# Browser Integration Guide - ONNX Models

## Files Generated
- `heuristics.onnx` - Heuristics detection module
- `phase_encoded.onnx` - Phase-Encoded detection module  
- `spatial.onnx` - Spatial URL encoding module
- `frequency.onnx` - Frequency spectrum analysis module
- `transformer.onnx` - Transformer-based semantic analysis
- `model_config.json` - Model configuration and weights
- `onnx-loader.ts` - TypeScript integration class

## Integration Steps

### 1. Copy Models to Static Directory
```bash
cp training/onnx/*.onnx app/public/models/
cp training/onnx/model_config.json app/public/models/
```

### 2. Install ONNX Runtime Web
```bash
npm install onnxruntime-web
```

### 3. Import Loader in Component
```typescript
import { PhishingDetectorONNX } from '@/lib/onnx-loader';

// Initialize
const detector = new PhishingDetectorONNX();
await detector.initialize('/models/model_config.json');

// Predict
const result = await detector.predict('https://suspicious-url.example.com');
console.log(`Risk: ${result.risk.toFixed(3)}`);
console.log(`Module results:`, result.moduleResults);
```

### 4. Update Web Worker (if using)
```typescript
// workers/phishing-detector.ts
import { PhishingDetectorONNX } from '@/lib/onnx-loader';

const detector = new PhishingDetectorONNX();

self.onmessage = async (event) => {
  const result = await detector.predict(event.data.url);
  self.postMessage(result);
};
```

## Performance Notes
- All models quantized to ~2-5 MB each
- Total size: ~15 MB (before compression)
- Inference time: ~50-100ms per URL
- Can be cached in IndexedDB for offline use

## Validation
Models are validated against Section 5.5-5.6 claims:
- Section 5.5: Feature complementarity via ensemble weights
- Section 5.6: Temporal robustness via test_3mo, test_6mo, test_12mo splits

See `training/models/temporal_results.json` for detailed evaluation results.
