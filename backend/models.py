from __future__ import annotations

import csv
import pickle
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import numpy as np
import pandas as pd
from sklearn.calibration import CalibratedClassifierCV
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, balanced_accuracy_score, confusion_matrix, f1_score, precision_score, recall_score

from .feature_extraction import build_model_features, extract_url_features


def _load_url_label_csv(path: Path) -> Tuple[List[str], np.ndarray]:
    if not path.exists():
        raise FileNotFoundError(f"Dataset not found: {path}")

    with path.open("r", encoding="utf-8", newline="") as f:
        rows = list(csv.DictReader(f))

    if not rows:
        raise ValueError(f"Dataset is empty: {path}")
    if "url" not in rows[0] or "label" not in rows[0]:
        raise ValueError(f"Dataset must contain 'url' and 'label' columns: {path}")

    urls: List[str] = []
    labels_list: List[int] = []
    for row in rows:
        raw_url = str(row.get("url", "")).strip()
        if not raw_url:
            continue
        urls.append(raw_url)
        labels_list.append(1 if str(row.get("label", "")).strip().lower() in {"1", "phishing", "malicious"} else 0)

    labels = np.array(labels_list, dtype=np.int64)
    return urls, labels


def _feature_matrix(urls: List[str]) -> np.ndarray:
    vectors: List[List[float]] = []
    for url in urls:
        features = extract_url_features(url)
        vectors.append(build_model_features(features))
    return np.array(vectors, dtype=np.float64)


def _binary_metrics(y_true: np.ndarray, y_pred: np.ndarray) -> Dict[str, float]:
    tn, fp, fn, tp = confusion_matrix(y_true, y_pred, labels=[0, 1]).ravel()
    fpr = float(fp / (fp + tn)) if (fp + tn) > 0 else 0.0
    tnr = float(tn / (tn + fp)) if (tn + fp) > 0 else 0.0
    return {
        "accuracy": float(accuracy_score(y_true, y_pred)),
        "balanced_accuracy": float(balanced_accuracy_score(y_true, y_pred)),
        "precision": float(precision_score(y_true, y_pred, zero_division=0)),
        "recall": float(recall_score(y_true, y_pred, zero_division=0)),
        "f1": float(f1_score(y_true, y_pred, zero_division=0)),
        "fpr": fpr,
        "specificity": tnr,
        "tp": float(tp),
        "tn": float(tn),
        "fp": float(fp),
        "fn": float(fn),
    }


def _find_best_threshold(
    y_true: np.ndarray,
    probs: np.ndarray,
    min_precision: float = 0.95,
    low: float = 0.85,
    high: float = 0.93,
    steps: int = 161,
) -> float:
    candidates = np.linspace(low, high, steps)
    best_threshold = float(high)
    best_recall = -1.0
    best_fpr = 1.0

    for threshold in candidates:
        y_pred = (probs > threshold).astype(np.int64)
        m = _binary_metrics(y_true, y_pred)
        if m["precision"] < min_precision:
            continue
        if m["recall"] > best_recall or (m["recall"] == best_recall and m["fpr"] < best_fpr):
            best_recall = m["recall"]
            best_fpr = m["fpr"]
            best_threshold = float(threshold)

    if best_recall >= 0.0:
        return best_threshold

    # Fallback: choose highest precision in range, then highest recall.
    best_threshold = float(high)
    best_precision = -1.0
    best_recall = -1.0
    for threshold in candidates:
        y_pred = (probs > threshold).astype(np.int64)
        m = _binary_metrics(y_true, y_pred)
        if m["precision"] > best_precision or (m["precision"] == best_precision and m["recall"] > best_recall):
            best_precision = m["precision"]
            best_recall = m["recall"]
            best_threshold = float(threshold)
    return best_threshold


def _predict_with_margin(probs: np.ndarray, threshold: float, margin: float) -> np.ndarray:
    # Only classify as phishing when score is clearly above the tuned threshold.
    return (probs > (threshold + margin)).astype(np.int64)


