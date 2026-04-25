# PhishGuardX Architecture

## Current System Architecture

PhishGuardX is a hybrid phishing URL detection system with API-driven analysis and explainable output.
The architecture below reflects the current implementation used by backend runtime.

## High-Level Pipeline

User -> API -> Feature Extraction -> Hybrid Scoring -> Rule Overrides -> Result -> Trust Ledger -> UI

## Runtime Flow (Detailed)

1. Feature extraction
2. ML + heuristic + HTTPS weighted score
3. Base risk score
4. Trusted-domain adjustment
5. UUID/obfuscated-path adjustment
6. Rule overrides
7. Uncertainty-band classification
8. Explainability packaging and ledger append

## Core Components

### API Layer

- Entry routes accept URL scan requests.
- Route handlers delegate to core detection engine.

### Detection Orchestrator

Module: backend/core_detection.py

Responsibilities:

- call feature extraction and risk computation
- build reasons and confidence metadata
- append audit block to trust ledger
- return normalized response object

### Feature Extraction

Module: backend/feature_extraction.py

Outputs deterministic URL signals including:

- https, url_length, special_ratio
- keyword and structural token indicators
- suspicious host/path indicators
- uuid/hash-like segment indicators

### Hybrid Scoring

Module: backend/scoring_engine.py

Base score:

Risk_base = clamp01(0.72 * ML + 0.23 * Heuristic + 0.05 * HTTPS_risk)

Post-score policies:

- apply_domain_trust()
- detect_uuid_pattern()
- adjust_path_risk()
- apply_rule_overrides()
- classify_with_uncertainty()

### Rule Engine

Module: backend/rule_engine.py

Provides deterministic override logic and heuristic risk behavior for known suspicious signals.

### Trust Ledger

Module: backend/ledger.py

Stores hash-linked scan records to support auditability and integrity checking.

## Classification Policy

Threshold band:

- safe: risk < 0.45
- suspicious: 0.45 <= risk <= 0.70
- phishing: risk > 0.70

This uncertainty band reduces unstable label flipping near boundaries.

## Trusted-Domain Policy

Current trusted domains include:

- google.com
- chatgpt.com
- microsoft.com
- openai.com
- github.com
- apple.com

Policy behavior:

- Apply risk reduction after base score for trusted domains.
- Do not bypass obfuscation checks.
- Keep reasons explicit in output.

## Obfuscation Policy

Path patterns include:

- UUID format
- long hexadecimal segments
- long random alphanumeric segments

Behavior:

- untrusted domain -> stronger risk increase
- trusted domain -> softened increase

## Notes

This document is the authoritative architecture summary for current PhishGuardX behavior.
Legacy experimental narratives are not part of the active backend detection design.
