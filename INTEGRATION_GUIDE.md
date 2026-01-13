# 🔧 Quick Integration Example

This file shows you exactly how to integrate all the new features into your existing app.

---

## Option 1: Add to Existing Dashboard

If you have a `Dashboard.tsx` or similar component, add the new features like this:

```typescript
'use client';

import { useState } from 'react';
import { TrustLedgerViewer } from '@/app/components/TrustLedgerViewer';
import { AudioSpectrogram } from '@/app/components/AudioSpectrogram';
import { QuantumWaveform } from '@/app/components/QuantumWaveform';
import { DNAStripe } from '@/app/components/DNAStripe';
import { EnhancedExplainability } from '@/app/components/EnhancedExplainability';
import { PrivacyBadge } from '@/app/components/PrivacyBadge';
import { TrustLedger } from '@/app/utils/trustLedger';

export default function Dashboard() {
  const [url, setUrl] = useState('');
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = async () => {
    if (!url) return;
    
    setIsAnalyzing(true);
    
    try {
      // Your existing detection logic here
      const result = await analyzeURL(url);
      
      // Add to Trust Ledger
      await TrustLedger.addEntry(url, result.finalScore, {
        heuristic: result.heuristicScore,
        quantum: result.quantumScore,
        visual: result.visualScore,
        transformer: result.transformerScore,
        ensemble: result.ensembleScore,
      });
      
      setAnalysisResult(result);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      {/* URL Input Section */}
      <div className="max-w-4xl mx-auto mb-8">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter URL to analyze..."
          className="w-full px-4 py-3 bg-gray-900 border border-cyan-500/50 rounded-lg text-white"
        />
        <button
          onClick={handleAnalyze}
          disabled={isAnalyzing}
          className="mt-4 px-6 py-3 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-white font-semibold"
        >
          {isAnalyzing ? 'Analyzing...' : 'Analyze URL'}
        </button>
      </div>

      {/* Results Section */}
      {analysisResult && (
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Quantum Waveform */}
          <QuantumWaveform
            features={analysisResult.quantumFeatures || []}
            riskScore={analysisResult.finalScore}
          />

          {/* Audio Spectrogram */}
          <AudioSpectrogram url={url} />

          {/* DNA Stripe */}
          <DNAStripe url={url} />

          {/* Enhanced Explainability */}
          <EnhancedExplainability
            moduleScores={{
              heuristic: analysisResult.heuristicScore,
              quantum: analysisResult.quantumScore,
              visual: analysisResult.visualScore,
              transformer: analysisResult.transformerScore,
              ensemble: analysisResult.ensembleScore,
            }}
            triggeredRules={analysisResult.triggeredRules || []}
            riskFactors={analysisResult.riskFactors || []}
            confidence={analysisResult.confidence || 85}
            finalScore={analysisResult.finalScore}
          />

          {/* Trust Ledger */}
          <TrustLedgerViewer />
        </div>
      )}

      {/* Privacy Badge (always visible) */}
      <PrivacyBadge />
    </div>
  );
}
```

---

## Option 2: Create New Demo Page

Create a new page to showcase all features:

```typescript
// app/features/page.tsx

'use client';

import { TrustLedgerViewer } from '@/app/components/TrustLedgerViewer';
import { AudioSpectrogram } from '@/app/components/AudioSpectrogram';
import { QuantumWaveform } from '@/app/components/QuantumWaveform';
import { DNAStripe } from '@/app/components/DNAStripe';
import { EnhancedExplainability } from '@/app/components/EnhancedExplainability';
import { PrivacyBadge } from '@/app/components/PrivacyBadge';

export default function FeaturesDemo() {
  // Sample data for demo
  const sampleURL = 'http://secure-paypal-verify.suspicious-domain.com/login';
  const sampleQuantumFeatures = Array.from({ length: 64 }, () => Math.random());
  const sampleModuleScores = {
    heuristic: 78.5,
    quantum: 65.2,
    visual: 72.1,
    transformer: 82.3,
    ensemble: 75.8,
  };
  const sampleRules = [
    {
      id: 'rule-1',
      name: 'Suspicious Keywords Detected',
      reason: 'URL contains "secure", "paypal", "verify" - common phishing indicators',
      severity: 'high' as const,
      impact: 20,
    },
    {
      id: 'rule-2',
      name: 'Unusual Domain Length',
      reason: 'Domain exceeds 30 characters, potentially obfuscated',
      severity: 'medium' as const,
      impact: 12,
    },
  ];
  const sampleRiskFactors = [
    {
      description: 'Contains brand impersonation keywords (paypal, secure)',
      impact: 20,
      category: 'Semantic',
    },
    {
      description: 'High character entropy indicates random generation',
      impact: 15,
      category: 'Structural',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-cyan-400 mb-2">
          New Features Demo
        </h1>
        <p className="text-gray-400 mb-8">
          Showcasing all newly implemented features for First Review
        </p>

        <div className="space-y-8">
          {/* Quantum Waveform */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">
              1. Quantum Waveform Visualization
            </h2>
            <QuantumWaveform
              features={sampleQuantumFeatures}
              riskScore={76.8}
            />
          </section>

          {/* Audio Spectrogram */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">
              2. Audio Spectrogram Analysis
            </h2>
            <AudioSpectrogram url={sampleURL} />
          </section>

          {/* DNA Stripe */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">
              3. DNA Stripe Pattern
            </h2>
            <DNAStripe url={sampleURL} />
          </section>

          {/* Enhanced Explainability */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">
              4. Enhanced Explainability Dashboard
            </h2>
            <EnhancedExplainability
              moduleScores={sampleModuleScores}
              triggeredRules={sampleRules}
              riskFactors={sampleRiskFactors}
              confidence={88}
              finalScore={76.8}
            />
          </section>

          {/* Trust Ledger */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">
              5. Local Trust Ledger
            </h2>
            <TrustLedgerViewer />
          </section>
        </div>

        {/* Privacy Badge */}
        <PrivacyBadge />
      </div>
    </div>
  );
}
```

