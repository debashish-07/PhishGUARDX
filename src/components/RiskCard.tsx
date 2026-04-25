import React from 'react';

type RiskTone = 'safe' | 'medium' | 'high';

interface RiskCardProps {
    score: number;
    tone: RiskTone;
}

const toneClasses: Record<RiskTone, string> = {
    safe: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
    medium: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
    high: 'border-rose-500/30 bg-rose-500/10 text-rose-300',
};

const badgeClasses: Record<RiskTone, string> = {
    safe: 'bg-emerald-500/20 text-emerald-300',
    medium: 'bg-amber-500/20 text-amber-300',
    high: 'bg-rose-500/20 text-rose-300',
};

const labels: Record<RiskTone, string> = {
    safe: 'Safe',
    medium: 'Medium Risk',
    high: 'High Risk',
};

export const RiskCard: React.FC<RiskCardProps> = ({ score, tone }) => {
    return (
        <div className={`rounded-xl border p-5 shadow-lg ${toneClasses[tone]}`}>
            <div className="flex items-start justify-between">
                <div>
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Risk Score</div>
                    <div className="mt-4 text-5xl font-semibold text-white">{score.toFixed(1)}%</div>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeClasses[tone]}`}>
                    {labels[tone]}
                </span>
            </div>
        </div>
    );
};
