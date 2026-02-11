// Simulated homomorphic and zero-knowledge checks (no real crypto)

export function simulateHomomorphicRiskAggregation(scores: number[]): number {
  // Pretend to operate on encrypted values by using masked operations
  const mask = 1337;
  const encSum = scores.reduce((s, v) => s + ((v ^ mask) ^ mask), 0);
  return Math.min(100, Math.round(encSum / Math.max(1, scores.length)));
}

export function simulateZeroKnowledgeProof(url: string, claimedScore: number): { valid: boolean; proof: string } {
  // Construct a toy proof: hash(url|score) ends with certain pattern
  const payload = `${url}|${claimedScore}`;
  const digest = simpleHash(payload);
  const valid = digest.endsWith("00");
  return { valid, proof: digest };
}

function simpleHash(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 257 + s.charCodeAt(i)) >>> 0;
  return h.toString(16).padStart(8, '0');
}

// Offline / Privacy mode helper
const OFFLINE_KEY = 'pd_offline_mode';

export function enableOfflineMode(enabled: boolean) {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(OFFLINE_KEY, enabled ? '1' : '0');
    }
  } catch (e) {
    // ignore
  }
}

export function isOfflineMode(): boolean {
  try {
    if (typeof window === 'undefined') return false;
    const v = window.localStorage.getItem(OFFLINE_KEY);
    return v === '1';
  } catch (e) {
    return false;
  }
}


