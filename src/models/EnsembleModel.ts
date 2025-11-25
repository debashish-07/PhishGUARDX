import * as ort from 'onnxruntime-web';

export class EnsembleModel {
    private session: ort.InferenceSession | null = null;
    private isLoaded: boolean = false;

    async loadModel(modelPath: string): Promise<void> {
        try {
            console.log('[EnsembleModel] Loading ONNX model from:', modelPath);

            // Configure ONNX Runtime for WebAssembly
            ort.env.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.14.0/dist/';

            this.session = await ort.InferenceSession.create(modelPath, {
                executionProviders: ['wasm'],
                graphOptimizationLevel: 'all'
            });

            this.isLoaded = true;
            console.log('[EnsembleModel] Model loaded successfully');
        } catch (error) {
            console.error('[EnsembleModel] Failed to load model:', error);
            throw error;
        }
    }

    async predict(features: number[]): Promise<number> {
        if (!this.isLoaded || !this.session) {
            console.warn('[EnsembleModel] Model not loaded, using fallback heuristic');
            return this.fallbackPredict(features);
        }

        try {
            // Prepare input tensor
            const inputTensor = new ort.Tensor('float32', new Float32Array(features), [1, features.length]);

            // Run inference
            const feeds = { input: inputTensor };
            const results = await this.session.run(feeds);

            // Extract prediction (assuming binary classification with probability output)
            const output = results.output.data as Float32Array;
            return output[0]; // Return probability of phishing
        } catch (error) {
            console.error('[EnsembleModel] Prediction failed:', error);
            return this.fallbackPredict(features);
        }
    }

    private fallbackPredict(features: number[]): number {
        // Simple fallback: average of all features (assuming they're normalized 0-1)
        const avg = features.reduce((a, b) => a + b, 0) / features.length;
        return Math.min(Math.max(avg, 0), 1); // Clamp to [0, 1]
    }

    isModelLoaded(): boolean {
        return this.isLoaded;
    }
}

// Singleton instance
let ensembleModelInstance: EnsembleModel | null = null;

export function getEnsembleModel(): EnsembleModel {
    if (!ensembleModelInstance) {
        ensembleModelInstance = new EnsembleModel();
    }
    return ensembleModelInstance;
}
