import React from 'react';

interface QuantumRiskMapProps {
    data: number[];
}

export const QuantumRiskMap: React.FC<QuantumRiskMapProps> = ({ data }) => {
    return (
        <div className="p-4 bg-gray-900 rounded-lg border border-cyan-500/30">
            <h3 className="text-cyan-400 font-mono mb-2">Quantum Risk Map</h3>
            <div className="flex items-end space-x-1 h-32">
                {data.map((value, idx) => (
                    <div
                        key={idx}
                        className="flex-1 bg-cyan-500 transition-all duration-500"
                        style={{
                            height: `${value * 100}%`,
                            opacity: 0.5 + (value * 0.5)
                        }}
                        title={`Q-Bit ${idx}: ${value.toFixed(2)}`}
                    />
                ))}
            </div>
            <div className="mt-2 text-xs text-cyan-300 font-mono">
                Superposition Entropy: {data.reduce((a, b) => a + b, 0).toFixed(2)}
            </div>
        </div>
    );
};
