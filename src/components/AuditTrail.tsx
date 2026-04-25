import React, { useState, useEffect } from 'react';

interface AuditBlock {
    index: number;
    timestamp: string;
    url: string;
    result: string;
    risk_score: number;
    previous_hash: string;
    block_hash: string;
}

interface AuditTrailProps {
    showLimit?: number;
}

export const AuditTrail: React.FC<AuditTrailProps> = ({ showLimit = 20 }) => {
    const [blocks, setBlocks] = useState<AuditBlock[]>([]);
    const [chainValid, setChainValid] = useState<boolean>(true);
    const [loading, setLoading] = useState(true);
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
    const [totalBlocks, setTotalBlocks] = useState(0);

    useEffect(() => {
        fetchAuditTrail();
        // Refresh every 5 seconds
        const interval = setInterval(fetchAuditTrail, 5000);
        return () => clearInterval(interval);
    }, []);

    const fetchAuditTrail = async () => {
        try {
            const backendBase = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000';
            const response = await fetch(`${backendBase}/api/ledger/`);
            if (!response.ok) throw new Error('Failed to fetch audit trail');
            const data = await response.json();
            setBlocks(data.blocks.slice(0, showLimit));
            setChainValid(data.chain_valid);
            setTotalBlocks(data.total_blocks);
        } catch (error) {
            console.error('Error fetching audit trail:', error);
        } finally {
            setLoading(false);
        }
    };

    const shortenHash = (hash: string, length: number = 8) => {
        if (!hash) return 'GENESIS';
        return hash.substring(0, length) + '...' + hash.substring(hash.length - 4);
    };

    const getRiskColor = (score: number) => {
        if (score > 0.65) return 'bg-red-100 text-red-700';
        if (score > 0.40) return 'bg-yellow-100 text-yellow-700';
        return 'bg-green-100 text-green-700';
    };

    const getVerdictBadge = (result: string) => {
        const resultLower = result.toLowerCase();
        if (resultLower === 'phishing') return 'bg-red-600 text-white';
        if (resultLower === 'suspicious') return 'bg-yellow-600 text-white';
        return 'bg-green-600 text-white';
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    const formatTimestamp = (ts: string) => {
        const date = new Date(ts);
        return date.toLocaleString();
    };

    const formatUrl = (url: string, maxLength: number = 50) => {
        if (url.length <= maxLength) return url;
        return url.substring(0, maxLength) + '...';
    };

    if (loading) {
        return (
            <div className="rounded border border-slate-300 bg-white p-6">
                <div className="h-64 flex items-center justify-center text-slate-500">
                    Loading audit trail...
                </div>
            </div>
        );
    }

    return (
        <div className="rounded border border-slate-300 bg-white p-6" data-testid="audit-trail">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Trust Ledger Audit Trail</h2>
                <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold ${
                        chainValid 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                    }`}>
                        <span className={`w-2 h-2 rounded-full ${chainValid ? 'bg-green-600' : 'bg-red-600'}`}></span>
                        {chainValid ? 'Chain Valid' : 'Chain Compromised'}
                    </span>
                    <span className="text-sm text-slate-600">{totalBlocks} total blocks</span>
                </div>
            </div>

            {/* Description */}
            <p className="mb-4 text-sm text-slate-600">
                Hash-linked blocks with chain verification. Each block contains a SHA-256 hash of its content 
                and the previous block's hash, ensuring tampering detection.
            </p>

            {/* Table */}
            {blocks.length === 0 ? (
                <div className="rounded border border-dashed border-slate-300 bg-slate-50 py-12 text-center">
                    <p className="text-slate-500">No audit trail entries yet. Scan URLs to start building the ledger.</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50 text-left text-slate-700">
                                <th className="px-4 py-3 font-semibold">#</th>
                                <th className="px-4 py-3 font-semibold">Timestamp</th>
                                <th className="px-4 py-3 font-semibold">URL</th>
                                <th className="px-4 py-3 font-semibold">Risk</th>
                                <th className="px-4 py-3 font-semibold">Verdict</th>
                                <th className="px-4 py-3 font-semibold">Block Hash</th>
                                <th className="px-4 py-3 font-semibold text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {blocks.map((block, idx) => (
                                <React.Fragment key={block.index}>
                                    <tr 
                                        className={`border-b border-slate-200 hover:bg-slate-50 cursor-pointer transition ${
                                            expandedIndex === idx ? 'bg-slate-50' : ''
                                        }`}
                                        onClick={() => setExpandedIndex(expandedIndex === idx ? null : idx)}
                                    >
                                        <td className="px-4 py-3 font-mono text-slate-600">{block.index}</td>
                                        <td className="px-4 py-3 text-slate-600 text-xs">
                                            {formatTimestamp(block.timestamp)}
                                        </td>
                                        <td className="px-4 py-3 font-mono text-slate-700">
                                            <div title={block.url} className="max-w-xs truncate">
                                                {formatUrl(block.url)}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                                                getRiskColor(block.risk_score)
                                            }`}>
                                                {(block.risk_score * 100).toFixed(1)}%
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-block px-2.5 py-1 rounded text-xs font-semibold ${
                                                getVerdictBadge(block.result)
                                            }`}>
                                                {block.result}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 font-mono text-xs text-slate-600">
                                            {shortenHash(block.block_hash)}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    copyToClipboard(block.block_hash);
                                                }}
                                                className="text-blue-600 hover:text-blue-800 font-semibold text-xs"
                                                title="Copy full hash"
                                            >
                                                Copy
                                            </button>
                                        </td>
                                    </tr>

                                    {/* Expanded Detail Row */}
                                    {expandedIndex === idx && (
                                        <tr className="bg-slate-50 border-b border-slate-200">
                                            <td colSpan={7} className="px-4 py-4">
                                                <div className="space-y-3 text-sm">
                                                    <div>
                                                        <div className="text-slate-600 font-semibold mb-1">Full URL</div>
                                                        <div className="font-mono bg-white p-2 rounded border border-slate-200 text-slate-700 break-all">
                                                            {block.url}
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <div className="text-slate-600 font-semibold mb-1">Block Hash</div>
                                                            <div className="font-mono bg-white p-2 rounded border border-slate-200 text-slate-700 break-all text-xs">
                                                                {block.block_hash}
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <div className="text-slate-600 font-semibold mb-1">Previous Hash</div>
                                                            <div className="font-mono bg-white p-2 rounded border border-slate-200 text-slate-700 break-all text-xs">
                                                                {shortenHash(block.previous_hash, 12)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="text-xs text-slate-600 bg-blue-50 p-2 rounded border border-blue-200">
                                                        <strong>Hash Verification:</strong> This block's hash is computed from its content 
                                                        and the previous block's hash. Modifying any field would invalidate this hash, 
                                                        detecting tampering.
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Footer Info */}
            <div className="mt-4 flex items-center justify-between text-xs text-slate-600">
                <div>Showing {blocks.length} of {totalBlocks} entries</div>
                <button
                    onClick={fetchAuditTrail}
                    className="text-blue-600 hover:text-blue-800 font-semibold"
                >
                    Refresh
                </button>
            </div>
        </div>
    );
};
