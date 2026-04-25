from __future__ import annotations

from pathlib import Path

from .core_detection import CoreDetectionEngine


BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "models" / "core_model.pkl"
LEDGER_PATH = BASE_DIR / "data" / "trust_ledger.json"


engine = CoreDetectionEngine(model_path=str(MODEL_PATH), ledger_path=str(LEDGER_PATH))