def train_and_benchmark_models(
    dataset_path: Optional[str] = None,
    save_model_path: str = "backend/models/core_model.pkl",
    save_benchmark_path: str = "evaluation/benchmark_results_100k.csv",
    random_state: int = 42,
) -> pd.DataFrame:
    balanced_train_path = Path(dataset_path) if dataset_path else Path("training/data_100k_balanced/train.csv")
    imbalanced_val_path = Path("training/data_1m_benign_full/val.csv")
    imbalanced_test_path = Path("training/data_1m_benign_full/test.csv")

    train_urls, y_train = _load_url_label_csv(balanced_train_path)
    val_urls, y_val = _load_url_label_csv(imbalanced_val_path)
    test_urls, y_test = _load_url_label_csv(imbalanced_test_path)

    X_train = _feature_matrix(train_urls)
    X_val = _feature_matrix(val_urls)
    X_test = _feature_matrix(test_urls)

    rf = RandomForestClassifier(
        n_estimators=450,
        max_depth=18,
        min_samples_leaf=2,
        class_weight="balanced",
        random_state=random_state,
        n_jobs=-1,
    )
    rf.fit(X_train, y_train)

    # BEFORE: uncalibrated model with baseline 0.5 threshold.
    uncal_test_probs = rf.predict_proba(X_test)[:, 1]
    before_pred = (uncal_test_probs > 0.50).astype(np.int64)
    before_metrics = _binary_metrics(y_test, before_pred)

    # Calibrate on imbalanced validation set (Platt scaling via sigmoid).
    calibrator = CalibratedClassifierCV(rf, method="sigmoid", cv="prefit")
    calibrator.fit(X_val, y_val)

    val_probs = calibrator.predict_proba(X_val)[:, 1]
    tuned_threshold = _find_best_threshold(
        y_true=y_val,
        probs=val_probs,
        min_precision=0.95,
        low=0.85,
        high=0.93,
    )
    decision_margin = 0.03

    cal_test_probs = calibrator.predict_proba(X_test)[:, 1]
    calibrated_half_pred = (cal_test_probs > 0.50).astype(np.int64)
    after_pred = _predict_with_margin(cal_test_probs, tuned_threshold, decision_margin)

    calibrated_half_metrics = _binary_metrics(y_test, calibrated_half_pred)
    after_metrics = _binary_metrics(y_test, after_pred)

    rows: List[Dict[str, float | str]] = [
        {
            "model": "RF (Before, Uncalibrated @0.50)",
            **before_metrics,
        },
        {
            "model": "RF (Calibrated @0.50)",
            **calibrated_half_metrics,
        },
        {
            "model": f"RF (After, Calibrated @{tuned_threshold:.3f} + margin 0.03)",
            **after_metrics,
        },
    ]

    result_df = pd.DataFrame(rows)
    Path(save_benchmark_path).parent.mkdir(parents=True, exist_ok=True)
    result_df.to_csv(save_benchmark_path, index=False)

    payload: Dict[str, Any] = {
        "rf": calibrator,
        "xgb": None,
        "meta": {
            "random_state": random_state,
            "train_path": str(balanced_train_path),
            "val_path": str(imbalanced_val_path),
            "test_path": str(imbalanced_test_path),
            "train_rows": int(len(y_train)),
            "val_rows": int(len(y_val)),
            "test_rows": int(len(y_test)),
            "calibration": "sigmoid",
            "class_weight": "balanced",
            "mid_threshold": 0.45,
            "decision_threshold": float(tuned_threshold),
            "decision_margin": float(decision_margin),
            "threshold_precision_target": 0.95,
            "threshold_search_range": [0.85, 0.93],
            "before_confusion_matrix": {
                "tn": before_metrics["tn"],
                "fp": before_metrics["fp"],
                "fn": before_metrics["fn"],
                "tp": before_metrics["tp"],
            },
            "after_confusion_matrix": {
                "tn": after_metrics["tn"],
                "fp": after_metrics["fp"],
                "fn": after_metrics["fn"],
                "tp": after_metrics["tp"],
            },
        },
    }

    model_file = Path(save_model_path)
    model_file.parent.mkdir(parents=True, exist_ok=True)
    with model_file.open("wb") as f:
        pickle.dump(payload, f)

    return result_df


if __name__ == "__main__":
    table = train_and_benchmark_models()
    print(table.to_string(index=False))
