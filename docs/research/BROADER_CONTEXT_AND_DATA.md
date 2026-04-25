# Broader Context and Data (Current Scope)

This research note now focuses on the active PhishGuardX implementation scope.

## Threat Context

Phishing continues to rely heavily on URL deception, path obfuscation, and domain impersonation.
A practical detector must balance sensitivity, false positives, and explainability.

## Current Project Positioning

PhishGuardX uses:

- deterministic URL feature extraction
- hybrid ML and heuristic scoring
- trusted-domain context handling
- obfuscation-aware path adjustment
- uncertainty-band final classification

## Data Context

Benchmark artifacts included in repository:

- ../../evaluation/benchmark_results.csv
- ../../evaluation/benchmark_results_100k.csv

Dataset pipeline sources include:

- PhishTank
- OpenPhish
- URLhaus
- Tranco

## Note

This file intentionally avoids legacy experimental architecture claims and aligns to active backend behavior.
