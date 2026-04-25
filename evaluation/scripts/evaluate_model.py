from __future__ import annotations

from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[2]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from backend.models import train_and_benchmark_models


def evaluate() -> None:
    print("Running production benchmark comparison...")
    table = train_and_benchmark_models(
        dataset_path=None,
        save_model_path="backend/models/core_model.pkl",
        save_benchmark_path="evaluation/benchmark_results.csv",
        random_state=42,
    )
    print("\nModel comparison (Accuracy / Precision / Recall / F1):")
    print(table.to_string(index=False))
    print("\nSaved benchmark table to evaluation/benchmark_results.csv")
    print("Saved Random Forest primary model to backend/models/core_model.pkl")


if __name__ == "__main__":
    evaluate()
