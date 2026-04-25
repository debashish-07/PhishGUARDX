import React from 'react';

const items = [
    { label: 'Scanner', href: '#scanner' },
    { label: 'Dashboard', href: '#dashboard' },
    { label: 'Trust Ledger', href: '#ledger' },
];

export const Sidebar: React.FC = () => {
    return (
        <aside className="hidden w-64 shrink-0 border-r border-slate-800 bg-slate-950 px-4 py-6 lg:flex lg:flex-col">
            <div>
                <div className="text-xs uppercase tracking-[0.3em] text-cyan-400">PhishGuardX</div>
                <div className="mt-2 text-lg font-semibold text-white">SOC Console</div>
            </div>

            <nav className="mt-8 space-y-2">
                {items.map((item) => (
                    <a
                        key={item.label}
                        href={item.href}
                        className="flex items-center rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-300 transition hover:border-cyan-500 hover:text-white"
                    >
                        {item.label}
                    </a>
                ))}
            </nav>

            <div className="mt-auto rounded-xl border border-slate-800 bg-slate-900 p-4 text-xs text-slate-400">
                Live scan telemetry
            </div>
        </aside>
    );
};
