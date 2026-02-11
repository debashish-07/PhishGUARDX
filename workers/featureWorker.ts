// Web Worker: parallel feature extraction (heuristics, quantum hash, audio)

import { evaluateUrlHeuristics } from "@/lib/heuristics";
import { computeQuantumHash } from "@/lib/quantum";
import { generateAudioFeatures } from "@/lib/audio";

export type WorkerRequest = { url: string };
export type WorkerResponse = {
  heuristics: ReturnType<typeof evaluateUrlHeuristics>;
  qhash: number[];
  audio: Awaited<ReturnType<typeof generateAudioFeatures>>;
};

self.onmessage = async (ev: MessageEvent<WorkerRequest>) => {
  const { url } = ev.data;
  const heuristics = evaluateUrlHeuristics(url);
  const qhash = computeQuantumHash(url);
  const audio = await generateAudioFeatures(url);
  const res: WorkerResponse = { heuristics, qhash, audio };
  (self as any).postMessage(res);
};



