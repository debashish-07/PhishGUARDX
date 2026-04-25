# Documentation Index (Current Architecture)

This documentation index is aligned to the active PhishGuardX hybrid detection implementation.

## Primary Source Documents

Use these as the current, submission-safe references:

- ../README.md
- ../ARCHITECTURE.md
- ../PROJECT_REPORT.md

## Current System Summary

PhishGuardX is a URL-based phishing detection system using:

- deterministic feature extraction
- hybrid risk scoring (ML + heuristic + HTTPS)
- rule overrides
- trusted-domain and obfuscation-aware post-processing
- uncertainty-band classification
- explainable reasons and trust-ledger auditability

Pipeline:

User -> API -> Feature Extraction -> Hybrid Scoring -> Rule Overrides -> Result -> Trust Ledger -> UI

## Repository Notes

Some historical files in docs/ and REPORT/ represent earlier experimental phases.
Those files are useful for project history, but they are not the authoritative description of the current production-style backend pipeline.

For final-year submission consistency, prefer:

1. README.md
2. ARCHITECTURE.md
3. PROJECT_REPORT.md

## Recommended Next Cleanup (Optional)

To fully remove legacy terminology across all docs, perform a phased cleanup of:

- docs/architecture/
- docs/guides/
- docs/research/
- REPORT/Phase1_Report.md
- PROJECT_STRUCTURE.md

This step is optional and can be done after final submission documents are approved.
