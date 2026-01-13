import React from 'react';

interface ModuleBreakdownHeatmapProps {
    url: string;
    breakdown: {
        heuristic: number;
        quantum: number;
        visual: number;
        transformer: number;
        ensemble: number;
    };
}

const MODULE_DESCRIPTIONS = {
    heuristic: {
        name: 'Heuristics Analysis',
        icon: '🔍',
        description: 'Rule-based detection examining URL patterns',
        checks: [
            'Suspicious keywords (login, verify, secure, account)',
            'IP addresses instead of domain names',
            'Excessive special characters and subdomains',
            'URL length and complexity',
            'Suspicious TLDs (.tk, .ml, .ga, etc.)'
        ]
    },
    quantum: {
        name: 'Quantum Hash',
        icon: '🔮',
        description: 'Quantum-inspired feature encoding for structural analysis',
        checks: [
            'Character frequency distribution',
            'Structural entropy measurements',
            'Phase-based anomaly detection',
            'Superposition-inspired pattern matching',
            'Hamming distance from known phishing patterns'
        ]
    },
    visual: {
        name: 'Visual DNA',
        icon: '🧬',
        description: 'Biometric-style URL fingerprinting',
        checks: [
            'Character sequence patterns',
            'Visual similarity to legitimate sites',
            '2D structural representation',
            'Fingerprint-based clustering',
            'Mutation detection from known patterns'
        ]
    },
    transformer: {
        name: 'Transformer AI',
        icon: '🤖',
        description: 'Deep learning semantic analysis',
        checks: [
            'Contextual meaning extraction',
            'Brand impersonation detection',
            'Natural language understanding',
            'Sentiment and intent classification',
            'Pre-trained on phishing datasets'
        ]
    },
    ensemble: {
        name: 'ML Ensemble',
        icon: '🎯',
        description: 'Aggregated machine learning prediction',
        checks: [
            'Combines all feature vectors',
            'ONNX runtime inference',
            'Neural network aggregation',
            'Weighted voting mechanism',
            'Fallback to heuristic if model unavailable'
        ]
    }
};

