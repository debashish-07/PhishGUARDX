"""
API Response Examples & Contract
PhishGuardX Hybrid Phishing Detection Engine
"""

EXAMPLE_SAFE_URL = "https://brooksbrothers.com/"
EXAMPLE_SUSPICIOUS_URL = "https://accounts-google-secure.firebaseapp.com/"
EXAMPLE_PHISHING_URL = "https://forterasecure.weebly.com/"

# ============================================================================
# 1. DETECTION REQUEST/RESPONSE
# ============================================================================

REQUEST_DETECT_SAFE = {
    "url": EXAMPLE_SAFE_URL
}

RESPONSE_DETECT_SAFE = {
    "status": "🟢 Safe",
    "label": "safe",
    "risk_score": 0.0353,
    "risk_level": "Low",
    "confidence": "High",
    "summary": "No strong phishing indicators were detected.",
    "reasons": [],
    "recommended_action": "Safe to continue, but remain alert for unusual behavior.",
    "block_hash": "a7f1e2c9d8b3e4f5a6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8",
    "ledger_valid": True,
    "model_source": "fallback",
    "signals": {
        "url_length": 28,
        "subdomain_depth": 0,
        "special_char_ratio": 0.04,
        "suspicious_token_hits": 0,
        "https_present": True,
        "risky_host": False,
        "shortener_detected": False,
    },
    "thresholds": {
        "mid_threshold": 0.40,
        "high_threshold": 0.65
    }
}

# ============================================================================

REQUEST_DETECT_SUSPICIOUS = {
    "url": EXAMPLE_SUSPICIOUS_URL
}

RESPONSE_DETECT_SUSPICIOUS = {
    "status": "⚠️ Suspicious",
    "label": "suspicious",
    "risk_score": 0.4823,
    "risk_level": "Medium",
    "confidence": "Medium",
    "summary": "Suspicious signals found; review before continuing (Firebase hosting abuse pattern).",
    "reasons": [
        "Firebase hosting abuse pattern detected",
        "Multiple suspicious subdomain segments",
        "Domain structure mimics legitimate service",
    ],
    "recommended_action": "Proceed with caution and avoid entering credentials.",
    "block_hash": "c2e4f6a8b0d2e4f6a8b0c2d4e6f8a0b2c4d6e8f0a2c4e6f8a0b2c4d6e8f0a",
    "ledger_valid": True,
    "model_source": "fallback",
    "signals": {
        "url_length": 45,
        "subdomain_depth": 3,
        "special_char_ratio": 0.11,
        "suspicious_token_hits": 2,
        "https_present": True,
        "risky_host": True,
        "shortener_detected": False,
    },
    "thresholds": {
        "mid_threshold": 0.40,
        "high_threshold": 0.65
    }
}

# ============================================================================

REQUEST_DETECT_PHISHING = {
    "url": EXAMPLE_PHISHING_URL
}

RESPONSE_DETECT_PHISHING = {
    "status": "🔴 Phishing",
    "label": "phishing",
    "risk_score": 0.6694,
    "risk_level": "High",
    "confidence": "Medium",
    "summary": "High-risk phishing indicators detected (Suspicious URL structure).",
    "reasons": [
        "Suspicious URL structure",
        "Known abuse-prone hosting pattern (Weebly abuse history)",
        "Possible brand impersonation (ForteraSecure mimics bank security)",
    ],
    "recommended_action": "Block access and warn the user immediately.",
    "block_hash": "6c5a6a058a1b6ecdbb6472de35e51f17d96c0152f1288e608118954d1bbf785b",
    "ledger_valid": True,
    "model_source": "fallback",
    "signals": {
        "url_length": 33,
        "subdomain_depth": 1,
        "special_char_ratio": 0.06,
        "suspicious_token_hits": 3,
        "https_present": True,
        "risky_host": True,
        "shortener_detected": False,
    },
    "thresholds": {
        "mid_threshold": 0.40,
        "high_threshold": 0.65
    }
}

# ============================================================================
# 2. REPORT REQUEST/RESPONSE (DOWNLOADABLE)
# ============================================================================

REQUEST_REPORT = {
    "url": EXAMPLE_PHISHING_URL
}

RESPONSE_REPORT = {
    "timestamp": "2026-04-12T16:46:55.806474+00:00",
    "url": EXAMPLE_PHISHING_URL,
    "result": "phishing",
    "risk_score": 0.6694,
    "status": "🔴 Phishing",
    "risk_level": "High",
    "confidence": "Medium",
    "summary": "High-risk phishing indicators detected (Suspicious URL structure).",
    "reasons": [
        "Suspicious URL structure",
        "Known abuse-prone hosting pattern",
        "Possible brand impersonation",
    ],
    "recommended_action": "Block access and warn the user immediately.",
    "block_hash": "6c5a6a058a1b6ecdbb6472de35e51f17d96c0152f1288e608118954d1bbf785b",
}

# ============================================================================
# 3. TRUST LEDGER BLOCK STRUCTURE
# ============================================================================

LEDGER_BLOCK_EXAMPLE = {
    "index": 45,
    "timestamp": "2026-04-12T16:46:55.798049+00:00",
    "url": "https://forterasecure.weebly.com/",
    "result": "phishing",
    "risk_score": 0.6694,
    "previous_hash": "9cd6515d14fbd2d2f224e571abe5c3f7e853cb616ac2a814433e6452a1685d74",
    "block_hash": "6c5a6a058a1b6ecdbb6472de35e51f17d96c0152f1288e608118954d1bbf785b"
}

LEDGER_CHAIN_VERIFICATION = {
    "is_valid": True,
    "chain_length": 45,
    "blocks_verified": 45,
    "message": "All chain links verified. Trust ledger integrity confirmed."
}

# ============================================================================
# 4. SYSTEM STATUS ENDPOINT
# ============================================================================

REQUEST_HEALTH = {}

RESPONSE_HEALTH = {
    "status": "healthy",
    "version": "1.0.0",
    "model_source": "fallback",
    "ledger_blocks": 45,
    "ledger_valid": True,
}

# ============================================================================
# CURL EXAMPLES FOR TESTING
# ============================================================================

"""
# Test safe URL
curl -X POST http://localhost:8000/api/detect/url \\
  -H "Content-Type: application/json" \\
  -d '{"url": "https://brooksbrothers.com/"}'

# Test suspicious URL
curl -X POST http://localhost:8000/api/detect/url \\
  -H "Content-Type: application/json" \\
  -d '{"url": "https://accounts-google-secure.firebaseapp.com/"}'

# Test phishing URL
curl -X POST http://localhost:8000/api/detect/url \\
  -H "Content-Type: application/json" \\
  -d '{"url": "https://forterasecure.weebly.com/"}'

# Generate audit report
curl -X POST http://localhost:8000/api/report \\
  -H "Content-Type: application/json" \\
  -d '{"url": "https://forterasecure.weebly.com/"}' \\
  -o report.json

# Check system health
curl http://localhost:8000/health

"""
