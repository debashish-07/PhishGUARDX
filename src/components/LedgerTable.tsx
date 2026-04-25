import React, { useEffect, useState } from 'react';

interface AuditBlock {
    index: number;
    timestamp: string;
    url: string;
    user_id?: string;
    result: string;
    risk_score: number;
    previous_hash: string;
    block_hash: string;
}

interface TamperAlert {
    detected: boolean;
    severity: string;
    message: string;
}

interface LedgerTableProps {
    showLimit?: number;
}

export const LedgerTable: React.FC<LedgerTableProps> = ({ showLimit = 20 }) => {
    const [blocks, setBlocks] = useState<AuditBlock[]>([]);
    const [chainValid, setChainValid] = useState(true);
    const [totalBlocks, setTotalBlocks] = useState(0);
    const [loading, setLoading] = useState(true);
    const [tamperAlert, setTamperAlert] = useState<TamperAlert | null>(null);

    useEffect(() => {
        fetchLedger();
        const interval = setInterval(fetchLedger, 5000);
        return () => clearInterval(interval);
    }, []);

    const fetchLedger = async () => {
        try {
            const backendBase = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000';
            const response = await fetch(`${backendBase}/api/ledger/`);
            if (!response.ok) throw new Error('Failed to fetch ledger');
            const data = await response.json();
            setBlocks(data.blocks.slice(0, showLimit));
            setChainValid(data.chain_valid);
            setTotalBlocks(data.total_blocks);
            setTamperAlert(data.tamper_alert ?? null);
        } finally {
            setLoading(false);
        }
    };

    const shortenHash = (value: string) => `${value.slice(0, 6)}...${value.slice(-4)}`;

    const copyHash = async (value: string) => {
        await navigator.clipboard.writeText(value);
    };

    return (
        <section id="ledger" className="rounded border border-slate-300 bg-white p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                    <div className="text-sm font-semibold uppercase tracking-wide text-slate-700">Trust Ledger Audit Trail</div>
                    <div className="mt-2 flex items-center gap-2">
                        <span className={`h-2.5 w-2.5 rounded-full ${chainValid ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        <span className={`rounded-full px-3 py-1 text-sm font-semibold ${chainValid ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                            {chainValid ? 'Chain Valid' : 'Tampered'}
                        </span>
                    </div>
                </div>
                <div className="text-sm text-slate-600">{totalBlocks} total blocks</div>
            </div>

            {tamperAlert?.detected && (
                <div className="mb-4 rounded border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {tamperAlert.message}
                </div>
            )}

            <div className="overflow-hidden rounded border border-slate-200">
                <div className="max-h-[540px] overflow-auto">
                    <table className="min-w-full divide-y divide-slate-200 text-sm">
                        <thead className="sticky top-0 z-10 bg-slate-100 text-slate-700">
                            <tr>
                                <th className="px-4 py-3 text-left">#</th>
                                <th className="px-4 py-3 text-left">Timestamp</th>
                                <th className="px-4 py-3 text-left">URL</th>
                                <th className="px-4 py-3 text-left">User</th>
                                <th className="px-4 py-3 text-left">Risk</th>
                                <th className="px-4 py-3 text-left">Verdict</th>
                                <th className="px-4 py-3 text-left">Block Hash</th>
                                <th className="px-4 py-3 text-left">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 bg-white text-slate-800">
                            {loading && (
                                <tr>
                                    <td colSpan={8} className="px-4 py-8 text-center text-slate-500">Loading</td>
                                </tr>
                            )}
                            {!loading && blocks.map((block) => {
                                const isHigh = block.risk_score >= 0.65;
                                return (
                                    <tr key={block.index} className={`transition hover:bg-slate-50 ${isHigh ? 'bg-rose-50/40' : ''}`}>
                                        <td className="px-4 py-3 font-mono text-slate-700">{block.index}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-slate-700">{new Date(block.timestamp).toLocaleString()}</td>
                                        <td className="px-4 py-3 max-w-[360px] truncate text-slate-800" title={block.url}>{block.url}</td>
                                        <td className="px-4 py-3 font-mono text-xs text-slate-700">{block.user_id || 'anonymous'}</td>
                                        <td className="px-4 py-3">
                                            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${isHigh ? 'bg-rose-100 text-rose-700' : block.risk_score >= 0.4 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                                {(block.risk_score * 100).toFixed(1)}%
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`rounded px-2.5 py-1 text-xs font-semibold ${block.result === 'phishing' ? 'bg-red-600 text-white' : block.result === 'suspicious' ? 'bg-yellow-500 text-white' : 'bg-green-600 text-white'}`}>
                                                {block.result}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 font-mono text-xs text-slate-700">{shortenHash(block.block_hash)}</td>
                                        <td className="px-4 py-3">
                                            <button onClick={() => copyHash(block.block_hash)} className="rounded px-2.5 py-1 text-sm text-blue-700 transition hover:text-blue-800">
                                                Copy
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );
};
