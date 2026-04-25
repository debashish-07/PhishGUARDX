#!/usr/bin/env python3
"""Debug why github.com gets different scores"""

from backend.runtime import engine
from backend.feature_extraction import extract_url_features
from backend.scoring_engine import compute_risk_score

url = 'https://github.com/torvalds/linux'

# Get result from engine
result = engine.analyze_url(url)
print(f"Via engine.analyze_url():")
print(f"  Label: {result['label']}")
print(f"  Risk: {result['risk']}")
print(f"  Reasons: {result['reasons']}")
print()

# Get result from compute_risk_score directly
signals = extract_url_features(url)
risk_result = compute_risk_score(url, features=signals, model=engine.model, model_type="rf")
print(f"Via compute_risk_score():")
print(f"  Label: {risk_result['label']}")
print(f"  Risk: {risk_result['risk_score']}")
print(f"  ML Prob: {risk_result['ml_probability']}")
print(f"  Heuristic: {risk_result['heuristic_score']}")
print(f"  Override reasons: {risk_result['override_reasons']}")
