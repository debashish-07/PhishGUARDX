from __future__ import annotations

import math
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Dict, List, Optional
import pickle
from urllib.parse import parse_qsl, urlparse

from .feature_extraction import build_model_features, clamp01, extract_url_features
from .rule_engine import apply_rule_overrides, heuristic_risk


TRUSTED_DOMAINS = {
    "google.com",
    "chatgpt.com",
    "whatsapp.com",
    "microsoft.com",
    "amazon.com",
    "facebook.com",
    "instagram.com",
    "apple.com",
}

RESERVED_DOCUMENTATION_DOMAINS = {
    "example.com",
    "example.org",
    "example.net",
    "test.com",
    "localhost",
    "127.0.0.1",
}

SUSPICIOUS_TRUST_KEYWORDS = {"login", "verify", "secure", "update", "account"}
TRACKING_QUERY_PARAMS = {
    "msclkid",
    "gclid",
    "fbclid",
    "dclid",
    "gbraid",
    "wbraid",
    "yclid",
    "mc_cid",
    "mc_eid",
    "ttclid",
}
MICROSOFT_ADS_TRACKING_PARAMS = {
    "c_id",
    "c_agid",
    "c_kwid",
    "c_pms",
    "c_nw",
    "c_dvc",
}
LOW_SIGNAL_SAFE_MAX_RISK = 0.44
LOW_SIGNAL_ML_PROBABILITY_MAX = 0.85
COMMON_TWO_PART_SUFFIXES = {
    "co.uk",
    "org.uk",
    "ac.uk",
    "co.in",
    "com.au",
    "co.jp",
    "com.br",
    "com.mx",
    "co.nz",
}

UUID_PATTERN = re.compile(
    r"^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$"
)
HEX_PATTERN = re.compile(r"^[a-fA-F0-9]{24,}$")
RANDOMISH_PATTERN = re.compile(r"^[A-Za-z0-9]{24,}$")


@dataclass(frozen=True)
class Thresholds:
    mid: float = 0.45
    high: float = 0.90


def classify_with_uncertainty(risk_score: float, thresholds: Thresholds, margin: float = 0.03) -> str:
    if risk_score < thresholds.mid:
        return "safe"
    if risk_score > (thresholds.high + margin):
        return "phishing"
    if abs(risk_score - thresholds.high) < margin:
        return "suspicious"
    return "suspicious"


def label_from_score(risk_score: float, thresholds: Thresholds, margin: float = 0.03) -> str:
    return classify_with_uncertainty(risk_score, thresholds, margin=margin)


def status_emoji(label: str) -> str:
    return {
        "safe": "🟢 Safe",
        "suspicious": "⚠️ Suspicious",
        "phishing": "🔴 Phishing",
    }.get(label, label)


def risk_level(risk_score: float) -> str:
    if risk_score > 0.70:
        return "High"
    if risk_score >= 0.45:
        return "Medium"
    return "Low"


def confidence_level(risk_score: float, override_count: int) -> str:
    if override_count >= 3 or risk_score >= 0.85 or risk_score <= 0.15:
        return "High"
    if override_count >= 1 or risk_score >= 0.70 or risk_score <= 0.30:
        return "Medium"
    return "Low"


def recommended_action(label: str) -> str:
    if label == "phishing":
        return "Block access and warn the user immediately."
    if label == "suspicious":
        return "Proceed with caution and avoid entering credentials."
    return "Safe to continue, but remain alert for unusual behavior."


def extract_base_domain(url: str) -> str:
    """Extract base/registered domain using simple suffix-aware parsing."""
    host = (urlparse(url.strip()).hostname or "").lower().strip(".")
    if not host:
        return ""

    parts = [part for part in host.split(".") if part]
    if len(parts) <= 2:
        return host

    tail_two = ".".join(parts[-2:])
    tail_three = ".".join(parts[-3:])
    if tail_two in COMMON_TWO_PART_SUFFIXES and len(parts) >= 3:
        return tail_three
    return tail_two


