# Training Pipeline (Current)

This directory contains training utilities for PhishGuardX URL phishing detection models.

## Scope

Current training focus is aligned to hybrid backend scoring with model candidates used in benchmarking.

## Primary Scripts

- train.py
- train_ensemble.py
- run_training.py
- evaluate_large_scale.py
- export_onnx.py

## Model Families

- Logistic Regression
- Decision Tree
- Random Forest
- XGBoost (optional dependency)

## Benchmark Artifacts

- ../evaluation/benchmark_results.csv
- ../evaluation/benchmark_results_100k.csv

## Notes

Training documentation is aligned to current backend architecture.
Use top-level README.md and PROJECT_REPORT.md for final submission narrative.
