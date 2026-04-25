# Training Pipeline Summary (Current)

## Overview

PhishGuardX model benchmarking is managed through backend/models.py and training scripts in ../../training.

## Supported Models

- Logistic Regression
- Decision Tree
- Random Forest
- XGBoost (optional)

## Hybrid Evaluation

The repository evaluates model-only and hybrid policy modes, including:

- Random Forest
- Hybrid (RF + Rules)
- Rules Only baseline

## Benchmark Artifacts

- ../../evaluation/benchmark_results.csv
- ../../evaluation/benchmark_results_100k.csv

## Current Interpretation

- Random Forest: strongest balanced F1 in available benchmark artifacts
- Hybrid mode: very high precision and lower false positive rate
- Rules-only mode: insufficient recall

This summary is aligned to current backend implementation and avoids legacy module references.
