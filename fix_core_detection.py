import sys
sys.path.insert(0, '/backend')

content = '''from __future__ import annotations

from pathlib import Path
from typing import Any, Dict, Optional

from .feature_extraction import clamp01, extract_url_features
from .ledger import TrustLedger
from .reporting import build_report_payload
from .scoring_engine import (
    Thresholds,
    confidence_level,
    compute_risk_score,
    label_from_score,
    load_model,
    recommended_action,
    risk_level,
    status_emoji,
    top_reasons,
)


def _summary(label: str, risk_score: float, reasons: list[str]) -> str:
    lead = reasons[0] if reasons else "multiple signals"
    if label == "phishing":
        return f"This URL is likely a phishing attempt ({lead})."
    if label == "suspicious":
        return f"This URL looks suspicious and should be verified ({lead})."
    return "No strong phishing indicators were detected."


class CoreDetectionEngine:
    """Modular phishing detection engine with deterministic fallback behavior."""

    def __init__(
        self,
        model_path: Optional[str] = None,
        ledger_path: Optional[str] = None,
        thresholds: Optional[Thresholds] = None,
    ):
        self.thresholds = thresholds or Thresholds()
        self.model = load_model(model_path) if model_path else None
        ledger_file = ledger_path or str(Path(__file__).resolve().parent / "data" / "trust_ledger.json")
        self.ledger = TrustLedger(ledger_file)

    def analyze_url(self, url: str, model_type: str = "rf") -> Dict[str, Any]:
        clean_url = url.strip()
        signals = extract_url_features(clean_url)
        risk_result = compute_risk_score(clean_url, signals, model=self.model, model_type=model_type)

        risk_score = clamp01(float(risk_result["risk_score"]))
        label = label_from_score(risk_score, self.thresholds)

        override_reason_list = list(risk_result.get("override_reasons", []))
        reasons = top_reasons(
            signals=risk_result["signals"],
            ml_probability=float(risk_result["ml_probability"]),
            heuristic_score=float(risk_result["heuristic_score"]),
            override_reasons=override_reason_list,
        )

        block = self.ledger.append_block(clean_url, label, risk_score)
        # Enforce size limit (keep only 50 most recent)
        self.ledger.enforce_size_limit(50)

        confidence = confidence_level(risk_score, len(override_reason_list))

        result = {
            "status": status_emoji(label),
            "label": label,
            "risk_score": round(risk_score, 4),
            "risk_level": risk_level(risk_score),
            "confidence": confidence,
            "summary": _summary(label, risk_score, reasons),
            "reasons": reasons[:5],
            "recommended_action": recommended_action(label),
            "model_used": str(risk_result.get("model_used", "fallback")),
            "block_hash": block.block_hash,
            "ledger_valid": self.ledger.verify_chain(),
            "thresholds": {
                "mid_threshold": self.thresholds.mid,
                "high_threshold": self.thresholds.high,
            },
            "signals": {
                "ml_probability": round(float(risk_result["ml_probability"]), 4),
                "heuristic_risk": round(float(risk_result["heuristic_score"]), 4),
                "https_present": bool(risk_result["signals"]["https"]),
                "url_length": int(risk_result["signals"]["url_length"]),
                "subdomain_depth": int(risk_result["signals"]["subdomain_depth"]),
                "suspicious_token_hits": int(risk_result["signals"]["token_hits"]),
            },
            "model_source": "pickle" if self.model is not None else "fallback",
        }
        return result

    def build_report(self, url: str) -> Dict[str, Any]:
        result = self.analyze_url(url)
        return build_report_payload(result, url)
'''

filepath = r"c:\Users\DEBASHISH ROUT L\OneDrive\Desktop\major project1\backend\core_detection.py"
with open(filepath, 'w') as f:
    f.write(content)
print("File written successfully")