def _has_suspicious_trust_keywords(features: Dict[str, float]) -> bool:
    if features.get("token_hits", 0.0) >= 1.0:
        return True

    for keyword in SUSPICIOUS_TRUST_KEYWORDS:
        if features.get(f"keyword_{keyword}", 0.0) >= 1.0:
            return True

    # Keep compatibility if keyword_hits is present in a custom feature map.
    if features.get("keyword_hits", 0.0) >= 1.0:
        return True
    return False


def apply_domain_trust(domain: str, risk_score: float, features: Dict[str, float]) -> float:
    """Apply mild trust weighting for known legitimate domains with strict safety guards."""
    if domain not in TRUSTED_DOMAINS:
        return risk_score

    has_strong_phishing_signals = any(
        [
            features.get("https", 0.0) == 0.0,
            _has_suspicious_trust_keywords(features),
            features.get("subdomain_depth", 0.0) > 3.0,
            features.get("risky_host", 0.0) == 1.0,
            features.get("suspicious_tld", 0.0) == 1.0,
        ]
    )
    if has_strong_phishing_signals:
        return risk_score

    return clamp01(risk_score * 0.80)


def _is_benign_tracking_query(url: str, features: Dict[str, float], trusted_domain: bool) -> bool:
    """Detect long query strings made only of common analytics/tracking parameters."""
    if not trusted_domain:
        return False

    has_strong_signals = any(
        [
            features.get("https", 0.0) == 0.0,
            _has_suspicious_trust_keywords(features),
            features.get("subdomain_depth", 0.0) > 2.0,
            features.get("risky_host", 0.0) == 1.0,
            features.get("suspicious_tld", 0.0) == 1.0,
            features.get("structural_hits", 0.0) >= 2.0,
        ]
    )
    if has_strong_signals:
        return False

    parsed = urlparse(url.strip())
    if not parsed.query:
        return False

    query_pairs = parse_qsl(parsed.query, keep_blank_values=True)
    if not query_pairs:
        return False

    def is_tracking_key(key: str) -> bool:
        normalized = key.strip().lower()
        return (
            normalized.startswith("utm_")
            or normalized in TRACKING_QUERY_PARAMS
            or normalized in MICROSOFT_ADS_TRACKING_PARAMS
        )

    return all(is_tracking_key(key) for key, _ in query_pairs)


def _is_trusted_root_query(url: str, trusted_domain: bool) -> bool:
    if not trusted_domain:
        return False

    parsed = urlparse(url.strip())
    normalized_path = (parsed.path or "/").strip()
    if normalized_path not in {"", "/"}:
        return False

    return bool(parsed.query)


def _is_low_signal_clean_https(features: Dict[str, float]) -> bool:
    return all(
        [
            features.get("https", 0.0) == 1.0,
            features.get("token_hits", 0.0) == 0.0,
            features.get("keyword_hits", 0.0) == 0.0,
            features.get("structural_hits", 0.0) <= 1.0,
            features.get("risky_host", 0.0) == 0.0,
            features.get("suspicious_tld", 0.0) == 0.0,
            features.get("subdomain_depth", 0.0) <= 1.0,
            features.get("url_length", 0.0) <= 160.0,
            features.get("long_segment", 0.0) <= 70.0,
        ]
    )


def _has_human_readable_long_slug(url: str) -> bool:
    parsed = urlparse(url.strip())
    segments = [segment.strip().lower() for segment in parsed.path.split("/") if segment.strip()]
    if not segments:
        return False

    for segment in segments:
        if len(segment) < 24 or "-" not in segment:
            continue

        parts = [part for part in segment.split("-") if part]
        if len(parts) < 4:
            continue

        readable_parts = sum(1 for part in parts if re.fullmatch(r"[a-z0-9]{1,16}", part))
        if readable_parts / len(parts) >= 0.8:
            return True

    return False


def _has_clean_readable_path(url: str) -> bool:
    parsed = urlparse(url.strip())
    segments = [segment.strip().lower() for segment in parsed.path.split("/") if segment.strip()]
    if not segments:
        return True

    if len(segments) > 5:
        return False

    for segment in segments:
        if not re.fullmatch(r"[a-z0-9-]{1,32}", segment):
            return False
        if not any(ch.isalpha() for ch in segment):
            return False

    return True


