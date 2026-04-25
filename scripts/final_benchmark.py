#!/usr/bin/env python3
"""
Final Benchmark & Validation Script for PhishGuardX
Compares Rule-based vs Hybrid detection on sample dataset
"""

import csv
import sys
import json
from pathlib import Path
from typing import Dict, List, Tuple

# Add parent to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from backend.runtime import engine
from backend.feature_extraction import extract_url_features
from backend.rule_engine import apply_rule_overrides, heuristic_risk


def load_sample_dataset(csv_path: str) -> List[Tuple[str, str]]:
    """Load URLs and true labels from CSV"""
    urls_with_labels = []
    with open(csv_path, 'r') as f:
        reader = csv.DictReader(f)
        for row in reader:
            urls_with_labels.append((row['url'], row['label']))
    return urls_with_labels


def baseline_rule_only(url: str) -> str:
    """Baseline: Rule-based detection only (heuristics)"""
    features = extract_url_features(url)
    heur_risk = heuristic_risk(features)
    heur_risk = apply_rule_overrides(heur_risk, features)
    
    # Simple thresholds for baseline
    if heur_risk > 0.65:
        return "phishing"
    if heur_risk >= 0.40:
        return "suspicious"
    return "safe"


def hybrid_detection(url: str) -> str:
    """Hybrid: Full PhishGuardX system"""
    result = engine.analyze_url(url)
    return result['label']


def compute_metrics(y_true: List[str], y_pred: List[str]) -> Dict[str, float]:
    """Compute accuracy, precision, recall, F1"""
    from collections import defaultdict
    
    # Convert to binary (phishing vs not)
    y_true_bin = [1 if label == "phishing" else 0 for label in y_true]
    y_pred_bin = [1 if label == "phishing" else 0 for label in y_pred]
    
    tp = sum(1 for t, p in zip(y_true_bin, y_pred_bin) if t == 1 and p == 1)
    tn = sum(1 for t, p in zip(y_true_bin, y_pred_bin) if t == 0 and p == 0)
    fp = sum(1 for t, p in zip(y_true_bin, y_pred_bin) if t == 0 and p == 1)
    fn = sum(1 for t, p in zip(y_true_bin, y_pred_bin) if t == 1 and p == 0)
    
    accuracy = (tp + tn) / len(y_true) if len(y_true) > 0 else 0
    precision = tp / (tp + fp) if (tp + fp) > 0 else 0
    recall = tp / (tp + fn) if (tp + fn) > 0 else 0
    f1 = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0
    
    return {
        "accuracy": round(accuracy, 4),
        "precision": round(precision, 4),
        "recall": round(recall, 4),
        "f1_score": round(f1, 4),
        "tp": tp,
        "tn": tn,
        "fp": fp,
        "fn": fn,
    }


def main():
    csv_path = "datasets/sample_urls.csv"
    
    if not Path(csv_path).exists():
        print(f"ERROR: {csv_path} not found")
        sys.exit(1)
    
    print("=" * 80)
    print("PhishGuardX FINAL BENCHMARK & COMPARISON")
    print("=" * 80)
    print()
    
    # Load dataset
    urls_labels = load_sample_dataset(csv_path)
    print(f"Loaded {len(urls_labels)} URLs from {csv_path}")
    print()
    
    # Run both systems
    y_true = []
    y_baseline = []
    y_hybrid = []
    results_detailed = []
    
    print("Running detections...")
    for url, true_label in urls_labels:
        y_true.append(true_label)
        
        baseline_pred = baseline_rule_only(url)
        y_baseline.append(baseline_pred)
        
        hybrid_pred = hybrid_detection(url)
        y_hybrid.append(hybrid_pred)
        
        results_detailed.append({
            "url": url[:55],
            "true": true_label,
            "baseline": baseline_pred,
            "hybrid": hybrid_pred,
            "match_baseline": "✓" if baseline_pred == true_label else "✗",
            "match_hybrid": "✓" if hybrid_pred == true_label else "✗",
        })
    
    # Compute metrics
    baseline_metrics = compute_metrics(y_true, y_baseline)
    hybrid_metrics = compute_metrics(y_true, y_hybrid)
    
    # Print comparison table
    print()
    print("=" * 80)
    print("BENCHMARK COMPARISON TABLE")
    print("=" * 80)
    print()
    print(f"{'Metric':<15} {'Rule-Based Only':<20} {'Hybrid (PhishGuardX)':<20} {'Improvement':<15}")
    print("-" * 80)
    
    for metric in ["accuracy", "precision", "recall", "f1_score"]:
        baseline_val = baseline_metrics[metric]
        hybrid_val = hybrid_metrics[metric]
        improvement = hybrid_val - baseline_val
        improvement_str = f"+{improvement:.4f}" if improvement > 0 else f"{improvement:.4f}"
        
        print(f"{metric:<15} {baseline_val:<20.4f} {hybrid_val:<20.4f} {improvement_str:<15}")
    
    print()
    print("Confusion Matrix (Hybrid System):")
    print(f"  True Positives (Phishing correctly detected):  {hybrid_metrics['tp']}")
    print(f"  True Negatives (Safe correctly identified):    {hybrid_metrics['tn']}")
    print(f"  False Positives (Safe flagged as phishing):    {hybrid_metrics['fp']}")
    print(f"  False Negatives (Phishing missed):             {hybrid_metrics['fn']}")
    print()
    
    # Show prediction disagreements
    print("=" * 80)
    print("DETAILED PREDICTIONS (Hybrid Mismatches)")
    print("=" * 80)
    print()
    print(f"{'URL':<55} {'True':<10} {'Pred':<12} {'Status'}")
    print("-" * 90)
    
    for detail in results_detailed:
        if detail['match_hybrid'] == '✗':
            print(f"{detail['url']:<55} {detail['true']:<10} {detail['hybrid']:<12} MISMATCH")
    
    if all(detail['match_hybrid'] == '✓' for detail in results_detailed):
        print("✓ All predictions correct!")
    
    # Save detailed results to JSON
    output_file = "scripts/benchmark_results.json"
    with open(output_file, 'w') as f:
        json.dump({
            "timestamp": str(Path.cwd()),
            "dataset_size": len(urls_labels),
            "baseline_metrics": baseline_metrics,
            "hybrid_metrics": hybrid_metrics,
            "detailed_results": results_detailed,
        }, f, indent=2)
    
    print()
    print(f"Detailed results saved to: {output_file}")
    print()
    print("=" * 80)


if __name__ == "__main__":
    main()
