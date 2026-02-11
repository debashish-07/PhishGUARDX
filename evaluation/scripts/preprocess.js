const fs = require('fs');
const path = require('path');

// Configuration
const DATA_DIR = path.join(__dirname, '../datasets');
const RAW_DIR = path.join(DATA_DIR, 'raw');
const PROCESSED_DIR = path.join(DATA_DIR, 'processed');

function loadRawData() {
    const files = fs.readdirSync(RAW_DIR);

    const phishFiles = files.filter(f => f.startsWith('openphish_')).map(f => path.join(RAW_DIR, f));
    const benignFiles = files.filter(f => f.startsWith('benign_')).map(f => path.join(RAW_DIR, f));

    if (phishFiles.length === 0 || benignFiles.length === 0) {
        console.log("Missing raw data files.");
        return null;
    }

    // Get latest files (simple string sort works for ISO timestamps usually, but let's rely on stat)
    const latestPhish = phishFiles.sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs)[0];
    const latestBenign = benignFiles.sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs)[0];

    console.log(`Processing ${latestPhish} and ${latestBenign}...`);

    const phishUrls = fs.readFileSync(latestPhish, 'utf-8').split('\n').map(l => l.trim()).filter(l => l);
    const benignUrls = fs.readFileSync(latestBenign, 'utf-8').split('\n').map(l => l.trim()).filter(l => l);

    return { phishUrls, benignUrls };
}

function preprocess(phishUrls, benignUrls) {
    const data = [];
    phishUrls.forEach(url => data.push({ url, label: 1 }));
    benignUrls.forEach(url => data.push({ url, label: 0 }));

    // Deduplicate
    const uniqueData = Array.from(new Set(data.map(JSON.stringify))).map(JSON.parse);
    console.log(`Removed ${data.length - uniqueData.length} duplicates.`);

    // Shuffle (Fisher-Yates)
    for (let i = uniqueData.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [uniqueData[i], uniqueData[j]] = [uniqueData[j], uniqueData[i]];
    }

    return uniqueData;
}

function main() {
    const rawData = loadRawData();
    if (rawData) {
        const processedData = preprocess(rawData.phishUrls, rawData.benignUrls);

        const outputFile = path.join(PROCESSED_DIR, 'dataset.json');
        fs.writeFileSync(outputFile, JSON.stringify(processedData, null, 2));
        console.log(`Saved processed dataset to ${outputFile} (${processedData.length} samples)`);
    }
}

main();
