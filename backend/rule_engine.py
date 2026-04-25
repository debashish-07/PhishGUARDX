from __future__ import annotations

from typing import Dict, List, Tuple

from .feature_extraction import clamp01


def heuristic_risk(features: Dict[str, float]) -> float:
    len_risk = clamp01((features["url_length"] - 40.0) / 120.0)
    special_risk = clamp01(features["special_ratio"] / 0.12)
    subdomain_risk = clamp01(features["subdomain_depth"] / 4.0)
    token_risk = clamp01(features["token_hits"] / 3.0)
    digit_risk = clamp01(features["digit_ratio"] / 0.20)
    encoded_risk = clamp01(features["encoded_count"] / 4.0)
    long_segment_risk = clamp01((features["long_segment"] - 20.0) / 25.0)
    tld_risk = clamp01(features.get("suspicious_tld", 0.0))
    ip_risk = clamp01(features.get("host_is_ip", 0.0))
    no_https_risk = clamp01(1.0 - features.get("https", 1.0))

    score = (
        0.08 * len_risk
        + 0.10 * special_risk
        + 0.09 * subdomain_risk
        + 0.30 * token_risk
        + 0.08 * digit_risk
        + 0.08 * encoded_risk
        + 0.04 * long_segment_risk
        + 0.14 * tld_risk
        + 0.12 * ip_risk
        + 0.12 * no_https_risk
    )

    if features["has_at"] == 1.0:
        score += 0.08
    if features["host_is_ip"] == 1.0:
        score += 0.12
    if features["has_punycode"] == 1.0:
        score += 0.08
    if features["risky_host"] == 1.0:
        score += 0.20
    if features["shortener_host"] == 1.0:
        score += 0.22
    if features["hash_like_segment"] == 1.0:
        score += 0.06
    if features["uuid_like_segment"] == 1.0:
        score += 0.05

    return clamp01(score)


def apply_rule_overrides(
    risk: float,
    features: Dict[str, float],
    suppress_long_url_penalty: bool = False,
) -> Tuple[float, List[str]]:
    reasons: List[str] = []
    updated = risk

    if features["url_length"] >= 120 and not suppress_long_url_penalty:
        updated += 0.04
        reasons.append("Very long URL")

    if features.get("suspicious_tld", 0.0) == 1.0:
        updated += 0.14
        reasons.append("Suspicious domain pattern")

    if features["https"] == 0.0 and features["token_hits"] >= 1:
        updated += 0.14
        reasons.append("No HTTPS with suspicious terms")

    if features["token_hits"] >= 2:
        updated += 0.10
        reasons.append("Multiple suspicious keywords")

    if features["host_is_ip"] == 1.0:
        updated += 0.14
        reasons.append("IP-based host")

    if features["subdomain_depth"] >= 4:
        updated += 0.03
        reasons.append("Deep subdomain structure")

    if features["risky_host"] == 1.0:
        updated += 0.15
        reasons.append("Known abuse-prone hosting pattern")

    if features["risky_host"] == 1.0 and features["token_hits"] >= 1:
        updated += 0.18
        reasons.append("Possible brand impersonation")

    if features.get("has_brand_term", 0.0) == 1.0 and features["token_hits"] >= 1:
        updated += 0.12
        reasons.append("Possible brand impersonation")

    # Critical override: no HTTPS and suspicious terms strongly indicates phishing intent.
    if features["https"] == 0.0 and features["token_hits"] >= 2:
        updated = max(updated, 0.92)
        reasons.append("Critical phishing pattern detected")

    if features["shortener_host"] == 1.0:
        updated += 0.20
        reasons.append("URL shortener redirect pattern")

    if features["hash_like_segment"] == 1.0:
        updated += 0.14
        reasons.append("Long hash-like URL segment")

    if features["uuid_like_segment"] == 1.0:
        updated += 0.10
        reasons.append("UUID-like obfuscated path")

    return clamp01(updated), reasons