export const ModuleBreakdownHeatmap: React.FC<ModuleBreakdownHeatmapProps> = ({ url, breakdown }) => {
    const getColorForScore = (score: number) => {
        if (score < 20) return 'bg-green-500';
        if (score < 40) return 'bg-yellow-500';
        if (score < 60) return 'bg-orange-500';
        return 'bg-red-500';
    };

    const getTextColorForScore = (score: number) => {
        if (score < 20) return 'text-green-400';
        if (score < 40) return 'text-yellow-400';
        if (score < 60) return 'text-orange-400';
        return 'text-red-400';
    };

    const renderModuleCard = (moduleKey: keyof typeof breakdown, score: number) => {
        const module = MODULE_DESCRIPTIONS[moduleKey];
        const normalizedScore = Math.min(100, Math.max(0, score));
        const colorClass = getColorForScore(normalizedScore);
        const textColorClass = getTextColorForScore(normalizedScore);

        return (
            <div key={moduleKey} className="glass p-6 rounded-xl border border-purple-500/30 hover:border-purple-500/60 transition-all">
                <div className="flex items-center justify-between mb-4">
                    <h4 className={`text-lg font-bold flex items-center ${textColorClass}`}>
                        <span className="mr-2 text-2xl">{module.icon}</span>
                        {module.name}
                    </h4>
                    <div className={`text-2xl font-bold ${textColorClass}`}>
                        {normalizedScore.toFixed(1)}/100
                    </div>
                </div>

                {/* Score Bar */}
                <div className="w-full bg-gray-800 rounded-full h-3 mb-4 overflow-hidden">
                    <div
                        className={`h-full ${colorClass} transition-all duration-500 ease-out rounded-full`}
                        style={{ width: `${normalizedScore}%` }}
                    />
                </div>

                <p className="text-sm text-gray-400 mb-3">{module.description}</p>

                {/* What it checks */}
                <div className="space-y-1">
                    <p className="text-xs font-semibold text-purple-300 mb-2">Detection Focus:</p>
                    {module.checks.map((check, idx) => (
                        <div key={idx} className="flex items-start text-xs text-gray-500">
                            <span className="mr-2 text-purple-400">•</span>
                            <span>{check}</span>
                        </div>
                    ))}
                </div>

                {/* URL Segment Heatmap */}
                <div className="mt-4 pt-4 border-t border-gray-700">
                    <p className="text-xs font-semibold text-purple-300 mb-2">URL Impact Zones:</p>
                    <div className="flex flex-wrap gap-1">
                        {url.split('').map((char, idx) => {
                            // Simple heuristic: higher scores mean riskier characters
                            const charRisk = getCharacterRisk(char, idx, url, moduleKey, normalizedScore);
                            const opacity = Math.min(1, charRisk / 100);
                            
                            return (
                                <span
                                    key={idx}
                                    className="inline-block px-1 py-0.5 rounded text-xs font-mono transition-all hover:scale-110"
                                    style={{
                                        backgroundColor: `rgba(239, 68, 68, ${opacity * 0.6})`,
                                        color: opacity > 0.3 ? '#fff' : '#999'
                                    }}
                                    title={`Character: ${char} | Module: ${module.name} | Risk: ${charRisk.toFixed(1)}%`}
                                >
                                    {char}
                                </span>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <div className="glass p-6 rounded-xl border border-cyan-500/30">
                <h3 className="text-2xl font-bold text-cyan-400 mb-2 flex items-center">
                    <span className="mr-2">📊</span>
                    Detection Module Breakdown
                </h3>
                <p className="text-sm text-gray-400 mb-4">
                    Each module analyzes the URL independently. Higher scores indicate higher phishing risk.
                    Hover over characters to see module-specific risk attributions.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {renderModuleCard('heuristic', breakdown.heuristic)}
                {renderModuleCard('quantum', breakdown.quantum)}
                {renderModuleCard('visual', breakdown.visual)}
                {renderModuleCard('transformer', breakdown.transformer)}
                {renderModuleCard('ensemble', breakdown.ensemble)}
            </div>
        </div>
    );
};

// Helper function to estimate character-level risk per module
function getCharacterRisk(
    char: string,
    index: number,
    url: string,
    module: keyof typeof MODULE_DESCRIPTIONS,
    moduleScore: number
): number {
    let risk = 0;

    switch (module) {
        case 'heuristic':
            // Heuristics: suspicious keywords, special chars, IP patterns
            if (/[0-9]/.test(char) && url.includes('://')) risk += 30;
            if (/[-_.]/.test(char)) risk += 15;
            if (url.toLowerCase().includes('login') || url.toLowerCase().includes('verify')) {
                const keywordIndex = url.toLowerCase().indexOf('login') || url.toLowerCase().indexOf('verify');
                if (index >= keywordIndex && index < keywordIndex + 10) risk += 40;
            }
            break;

        case 'quantum':
            // Quantum: structural entropy - middle chars and special patterns
            const normalizedPos = index / url.length;
            risk += Math.abs(normalizedPos - 0.5) * 50; // Center chars more suspicious
            if (/[^a-zA-Z0-9]/.test(char)) risk += 25;
            break;

        case 'visual':
            // Visual: pattern mutations, homoglyphs
            if (/[Il1O0]/.test(char)) risk += 35; // Confusable chars
            if (index > 0 && url[index - 1] === char) risk += 20; // Repeated chars
            break;

        case 'transformer':
            // Transformer: semantic context - focuses on domain/path keywords
            if (url.includes('secure') || url.includes('account') || url.includes('update')) {
                const keywords = ['secure', 'account', 'update', 'verify', 'login'];
                for (const kw of keywords) {
                    const kwIndex = url.toLowerCase().indexOf(kw);
                    if (kwIndex !== -1 && index >= kwIndex && index < kwIndex + kw.length) {
                        risk += 50;
                    }
                }
            }
            break;

        case 'ensemble':
            // Ensemble: aggregate average risk
            risk = moduleScore * (0.3 + Math.random() * 0.4); // Proportional to overall score
            break;
    }

    // Scale to module score
    return Math.min(100, risk * (moduleScore / 100));
}