def detect_uuid_pattern(url: str) -> Dict[str, Any]:
    parsed = urlparse(url.strip())
    segments = [segment for segment in parsed.path.split("/") if segment]

    matched_segments = [
        segment
        for segment in segments
        if UUID_PATTERN.fullmatch(segment) or HEX_PATTERN.fullmatch(segment) or RANDOMISH_PATTERN.fullmatch(segment)
    ]

    return {
        "has_obfuscated_path": bool(matched_segments),
        "matched_segments": matched_segments,
        "severity": min(1.0, 0.25 * len(matched_segments)),
    }


def adjust_path_risk(
    url: str,
    risk_score: float,
    reasons: List[str],
    trusted_domain: bool,
) -> tuple[float, List[str]]:
    path_signal = detect_uuid_pattern(url)
    if not path_signal["has_obfuscated_path"]:
        return risk_score, reasons

    severity = float(path_signal["severity"])
    multiplier = 1.0 + (0.12 * severity if not trusted_domain else 0.04 * severity)
    adjusted = clamp01(risk_score * multiplier)

    if trusted_domain:
        reasons = [*reasons, "Obfuscated path detected; penalty softened for trusted domain"]
    else:
        reasons = [*reasons, "Obfuscated path detected; risk increased"]

    return adjusted, reasons


class SimpleModelWrapper:
    def __init__(self, model: Any):
        self.model = model


def load_model(model_path: str) -> Optional[Any]:
    path = Path(model_path)
    if not path.exists():
        return None
    try:
        with path.open("rb") as f:
            return pickle.load(f)
    except Exception:
        return None


def _select_model(model: Optional[Any], model_type: str) -> Optional[Any]:
    if model is None:
        return None
    if isinstance(model, dict):
        selected = model.get(model_type)
        if selected is not None:
            return selected
        if model_type != "rf" and model.get("rf") is not None:
            return model.get("rf")
        return model.get("model")
    return model


def model_probability(features: List[float], model: Optional[Any] = None, model_type: str = "rf") -> float:
    selected_model = _select_model(model, model_type)
    if selected_model is not None:
        try:
            proba = selected_model.predict_proba([features])[0][1]
            return clamp01(float(proba))
        except Exception:
            pass

    z = (
        0.018 * features[0]
        + 2.40 * features[1]
        + 0.42 * features[2]
        + 0.55 * features[3]
        + 1.30 * features[4]
        + 0.40 * features[5]
        + 1.50 * features[6]
        + 1.10 * features[7]
        + 1.60 * features[8]
        - 0.95 * features[9]
        + 1.35 * features[10]
        - 1.65 * features[11]
        + 0.015 * features[12]
        + 1.30 * features[13]
        + 1.15 * features[14]
        - 2.50
    )
    return clamp01(1.0 / (1.0 + math.exp(-z)))


