// Quantum-inspired feature hashing using simulated probabilistic rotations.

function xorshift32(seed: number): () => number {
  let x = seed | 0;
  return () => {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    return (x >>> 0) / 0xffffffff;
  };
}

export function computeQuantumHash(input: string, dims: number = 64): number[] {
  const rnd = xorshift32(hashStringToInt(input));
  const vector = new Array<number>(dims).fill(0);

  for (let i = 0; i < input.length; i++) {
    const ch = input.charCodeAt(i);
    const phase = rnd() * Math.PI * 2;
    const amplitude = (ch % 31) / 31; // normalized 0..1
    const idx = Math.floor(rnd() * dims);
    vector[idx] += Math.sin(phase) * amplitude;
    vector[(idx + 1) % dims] += Math.cos(phase) * amplitude * 0.5;
  }

  // L2 normalize
  const norm = Math.sqrt(vector.reduce((s, v) => s + v * v, 0)) || 1;
  for (let i = 0; i < dims; i++) vector[i] /= norm;
  return vector;
}

export function hashStringToInt(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}



