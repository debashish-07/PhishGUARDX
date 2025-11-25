const fs = require('fs');
const path = require('path');

// Configuration
const DATA_DIR = path.join(__dirname, '../datasets');
const PROCESSED_DIR = path.join(DATA_DIR, 'processed');
const DATASET_FILE = path.join(PROCESSED_DIR, 'dataset.json');

// Mock Model
function mockPredict(url) {
    const suspiciousKeywords = ['login', 'verify', 'account', 'update', 'secure', 'banking'];
    if (url.length > 50) return 1;
    for (const kw of suspiciousKeywords) {
        if (url.toLowerCase().includes(kw)) return 1;
    }
    return 0;
}

function calculateMetrics(yTrue, yPred) {
    let tp = 0, fp = 0, tn = 0, fn = 0;

    for (let i = 0; i < yTrue.length; i++) {
        if (yTrue[i] === 1 && yPred[i] === 1) tp++;
        if (yTrue[i] === 0 && yPred[i] === 1) fp++;
        if (yTrue[i] === 0 && yPred[i] === 0) tn++;
        if (yTrue[i] === 1 && yPred[i] === 0) fn++;
    }

    const accuracy = (tp + tn) / (tp + tn + fp + fn);
    const precision = tp / (tp + fp) || 0;
    const recall = tp / (tp + fn) || 0;
    const f1 = 2 * (precision * recall) / (precision + recall) || 0;

    return { accuracy, precision, recall, f1, confusionMatrix: { tp, fp, tn, fn } };
}

function evaluate() {
    if (!fs.existsSync(DATASET_FILE)) {
        console.log(`Dataset not found at ${DATASET_FILE}. Run preprocess.js first.`);
        return;
    }

    console.log("Loading dataset...");
    const dataset = JSON.parse(fs.readFileSync(DATASET_FILE, 'utf-8'));
    console.log(`Evaluating on ${dataset.length} samples...`);

    const yTrue = [];
    const yPred = [];
    const latencies = [];

    dataset.forEach(item => {
        yTrue.push(item.label);

        const start = process.hrtime();
        const pred = mockPredict(item.url);
        const end = process.hrtime(start);

        yPred.push(pred);
        latencies.push(end[0] * 1000 + end[1] / 1e6); // ms
    });

    const metrics = calculateMetrics(yTrue, yPred);
    const avgLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;

    console.log("\n--- Evaluation Results ---");
    console.log(`Accuracy:  ${metrics.accuracy.toFixed(4)}`);
    console.log(`Precision: ${metrics.precision.toFixed(4)}`);
    console.log(`Recall:    ${metrics.recall.toFixed(4)}`);
    console.log(`F1 Score:  ${metrics.f1.toFixed(4)}`);
    console.log(`Avg Latency: ${avgLatency.toFixed(2)} ms`);
    console.log("\nConfusion Matrix:", metrics.confusionMatrix);
}

evaluate();
