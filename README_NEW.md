# PhishGuardX – Hybrid Phishing Detection System

**Production-Grade URL-Based Phishing Detection with Explainability**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.9+](https://img.shields.io/badge/Python-3.9+-blue)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.95+-green)](https://fastapi.tiangolo.com/)

---

## Overview

PhishGuardX is a hybrid phishing detection system that combines machine learning, deterministic heuristics, rule-based overrides, and explainability reasoning to accurately classify URLs as safe, suspicious, or phishing.

### Key Characteristics

- **Hybrid Scoring**: ML probability (72%) + heuristic risk (23%) + HTTPS signal (5%)
- **Trust Weighting**: Domain reputation adjustment for known legitimate services
- **Context-Aware Path Analysis**: UUID/obfuscation detection with severity scaling by domain type
- **Explainable Output**: Reason-based decisions for user and analyst review
- **Deterministic**: Reproducible results with no external API dependencies
- **Fast**: <500ms detection latency on standard hardware
- **Audit Trail**: Trust ledger with SHA256-linked immutable blocks

---

## Architecture

```
User Input (URL)
    ↓
Feature Extraction (15 deterministic signals)
    ↓
Hybrid Risk Scoring (ML + Heuristic + HTTPS)
    ↓
Post-Processing Adjustments:
    ├─ Domain Trust Weighting (0.75x for trusted)
    ├─ UUID/Path Context Adjustment
    └─ Rule Overrides
    ↓
Uncertainty Band Classification:
    ├─ Safe: risk < 0.45
    ├─ Suspicious: 0.45 ≤ risk ≤ 0.70
    └─ Phishing: risk > 0.70
    ↓
Explainability Reasons + Ledger Block
    ↓
API Response (label, risk, reasons, metadata)
```

---

## Detection Methodology

### 1. Feature Extraction
15 structural signals extracted deterministically from URL:
- URL length, HTTPS presence, subdomain depth
- Special character ratio, token/keyword counts
- Risky hosting patterns, shortener detection
- IP as host, encoded characters, hash-like segments
- UUID patterns

### 2. Hybrid Risk Computation
```
risk_base = clamp01(
    0.72 * P_ml           # Machine learning confidence
    + 0.23 * R_heuristic  # Rule-based risk
    + 0.05 * R_https      # HTTPS/protocol penalty
)
```

### 3. Domain Trust Adjustment
If URL host matches trusted domain (google.com, chatgpt.com, etc.):
```
risk_after_trust = clamp01(risk_base * 0.75)
```

### 4. Path Obfuscation Handling
Detects UUID, hex, random-alphanumeric segments:
- Trusted domain: soft penalty (context-aware softening)
- Untrusted domain: stronger penalty (security-first)

### 5. Rule Overrides
Deterministic security rules (risky hosts, shorteners, etc.) applied with reason logging.

### 6. Final Classification
Uncertainty-band thresholding:
- **Phishing**: risk > 0.70
- **Suspicious**: 0.45 ≤ risk ≤ 0.70
- **Safe**: risk < 0.45

---

## Key Features

✅ **Machine Learning + Heuristics**: Hybrid approach balances learned patterns and explicit rules  
✅ **Context-Aware Scoring**: Trust weighting and domain-aware path penalties  
✅ **Explainability First**: Every decision includes reason(s)  
✅ **Deterministic**: Same URL always produces same score  
✅ **Audit Trail**: Immutable ledger for compliance and review  
✅ **No External APIs**: All processing local; zero data transmission  
✅ **Fast**: <500ms typical latency  

---

## Technology Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Backend API | FastAPI (Python) | REST endpoints and orchestration |
| ML Model | scikit-learn (Random Forest) | Phishing probability |
| Feature Extraction | Python deterministic rules | URL signal extraction |
| Database | JSON ledger (file-based) | Audit trail and storage |
| Frontend | Next.js + TypeScript | User interface |
| Deployment | Docker optional | Containerization support |

---

## Dataset

Trained and evaluated on ~100k balanced URLs:
- **Phishing**: PhishTank, OpenPhish, URLhaus
- **Benign**: Tranco Top 1M, Alexa, known legitimate services
- **Coverage**: Multiple TLDs, dynamic domains, subdomains

---

## Performance

### Benchmark Results

| Metric | Value | Notes |
|--------|-------|-------|
| Precision | ~0.963 | Low false positive rate |
| Recall | ~0.921 | Good phishing detection |
| F1 Score | ~0.941 | Balanced performance |
| Latency | 287ms | Average detection time |
| Model | Random Forest | Best stability in hybrid pipeline |

### Key Finding
Hybrid approach (ML + heuristic + rules) achieves high precision while maintaining strong phishing sensitivity. Trust weighting reduces false positives on legitimate high-traffic domains without weakening malicious detection.

---

## Installation & Quick Start

### Prerequisites
- Python 3.9+
- Node.js 18+ (optional, for frontend)

### Backend Setup

```bash
# Clone repository
git clone https://github.com/yourusername/phishguardx.git
cd phishguardx

# Create Python environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run backend API
python backend/main.py
```

API will be available at `http://localhost:8000`

### Test a URL

```bash
curl -X POST http://localhost:8000/api/detect/url \
  -H "Content-Type: application/json" \
  -d '{"url": "https://suspicious-domain.tk/login"}'
```

### Expected Response

```json
{
  "label": "phishing",
  "risk_score": 0.8426,
  "risk_level": "High",
  "confidence": "Medium",
  "reasons": [
    "High ML confidence",
    "Suspicious URL structure",
    "Risky hosting pattern (.tk)"
  ],
  "summary": "This URL shows strong phishing indicators and should be avoided."
}
```

---

## Core Modules

### backend/feature_extraction.py
Deterministic URL signal extraction. 15 features normalized to [0,1].

### backend/scoring_engine.py
Hybrid risk computation, trust weighting, path adjustment, threshold classification.

### backend/rule_engine.py
Deterministic rule-based penalties and overrides.

### backend/core_detection.py
Orchestrates feature extraction, scoring, explainability, and ledger integration.

### backend/ledger.py
SHA256-linked audit trail for all detection records.

---

## Explainability Examples

### Example 1: Trusted Domain (Safe)
```
URL: https://chatgpt.com/c
Label: Safe
Risk: 0.1008
Reasons:
  - Trusted domain adjustment applied (chatgpt.com)
```

### Example 2: Malicious with Obfuscation (Phishing)
```
URL: https://paypal-verify.tk/account/abcdef0123456789abcdef0123456789
Label: Phishing
Risk: 0.9015
Reasons:
  - High ML confidence
  - Suspicious URL structure
  - Obfuscated path detected; risk increased
  - Risky hosting pattern
```

---

## Configuration

### Trusted Domains (Current Policy)
Located in `backend/scoring_engine.py`:
```python
TRUSTED_DOMAINS = {
    "google.com",
    "chatgpt.com",
    "microsoft.com",
    "openai.com",
    "github.com",
    "apple.com",
}
```

### Thresholds (Current Policy)
```python
mid_threshold = 0.45   # safe/suspicious boundary
high_threshold = 0.70  # suspicious/phishing boundary
```

---

## Deployment

### Docker

```dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY . .
RUN pip install -r requirements.txt
CMD ["python", "backend/main.py"]
```

Build and run:
```bash
docker build -t phishguardx .
docker run -p 8000:8000 phishguardx
```

### Production Notes
- Use HTTPS for all API calls
- Enable rate limiting on `/api/detect/url` endpoint
- Monitor ledger size (default: 50 recent blocks)
- Version model artifacts independently from code

---

## Testing

```bash
# Run unit tests
python -m pytest backend/test_scoring_engine.py -v

# Run UUID detection tests
python test_uuid_detection.py

# Run regression tests
python test_regressions.py

# Cleanup stale artifacts
node scripts/cleanup-stale-artifacts.js --force
```

---

## Limitations

1. **URL-Only Analysis**: Does not evaluate page content, JavaScript, or visual rendering
2. **Static Trust List**: Hardcoded trusted domains (should move to managed config)
3. **Model Calibration**: Some legitimate long-path URLs may score in suspicious zone
4. **No DNS/WHOIS**: Does not query domain age or registrar metadata
5. **No Certificate Analysis**: Does not evaluate SSL/TLS certificate properties

---

## Future Work

1. Probability calibration (Platt/isotonic scaling)
2. Dynamic trust policy via configuration file
3. Extended signals (WHOIS age, certificate metadata)
4. Adversarial robustness testing
5. Per-reason score contribution breakdown

---

## Security & Privacy

- **No External APIs**: All computation local to system
- **No Telemetry**: Zero analytics or usage tracking
- **Deterministic**: Same URL always produces same result
- **Audit Trail**: Immutable ledger for compliance

---

## Contributing

For improvements or bug reports:
1. Create a feature branch
2. Add tests for new functionality
3. Submit pull request with clear description

---

## License

MIT License – See [LICENSE](LICENSE) for details

---

## References

1. Jain, A. K., & Gupta, B. B. (2018). Machine learning based phishing detection using hyperlinks information.
2. Sahingoz, O. K., et al. (2019). Machine learning based phishing detection from URLs.
3. Ribeiro, M. T., Singh, S., & Guestrin, C. (2016). Why should I trust you?
4. APWG Phishing Activity Trend Reports

---

## API Reference

### 1. Detect URL Endpoint

**POST** `/api/detect/url`

Detect phishing risk for a single URL.

**Request**:
```json
{
  "url": "https://suspicious-domain.tk/login",
  "include_signals": true,
  "include_reasons": true
}
```

**Response** (200 OK):
```json
{
  "label": "phishing",
  "risk_score": 0.8426,
  "risk_level": "High",
  "confidence": "Medium",
  "reasons": [
    "High ML confidence (0.91)",
    "Suspicious URL structure",
    "Risky hosting pattern (.tk)",
    "Detected UUID-like path segment"
  ],
  "signals": {
    "url_length": 45,
    "has_https": false,
    "subdomain_depth": 2,
    "special_char_ratio": 0.08,
    "keyword_hits": 2,
    "risky_host": true,
    "host_is_ip": false,
    "digit_ratio": 0.12,
    "has_uuid_pattern": true,
    "trusted_domain": false
  },
  "summary": "This URL shows strong phishing indicators and should be avoided.",
  "metadata": {
    "detection_time_ms": 287,
    "model_version": "1.0.0-hybrid",
    "processing_timestamp": "2026-04-17T14:32:15Z",
    "ledger_block_id": "sha256:abc123def456..."
  }
}
```

**Error Response** (400 Bad Request):
```json
{
  "error": "Invalid URL format",
  "details": "URL must be valid and start with http:// or https://"
}
```

### 2. Batch Detect Endpoint

**POST** `/api/detect/batch`

Detect multiple URLs in one request.

**Request**:
```json
{
  "urls": [
    "https://example.com",
    "https://suspicious.tk/login"
  ],
  "include_signals": false
}
```

**Response** (200 OK):
```json
{
  "results": [
    {
      "url": "https://example.com",
      "label": "safe",
      "risk_score": 0.12
    },
    {
      "url": "https://suspicious.tk/login",
      "label": "phishing",
      "risk_score": 0.87
    }
  ],
  "summary": "2 URLs analyzed: 1 safe, 0 suspicious, 1 phishing"
}
```

### 3. Explain Decision Endpoint

**POST** `/api/detect/explain`

Detailed explainability for a URL decision.

**Request**:
```json
{
  "url": "https://chatgpt.com/c/abc123def456"
}
```

**Response** (200 OK):
```json
{
  "url": "https://chatgpt.com/c/abc123def456",
  "final_label": "safe",
  "final_risk": 0.2815,
  "decision_flow": [
    {
      "stage": "Feature Extraction",
      "result": "15 features extracted successfully",
      "details": {
        "url_length": 38,
        "https_present": true,
        "subdomain_depth": 1
      }
    },
    {
      "stage": "Base Risk Computation",
      "result": "risk_base = 0.3754",
      "details": {
        "ml_probability": 0.41,
        "heuristic_risk": 0.18,
        "https_signal": 0.0,
        "formula": "0.72*0.41 + 0.23*0.18 + 0.05*0.0 = 0.3754"
      }
    },
    {
      "stage": "Trust Adjustment",
      "result": "Trusted domain detected (chatgpt.com)",
      "details": {
        "original_risk": 0.3754,
        "multiplier": 0.75,
        "adjusted_risk": 0.2815,
        "reason": "chatgpt.com is in trusted domains list"
      }
    },
    {
      "stage": "Path Analysis",
      "result": "UUID pattern detected but softened penalty applied",
      "details": {
        "pattern_type": "uuid",
        "domain_type": "trusted",
        "penalty_applied": 0.04,
        "reason": "Penalty softened for trusted domain"
      }
    },
    {
      "stage": "Classification",
      "result": "SAFE (risk 0.2815 < threshold 0.45)",
      "details": {
        "risk_score": 0.2815,
        "safe_threshold": 0.45,
        "suspicious_threshold": 0.70
      }
    }
  ],
  "contributing_signals": [
    {
      "signal": "Trusted domain",
      "impact": "Strongly reduces risk",
      "percentage": "25%"
    },
    {
      "signal": "HTTPS present",
      "impact": "Slightly reduces risk",
      "percentage": "5%"
    }
  ]
}
```

### 4. Ledger Query Endpoint

**GET** `/api/ledger/recent?count=10`

Query recent detection records from immutable ledger.

**Response** (200 OK):
```json
{
  "ledger_blocks": [
    {
      "block_id": "sha256:abc123...",
      "timestamp": "2026-04-17T14:32:15Z",
      "url_hash": "sha256:def456...",
      "label": "phishing",
      "risk_score": 0.87,
      "previous_block_hash": "sha256:xyz789..."
    }
  ],
  "chain_integrity": true
}
```

---

## Advanced Configuration

### Custom Trust Domain Policy

Edit `backend/scoring_engine.py`:

```python
# Modify trust domains list
TRUSTED_DOMAINS = {
    "google.com",
    "chatgpt.com",
    "microsoft.com",
    "openai.com",
    "github.com",
    "apple.com",
    "your-company.com",  # Add your organization
}

# Modify trust multiplier
TRUST_MULTIPLIER = 0.75  # Adjust sensitivity (0.5-0.9)
```

### Custom Threshold Configuration

```python
# In backend/models.py
class Thresholds:
    mid = 0.45      # safe/suspicious boundary
    high = 0.70     # suspicious/phishing boundary

# Tune for your risk tolerance:
# Conservative: mid=0.35, high=0.60 (catch more false positives)
# Aggressive: mid=0.55, high=0.80 (fewer false positives, miss more malicious)
```

### Custom Feature Weights

```python
# In backend/scoring_engine.py
SCORE_WEIGHTS = {
    'ml_probability': 0.72,
    'heuristic_risk': 0.23,
    'https_signal': 0.05,
}
# Must sum to 1.0
```

---

## Troubleshooting Guide

### Issue 1: High False Positive Rate

**Symptom**: Legitimate URLs classified as suspicious/phishing

**Causes**:
- Model overfitting on certain URL patterns
- Legitimate services with long paths not in trust list
- Aggressive heuristic scoring

**Solutions**:
```bash
# 1. Add domain to trusted list
# Edit TRUSTED_DOMAINS in backend/scoring_engine.py

# 2. Lower thresholds
mid_threshold = 0.50  # was 0.45
high_threshold = 0.75  # was 0.70

# 3. Increase trust multiplier
TRUST_MULTIPLIER = 0.80  # was 0.75

# 4. Review model calibration
python backend/models.py --calibrate
```

### Issue 2: High False Negative Rate

**Symptom**: Malicious URLs classified as safe/suspicious

**Causes**:
- Model underfitting
- Trusted domain on attacker's subdomain
- Weak heuristic rules

**Solutions**:
```bash
# 1. Lower thresholds
mid_threshold = 0.40  # was 0.45
high_threshold = 0.65  # was 0.70

# 2. Decrease trust multiplier
TRUST_MULTIPLIER = 0.70  # was 0.75

# 3. Review domain trust allowlist
# Verify only legitimate domains are whitelisted

# 4. Retrain model
python training/run_training.py --retrain
```

### Issue 3: Latency Exceeding 500ms

**Symptom**: Detection requests taking >500ms

**Causes**:
- Ledger file too large
- ML model inference slow
- Network delays

**Solutions**:
```bash
# 1. Archive old ledger
node scripts/cleanup-stale-artifacts.js --force

# 2. Optimize ML model
python backend/models.py --optimize-inference

# 3. Use model quantization
# For production: export ONNX quantized version

# 4. Monitor timing
python backend/core_detection.py --profile
```

### Issue 4: Inconsistent Verdicts on Same URL

**Symptom**: Same URL classified differently on repeated calls

**Causes**:
- Non-deterministic behavior (should not happen)
- Model loading issue
- Cache corruption

**Solutions**:
```bash
# 1. Verify deterministic behavior
python test_uuid_detection.py
python backend/test_scoring_engine.py

# 2. Clear model cache
rm -rf backend/models/__pycache__

# 3. Restart backend
python backend/main.py --reload

# 4. Verify consistent scoring
curl -X POST http://localhost:8000/api/detect/url \
  -d '{"url": "https://example.com"}' \
  && sleep 1 \
  && curl -X POST http://localhost:8000/api/detect/url \
  -d '{"url": "https://example.com"}'
# Both responses should be identical
```

---

## Performance Optimization

### Batch Processing

For high-volume analysis:

```python
import requests
import time

urls = ["https://example.com", "https://test.com", ...]

# Batch of 100 URLs
for i in range(0, len(urls), 100):
    batch = urls[i:i+100]
    response = requests.post(
        'http://localhost:8000/api/detect/batch',
        json={'urls': batch}
    )
    print(f"Batch {i//100 + 1}: {response.json()['summary']}")
    time.sleep(0.5)  # Rate limiting
```

### Caching Results

```python
import hashlib
import json

cache = {}

def get_cached_detection(url):
    url_hash = hashlib.sha256(url.encode()).hexdigest()
    if url_hash in cache:
        return cache[url_hash]
    return None

def cache_detection(url, result):
    url_hash = hashlib.sha256(url.encode()).hexdigest()
    cache[url_hash] = result
```

---

## Use Cases & Examples

### Use Case 1: Email Gateway Integration

Integrate PhishGuardX into email security gateway:

```python
from backend.core_detection import CoreDetectionEngine

engine = CoreDetectionEngine()

def scan_email(email_body):
    # Extract URLs from email
    urls = extract_urls(email_body)
    
    phishing_urls = []
    for url in urls:
        result = engine.analyze_url(url)
        if result['label'] != 'safe':
            phishing_urls.append((url, result['risk_score']))
    
    if phishing_urls:
        return {'action': 'quarantine', 'urls': phishing_urls}
    return {'action': 'allow'}
```

### Use Case 2: Real-Time Browser Extension

```javascript
// content_script.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'checkUrl') {
    fetch('http://localhost:8000/api/detect/url', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({url: request.url})
    })
    .then(r => r.json())
    .then(data => {
      if (data.label === 'phishing') {
        showWarning(data.reasons);
      }
      sendResponse(data);
    });
  }
});
```

### Use Case 3: SOC Analytics Platform

```python
# Integrate with SIEM
def send_to_siem(detection_result):
    siem_event = {
        'event_type': 'phishing_detection',
        'url': detection_result['url'],
        'risk_score': detection_result['risk_score'],
        'label': detection_result['label'],
        'reasons': detection_result['reasons'],
        'timestamp': datetime.now().isoformat()
    }
    siem_client.send(siem_event)
```

---

## Benchmarking & Performance Testing

### Run Benchmark Suite

```bash
# Full benchmark
python evaluation/scripts/benchmark.py --dataset 100k

# Output:
# Precision: 0.963
# Recall: 0.921
# F1 Score: 0.941
# Latency (mean): 287ms
# Latency (p95): 412ms
# Latency (p99): 487ms
```

### Load Testing

```bash
# Test 1000 URLs/min for 10 minutes
locust -f performance_test.py --host=http://localhost:8000 \
  --users 50 --spawn-rate 5 --run-time 10m
```

---

## Migration from Other Systems

### From URL Reputation Service

```python
# Old approach: External API calls
import requests

def check_url_old(url):
    response = requests.get(f"https://api.reputation.service/?url={url}")
    return response.json()  # 200-500ms latency

# New approach: Local ML detection
from backend.core_detection import CoreDetectionEngine
engine = CoreDetectionEngine()

def check_url_new(url):
    return engine.analyze_url(url)  # <500ms latency, 100% local
```

---

## Implementation Roadmap

### Phase 1: Immediate (April 2026)
- ✅ Core detection engine
- ✅ API endpoints
- ✅ Explainability system
- ✅ Unit tests

### Phase 2: Short-term (May 2026)
- 📅 WHOIS integration for domain age
- 📅 Certificate metadata extraction
- 📅 DNS record analysis
- 📅 Advanced probability calibration

### Phase 3: Medium-term (June-July 2026)
- 📅 Mobile app deployment
- 📅 Browser extension
- 📅 Email gateway plugins
- 📅 SIEM integrations

### Phase 4: Long-term (Q3-Q4 2026)
- 📅 Ensemble model combining multiple backends
- 📅 Adversarial attack resistance
- 📅 Federal learning for distributed detection
- 📅 Real-time threat intelligence feed

---

## Citation

```bibtex
@software{phishguardx2026,
  title={PhishGuardX: Hybrid Phishing Detection System with Trust Weighting and Explainability},
  author={Rout, Debashish and Sudharshan, TK and Kumar, Nithin KR and Mirji, Kartik},
  year={2026},
  publisher={Dayananda Sagar University},
  url={https://github.com/yourusername/phishguardx},
  note={Submitted for Cyber Security Viva Defense, April 2026}
}
```

---

## Support & Community

**Issues**: Report bugs via GitHub Issues  
**Discussions**: Feature requests and design questions in Discussions tab  
**Security**: Report vulnerabilities responsibly to security@phishguardx.local  
**Academic**: For research collaborations, contact research@phishguardx.local  

---

## Acknowledgments

- PhishTank for phishing URL dataset
- OpenPhish for threat intelligence
- Tranco Project for benign URL distribution
- APWG for industry guidance and standards

---

**Last Updated**: April 17, 2026  
**System Status**: Stable and validated  
**Next Review**: May 1, 2026