def compute_risk_score(
    url: str,
    features: Optional[Dict[str, float]] = None,
    model: Optional[Any] = None,
    model_type: str = "rf",
    thresholds: Optional[Thresholds] = None,
    decision_margin: float = 0.03,
) -> Dict[str, Any]:
    extracted = features or extract_url_features(url)
    model_features = build_model_features(extracted)
    ml_probability = model_probability(model_features, model=model, model_type=model_type)
    heuristic_score = heuristic_risk(extracted)
    https_risk = 1.0 - extracted["https"]

    w_ml, w_heur, w_https = 0.72, 0.23, 0.05
    base_risk = clamp01(w_ml * ml_probability + w_heur * heuristic_score + w_https * https_risk)

    adjustment_reasons: List[str] = []
    base_domain = extract_base_domain(url)

    if base_domain in RESERVED_DOCUMENTATION_DOMAINS:
        return {
            "risk_score": 0.0,
            "ml_probability": 0.0,
            "heuristic_score": 0.0,
            "override_reasons": ["Reserved/documentation domain explicitly marked as safe"],
            "signals": extracted,
            "model_used": "reserved_domain_bypass",
            "label": "safe",
            "verdict": "safe",
        }

    trusted_domain = base_domain in TRUSTED_DOMAINS
    benign_tracking_query = _is_benign_tracking_query(url, extracted, trusted_domain)
    trusted_root_query = _is_trusted_root_query(url, trusted_domain)
    risk_after_trust = apply_domain_trust(base_domain, base_risk, extracted)
    if risk_after_trust < base_risk:
        adjustment_reasons.append("Trusted domain risk adjustment applied")
    if benign_tracking_query:
        adjustment_reasons.append("Tracking query pattern on trusted domain")

    if benign_tracking_query and trusted_root_query and extracted.get("token_hits", 0.0) == 0.0:
        risk_after_trust = clamp01(risk_after_trust * 0.62)
        adjustment_reasons.append("Trusted root tracking URL risk normalization")

    risk_after_path, adjustment_reasons = adjust_path_risk(url, risk_after_trust, adjustment_reasons, trusted_domain)
    final_risk, override_reasons = apply_rule_overrides(
        risk_after_path,
        extracted,
        suppress_long_url_penalty=benign_tracking_query,
    )

    if (
        _is_low_signal_clean_https(extracted)
        and heuristic_score <= 0.20
        and ml_probability <= LOW_SIGNAL_ML_PROBABILITY_MAX
        and not override_reasons
    ):
        final_risk = min(final_risk, LOW_SIGNAL_SAFE_MAX_RISK)
        adjustment_reasons.append("Low-signal HTTPS domain normalization")

    if (
        _has_human_readable_long_slug(url)
        and extracted.get("https", 0.0) == 1.0
        and extracted.get("token_hits", 0.0) == 0.0
        and extracted.get("keyword_hits", 0.0) == 0.0
        and extracted.get("risky_host", 0.0) == 0.0
        and extracted.get("suspicious_tld", 0.0) == 0.0
        and extracted.get("subdomain_depth", 0.0) <= 2.0
        and not override_reasons
    ):
        final_risk = min(final_risk, LOW_SIGNAL_SAFE_MAX_RISK)
        adjustment_reasons.append("Human-readable slug normalization")

    if (
        _has_clean_readable_path(url)
        and extracted.get("https", 0.0) == 1.0
        and extracted.get("token_hits", 0.0) == 0.0
        and extracted.get("keyword_hits", 0.0) == 0.0
        and extracted.get("structural_hits", 0.0) == 0.0
        and extracted.get("risky_host", 0.0) == 0.0
        and extracted.get("suspicious_tld", 0.0) == 0.0
        and heuristic_score <= 0.10
        and not override_reasons
    ):
        final_risk = min(final_risk, LOW_SIGNAL_SAFE_MAX_RISK)
        adjustment_reasons.append("Readable-path HTTPS normalization")

    all_reasons = [*adjustment_reasons, *override_reasons]
    active_thresholds = thresholds or Thresholds()
    label = classify_with_uncertainty(final_risk, active_thresholds, margin=decision_margin)
    return {
        "risk_score": round(final_risk, 4),
        "ml_probability": round(ml_probability, 4),
        "heuristic_score": round(heuristic_score, 4),
        "override_reasons": all_reasons,
        "signals": extracted,
        "model_used": model_type if _select_model(model, model_type) is not None else "fallback",
        "label": label,
        "verdict": label,
        "thresholds": {"mid": active_thresholds.mid, "high": active_thresholds.high, "margin": decision_margin},
    }


def top_reasons(signals: Dict[str, float], ml_probability: float, heuristic_score: float, override_reasons: List[str]) -> List[str]:
    reasons: List[str] = []

    if ml_probability >= 0.55:
        reasons.append("High ML confidence")

    if heuristic_score >= 0.15 or signals["token_hits"] >= 1 or signals["subdomain_depth"] >= 2:
        reasons.append("Suspicious URL structure")

    if signals["https"] == 0.0:
        reasons.append("No HTTPS")

    reasons.extend(override_reasons)
    if signals["risky_host"] == 1.0:
        reasons.append("Possible brand impersonation")
    seen = []
    for reason in reasons:
        if reason not in seen:
            seen.append(reason)
    return seen[:5]