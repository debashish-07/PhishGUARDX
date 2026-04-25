# type: ignore
# pyright: reportGeneralTypeIssues=false, reportUnknownMemberType=false, reportUnknownVariableType=false

"""
Large-Scale Evaluation for PhishGuard-X

Trains a lightweight classifier on generated feature columns and evaluates
performance on the 1M-benign scenario split files.

Usage:
  python training/evaluate_large_scale.py
  python training/evaluate_large_scale.py --data-dir training/data_1m_benign_full
"""

from __future__ import annotations

import argparse
import json
import time
from pathlib import Path
from typing import Dict, List

import numpy as np
import pandas as pd
from sklearn.linear_model import SGDClassifier
from sklearn.metrics import accuracy_score, confusion_matrix, f1_score, precision_score, recall_score, roc_auc_score
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
import pickle


def load_split(data_dir: Path, split_name: str) -> pd.DataFrame:
    split_path = data_dir / f"{split_name}.csv"
    if not split_path.exists():
        raise FileNotFoundError(f"Missing split file: {split_path}")
    return pd.read_csv(split_path)


def build_feature_columns(df: pd.DataFrame) -> List[str]:
    excluded = {"url", "label", "split"}
    cols = [c for c in df.columns if c not in excluded]
    if not cols:
        raise ValueError("No feature columns found in dataset.")
    return cols


def evaluate_split(model: Pipeline, x: np.ndarray, y: np.ndarray, threshold: float = 0.5) -> Dict[str, float]:
    start = time.perf_counter()
    y_prob = model.predict_proba(x)[:, 1]
    elapsed = time.perf_counter() - start

    y_pred = (y_prob >= threshold).astype(int)

    acc = accuracy_score(y, y_pred)
    prec = precision_score(y, y_pred, zero_division=0)
    rec = recall_score(y, y_pred, zero_division=0)
    f1 = f1_score(y, y_pred, zero_division=0)
    auc = roc_auc_score(y, y_prob)

    tn, fp, fn, tp = confusion_matrix(y, y_pred, labels=[0, 1]).ravel()
    fpr = fp / (fp + tn) if (fp + tn) else 0.0
    fnr = fn / (fn + tp) if (fn + tp) else 0.0

    latency_ms_per_url = (elapsed / max(len(y), 1)) * 1000.0

    return {
        "samples": int(len(y)),
        "accuracy": float(acc),
        "precision": float(prec),
        "recall": float(rec),
        "f1": float(f1),
        "auroc": float(auc),
        "fpr": float(fpr),
        "fnr": float(fnr),
        "tp": int(tp),
        "tn": int(tn),
        "fp": int(fp),
        "fn": int(fn),
        "threshold": float(threshold),
        "inference_latency_ms_per_url": float(latency_ms_per_url),
    }


def find_threshold_for_target_fpr(
    model: Pipeline,
    x_val: np.ndarray,
    y_val: np.ndarray,
    target_fpr: float = 0.01,
) -> Dict[str, float]:
    """Pick threshold on validation set with max F1 under target FPR."""
    y_prob = model.predict_proba(x_val)[:, 1]
    best: Dict[str, float] = {"threshold": 0.5, "f1": -1.0, "fpr": 1.0, "precision": 0.0, "recall": 0.0}

    for t in np.linspace(0.05, 0.999, 300):
        y_pred = (y_prob >= t).astype(int)
        tn, fp, _, _ = confusion_matrix(y_val, y_pred, labels=[0, 1]).ravel()
        fpr = fp / (fp + tn) if (fp + tn) else 0.0
        if fpr > target_fpr:
            continue

        precision = precision_score(y_val, y_pred, zero_division=0)
        recall = recall_score(y_val, y_pred, zero_division=0)
        f1 = f1_score(y_val, y_pred, zero_division=0)

        if f1 > best["f1"]:
            best = {
                "threshold": float(t),
                "f1": float(f1),
                "fpr": float(fpr),
                "precision": float(precision),
                "recall": float(recall),
            }

    return best