---

## Option 3: Add to Existing Page.tsx

If you want to add to your main `app/page.tsx`:

```typescript
// app/page.tsx

import { PrivacyBadge } from '@/app/components/PrivacyBadge';
// ... other imports

export default function Home() {
  return (
    <main>
      {/* Your existing content */}
      
      {/* Add Privacy Badge at the end */}
      <PrivacyBadge />
    </main>
  );
}
```

---

## Sample Data for Testing

Use this sample data structure:

```typescript
// Sample analysis result structure
const sampleResult = {
  url: 'http://secure-paypal-verify.suspicious-domain.com/login',
  finalScore: 76.8,
  confidence: 88,
  
  // Module scores
  heuristicScore: 78.5,
  quantumScore: 65.2,
  visualScore: 72.1,
  transformerScore: 82.3,
  ensembleScore: 75.8,
  
  // Quantum features (64-dimensional vector)
  quantumFeatures: Array.from({ length: 64 }, () => Math.random()),
  
  // Triggered rules
  triggeredRules: [
    {
      id: 'rule-1',
      name: 'Suspicious Keywords Detected',
      reason: 'URL contains "secure", "paypal", "verify"',
      severity: 'high',
      impact: 20,
    },
    {
      id: 'rule-2',
      name: 'Unusual Domain Length',
      reason: 'Domain exceeds 30 characters',
      severity: 'medium',
      impact: 12,
    },
    {
      id: 'rule-3',
      name: 'Missing HTTPS',
      reason: 'URL uses HTTP instead of HTTPS',
      severity: 'high',
      impact: 18,
    },
  ],
  
  // Risk factors
  riskFactors: [
    {
      description: 'Contains brand impersonation keywords',
      impact: 20,
      category: 'Semantic',
    },
    {
      description: 'High character entropy',
      impact: 15,
      category: 'Structural',
    },
    {
      description: 'Suspicious TLD',
      impact: 12,
      category: 'Domain',
    },
    {
      description: 'Long subdomain chain',
      impact: 10,
      category: 'Structural',
    },
    {
      description: 'No SSL certificate',
      impact: 18,
      category: 'Security',
    },
  ],
};
```

---

## Testing URLs

Use these URLs for testing:

### Safe URLs:
```
https://www.google.com
https://github.com
https://www.microsoft.com
https://www.amazon.com
```

### Phishing URLs:
```
http://secure-paypal-verify.suspicious-domain.com/login
http://apple-id-unlock.tk/verify?account=12345
http://amazon-security-alert.xyz/update-payment
http://192.168.1.1/admin/login.php
```

---

## Quick Start Commands

```bash
# 1. Navigate to project
cd "c:\Users\DEBASHISH ROUT L\OneDrive\Desktop\major project1\phishing-detector"

# 2. Install dependencies (if needed)
npm install

# 3. Run development server
npm run dev

# 4. Open browser
# Navigate to http://localhost:3000
```

---

## Troubleshooting

### If components don't render:
1. Check console for errors
2. Verify all imports are correct
3. Make sure Tailwind CSS is configured
4. Check that all props are passed correctly

### If Trust Ledger doesn't work:
1. Check browser console for IndexedDB errors
2. Make sure you're in a secure context (HTTPS or localhost)
3. Clear browser storage and try again

### If animations are slow:
1. Reduce canvas size
2. Increase animation frame delay
3. Disable some particle effects

---

## Next Steps

1. ✅ Choose integration option (1, 2, or 3)
2. ✅ Copy the code
3. ✅ Test with sample data
4. ✅ Test with real URLs
5. ✅ Customize styling if needed
6. ✅ Update documentation

---

**You're ready to integrate! 🚀**

Choose the option that works best for your project structure and start testing!
