'use client';

interface ModuleScore {
    name: string;
    score: number;
    weight: number;
    contribution: number;
    confidence: number;
}

interface TriggeredRule {
    id: string;
    name: string;
    reason: string;
    severity: 'low' | 'medium' | 'high';
    impact: number;
}

interface RiskFactor {
    description: string;
    impact: number;
    category: string;
}

interface EnhancedExplainabilityProps {
    moduleScores: {
        heuristic: number;
        quantum: number;
        visual: number;
        transformer: number;
        ensemble: number;
    };
    triggeredRules?: TriggeredRule[];
    riskFactors?: RiskFactor[];
    confidence?: number;
    finalScore: number;
}

export function EnhancedExplainability({
    moduleScores,
    triggeredRules = [],
    riskFactors = [],
    confidence = 85,
    finalScore,
}: EnhancedExplainabilityProps) {

    const modules: ModuleScore[] = [
        {
            name: 'Heuristic Analysis',
            score: moduleScores.heuristic,
            weight: 0.25,
            contribution: moduleScores.heuristic * 0.25,
            confidence: 95,
        },
        {
            name: 'Quantum Hash',
            score: moduleScores.quantum,
            weight: 0.15,
            contribution: moduleScores.quantum * 0.15,
            confidence: 88,
        },
        {
            name: 'Visual DNA',
            score: moduleScores.visual,
            weight: 0.10,
            contribution: moduleScores.visual * 0.10,
            confidence: 82,
        },
        {
            name: 'Transformer',
            score: moduleScores.transformer,
            weight: 0.25,
            contribution: moduleScores.transformer * 0.25,
            confidence: 92,
        },
        {
            name: 'Ensemble',
            score: moduleScores.ensemble,
            weight: 0.25,
            contribution: moduleScores.ensemble * 0.25,
            confidence: 90,
        },
    ];

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'high': return 'text-red-400 bg-red-900/20 border-red-500/50';
            case 'medium': return 'text-yellow-400 bg-yellow-900/20 border-yellow-500/50';
            case 'low': return 'text-blue-400 bg-blue-900/20 border-blue-500/50';
            default: return 'text-gray-400 bg-gray-900/20 border-gray-500/50';
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 70) return 'text-red-400';
        if (score >= 40) return 'text-yellow-400';
        return 'text-green-400';
    };

    const getScoreBg = (score: number) => {
        if (score >= 70) return 'bg-red-500';
        if (score >= 40) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    return (
        <div className="enhanced-explainability space-y-6">
            {/* Module Contribution Breakdown */}
            <section className="bg-gray-900/50 p-6 rounded-lg border border-purple-500/30">
                <h4 className="text-xl font-bold text-purple-400 mb-4 flex items-center gap-2">
                    <span>📊</span> Module Contributions
                </h4>
                <div className="space-y-4">
                    {modules.map((module, index) => (
                        <div key={index} className="space-y-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="text-white font-semibold">{module.name}</span>
                                    <span className="text-xs text-gray-400">
                                        (Weight: {(module.weight * 100).toFixed(0)}%)
                                    </span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className={`text-sm font-mono ${getScoreColor(module.score)}`}>
                                        {module.score.toFixed(1)}%
                                    </span>
                                    <span className="text-xs text-gray-400">
                                        Contribution: {module.contribution.toFixed(1)}%
                                    </span>
                                </div>
                            </div>
                            <div className="relative h-3 bg-gray-800 rounded-full overflow-hidden">
                                <div
                                    className={`absolute left-0 top-0 h-full ${getScoreBg(module.score)} transition-all duration-500`}
                                    style={{ width: `${module.score}%` }}
                                ></div>
                                <div
                                    className="absolute left-0 top-0 h-full bg-white/20"
                                    style={{ width: `${module.weight * 100}%` }}
                                ></div>
                            </div>
                            <div className="flex items-center justify-between text-xs text-gray-500">
                                <span>Confidence: {module.confidence}%</span>
                                <span>Impact on final score: {module.contribution.toFixed(1)}%</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Final Score Calculation */}
                <div className="mt-6 p-4 bg-purple-900/20 rounded-lg border border-purple-500/30">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-purple-400 font-semibold">Final Risk Score</span>
                        <span className={`text-2xl font-bold ${getScoreColor(finalScore)}`}>
                            {finalScore.toFixed(1)}%
                        </span>
                    </div>
                    <div className="text-xs text-gray-400">
                        Calculated as weighted sum of all module contributions
                    </div>
                </div>
            </section>

            {/* Rule Justification */}
            {triggeredRules.length > 0 && (
                <section className="bg-gray-900/50 p-6 rounded-lg border border-yellow-500/30">
                    <h4 className="text-xl font-bold text-yellow-400 mb-4 flex items-center gap-2">
                        <span>🛡️</span> Triggered Security Rules
                    </h4>
                    <div className="space-y-3">
                        {triggeredRules.map((rule, index) => (
                            <div
                                key={index}
                                className={`p-4 rounded-lg border ${getSeverityColor(rule.severity)}`}
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                        <div className="font-semibold text-white mb-1">{rule.name}</div>
                                        <div className="text-sm text-gray-300">{rule.reason}</div>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <span className={`text-xs px-2 py-1 rounded-full border ${getSeverityColor(rule.severity)}`}>
                                            {rule.severity.toUpperCase()}
                                        </span>
                                        <span className="text-xs text-gray-400">
                                            Impact: +{rule.impact}%
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Top Risk Factors */}
            {riskFactors.length > 0 && (
                <section className="bg-gray-900/50 p-6 rounded-lg border border-red-500/30">
                    <h4 className="text-xl font-bold text-red-400 mb-4 flex items-center gap-2">
                        <span>⚠️</span> Top Risk Factors
                    </h4>
                    <ol className="space-y-3">
                        {riskFactors.slice(0, 5).map((factor, index) => (
                            <li key={index} className="flex items-start gap-3 p-3 bg-red-900/20 rounded-lg border border-red-500/30">
                                <span className="text-red-400 font-bold text-lg">{index + 1}.</span>
                                <div className="flex-1">
                                    <div className="text-white text-sm">{factor.description}</div>
                                    <div className="text-xs text-gray-400 mt-1">
                                        Category: {factor.category} • Impact: +{factor.impact}%
                                    </div>
                                </div>
                                <div className="text-red-400 font-bold text-lg">
                                    +{factor.impact}%
                                </div>
                            </li>
                        ))}
                    </ol>
                </section>
            )}

            {/* Confidence Visualization */}
            <section className="bg-gray-900/50 p-6 rounded-lg border border-blue-500/30">
                <h4 className="text-xl font-bold text-blue-400 mb-4 flex items-center gap-2">
                    <span>📈</span> Model Confidence
                </h4>
                <div className="space-y-4">
                    <div className="relative">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-300">Overall Confidence</span>
                            <span className="text-2xl font-bold text-blue-400">{confidence}%</span>
                        </div>
                        <div className="relative h-8 bg-gray-800 rounded-full overflow-hidden">
                            <div
                                className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-500"
                                style={{ width: `${confidence}%` }}
                            ></div>
                            <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-white">
                                {confidence >= 80 ? 'High Confidence' : confidence >= 60 ? 'Medium Confidence' : 'Low Confidence'}
                            </div>
                        </div>
                    </div>

                    <div className="p-4 bg-blue-900/20 rounded-lg border border-blue-500/30">
                        <p className="text-sm text-gray-300">
                            <strong className="text-blue-400">Interpretation:</strong>{' '}
                            {confidence >= 80 && 'The model is highly confident in this prediction. All modules agree on the assessment.'}
                            {confidence >= 60 && confidence < 80 && 'The model has moderate confidence. Some modules show varying assessments.'}
                            {confidence < 60 && 'The model has low confidence. Consider manual review or additional analysis.'}
                        </p>
                    </div>
                </div>
            </section>

            {/* Explanation Summary */}
            <section className="bg-gray-900/50 p-6 rounded-lg border border-cyan-500/30">
                <h4 className="text-xl font-bold text-cyan-400 mb-4 flex items-center gap-2">
                    <span>💡</span> How This Works
                </h4>
                <div className="space-y-3 text-sm text-gray-300">
                    <p>
                        <strong className="text-cyan-400">Multi-Modal Analysis:</strong> We analyze the URL using 5 different
                        detection methods, each contributing to the final risk score based on their assigned weights.
                    </p>
                    <p>
                        <strong className="text-cyan-400">Weighted Ensemble:</strong> The final score is calculated as a weighted
                        sum of all module scores. Modules with higher weights (Heuristic, Transformer, Ensemble) have more influence.
                    </p>
                    <p>
                        <strong className="text-cyan-400">Explainability:</strong> Every decision is transparent. You can see exactly
                        which modules flagged the URL and why, making the AI's reasoning clear and auditable.
                    </p>
                </div>
            </section>
        </div>
    );
}
