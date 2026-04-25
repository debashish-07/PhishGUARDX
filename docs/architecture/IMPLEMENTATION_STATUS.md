# Implementation Status (Current)

## Status

Current PhishGuardX core detection implementation is active and documented in:

- backend/scoring_engine.py
- backend/core_detection.py
- backend/feature_extraction.py
- backend/rule_engine.py
- backend/ledger.py

## Active Detection Design

- Hybrid score: ML + heuristic + HTTPS
- Trusted-domain post-score weighting
- UUID/obfuscated-path contextual adjustment
- Rule overrides
- Uncertainty-band classification
- Explainable reasons in final output

## Validation Snapshot

- Targeted trusted-domain stability scenario validated
- Scoring unit tests passed
- UUID scenario tests passed
- Benchmark artifacts available in evaluation/

## Note

Legacy experimental module narratives are archived and not considered current architecture.
