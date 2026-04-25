#!/usr/bin/env python3
"""Debug model predictions"""

from backend.runtime import engine
from backend.feature_extraction import extract_url_features, build_model_features
from backend.scoring_engine import model_probability

url = 'https://github.com/torvalds/linux'

signals = extract_url_features(url)
model_features = build_model_features(signals)

print("URL:", url)
print()
print("Features list (15 values for model input):")
for i, val in enumerate(model_features):
    print(f"  [{i:2d}] = {val}")
print()

# Call model_probability with the model
ml_prob_with_model = model_probability(model_features, model=engine.model, model_type="rf")
print(f"ML Probability (with loaded model): {ml_prob_with_model}")

# Call model_probability without model (fallback)
ml_prob_fallback = model_probability(model_features, model=None, model_type="rf")
print(f"ML Probability (fallback): {ml_prob_fallback}")
print()

# Try direct model prediction
if engine.model:
    try:
        print("Model object:", type(engine.model))
        if hasattr(engine.model, 'predict_proba'):
            proba = engine.model.predict_proba([model_features])[0]
            print(f"Direct prediction: {proba}")
        elif isinstance(engine.model, dict):
            print("Model is dict with keys:", list(engine.model.keys()))
            if 'rf' in engine.model:
                model_rf = engine.model['rf']
                if hasattr(model_rf, 'predict_proba'):
                    proba = model_rf.predict_proba([model_features])[0]
                    print(f"RF model prediction: {proba}")
    except Exception as e:
        print(f"Error: {e}")
