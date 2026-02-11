import os
import pandas as pd
import time
import numpy as np
from sklearn.metrics import precision_score, recall_score, f1_score, accuracy_score, confusion_matrix

# Configuration
DATA_DIR = os.path.join(os.path.dirname(__file__), '../datasets')
PROCESSED_DIR = os.path.join(DATA_DIR, 'processed')
DATASET_FILE = os.path.join(PROCESSED_DIR, 'dataset.csv')

# Mock Model / Heuristics for Baseline
# In a real scenario, this would import the actual detection logic or call the API
def mock_predict(url):
    # Simple heuristic for demonstration: long URLs or suspicious keywords are phishing
    suspicious_keywords = ['login', 'verify', 'account', 'update', 'secure', 'banking']
    if len(url) > 50:
        return 1
    for kw in suspicious_keywords:
        if kw in url.lower():
            return 1
    return 0

def evaluate():
    if not os.path.exists(DATASET_FILE):
        print(f"Dataset not found at {DATASET_FILE}. Run preprocess.py first.")
        return

    print("Loading dataset...")
    df = pd.read_csv(DATASET_FILE)
    
    print(f"Evaluating on {len(df)} samples...")
    
    y_true = df['label'].values
    y_pred = []
    latencies = []
    
    for url in df['url']:
        start_time = time.time()
        # TODO: Replace with actual model call
        pred = mock_predict(url)
        end_time = time.time()
        
        y_pred.append(pred)
        latencies.append((end_time - start_time) * 1000) # ms
        
    y_pred = np.array(y_pred)
    
    # Metrics
    precision = precision_score(y_true, y_pred)
    recall = recall_score(y_true, y_pred)
    f1 = f1_score(y_true, y_pred)
    accuracy = accuracy_score(y_true, y_pred)
    avg_latency = np.mean(latencies)
    
    print("\n--- Evaluation Results ---")
    print(f"Accuracy:  {accuracy:.4f}")
    print(f"Precision: {precision:.4f}")
    print(f"Recall:    {recall:.4f}")
    print(f"F1 Score:  {f1:.4f}")
    print(f"Avg Latency: {avg_latency:.2f} ms")
    print("\nConfusion Matrix:")
    print(confusion_matrix(y_true, y_pred))

if __name__ == "__main__":
    evaluate()
