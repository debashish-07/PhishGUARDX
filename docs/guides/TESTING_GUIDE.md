# Testing Guide (Current PhishGuardX)

## Scope

This guide covers testing for the current hybrid backend detection system.

## Core Test Areas

1. Feature extraction consistency
2. Hybrid risk scoring behavior
3. Trusted-domain adjustment behavior
4. UUID/obfuscation path handling
5. Threshold boundary stability (0.45 and 0.70)
6. Rule override behavior
7. Explainability reason output

## Suggested Execution Order

1. Unit tests for scoring engine helpers
2. UUID scenario tests
3. Regression URL set tests
4. API route tests

## Validation Notes

- Ensure output includes label, risk score, and reasons.
- Verify trusted-domain adjustments are applied after base scoring.
- Verify obfuscation signal is softened, not removed, for trusted domains.
- Verify suspicious band is used between safe and phishing classes.

## Reporting

Attach test outputs to submission appendix.
Use benchmark CSV artifacts in evaluation/ for metric claims.
