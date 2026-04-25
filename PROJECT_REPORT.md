# Project Report: PhishGuardX Hybrid Phishing Detection System

## 1. Introduction

Phishing attacks continue to exploit user trust through deceptive URLs, domain impersonation, and obfuscated path patterns.
PhishGuardX is a final-year cybersecurity project that implements a production-style hybrid phishing detection pipeline for URL risk analysis.

The project evolved from an earlier experimental architecture to a cleaner backend-first design with deterministic policies and explainable results.
The current implementation emphasizes three practical requirements:

1. Reliable phishing detection sensitivity
2. Reduced false positives on trusted domains
3. Stable and explainable classification behavior

PhishGuardX integrates API-driven scanning, modular feature extraction, hybrid scoring, rule overrides, and an auditable trust ledger.

## 2. Problem Statement

Earlier project versions included architecture mismatch between documentation and runtime behavior.
The codebase had moved to a hybrid backend scorer while documents still described a multi-module experimental pipeline.

Operationally, the detector also showed instability on trusted-domain variants near class boundaries.
Root causes included:

- insufficient domain-context weighting
- aggressive obfuscation penalty regardless of trust context
- sharp threshold boundaries causing label flipping

The project goal is to maintain strong phishing detection while improving consistency and documentation accuracy.

## 3. Proposed System (PhishGuardX Core)

PhishGuardX core is a hybrid, deterministic, explainable phishing detection system.
It performs URL-only security analysis with this layered strategy:

1. Extract structural features from URL
2. Compute ML phishing probability
3. Compute heuristic risk
4. Add HTTPS risk contribution
5. Apply contextual policy adjustments
6. Apply rule overrides
7. Emit final verdict with explanations

The system is designed for reproducibility, lightweight inference, and clear reason-level output.

## 4. Architecture (Simple Pipeline)

User -> API -> Feature Extraction -> Hybrid Scoring -> Rule Overrides -> Result -> Trust Ledger -> UI

Detailed runtime order:

feature extraction
-> ML + heuristic + HTTPS weighted scoring
-> base risk
-> domain trust adjustment
-> UUID/path adjustment
-> rule overrides
-> uncertainty-band classification

This sequence is implemented in backend/scoring_engine.py and orchestrated by backend/core_detection.py.

## 5. Detection Methodology

### 5.1 Feature Extraction

PhishGuardX extracts deterministic URL signals such as:

- protocol security (https)
- URL length and special-character density
- subdomain depth and token/keyword hits
- suspicious TLD and brand-term indicators
- host-is-IP and encoded/punycode patterns
- long, hash-like, and UUID-like path segment indicators

These features are transformed into model inputs and heuristic components.

### 5.2 Hybrid Scoring

Weighted base risk formula:

Risk_base = clamp01(0.72 * P_ml + 0.23 * R_heur + 0.05 * R_https)

Where:

- P_ml: machine-learning probability
- R_heur: heuristic risk score
- R_https: 1 - https signal

### 5.3 Rule Overrides

After base scoring and contextual adjustments, deterministic override rules are applied.
These rules increase confidence on known high-risk patterns and generate reason strings used in explainability.

## 6. Dataset and Training

PhishGuardX training and benchmarking support large URL datasets.
Repository benchmark artifacts include:

- evaluation/benchmark_results.csv
- evaluation/benchmark_results_100k.csv

The project pipeline uses or targets major phishing and benign URL sources:

- PhishTank
- OpenPhish
- URLhaus
- Tranco

Model training module:

- backend/models.py

Supported model families include:

- Logistic Regression
- Decision Tree
- Random Forest
- XGBoost (optional, if dependency available)

Hybrid benchmark mode evaluates RF + rule policy combination and compares with rules-only baseline.

## 7. Benchmark Results (Summary)

From evaluation/benchmark_results_100k.csv:

| Model | Accuracy | Precision | Recall | F1 | FPR |
|------|----------|-----------|--------|----|-----|
| Random Forest | 0.9781 | 0.9848 | 0.9712 | 0.9779 | 0.0150 |
| XGBoost | 0.9777 | 0.9856 | 0.9696 | 0.9775 | 0.0142 |
| Hybrid (RF + Rules) | 0.9709 | 0.9974 | 0.9443 | 0.9701 | 0.0025 |
| Rules Only | 0.6380 | 1.0000 | 0.2759 | 0.4325 | 0.0000 |

Key interpretation:

- Random Forest gives the strongest balanced F1 in this benchmark.
- Hybrid policy achieves very high precision and very low false positive rate.
- Rules-only baseline is too restrictive and has poor recall.

## 8. Trust Ledger (Audit System)

PhishGuardX includes a trust ledger to keep auditable scan records.
The ledger stores analysis metadata with hash-linked entries and supports integrity checks.

Benefits:

- traceability of decisions
- tamper-evident record chain
- useful for review, debugging, and compliance narratives

Implementation module:

- backend/ledger.py

## 9. Limitations

Current known limitations:

1. Model calibration gap on some benign, path-rich URLs can still create false positives.
2. Trusted domain list is static and currently maintained in code.
3. URL-only analysis does not inspect live page content, scripts, or certificates.
4. Broad historical docs still contain legacy narrative and need phased cleanup.

## 10. Future Work

1. Retrain and calibrate models using broader benign long-path samples.
2. Externalize trust domain policy and threshold tuning to config files.
3. Add optional signals such as certificate metadata and domain age.
4. Expand automated regression suites with adversarial URL mutations.
5. Complete full repository-wide documentation cleanup for all legacy files.

## 11. Conclusion

PhishGuardX now reflects a cleaner, production-style hybrid phishing detection architecture.
The current implementation combines model probability, heuristics, HTTPS risk, contextual trust logic, obfuscation-aware path handling, and rule overrides under a stable uncertainty-band classifier.

This design improves practical reliability and explainability while preserving strong phishing detection performance.
It is suitable for final-year submission as a realistic cybersecurity engineering project with measurable results and clear future extensibility.
