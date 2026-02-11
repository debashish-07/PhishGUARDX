// Client-side preprocessing and feature extraction for datasets

import { evaluateUrlHeuristics } from "@/lib/heuristics";
import { computeQuantumHash } from "@/lib/quantum";
import { generateAudioFeatures } from "@/lib/audio";

export type ProcessedRecord = {
  url: string;
  label: string;
  features: {
    heuristics: ReturnType<typeof evaluateUrlHeuristics>;
    quantum: number[];
    audio: Awaited<ReturnType<typeof generateAudioFeatures>>;
  };
};

export async function preprocessDataset(records: { url: string; label: string }[]): Promise<ProcessedRecord[]> {
  const processed: ProcessedRecord[] = [];
  
  for (const record of records) {
    try {
      const heuristics = evaluateUrlHeuristics(record.url);
      const quantum = computeQuantumHash(record.url);
      const audio = await generateAudioFeatures(record.url);
      
      processed.push({
        url: record.url,
        label: record.label,
        features: {
          heuristics,
          quantum,
          audio
        }
      });
    } catch (error) {
      console.error(`Failed to preprocess ${record.url}:`, error);
    }
  }
  
  return processed;
}

export function extractFeatures(processed: ProcessedRecord[]): number[][] {
  return processed.map(record => {
    const h = record.features.heuristics;
    const q = record.features.quantum.slice(0, 16); // Use first 16 quantum features
    const a = record.features.audio.spectrum.slice(0, 8); // Use first 8 audio features
    
    return [
      h.score,
      Object.keys(h.signals).length,
      h.reasons.length,
      ...q,
      ...a
    ];
  });
}

export function augmentDataset(records: { url: string; label: string }[]): { url: string; label: string }[] {
  const augmented: { url: string; label: string }[] = [...records];
  
  for (const record of records) {
    if (record.label === 'phishing') {
      // Add character-level mutations
      const mutations = [
        record.url.replace(/\./g, '-'),
        record.url.replace(/https/g, 'http'),
        record.url + '?ref=email',
        record.url.replace(/[aeiou]/gi, '@')
      ];
      
      mutations.forEach(mut => {
        if (mut !== record.url) {
          augmented.push({ url: mut, label: 'phishing' });
        }
      });
    }
  }
  
  return augmented;
}

export async function exportProcessedDataset(processed: ProcessedRecord[]): Promise<Blob> {
  const csv = [
    "url,label,score,risk_factors,quantum_features,audio_features",
    ...processed.map(p => {
      const h = p.features.heuristics;
      const q = p.features.quantum.slice(0, 8).join(';');
      const a = p.features.audio.spectrum.slice(0, 4).join(';');
      return `${p.url},${p.label},${h.score},"${h.reasons.join(';')}",${q},${a}`;
    })
  ].join('\n');
  
  return new Blob([csv], { type: 'text/csv' });
}

