import React, { useState } from 'react';
import { QuantumRiskMap } from './visualizations/QuantumRiskMap';
import { VisualDNA } from './visualizations/VisualDNA';
import { AudioSpectrum } from './visualizations/AudioSpectrum';
import { ExplainPanel } from '@/app/components/ExplainPanel';

interface DashboardProps {
    url: string;
    result: {
        score: number;
        details: {
            quantum: number[];
            visual: number[][];
            audio: number[];
        };
        breakdown?: {
            heuristic: number;
            quantum: number;
            visual: number;
            transformer: number;
            ensemble: number;
        };
        explain?: {
            attributions: any[];
            heatmap: any[];
        };
    } | null;
}

export const Dashboard: React.FC<DashboardProps> = ({ result, url }) => {
    const [isGeneratingReport, setIsGeneratingReport] = useState(false);

    if (!result) return null;

    const handleGenerateReport = async () => {
        setIsGeneratingReport(true);
        try {
            // Dynamic import to reduce bundle size
            const { generateAndDownloadReport } = await import('@/src/lib/reportGenerator');

            const verdict = result.score > 0.7 ? 'phishing' : result.score > 0.4 ? 'suspicious' : 'safe';

            await generateAndDownloadReport({
                url,
                timestamp: Date.now(),
                score: result.score,
                breakdown: result.breakdown || {
                    heuristic: 0,
                    quantum: 0,
                    visual: 0,
                    transformer: 0,
                    ensemble: 0
                },
                explain: result.explain || { attributions: [], heatmap: [] },
                verdict
            });
        } catch (error) {
            console.error('Failed to generate report:', error);
        } finally {
            setIsGeneratingReport(false);
        }
    };

    return (
        <div className="mt-8 space-y-8">
            {/* Risk Score Header */}
            <div className="text-center p-8 glass rounded-xl border border-gray-700 animate-slide-up">
                <div className="text-sm text-gray-400 mb-2 uppercase tracking-wider">Risk Assessment</div>
                <div className="text-7xl font-bold mb-4">
                    <span className={
                        result.score > 0.7 ? 'text-red-500' :
                            result.score > 0.4 ? 'text-yellow-500' :
                                'text-green-500'
                    }>
                        {(result.score * 100).toFixed(1)}%
                    </span>
                </div>
                <div className="text-lg mb-4">
                    {result.score > 0.7 ? (
                        <span className="text-red-400 font-semibold">⚠️ High Risk - Likely Phishing</span>
                    ) : result.score > 0.4 ? (
                        <span className="text-yellow-400 font-semibold">⚡ Suspicious - Exercise Caution</span>
                    ) : (
                        <span className="text-green-400 font-semibold">✓ Low Risk - Appears Safe</span>
                    )}
                </div>

                {/* Generate Report Button */}
                <button
                    onClick={handleGenerateReport}
                    disabled={isGeneratingReport}
                    className="mt-4 px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-cyan-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isGeneratingReport ? '📄 Generating...' : '📄 Download PDF Report'}
                </button>
            </div>

            {/* Explainability Panel - Heatmaps and Attributions */}
            {result.explain && (
                <div className="animate-slide-up delay-100">
                    <h2 className="text-2xl font-bold text-cyan-400 mb-4 flex items-center">
                        <span className="w-2 h-2 bg-cyan-400 rounded-full mr-2 animate-pulse"></span>
                        Explainability Analysis
                    </h2>
                    <ExplainPanel
                        attributions={result.explain.attributions}
                        heatmapRanges={result.explain.heatmap}
                        url={url}
                    />
                </div>
            )}

            {/* Multi-Modal Feature Visualizations */}
            <div className="animate-slide-up delay-200">
                <h2 className="text-2xl font-bold text-cyan-400 mb-4 flex items-center">
                    <span className="w-2 h-2 bg-cyan-400 rounded-full mr-2 animate-pulse"></span>
                    Multi-Modal Feature Analysis
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="glass p-6 rounded-xl border border-purple-500/30 hover:border-purple-500/60 transition-all">
                        <h3 className="text-purple-400 font-bold mb-4 flex items-center">
                            <span className="mr-2">🔮</span>
                            Quantum Risk Map
                        </h3>
                        <QuantumRiskMap data={result.details.quantum} />
                        <p className="text-xs text-gray-500 mt-3">
                            Quantum-inspired hashing reveals structural anomalies
                        </p>
                    </div>
                    <div className="glass p-6 rounded-xl border border-pink-500/30 hover:border-pink-500/60 transition-all">
                        <h3 className="text-pink-400 font-bold mb-4 flex items-center">
                            <span className="mr-2">🧬</span>
                            Visual DNA Pattern
                        </h3>
                        <VisualDNA data={result.details.visual} />
                        <p className="text-xs text-gray-500 mt-3">
                            Fingerprint-based structural similarity detection
                        </p>
                    </div>
                    <div className="glass p-6 rounded-xl border border-cyan-500/30 hover:border-cyan-500/60 transition-all">
                        <h3 className="text-cyan-400 font-bold mb-4 flex items-center">
                            <span className="mr-2">🎵</span>
                            Audio Spectrum Analysis
                        </h3>
                        <AudioSpectrum data={result.details.audio} />
                        <p className="text-xs text-gray-500 mt-3">
                            MFCC-based frequency domain analysis
                        </p>
                    </div>
                </div>
            </div>

            {/* Confidence Indicator */}
            <div className="text-center text-xs text-gray-500 animate-slide-up delay-300">
                <p>Analysis powered by 5-module hybrid AI • Privacy-first browser processing</p>
                <p className="mt-1">Weighted ensemble: Heuristics (25%) • Quantum (15%) • Visual (10%) • Transformer (25%) • ML Ensemble (25%)</p>
            </div>
        </div>
    );
};
