import { useState, useCallback, useEffect } from 'react';
import { evaluateUrlHeuristics } from '@/lib/heuristics';
import { classifyText } from '@/lib/models';
import { explainBySubstring, heatmapRanges } from '@/lib/explain';
import { getStorage, AnalysisRecord } from '@/src/lib/storage';
import { getEnsembleModel } from '@/src/models/EnsembleModel';

interface DetectionResult {
    score: number;
    details: {
        quantum: number[];
        visual: number[][];
        audio: number[];
    };
    breakdown: {
        heuristic: number;
        quantum: number;
        visual: number;
        transformer: number;
        ensemble: number;
    };
    explain: {
        attributions: any[];
        heatmap: any[];
    };
    timestamp: number;
}

export function useDetection() {
    const [isScanning, setIsScanning] = useState(false);
    const [result, setResult] = useState<DetectionResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [history, setHistory] = useState<AnalysisRecord[]>([]);

    const storage = getStorage();
    const ensembleModel = getEnsembleModel();

    // Load history on mount
    useEffect(() => {
        storage.init().then(() => {
            storage.getHistory(10).then(setHistory);
        });
    }, []);

    const scanUrl = useCallback(async (url: string) => {
        setIsScanning(true);
        setError(null);
        setResult(null);

        console.log(`[Detector] Starting analysis for: ${url}`);

        try {
            // Check cache first
            const cached = await storage.getCachedFeatures(url);
            if (cached) {
                console.log('[Detector] Using cached features');
                setResult(cached);
                setIsScanning(false);
                return;
            }

            // 1. Heuristics (25%)
            console.log('[Detector] Module 1/5: Heuristics Engine...');
            const heurResult = evaluateUrlHeuristics(url);
            const heurScore = heurResult.score;
            console.log(`[Detector] Heuristics Score: ${heurScore}/100`);

            // Explainability
            const attributions = explainBySubstring(url, Object.keys(heurResult.signals));
            const heatmap = heatmapRanges(url, attributions.map((e) => e.token));

            // 2. Transformer (25%)
            console.log('[Detector] Module 2/5: Transformer Semantic Analysis...');
            const clsResult = await classifyText(url).catch(() => []);
            const transformerScore = clsResult.find(r => r.label === 'NEGATIVE')?.score
                ? (clsResult.find(r => r.label === 'NEGATIVE')!.score * 100)
                : (clsResult.find(r => r.label === 'POSITIVE')?.score
                    ? (1 - clsResult.find(r => r.label === 'POSITIVE')!.score) * 100
                    : 50);
            console.log(`[Detector] Transformer Score: ${transformerScore.toFixed(2)}/100`);

            // Instantiate Workers for parallel processing
            const quantumWorker = new Worker(new URL('../workers/quantum_hash.worker.ts', import.meta.url));
            const visualWorker = new Worker(new URL('../workers/visual_dna.worker.ts', import.meta.url));
            const mfccWorker = new Worker(new URL('../workers/mfcc.worker.ts', import.meta.url));

            const runWorker = (worker: Worker, data: any, name: string) => {
                console.log(`[Detector] Module: ${name} started...`);
                return new Promise<any>((resolve, reject) => {
                    worker.onmessage = (e) => {
                        console.log(`[Detector] Module: ${name} completed.`);
                        resolve(e.data);
                    };
                    worker.onerror = (e) => reject(e);
                    worker.postMessage(data);
                });
            };

            // 3. Quantum, 4. Visual, 5. Audio (Parallel)
            const [quantumData, visualData, mfccData] = await Promise.all([
                runWorker(quantumWorker, { url }, 'Quantum Hashing'),
                runWorker(visualWorker, { url }, 'Visual DNA'),
                runWorker(mfccWorker, { url }, 'MFCC Audio')
            ]);

            quantumWorker.terminate();
            visualWorker.terminate();
            mfccWorker.terminate();

            // Calculate Scores for Worker features
            const quantumScore = (quantumData.reduce((a: number, b: number) => a + Math.abs(b), 0) / quantumData.length) * 100;
            console.log(`[Detector] Quantum Score: ${quantumScore.toFixed(2)}/100`);

            const visualScore = (visualData.flat().reduce((a: number, b: number) => a + b, 0) / (visualData.length * visualData[0].length)) * 100;
            console.log(`[Detector] Visual DNA Score: ${visualScore.toFixed(2)}/100`);

            // ML Ensemble (25%) - Use actual model if loaded
            console.log('[Detector] Module 5/5: ML Ensemble...');
            const ensembleFeatures = [
                heurScore / 100,
                transformerScore / 100,
                quantumScore / 100,
                visualScore / 100,
                ...quantumData.slice(0, 10), // First 10 quantum features
                ...visualData.flat().slice(0, 10) // First 10 visual features
            ];

            let ensembleScore = 0;
            if (ensembleModel.isModelLoaded()) {
                ensembleScore = (await ensembleModel.predict(ensembleFeatures)) * 100;
            } else {
                // Fallback: weighted average
                ensembleScore = (heurScore + transformerScore + quantumScore + visualScore) / 4;
            }
            console.log(`[Detector] Ensemble Score: ${ensembleScore.toFixed(2)}/100`);

            // Final Weighted Score
            const finalScore = (
                (heurScore * 0.25) +
                (quantumScore * 0.15) +
                (visualScore * 0.10) +
                (transformerScore * 0.25) +
                (ensembleScore * 0.25)
            );

            console.log(`[Detector] Final Risk Score: ${finalScore.toFixed(2)}/100`);

            const detectionResult: DetectionResult = {
                score: finalScore / 100,
                details: {
                    quantum: quantumData,
                    visual: visualData,
                    audio: mfccData
                },
                breakdown: {
                    heuristic: heurScore,
                    quantum: quantumScore,
                    visual: visualScore,
                    transformer: transformerScore,
                    ensemble: ensembleScore
                },
                explain: {
                    attributions,
                    heatmap
                },
                timestamp: Date.now()
            };

            // Save to history
            const verdict = finalScore > 70 ? 'phishing' : finalScore > 40 ? 'suspicious' : 'safe';
            const record: AnalysisRecord = {
                id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                url,
                timestamp: detectionResult.timestamp,
                score: detectionResult.score,
                breakdown: detectionResult.breakdown,
                verdict
            };

            await storage.saveAnalysis(record);
            await storage.cacheFeatures(url, detectionResult, 3600000); // Cache for 1 hour

            // Update history
            const updatedHistory = await storage.getHistory(10);
            setHistory(updatedHistory);

            setResult(detectionResult);
        } catch (err) {
            console.error('[Detector] Analysis failed:', err);
            setError(err instanceof Error ? err.message : 'Unknown error occurred');
        } finally {
            setIsScanning(false);
        }
    }, [storage, ensembleModel]);

    const clearHistory = useCallback(async () => {
        await storage.clearHistory();
        setHistory([]);
    }, [storage]);

    const exportHistory = useCallback(async () => {
        const allHistory = await storage.exportHistory();
        const csv = convertToCSV(allHistory);
        downloadCSV(csv, `phishing-history-${Date.now()}.csv`);
    }, [storage]);

    return {
        scanUrl,
        isScanning,
        result,
        error,
        history,
        clearHistory,
        exportHistory
    };
}

function convertToCSV(records: AnalysisRecord[]): string {
    const headers = ['Timestamp', 'URL', 'Score', 'Verdict', 'Heuristic', 'Quantum', 'Visual', 'Transformer', 'Ensemble'];
    const rows = records.map(r => [
        new Date(r.timestamp).toISOString(),
        r.url,
        r.score.toFixed(3),
        r.verdict,
        r.breakdown.heuristic.toFixed(2),
        r.breakdown.quantum.toFixed(2),
        r.breakdown.visual.toFixed(2),
        r.breakdown.transformer.toFixed(2),
        r.breakdown.ensemble.toFixed(2)
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
}

function downloadCSV(csv: string, filename: string): void {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
