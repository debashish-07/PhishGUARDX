'use client';

import { useMemo } from 'react';

interface DNAStripeProps {
    url: string;
}

type DNABase = 'A' | 'T' | 'G' | 'C';

export function DNAStripe({ url }: DNAStripeProps) {
    const dnaSequence = useMemo(() => urlToDNA(url), [url]);
    const patternAnalysis = useMemo(() => analyzePattern(dnaSequence), [dnaSequence]);

    function urlToDNA(urlString: string): DNABase[] {
        const bases: DNABase[] = ['A', 'T', 'G', 'C'];
        return urlString.split('').map(char => {
            const code = char.charCodeAt(0);
            return bases[code % 4];
        });
    }

    function getBaseColor(base: DNABase): string {
        const colors = {
            'A': '#FF6B6B', // Red (Adenine)
            'T': '#4ECDC4', // Cyan (Thymine)
            'G': '#95E1D3', // Green (Guanine)
            'C': '#FFE66D', // Yellow (Cytosine)
        };
        return colors[base];
    }

    function getBaseName(base: DNABase): string {
        const names = {
            'A': 'Adenine',
            'T': 'Thymine',
            'G': 'Guanine',
            'C': 'Cytosine',
        };
        return names[base];
    }

    function analyzePattern(sequence: DNABase[]) {
        const counts = { A: 0, T: 0, G: 0, C: 0 };
        sequence.forEach(base => counts[base]++);

        const total = sequence.length;
        const percentages = {
            A: (counts.A / total) * 100,
            T: (counts.T / total) * 100,
            G: (counts.G / total) * 100,
            C: (counts.C / total) * 100,
        };

        // Detect repeating patterns
        const patterns: string[] = [];
        for (let len = 2; len <= 4; len++) {
            for (let i = 0; i <= sequence.length - len * 2; i++) {
                const pattern = sequence.slice(i, i + len).join('');
                const next = sequence.slice(i + len, i + len * 2).join('');
                if (pattern === next && !patterns.includes(pattern)) {
                    patterns.push(pattern);
                }
            }
        }

        // Calculate entropy
        const entropy = -Object.values(percentages).reduce((sum, p) => {
            if (p === 0) return sum;
            return sum + (p / 100) * Math.log2(p / 100);
        }, 0);

        return {
            counts,
            percentages,
            patterns,
            entropy,
            isBalanced: Math.abs(percentages.A - 25) < 10 &&
                Math.abs(percentages.T - 25) < 10 &&
                Math.abs(percentages.G - 25) < 10 &&
                Math.abs(percentages.C - 25) < 10,
        };
    }

    return (
        <div className="dna-stripe bg-gray-900/50 p-6 rounded-lg border border-green-500/30">
            <div className="flex items-center gap-3 mb-4">
                <div className="text-3xl">🧬</div>
                <div>
                    <h4 className="text-xl font-bold text-green-400">DNA Stripe Pattern</h4>
                    <p className="text-sm text-gray-400">Bioinformatics-inspired URL encoding</p>
                </div>
            </div>

            {/* DNA Stripe Visualization */}
            <div className="mb-6">
                <div className="flex h-16 rounded-lg overflow-hidden border border-green-500/30 shadow-lg">
                    {dnaSequence.map((base, i) => (
                        <div
                            key={i}
                            className="flex-1 transition-all hover:scale-105 hover:z-10 cursor-pointer group relative"
                            style={{
                                backgroundColor: getBaseColor(base),
                                minWidth: '2px',
                            }}
                            title={`${base} (${url[i]})`}
                        >
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors"></div>
                            {dnaSequence.length <= 50 && (
                                <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white/80 group-hover:text-white">
                                    {base}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
                <div className="mt-2 text-xs text-gray-400 text-center">
                    {dnaSequence.length} base pairs • Hover over stripes for details
                </div>
            </div>

            {/* Legend */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {(['A', 'T', 'G', 'C'] as DNABase[]).map(base => (
                    <div
                        key={base}
                        className="flex items-center gap-2 p-3 rounded-lg border"
                        style={{
                            backgroundColor: `${getBaseColor(base)}20`,
                            borderColor: `${getBaseColor(base)}50`,
                        }}
                    >
                        <div
                            className="w-6 h-6 rounded"
                            style={{ backgroundColor: getBaseColor(base) }}
                        ></div>
                        <div className="flex-1">
                            <div className="text-sm font-bold text-white">{base}</div>
                            <div className="text-xs text-gray-400">{getBaseName(base)}</div>
                        </div>
                        <div className="text-right">
                            <div className="text-lg font-bold text-white">
                                {patternAnalysis.counts[base]}
                            </div>
                            <div className="text-xs text-gray-400">
                                {patternAnalysis.percentages[base].toFixed(1)}%
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pattern Analysis */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="p-4 bg-green-900/20 rounded-lg border border-green-500/30">
                    <div className="text-green-400 font-semibold mb-1 text-sm">Entropy</div>
                    <div className="text-white text-2xl font-bold">
                        {patternAnalysis.entropy.toFixed(3)}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                        {patternAnalysis.entropy > 1.9 ? 'High diversity' : 'Low diversity'}
                    </div>
                </div>

                <div className="p-4 bg-green-900/20 rounded-lg border border-green-500/30">
                    <div className="text-green-400 font-semibold mb-1 text-sm">Balance</div>
                    <div className="text-white text-2xl font-bold">
                        {patternAnalysis.isBalanced ? '✓' : '✗'}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                        {patternAnalysis.isBalanced ? 'Well distributed' : 'Skewed distribution'}
                    </div>
                </div>

                <div className="p-4 bg-green-900/20 rounded-lg border border-green-500/30">
                    <div className="text-green-400 font-semibold mb-1 text-sm">Patterns</div>
                    <div className="text-white text-2xl font-bold">
                        {patternAnalysis.patterns.length}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                        {patternAnalysis.patterns.length > 0 ? 'Repeating detected' : 'No repeats'}
                    </div>
                </div>
            </div>

            {/* Detected Patterns */}
            {patternAnalysis.patterns.length > 0 && (
                <div className="p-4 bg-yellow-900/20 rounded-lg border border-yellow-500/30 mb-4">
                    <div className="text-yellow-400 font-semibold mb-2 text-sm">
                        ⚠️ Repeating Patterns Detected
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {patternAnalysis.patterns.slice(0, 10).map((pattern, i) => (
                            <div
                                key={i}
                                className="px-3 py-1 bg-yellow-500/20 rounded-full border border-yellow-500/50 text-xs font-mono text-yellow-200"
                            >
                                {pattern}
                            </div>
                        ))}
                        {patternAnalysis.patterns.length > 10 && (
                            <div className="px-3 py-1 text-xs text-gray-400">
                                +{patternAnalysis.patterns.length - 10} more
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Explanation */}
            <div className="p-3 bg-green-900/20 rounded-lg border border-green-500/30">
                <p className="text-xs text-gray-300">
                    <strong className="text-green-400">DNA Encoding:</strong> Each character in the URL is mapped to a DNA base
                    (A, T, G, C) based on its ASCII code. This bioinformatics-inspired visualization reveals structural patterns
                    and repetitions that may indicate suspicious URL construction. High entropy and balanced distribution typically
                    indicate legitimate URLs, while repeating patterns may suggest automated generation.
                </p>
            </div>
        </div>
    );
}
