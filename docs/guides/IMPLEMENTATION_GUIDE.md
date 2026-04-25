# Implementation Guide (Current PhishGuardX)

## 1. Backend Setup

1. Create and activate Python virtual environment.
2. Install dependencies from requirements.txt.
3. Run backend service and verify health endpoint.

## 2. Frontend Setup

1. Install Node dependencies.
2. Run development server.
3. Use UI to submit URL scans against backend API.

## 3. Core Detection Pipeline

Runtime sequence:

feature extraction
-> ML + heuristic + HTTPS weighted score
-> trust adjustment
-> UUID/path adjustment
-> rule overrides
-> uncertainty-band classification

## 4. Key Modules

- backend/feature_extraction.py
- backend/scoring_engine.py
- backend/rule_engine.py
- backend/core_detection.py
- backend/ledger.py

## 5. Verification

Run current test suites:

- scoring logic tests
- UUID detection tests
- regression samples

## 6. Documentation Source of Truth

Use these files for current architecture and submission:

- ../../README.md
- ../../ARCHITECTURE.md
- ../../PROJECT_REPORT.md
