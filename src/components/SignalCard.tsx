import React from 'react';

interface SignalCardProps {
    label: string;
    value: string | number;
    highlight?: 'normal' | 'good' | 'warn' | 'bad';
}

const toneStyles: Record<NonNullable<SignalCardProps['highlight']>, string> = {
    normal: 'border-slate-800 bg-slate-900 text-slate-100',
    good: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200',
    warn: 'border-amber-500/30 bg-amber-500/10 text-amber-200',
    bad: 'border-rose-500/30 bg-rose-500/10 text-rose-200',
};

export const SignalCard: React.FC<SignalCardProps> = ({ label, value, highlight = 'normal' }) => {
    return (
        <div className={`rounded-xl border p-4 shadow-lg shadow-slate-950/10 ${toneStyles[highlight]}`}>
            <div className="text-[11px] uppercase tracking-[0.2em] text-slate-400">{label}</div>
            <div className="mt-3 text-lg font-semibold">{value}</div>
        </div>
    );
};
