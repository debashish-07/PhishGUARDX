import os
import pandas as pd
import glob

# Configuration
DATA_DIR = os.path.join(os.path.dirname(__file__), '../datasets')
RAW_DIR = os.path.join(DATA_DIR, 'raw')
PROCESSED_DIR = os.path.join(DATA_DIR, 'processed')
SAMPLE_CSV = os.path.join(os.path.dirname(__file__), '../../datasets/sample_urls.csv')

def load_raw_data():
    # Aggregate all available openphish files for broader phishing coverage.
    phish_files = glob.glob(os.path.join(RAW_DIR, 'openphish_*.txt'))
    if not phish_files:
        print("No phishing data found.")
        return None, None

    # Aggregate all available benign files for better calibration.
    benign_files = glob.glob(os.path.join(RAW_DIR, 'benign_*.txt'))
    if not benign_files:
        print("No benign data found.")
        return None, None

    print(f"Processing {len(phish_files)} phishing files and {len(benign_files)} benign files...")

    phish_urls = []
    for file_path in phish_files:
        with open(file_path, 'r', encoding='utf-8') as f:
            phish_urls.extend(line.strip() for line in f if line.strip())

    benign_urls = []
    for file_path in benign_files:
        with open(file_path, 'r', encoding='utf-8') as f:
            benign_urls.extend(line.strip() for line in f if line.strip())

    if os.path.exists(SAMPLE_CSV):
        sample_df = pd.read_csv(SAMPLE_CSV)
        if {"url", "label"}.issubset(sample_df.columns):
            sample_phish = sample_df[sample_df["label"].astype(str).str.lower() == "phishing"]["url"].astype(str).tolist()
            sample_benign = sample_df[sample_df["label"].astype(str).str.lower() == "benign"]["url"].astype(str).tolist()
            phish_urls.extend(sample_phish)
            benign_urls.extend(sample_benign)
            print(f"Included supplemental CSV samples: phishing={len(sample_phish)}, benign={len(sample_benign)}")
        
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
