const fs = require('fs');
const path = require('path');
const https = require('https');

// Configuration
const DATA_DIR = path.join(__dirname, '../datasets');
const RAW_DIR = path.join(DATA_DIR, 'raw');
const PROCESSED_DIR = path.join(DATA_DIR, 'processed');

const OPENPHISH_URL = "https://openphish.com/feed.txt";
const BENIGN_URLS = [
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
];

function ensureDirs() {
    if (!fs.existsSync(RAW_DIR)) fs.mkdirSync(RAW_DIR, { recursive: true });
    if (!fs.existsSync(PROCESSED_DIR)) fs.mkdirSync(PROCESSED_DIR, { recursive: true });
}

function downloadPhishingData() {
    return new Promise((resolve, reject) => {
        console.log("Downloading OpenPhish data...");
        https.get(OPENPHISH_URL, (res) => {
            if (res.statusCode !== 200) {
                console.error(`Failed to download OpenPhish data: ${res.statusCode}`);
                resolve(null);
                return;
            }

            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                const filename = path.join(RAW_DIR, `openphish_${timestamp}.txt`);
                fs.writeFileSync(filename, data);
                console.log(`Saved OpenPhish data to ${filename}`);
                resolve(filename);
            });
        }).on('error', (e) => {
            console.error(`Error downloading OpenPhish data: ${e.message}`);
            resolve(null);
        });
    });
}

function createBenignData() {
    console.log("Creating benign data sample...");
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = path.join(RAW_DIR, `benign_${timestamp}.txt`);
    const content = BENIGN_URLS.join('\n');
    fs.writeFileSync(filename, content);
    console.log(`Saved benign data to ${filename}`);
    return filename;
}

async function main() {
    ensureDirs();
    const phishingFile = await downloadPhishingData();
    const benignFile = createBenignData();

    if (phishingFile && benignFile) {
        console.log("\nData collection complete.");
    } else {
        console.log("\nData collection incomplete.");
    }
}

main();
