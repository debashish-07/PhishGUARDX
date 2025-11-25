import React from 'react';

interface AudioSpectrumProps {
    data: number[];
}

export const AudioSpectrum: React.FC<AudioSpectrumProps> = ({ data }) => {
    return (
        <div className="p-4 bg-gray-900 rounded-lg border border-emerald-500/30">
            <h3 className="text-emerald-400 font-mono mb-2">MFCC Audio Spectrum</h3>
            <div className="flex items-center justify-center h-32 space-x-2">
                {data.map((val, idx) => (
                    <div
                        key={idx}
                        className="w-2 bg-emerald-500 rounded-full transition-all duration-500"
                        style={{
                            height: `${Math.min(Math.abs(val) / 100, 1) * 100}%`,
                            opacity: 0.6 + (Math.min(Math.abs(val) / 200, 0.4))
                        }}
                    />
                ))}
            </div>
            <div className="mt-2 text-xs text-emerald-300 font-mono text-center">
                Structural Resonance Analysis
            </div>
        </div>
    );
};
