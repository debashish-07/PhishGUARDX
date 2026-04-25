/**
 * ONNX Model Loader for Phishing Detection Ensemble
 * Auto-generated from training pipeline
 * 
 * Usage:
 * import { PhishingDetectorONNX } from './onnx-loader';
 * const detector = new PhishingDetectorONNX();
 * await detector.initialize();
 * const result = await detector.predict(url);
 */

import * as ort from 'onnxruntime-web';

interface ModelConfig {
  models: Record<string, { type: string; file: string }>;
  ensemble: { strategy: string; weights: Record<string, number>; threshold: number };
  featureConfig: {
    numFeatures: number;
    scalerMean: number[];
    scalerStd: number[];
  };
}

export class PhishingDetectorONNX {
  private config: ModelConfig;
  private sessions: Map<string, ort.InferenceSession> = new Map();
  private initialized: boolean = false;

  async initialize(configPath: string = '/models/model_config.json') {
    try {
      // Load configuration
      const response = await fetch(configPath);
      this.config = await response.json();

      // Load each module model
      const modelDir = '/models/';
      for (const [moduleName, modelInfo] of Object.entries(this.config.models)) {
        const modelPath = modelDir + (modelInfo as any).file;
        const session = await ort.InferenceSession.create(modelPath);
        this.sessions.set(moduleName, session);
      }

      this.initialized = true;
      console.log('✓ Phishing detector models loaded');
    } catch (error) {
      console.error('❌ Failed to load models:', error);
      throw error;
    }
  }

  async predict(url: string): Promise<{ risk: number; confidence: number; moduleResults: Record<string, number> }> {
    if (!this.initialized) {
      throw new Error('Models not initialized. Call initialize() first.');
    }

    // Extract features from URL
    const features = this.extractFeatures(url);
    const normalized = this.normalize(features);

    // Get predictions from all modules
    const moduleResults: Record<string, number> = {};
    const predictions: number[] = [];

    for (const [moduleName, session] of this.sessions) {
      const input = new ort.Tensor('float32', new Float32Array(normalized), [1, normalized.length]);
      const outputs = await session.run({ float_input: input });
      
      // Extract probability of phishing class
      const probs = outputs.probabilities.data as Float32Array;
      const phishingProb = probs[1]; // Index 1 is phishing class
      moduleResults[moduleName] = phishingProb;
      predictions.push(phishingProb);
    }

    // Ensemble fusion with weights
    const weights = Object.values(this.config.ensemble.weights);
    const riskScore = predictions.reduce((sum, pred, i) => sum + pred * weights[i], 0);

    return {
      risk: riskScore,
      confidence: Math.max(...predictions),
      moduleResults
    };
  }

  private extractFeatures(url: string): number[] {
    // Feature extraction matching training pipeline
    const features: number[] = [];

    try {
      const urlObj = new URL(url);
      const domain = urlObj.hostname;
      const path = urlObj.pathname + urlObj.search;

      // Feature 1: Has IP address
      features.push(this.hasIPAddress(domain) ? 1 : 0);

      // Feature 2-3: Domain and overall length
      features.push(domain.length);
      features.push(domain.match(/[!@#$%^&*()_+\-=\[\]{}|;:'",.<>?]/g)?.length ?? 0);

      // Features 4-5: Entropy-based
      features.push(this.calculateEntropy(domain));
      features.push(this.calculateEntropy(domain) / Math.log2(256));

      // Features 6-7: Character ratios
      features.push(this.countCharType(domain, /[aeiouAEIOU]/) / domain.length);
      features.push(this.countCharType(domain, /\d/) / domain.length);

      // Features 8-9: Character patterns
      features.push(this.maxCharRepeat(domain));
      features.push(new Set(domain).size);

      // Feature 10: URL length normalized
      features.push((url.length - 20) / 80); // Normalize to ~[0,1]

      return features;
    } catch {
      // Return default features if extraction fails
      return new Array(10).fill(0);
    }
  }

  private normalize(features: number[]): number[] {
    const mean = this.config.featureConfig.scalerMean;
    const std = this.config.featureConfig.scalerStd;
    
    return features.map((f, i) => (f - mean[i]) / std[i]);
  }

  private hasIPAddress(domain: string): boolean {
    return /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(domain);
  }

  private calculateEntropy(text: string): number {
    const freq: Record<string, number> = {};
    for (const char of text) {
      freq[char] = (freq[char] ?? 0) + 1;
    }

    let entropy = 0;
    for (const count of Object.values(freq)) {
      const p = count / text.length;
      entropy -= p * Math.log2(p);
    }
    return entropy;
  }

  private countCharType(text: string, regex: RegExp): number {
    return (text.match(regex) ?? []).length;
  }

  private maxCharRepeat(text: string): number {
    let max = 1;
    for (let i = 0; i < text.length - 1; i++) {
      let count = 1;
      while (i + count < text.length && text[i] === text[i + count]) {
        count++;
      }
      max = Math.max(max, count);
    }
    return max;
  }
}
