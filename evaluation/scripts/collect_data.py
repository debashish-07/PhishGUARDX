import os
import requests
import pandas as pd
from datetime import datetime

# Configuration
DATA_DIR = os.path.join(os.path.dirname(__file__), '../datasets')
RAW_DIR = os.path.join(DATA_DIR, 'raw')
PROCESSED_DIR = os.path.join(DATA_DIR, 'processed')

# URLs for datasets (Examples - replace with actual persistent sources if needed)
OPENPHISH_URL = "https://openphish.com/feed.txt"
# For benign URLs, we might need a static list or a different source like Alexa top 1M (which is now retired/paid usually) or Tranco
# Using a placeholder for now or a small sample list
BENIGN_URLS = [
    "https://www.google.com",
    "https://www.youtube.com",
    "https://www.facebook.com",
    "https://www.amazon.com",
    "https://www.wikipedia.org",
    "https://www.reddit.com",
    "https://www.netflix.com",
    "https://www.linkedin.com",
    "https://www.microsoft.com",
    "https://www.instagram.com"
]

def ensure_dirs():
    os.makedirs(RAW_DIR, exist_ok=True)
    os.makedirs(PROCESSED_DIR, exist_ok=True)

def download_phishing_data():
    print("Downloading OpenPhish data...")
    try:
        response = requests.get(OPENPHISH_URL)
        if response.status_code == 200:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = os.path.join(RAW_DIR, f"openphish_{timestamp}.txt")
            with open(filename, 'w', encoding='utf-8') as f:
                f.write(response.text)
            print(f"Saved OpenPhish data to {filename}")
            return filename
        else:
            print(f"Failed to download OpenPhish data: {response.status_code}")
            return None
    except Exception as e:
        print(f"Error downloading OpenPhish data: {e}")
        return None

def create_benign_data():
    print("Creating benign data sample...")
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = os.path.join(RAW_DIR, f"benign_{timestamp}.txt")
    with open(filename, 'w', encoding='utf-8') as f:
        for url in BENIGN_URLS:
            f.write(url + "\n")
    print(f"Saved benign data to {filename}")
    return filename

def main():
    ensure_dirs()
    phishing_file = download_phishing_data()
    benign_file = create_benign_data()
    
    if phishing_file and benign_file:
        print("\nData collection complete.")
        print(f"Phishing data: {phishing_file}")
        print(f"Benign data: {benign_file}")
    else:
        print("\nData collection incomplete.")

if __name__ == "__main__":
    main()
