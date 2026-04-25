#!/usr/bin/env python3
"""Debug trust adjustment on github.com URL"""

from backend.feature_extraction import extract_url_features, build_model_features
from backend.scoring_engine import model_probability, heuristic_risk, clamp01
from urllib.parse import urlparse

url = 'https://github.com/torvalds/linux'

# Extract features
extracted = extract_url_features(url)
print('URL:', url)
print('Extracted features (key ones):')
print(f'  https: {extracted["https"]}')
print(f'  token_hits: {extracted["token_hits"]}')
print(f'  subdomain_depth: {extracted["subdomain_depth"]}')
print(f'  risky_host: {extracted["risky_host"]}')
print(f'  url_length: {extracted["url_length"]}')
print()

# Calculate components
model_features = build_model_features(extracted)
ml_prob = model_probability(model_features)
heur = heuristic_risk(extracted)
https_risk = 1.0 - extracted['https']

print('Scoring components:')
print(f'  ML Probability: {ml_prob:.4f}')
print(f'  Heuristic Risk: {heur:.4f}')
print(f'  HTTPS Risk: {https_risk:.4f}')
print()

# Base risk (before trust adjustment)
w_ml, w_heur, w_https = 0.72, 0.23, 0.05
base_risk = clamp01(w_ml * ml_prob + w_heur * heur + w_https * https_risk)
print(f'Base risk (before trust): {base_risk:.4f}')

# Apply trust adjustment
risk_after_trust = clamp01(base_risk * 0.75)
print(f'Risk after trust adjustment (x0.75): {risk_after_trust:.4f}')
print(f'Trust adjustment reduced risk by: {(base_risk - risk_after_trust):.4f}')
print()
print('Analysis:')
if base_risk > 0.70:
    print(f'  Without trust adjustment: would be PHISHING (>0.70)')
elif base_risk > 0.45:
    print(f'  Without trust adjustment: would be SUSPICIOUS (0.45-0.70)')
else:
    print(f'  Without trust adjustment: would be SAFE (<0.45)')

if risk_after_trust > 0.70:
    print(f'  With trust adjustment: PHISHING (>0.70)')
elif risk_after_trust > 0.45:
    print(f'  With trust adjustment: SUSPICIOUS (0.45-0.70)')
else:
    print(f'  With trust adjustment: SAFE (<0.45)')
