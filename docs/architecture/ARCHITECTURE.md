# Architecture (Current)

This document is aligned to the active PhishGuardX backend pipeline.

## Canonical Pipeline

User -> API -> Feature Extraction -> Hybrid Scoring -> Rule Overrides -> Result -> Trust Ledger -> UI

## Runtime Order

1. Feature extraction
2. ML + heuristic + HTTPS weighted score
3. Base risk score
4. Trusted-domain risk adjustment
5. UUID/obfuscated-path adjustment
6. Rule overrides
7. Classification using uncertainty band

## Threshold Policy

- safe: risk < 0.45
- suspicious: 0.45 <= risk <= 0.70
- phishing: risk > 0.70

## Source of Truth

For full details, refer to:

- ../../ARCHITECTURE.md
- ../../README.md
- ../../PROJECT_REPORT.md
