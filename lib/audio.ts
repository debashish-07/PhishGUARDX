// Convert URL string into pseudo waveform and compute FFT-like features.

export type AudioFeatures = {
  spectrum: number[];
  energy: number;
};

export async function generateAudioFeatures(input: string, bins: number = 32): Promise<AudioFeatures> {
  const waveform = new Float32Array(Math.max(64, input.length * 4));
  for (let i = 0; i < waveform.length; i++) {
    const ch = input.charCodeAt(i % input.length) || 0;
    const t = i / waveform.length;
    waveform[i] = Math.sin((ch + 1) * 0.1 * Math.PI * t) * 0.5 + Math.cos((ch + 3) * 0.07 * Math.PI * t) * 0.5;
  }

  // Simple DFT-like aggregation into bins
  const spectrum = new Array(bins).fill(0);
  for (let k = 0; k < bins; k++) {
    let re = 0;
    let im = 0;
    for (let n = 0; n < waveform.length; n++) {
      const angle = (-2 * Math.PI * k * n) / waveform.length;
      re += waveform[n] * Math.cos(angle);
      im += waveform[n] * Math.sin(angle);
    }
    spectrum[k] = Math.sqrt(re * re + im * im);
  }

  // Normalize spectrum and compute overall energy proxy
  const max = Math.max(1e-6, ...spectrum);
  const normSpec = spectrum.map((v) => v / max);
  const energy = Math.min(100, Math.round(normSpec.reduce((s, v) => s + v, 0) * 10));
  return { spectrum: normSpec, energy };
}



