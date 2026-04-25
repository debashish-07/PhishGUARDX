from __future__ import annotations

import re
from typing import Dict, List
from urllib.parse import urlparse


SUSPICIOUS_TOKENS = {
    "login",
    "verify",
    "update",
    "secure",
    "account",
    "password",
    "signin",
    "wallet",
    "invoice",
    "reset",
    "confirm",
    "otp",
    "support",
    "recovery",
}

RISKY_HOST_SUFFIXES = {
    "weebly.com",
    "framer.app",
    "workers.dev",
    "appspot.com",
    "q-r.to",
    "qrco.de",
}

RISKY_HOST_CONTAINS = {
    "sites.google.com",
    "docs.google.com",
    "firebasestorage.googleapis.com",
}

SHORTENER_HOSTS = {
    "q-r.to",
    "qrco.de",
}

SUSPICIOUS_TLDS = {"ru", "tk", "xyz", "top", "click", "gq", "ml", "cf"}

BRAND_TERMS = {"paypal", "amazon", "microsoft", "apple", "google", "bank"}

HASH_LIKE_SEGMENT_PATTERN = re.compile(r"[A-Za-z0-9]{24,}")


def clamp01(value: float) -> float:
    return max(0.0, min(1.0, value))


def extract_url_features(url: str) -> Dict[str, float]:
    clean_url = url.strip()
    parsed = urlparse(clean_url)
    host = (parsed.hostname or "").lower()
    path_and_query = (parsed.path or "") + (("?" + parsed.query) if parsed.query else "")
    path_segments = [seg for seg in (parsed.path or "").split("/") if seg]

    url_length = len(clean_url)
    special_chars = len(re.findall(r"[@\-_=+%&$!~*]", clean_url))
    special_ratio = special_chars / max(1, url_length)
    labels = [part for part in host.split(".") if part]
    tld = labels[-1] if labels else ""
    subdomain_depth = max(0, len(labels) - 2)
    token_hits = sum(1 for token in SUSPICIOUS_TOKENS if token in clean_url.lower())
    has_brand_term = 1.0 if any(term in clean_url.lower() for term in BRAND_TERMS) else 0.0
    suspicious_tld = 1.0 if tld in SUSPICIOUS_TLDS else 0.0
    digit_ratio = sum(ch.isdigit() for ch in clean_url) / max(1, url_length)
    encoded_count = len(re.findall(r"%[0-9a-fA-F]{2}", path_and_query))
    has_at = 1.0 if "@" in clean_url else 0.0
    has_punycode = 1.0 if "xn--" in host else 0.0
    host_is_ip = 1.0 if re.fullmatch(r"\d{1,3}(?:\.\d{1,3}){3}", host or "") else 0.0
    https_present = 1.0 if parsed.scheme.lower() == "https" else 0.0
    risky_host_suffix = 1.0 if any(host.endswith(suffix) for suffix in RISKY_HOST_SUFFIXES) else 0.0
    risky_host_contains = 1.0 if any(pattern in host for pattern in RISKY_HOST_CONTAINS) else 0.0
    risky_host = 1.0 if (risky_host_suffix or risky_host_contains) else 0.0
    shortener_host = 1.0 if host in SHORTENER_HOSTS else 0.0
    long_segment = max((len(seg) for seg in path_segments), default=0)
    # Treat only uninterrupted long alphanumeric tokens as hash-like; hyphenated slugs are often benign.
    hash_like_segment = 1.0 if any(HASH_LIKE_SEGMENT_PATTERN.fullmatch(seg) for seg in path_segments) else 0.0
    uuid_like_segment = 1.0 if any(
        re.fullmatch(r"[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}", seg)
        for seg in path_segments
    ) else 0.0
    structural_hits = float(
        sum(
            [
                int(risky_host > 0.0),
                int(shortener_host > 0.0),
                int(host_is_ip > 0.0),
                int(has_punycode > 0.0),
                int(has_at > 0.0),
                int(suspicious_tld > 0.0),
                int(encoded_count > 0),
                int(subdomain_depth >= 2),
                int(long_segment >= 20),
                int(hash_like_segment > 0.0),
                int(uuid_like_segment > 0.0),
            ]
        )
    )

    return {
        "https": https_present,
        "url_length": float(url_length),
        "special_ratio": special_ratio,
        "subdomain_depth": float(subdomain_depth),
        "token_hits": float(token_hits),
        "keyword_hits": float(token_hits),
        "structural_hits": structural_hits,
        "suspicious_tld": suspicious_tld,
        "has_brand_term": has_brand_term,
        "digit_ratio": digit_ratio,
        "encoded_count": float(encoded_count),
        "has_at": has_at,
        "has_punycode": has_punycode,
        "host_is_ip": host_is_ip,
        "risky_host": risky_host,
        "shortener_host": shortener_host,
        "long_segment": float(long_segment),
        "hash_like_segment": hash_like_segment,
        "uuid_like_segment": uuid_like_segment,
    }


def build_model_features(features: Dict[str, float]) -> List[float]:
    return [
        features["url_length"],
        features["special_ratio"],
        features["subdomain_depth"],
        features["token_hits"],
        features["digit_ratio"],
        features["encoded_count"],
        features["has_at"],
        features["has_punycode"],
        features["host_is_ip"],
        features["https"],
        features["risky_host"],
        features["shortener_host"],
        features["long_segment"],
        features["hash_like_segment"],
        features["uuid_like_segment"],
        features["suspicious_tld"],
        features["has_brand_term"],
    ]