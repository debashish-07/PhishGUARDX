import React, { useState, useEffect } from 'react';
import { QuantumRiskMap } from './visualizations/QuantumRiskMap';
import { VisualDNA } from './visualizations/VisualDNA';
import { UrlHeatmap } from './visualizations/UrlHeatmap';
import { ExplainPanel } from '@/app/components/ExplainPanel';
// New feature imports
import { TrustLedgerViewer } from '@/app/components/TrustLedgerViewer';
import { AudioSpectrogram } from '@/app/components/AudioSpectrogram';
import { QuantumWaveform } from '@/app/components/QuantumWaveform';
import { DNAStripe } from '@/app/components/DNAStripe';
import { EnhancedExplainability } from '@/app/components/EnhancedExplainability';
import { TrustLedger } from '@/app/utils/trustLedger';

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

    // Add to Trust Ledger when result changes
    useEffect(() => {
        if (result && url) {
            const addToLedger = async () => {
                try {
                    await TrustLedger.addEntry(
                        url,
                        result.score * 100, // Convert to percentage
                        {
                            heuristic: result.breakdown?.heuristic || 0,
                            quantum: result.breakdown?.quantum || 0,
                            visual: result.breakdown?.visual || 0,
                            transformer: result.breakdown?.transformer || 0,
                            ensemble: result.breakdown?.ensemble || 0,
                        }
                    );
                } catch (error) {
                    console.error('Failed to add to trust ledger:', error);
                }
            };
            addToLedger();
        }
    }, [result, url]);

    return (
        <div className="mt-8 space-y-8" data-testid="dashboard-ready">
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
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-green-500/50 bg-green-800/20 text-green-300 text-xs" data-testid="analysis-complete-badge">
                    <span>✓ Analysis Complete</span>
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


            {/* 🌟 SECTION 1: Advanced Visualizations (NEW FEATURES) */}
            <div className="animate-slide-up delay-100">
                <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-600 mb-6 flex items-center">
                    <span className="mr-3">🌟</span>
                    Advanced Visualizations
                </h2>
                <div className="space-y-6">
                    {/* Quantum Waveform */}
                    {result.details.quantum && result.details.quantum.length > 0 && (
                        <QuantumWaveform
                            features={result.details.quantum}
                            riskScore={result.score * 100}
                        />
                    )}

                    {/* Audio Spectrogram */}
                    <AudioSpectrogram url={url} />

                    {/* DNA Stripe */}
                    <DNAStripe url={url} />
                </div>
            </div>

            {/* 📊 SECTION 2: Multi-Modal Analysis (CORE FEATURES) */}
            <div className="animate-slide-up delay-200" data-testid="analysis-complete">
                <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-6 flex items-center">
                    <span className="mr-3">📊</span>
                    Multi-Modal Analysis
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Quantum Risk Map */}
                    <div className="glass p-6 rounded-xl border border-purple-500/30 hover:border-purple-500/60 transition-all">
                        <h3 className="text-purple-400 font-bold mb-4 flex items-center text-lg">
                            <span className="mr-2">🔮</span>
                            Quantum Risk Map
                        </h3>
                        <QuantumRiskMap data={result.details.quantum} />
                        <p className="text-xs text-gray-500 mt-3">
                            Quantum-inspired hashing reveals structural anomalies
                        </p>
                    </div>

                    {/* Visual DNA Pattern */}
                    <div className="glass p-6 rounded-xl border border-pink-500/30 hover:border-pink-500/60 transition-all">
                        <h3 className="text-pink-400 font-bold mb-4 flex items-center text-lg">
                            <span className="mr-2">🧬</span>
                            Visual DNA Pattern
                        </h3>
                        <VisualDNA data={result.details.visual} />
                        <p className="text-xs text-gray-500 mt-3">
                            Fingerprint-based structural similarity detection
                        </p>
                    </div>
                </div>
            </div>

            {/* 💡 SECTION 3: Explainability & Attribution */}
            <div className="animate-slide-up delay-250">
                <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-600 mb-6 flex items-center">
                    <span className="mr-3">💡</span>
                    Explainability & Attribution
                </h2>

                {/* URL Character Heatmap */}
                <div className="mb-6">
                    <h3 className="text-xl font-semibold text-yellow-400 mb-3 flex items-center">
                        <span className="mr-2">🔍</span>
                        Character-Level Risk Attribution
                    </h3>
                    <UrlHeatmap url={url} heatmapData={result.explain?.heatmap} />
                </div>

                {/* Enhanced Explainability Dashboard */}
                {result.breakdown && (
                    <div className="mt-6">
                        <h3 className="text-xl font-semibold text-purple-400 mb-3 flex items-center">
                            <span className="mr-2">📈</span>
                            Module Contribution Analysis
                        </h3>
                        <EnhancedExplainability
                            moduleScores={{
                                heuristic: result.breakdown.heuristic,
                                quantum: result.breakdown.quantum,
                                visual: result.breakdown.visual,
                                transformer: result.breakdown.transformer,
                                ensemble: result.breakdown.ensemble,
                            }}
                            triggeredRules={[
                                {
                                    id: 'rule-1',
                                    name: 'Risk Score Analysis',
                                    reason: `Overall risk score of ${(result.score * 100).toFixed(1)}% indicates ${result.score > 0.7 ? 'high' : result.score > 0.4 ? 'medium' : 'low'} threat level`,
                                    severity: result.score > 0.7 ? 'high' as const : result.score > 0.4 ? 'medium' as const : 'low' as const,
                                    impact: result.score * 20,
                                },
                            ]}
                            riskFactors={[
                                {
                                    description: 'Multi-modal analysis combining 5 detection methods',
                                    impact: 15,
                                    category: 'Methodology',
                                },
                            ]}
                            confidence={85}
                            finalScore={result.score * 100}
                        />
                    </div>
                )}

                {/* Original Explain Panel (Detailed Token Attribution) */}
                {result.explain && (
                    <div className="mt-6">
                        <h3 className="text-xl font-semibold text-cyan-400 mb-3 flex items-center">
                            <span className="mr-2">🎯</span>
                            Detailed Feature Attribution
                        </h3>
                        <ExplainPanel
                            attributions={result.explain.attributions}
                            heatmapRanges={result.explain.heatmap}
                            url={url}
                        />
                    </div>
                )}
            </div>

            {/* 🔗 SECTION 4: Audit Trail */}
            <div className="animate-slide-up delay-300">
                <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-600 mb-6 flex items-center">
                    <span className="mr-3">🔗</span>
                    Blockchain Audit Trail
                </h2>
                <TrustLedgerViewer />
            </div>

            {/* Confidence Indicator */}
            <div className="text-center text-xs text-gray-500 animate-slide-up delay-300">
                <p>Analysis powered by 5-module hybrid AI • Privacy-first browser processing</p>
                <p className="mt-1">Multi-Modal Ensemble: Heuristics (25%) • Quantum (15%) • Visual (10%) • Transformer (25%) • ML Ensemble (25%)</p>
            </div>
        </div>
    );
};
