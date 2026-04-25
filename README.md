# PhishGuardX - Hybrid Phishing Detection System

PhishGuardX is a production-style URL phishing detection system built around a hybrid backend pipeline.
It combines machine learning probability, deterministic heuristics, and HTTPS risk signals, then applies explainable post-processing policies before returning a verdict.

## System Overview

PhishGuardX provides URL-based phishing detection through API-driven analysis.
The current core pipeline is:

User -> API -> Feature Extraction -> Hybrid Scoring -> Rule Overrides -> Result -> Trust Ledger -> UI

Key characteristics:

- URL-focused phishing risk analysis
- Hybrid score from ML + heuristic + HTTPS
- Deterministic post-processing policy
- Explainable output with reason strings
- Trust ledger integration for auditability

## Current Architecture

1. API Layer
   - FastAPI routes receive URL scan requests.

2. Feature Extraction Layer
   - Structural URL signals are computed deterministically.

3. Hybrid Scoring Layer
   - Weighted base score using:
     - ML probability: 0.72
     - heuristic risk: 0.23
     - HTTPS risk: 0.05

4. Post-Scoring Policy Layer
   - Domain trust weighting for approved domains.
   - UUID/obfuscation-aware path risk adjustment.
   - Rule override application.

5. Classification Layer
   - Uncertainty band thresholds:
     - safe: risk < 0.45
     - suspicious: 0.45 <= risk <= 0.70
     - phishing: risk > 0.70

6. Explainability and Audit Layer
   - Top reasons are returned with each decision.
   - Trust ledger records analysis outcomes.

## Key Features

- Machine learning-based detection (Random Forest and XGBoost training support)
- Rule and heuristic validation for deterministic security policy
- Explainable output with top reasons and confidence context
- Trust ledger audit trail with chained record entries
- Benchmark-ready training and evaluation scripts

## Dataset

Training and evaluation pipelines are built for large URL datasets.
Current benchmark artifacts include a 100k-scale experiment and balanced test splits.

Planned and used data sources in project pipeline:

- PhishTank
- OpenPhish
- URLhaus
- Tranco

Repository evidence:

- evaluation/benchmark_results_100k.csv
- evaluation/benchmark_results.csv

## Performance Snapshot

From evaluation/benchmark_results_100k.csv:

- Random Forest F1: 0.9779
- Random Forest precision: 0.9848
- Random Forest recall: 0.9712
- Hybrid (RF + Rules) precision: 0.9974
- Hybrid (RF + Rules) F1: 0.9701
- Hybrid false positive rate: 0.0025

Interpretation:

- Random Forest provides best balanced F1 in this benchmark.
- Hybrid policy improves precision and reduces false positives further.
- Tradeoff is lower recall than standalone RF, which is expected with stricter rule policy.

## API Detection Flow

At runtime, core detection follows:

1. Extract URL signals.
2. Compute ML probability.
3. Compute heuristic risk.
4. Compute weighted base risk.
5. Apply trusted-domain adjustment.
6. Apply UUID/obfuscated-path adjustment.
7. Apply rule overrides.
8. Classify via uncertainty band.
9. Return verdict, risk score, reasons, and ledger metadata.

## Project Structure (High-Level)

- backend/
  - core_detection.py
  - scoring_engine.py
  - feature_extraction.py
  - rule_engine.py
  - ledger.py
  - models.py
  - runtime.py
- evaluation/
  - benchmark_results.csv
  - benchmark_results_100k.csv
- scripts/
  - cleanup-stale-artifacts.js
- app/ and src/
  - frontend UI and integration components

## Local Run

Backend and evaluation use Python environment.
Frontend uses Node.js tooling.

Typical commands:

- npm install
- npm run dev
- .venv/Scripts/python -m backend.main

Model benchmarking:

- .venv/Scripts/python -m backend.models

## Notes on Legacy Material

This repository contains historical documents from earlier experimental phases.
Primary reference documents for current architecture are:

- README.md
- ARCHITECTURE.md
- PROJECT_REPORT.md

Use these files for final-year submission content and implementation alignment.
