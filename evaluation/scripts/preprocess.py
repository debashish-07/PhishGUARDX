import os
import pandas as pd
import glob

# Configuration
DATA_DIR = os.path.join(os.path.dirname(__file__), '../datasets')
RAW_DIR = os.path.join(DATA_DIR, 'raw')
PROCESSED_DIR = os.path.join(DATA_DIR, 'processed')

def load_raw_data():
    # Find latest openphish file
    phish_files = glob.glob(os.path.join(RAW_DIR, 'openphish_*.txt'))
    if not phish_files:
        print("No phishing data found.")
        return None, None
    latest_phish = max(phish_files, key=os.path.getctime)
    
    # Find latest benign file
    benign_files = glob.glob(os.path.join(RAW_DIR, 'benign_*.txt'))
    if not benign_files:
        print("No benign data found.")
        return None, None
    latest_benign = max(benign_files, key=os.path.getctime)
    
    print(f"Processing {latest_phish} and {latest_benign}...")
    
    with open(latest_phish, 'r', encoding='utf-8') as f:
        phish_urls = [line.strip() for line in f if line.strip()]
        
    with open(latest_benign, 'r', encoding='utf-8') as f:
        benign_urls = [line.strip() for line in f if line.strip()]
        
    return phish_urls, benign_urls

def preprocess(phish_urls, benign_urls):
    df_phish = pd.DataFrame({'url': phish_urls, 'label': 1}) # 1 for phishing
    df_benign = pd.DataFrame({'url': benign_urls, 'label': 0}) # 0 for benign
    
    df = pd.concat([df_phish, df_benign], ignore_index=True)
    
    # Basic cleaning (deduplication)
    initial_count = len(df)
    df.drop_duplicates(subset=['url'], inplace=True)
    print(f"Removed {initial_count - len(df)} duplicates.")
    
    # Shuffle
    df = df.sample(frac=1, random_state=42).reset_index(drop=True)
    
    return df

def main():
    phish_urls, benign_urls = load_raw_data()
    if phish_urls and benign_urls:
        df = preprocess(phish_urls, benign_urls)
        
        output_file = os.path.join(PROCESSED_DIR, 'dataset.csv')
        df.to_csv(output_file, index=False)
        print(f"Saved processed dataset to {output_file} ({len(df)} samples)")
    else:
        print("Skipping preprocessing due to missing data.")

if __name__ == "__main__":
    main()