def main() -> None:
    parser = argparse.ArgumentParser(description="Large-scale 1M-benign evaluation")
    parser.add_argument("--data-dir", default="training/data_1m_benign_full", help="Directory with train/val/test CSVs")
    parser.add_argument("--output-dir", default="training/results", help="Output directory for metrics")
    args = parser.parse_args()

    data_dir = Path(args.data_dir)
    output_dir = Path(args.output_dir)
    model_dir = Path("training/models")
    output_dir.mkdir(parents=True, exist_ok=True)
    model_dir.mkdir(parents=True, exist_ok=True)

    train_df = load_split(data_dir, "train")
    val_df = load_split(data_dir, "val")
    test_df = load_split(data_dir, "test")

    feature_cols = build_feature_columns(train_df)

    x_train = train_df[feature_cols].to_numpy(dtype=np.float32)
    y_train = train_df["label"].to_numpy(dtype=np.int32)

    x_val = val_df[feature_cols].to_numpy(dtype=np.float32)
    y_val = val_df["label"].to_numpy(dtype=np.int32)

    x_test = test_df[feature_cols].to_numpy(dtype=np.float32)
    y_test = test_df["label"].to_numpy(dtype=np.int32)

    model = Pipeline([
        ("scaler", StandardScaler()),
        (
            "clf",
            SGDClassifier(
                loss="log_loss",
                alpha=1e-4,
                max_iter=2000,
                tol=1e-3,
                class_weight="balanced",
                random_state=42,
            ),
        ),
    ])

    train_start = time.perf_counter()
    model.fit(x_train, y_train)
    train_sec = time.perf_counter() - train_start

    val_metrics_default = evaluate_split(model, x_val, y_val, threshold=0.5)
    test_metrics_default = evaluate_split(model, x_test, y_test, threshold=0.5)

    calibration = find_threshold_for_target_fpr(model, x_val, y_val, target_fpr=0.01)
    cal_t = calibration["threshold"]

    val_metrics_calibrated = evaluate_split(model, x_val, y_val, threshold=cal_t)
    test_metrics_calibrated = evaluate_split(model, x_test, y_test, threshold=cal_t)

    summary = {
        "data_dir": str(data_dir),
        "feature_count": len(feature_cols),
        "train_samples": int(len(y_train)),
        "train_seconds": float(train_sec),
        "class_balance": {
            "train_phishing": int((y_train == 1).sum()),
            "train_benign": int((y_train == 0).sum()),
            "val_phishing": int((y_val == 1).sum()),
            "val_benign": int((y_val == 0).sum()),
            "test_phishing": int((y_test == 1).sum()),
            "test_benign": int((y_test == 0).sum()),
        },
        "calibration": {
            "method": "max_f1_under_fpr_constraint",
            "target_fpr": 0.01,
            "selected_on_validation": calibration,
        },
        "validation": {
            "default_threshold": val_metrics_default,
            "calibrated_threshold": val_metrics_calibrated,
        },
        "test": {
            "default_threshold": test_metrics_default,
            "calibrated_threshold": test_metrics_calibrated,
        },
    }

    json_path = output_dir / "large_scale_1m_eval.json"
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2)

    csv_path = output_dir / "large_scale_1m_eval.csv"
    pd.DataFrame([
        {"split": "validation", "mode": "default_threshold", **val_metrics_default},
        {"split": "validation", "mode": "calibrated_threshold", **val_metrics_calibrated},
        {"split": "test", "mode": "default_threshold", **test_metrics_default},
        {"split": "test", "mode": "calibrated_threshold", **test_metrics_calibrated},
    ]).to_csv(csv_path, index=False)

    model_path = model_dir / "large_scale_sgd_model.pkl"
    with open(model_path, "wb") as f:
        pickle.dump({"pipeline": model, "features": feature_cols}, f)

    print("Large-scale evaluation complete")
    print(f"Model:   {model_path}")
    print(f"JSON:    {json_path}")
    print(f"CSV:     {csv_path}")
    print("Test metrics (default threshold=0.5):")
    for key, value in test_metrics_default.items():
        if isinstance(value, float):
            print(f"  {key:32} {value:.6f}")
        else:
            print(f"  {key:32} {value}")

    print("Test metrics (calibrated threshold):")
    for key, value in test_metrics_calibrated.items():
        if isinstance(value, float):
            print(f"  {key:32} {value:.6f}")
        else:
            print(f"  {key:32} {value}")


if __name__ == "__main__":
    main()
