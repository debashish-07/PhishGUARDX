import React from 'react';

interface VerdictCardProps {
    verdict: string;
    confidence: string;
}

export const VerdictCard: React.FC<VerdictCardProps> = ({ verdict, confidence }) => {
    return (
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 shadow-lg shadow-slate-950/20">
            <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Verdict</div>
            <div className="mt-4 text-2xl font-semibold text-white">{verdict}</div>
            <div className="mt-2 text-sm text-slate-400">{confidence}</div>
        </div>
    );
};
