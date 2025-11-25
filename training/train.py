import os
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report
import joblib

# Configuration
DATA_DIR = os.path.join(os.path.dirname(__file__), '../evaluation/datasets/processed')
MODEL_DIR = os.path.join(os.path.dirname(__file__), '../src/models')

def train():
    dataset_path = os.path.join(DATA_DIR, 'dataset.csv')
    if not os.path.exists(dataset_path):
        print("Dataset not found.")
        return

    print("Loading dataset...")
    df = pd.read_csv(dataset_path)
    
    # Feature Extraction (Mock for now - in real usage, we'd extract features from URLs)
    # Here we just use length as a dummy feature
    X = df['url'].apply(lambda x: len(x)).values.reshape(-1, 1)
    y = df['label'].values
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print("Training Random Forest...")
    clf = RandomForestClassifier(n_estimators=100)
    clf.fit(X_train, y_train)
    
    print("Evaluating...")
    y_pred = clf.predict(X_test)
    print(classification_report(y_test, y_pred))
    
    # Save model
    os.makedirs(MODEL_DIR, exist_ok=True)
    joblib.dump(clf, os.path.join(MODEL_DIR, 'rf_model.pkl'))
    print(f"Model saved to {MODEL_DIR}")

if __name__ == "__main__":
    train()
