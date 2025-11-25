// IndexedDB storage for URL history and analysis results

import { set, get, del, keys } from "idb-keyval";

export type AnalysisRecord = {
  url: string;
  timestamp: number;
  score: number;
  heuristics: any;
  explanations: any;
  audio: any;
  visual: any;
  quantum: number[];
};

const HISTORY_KEY = "url_history";
const LEDGER_KEY = "trust_ledger";

export async function saveAnalysis(record: AnalysisRecord): Promise<void> {
  const history = await getHistory();
  history.unshift(record);
  // Keep only last 1000 records
  const trimmed = history.slice(0, 1000);
  await set(HISTORY_KEY, trimmed);
}

export async function getHistory(): Promise<AnalysisRecord[]> {
  return (await get(HISTORY_KEY)) || [];
}

export async function clearHistory(): Promise<void> {
  await del(HISTORY_KEY);
}

export async function exportHistory(): Promise<Blob> {
  const history = await getHistory();
  const csv = [
    "url,timestamp,score,risk_level",
    ...history.map(r => 
      `${r.url},${new Date(r.timestamp).toISOString()},${r.score},${r.score >= 60 ? 'High' : r.score >= 30 ? 'Medium' : 'Low'}`
    )
  ].join('\n');
  
  return new Blob([csv], { type: 'text/csv' });
}

export async function importDataset(file: File): Promise<{ url: string; label: string }[]> {
  const text = await file.text();
  const lines = text.split('\n').filter(line => line.trim());
  const headers = lines[0].split(',').map(h => h.trim());
  
  const urlIndex = headers.findIndex(h => h.toLowerCase().includes('url'));
  const labelIndex = headers.findIndex(h => h.toLowerCase().includes('label') || h.toLowerCase().includes('class'));
  
  if (urlIndex === -1) throw new Error('No URL column found');
  
  return lines.slice(1).map(line => {
    const values = line.split(',');
    return {
      url: values[urlIndex]?.trim() || '',
      label: labelIndex !== -1 ? values[labelIndex]?.trim() || 'unknown' : 'unknown'
    };
  }).filter(item => item.url);
}

export async function batchAnalyze(urls: string[]): Promise<AnalysisRecord[]> {
  const results: AnalysisRecord[] = [];
  
  for (const url of urls) {
    try {
      // Import analysis functions
      const { evaluateUrlHeuristics } = await import("@/lib/heuristics");
      const { computeQuantumHash } = await import("@/lib/quantum");
      const { generateAudioFeatures } = await import("@/lib/audio");
      const { explainBySubstring } = await import("@/lib/explain");
      
      const heuristics = evaluateUrlHeuristics(url);
      const quantum = computeQuantumHash(url);
      const audio = await generateAudioFeatures(url);
      const explanations = explainBySubstring(url, Object.keys(heuristics.signals));
      
      const record: AnalysisRecord = {
        url,
        timestamp: Date.now(),
        score: heuristics.score,
        heuristics,
        explanations,
        audio,
        visual: null, // Skip visual for batch
        quantum
      };
      
      results.push(record);
      await saveAnalysis(record);
    } catch (error) {
      console.error(`Failed to analyze ${url}:`, error);
    }
  }
  
  return results;
}
