'use client';

import { useEffect, useState } from 'react';
import { TrustLedger, LedgerEntry, LedgerStats } from '../utils/trustLedger';

export function TrustLedgerViewer() {
    const [entries, setEntries] = useState<LedgerEntry[]>([]);
    const [prevUrlMap, setPrevUrlMap] = useState<Record<string, string>>({});
    const [pinned, setPinned] = useState<Array<{url:string;note?:string;addedAt?:number}>>([]);
    const [stats, setStats] = useState<LedgerStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [showAll, setShowAll] = useState(false);

    useEffect(() => {
        loadLedger();
    }, []);

    useEffect(() => {
        const handler = (e: Event) => {
            try {
                // reload ledger when a new entry is added elsewhere
                loadLedger();
            } catch (err) {
                console.error('Error handling trustledger event', err);
            }
        };
        window.addEventListener('trustledger:entryAdded', handler as EventListener);
        return () => window.removeEventListener('trustledger:entryAdded', handler as EventListener);
    }, []);

    const loadLedger = async () => {
        try {
            setLoading(true);
            const recentEntries = await TrustLedger.getRecentEntries(showAll ? 1000 : 10);
            const ledgerStats = await TrustLedger.getStats();

            // Build a map of currentHash -> url for quick prev-url lookup
            try {
                const all = await TrustLedger.getAllEntries();
                const map: Record<string, string> = {};
                all.forEach(e => { map[e.currentHash] = e.url; });
                setPrevUrlMap(map);
            } catch (err) {
                console.warn('Failed to build prevUrlMap', err);
                setPrevUrlMap({});
            }

            // Load pinned URLs
            try {
                const pinnedList = await TrustLedger.getPinnedUrls();
                setPinned(pinnedList || []);
            } catch (err) {
                console.warn('Failed to load pinned URLs', err);
                setPinned([]);
            }

            setEntries(recentEntries);
            setStats(ledgerStats);
        } catch (error) {
            console.error('Failed to load ledger:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePin = async (entry: LedgerEntry) => {
        try {
            await TrustLedger.pinUrl(entry.url, {
                id: entry.id,
                timestamp: entry.timestamp,
                riskScore: entry.riskScore,
                verdict: entry.verdict,
                currentHash: entry.currentHash,
            });
            const list = await TrustLedger.getPinnedUrls();
            setPinned(list);
        } catch (err) {
            console.error('Failed to pin URL', err);
        }
    };

    const handleUnpin = async (url: string) => {
        try {
            await TrustLedger.unpinUrl(url);
            const list = await TrustLedger.getPinnedUrls();
            setPinned(list);
        } catch (err) {
            console.error('Failed to unpin URL', err);
        }
    };

    const handleExportJSON = async () => {
        try {
            const json = await TrustLedger.exportAsJSON();
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `trust-ledger-${Date.now()}.json`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Failed to export JSON:', error);
        }
    };

    const handleExportCSV = async () => {
        try {
            const csv = await TrustLedger.exportAsCSV();
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `trust-ledger-${Date.now()}.csv`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Failed to export CSV:', error);
        }
    };

    const handleClearLedger = async () => {
        if (confirm('Are you sure you want to clear the entire ledger? This cannot be undone.')) {
            try {
                await TrustLedger.clearLedger();
                await loadLedger();
            } catch (error) {
                console.error('Failed to clear ledger:', error);
            }
        }
    };

    const getVerdictColor = (verdict: string) => {
        switch (verdict) {
            case 'safe': return 'text-green-400';
            case 'suspicious': return 'text-yellow-400';
            case 'phishing': return 'text-red-400';
            default: return 'text-gray-400';
        }
    };

    const getVerdictBg = (verdict: string) => {
        switch (verdict) {
            case 'safe': return 'bg-green-500/20 border-green-500/50';
            case 'suspicious': return 'bg-yellow-500/20 border-yellow-500/50';
            case 'phishing': return 'bg-red-500/20 border-red-500/50';
            default: return 'bg-gray-500/20 border-gray-500/50';
        }
    };

    if (loading) {
        return (
            <div className="trust-ledger-container p-6 bg-gray-900/50 rounded-lg border border-cyan-500/30">
                <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
                    <span className="ml-3 text-cyan-400">Loading ledger...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="trust-ledger-container p-6 bg-gray-900/50 rounded-lg border border-cyan-500/30">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="text-3xl">🔗</div>
                    <div>
                        <h3 className="text-2xl font-bold text-cyan-400">Local Trust Ledger</h3>
                        <p className="text-sm text-gray-400">Blockchain-inspired audit trail</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleExportJSON}
                        className="px-4 py-2 bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/50 rounded-lg text-cyan-400 text-sm transition-colors"
                    >
                        Export JSON
                    </button>
                    <button
                        onClick={handleExportCSV}
                        className="px-4 py-2 bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/50 rounded-lg text-cyan-400 text-sm transition-colors"
                    >
                        Export CSV
                    </button>
                    <button
                        onClick={handleClearLedger}
                        className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500/50 rounded-lg text-red-400 text-sm transition-colors"
                    >
                        Clear
                    </button>
                </div>
            </div>

            {/* Statistics */}
            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
                    <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                        <div className="text-2xl font-bold text-white">{stats.totalScans}</div>
                        <div className="text-xs text-gray-400">Total Scans</div>
                    </div>
                    <div className="bg-green-900/20 p-4 rounded-lg border border-green-700/50">
                        <div className="text-2xl font-bold text-green-400">{stats.safeCount}</div>
                        <div className="text-xs text-gray-400">Safe</div>
                    </div>
                    <div className="bg-yellow-900/20 p-4 rounded-lg border border-yellow-700/50">
                        <div className="text-2xl font-bold text-yellow-400">{stats.suspiciousCount}</div>
                        <div className="text-xs text-gray-400">Suspicious</div>
                    </div>
                    <div className="bg-red-900/20 p-4 rounded-lg border border-red-700/50">
                        <div className="text-2xl font-bold text-red-400">{stats.phishingCount}</div>
                        <div className="text-xs text-gray-400">Phishing</div>
                    </div>
                    <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-700/50">
                        <div className="text-2xl font-bold text-blue-400">{stats.averageRiskScore.toFixed(1)}%</div>
                        <div className="text-xs text-gray-400">Avg Risk</div>
                    </div>
                    <div className={`p-4 rounded-lg border ${stats.chainIntegrity ? 'bg-green-900/20 border-green-700/50' : 'bg-red-900/20 border-red-700/50'}`}>
                        <div className="text-2xl font-bold">{stats.chainIntegrity ? '✅' : '❌'}</div>
                        <div className="text-xs text-gray-400">Chain Integrity</div>
                    </div>
                </div>
            )}

            {/* Watched Entries Table */}
            <div className="mb-4">
                <h4 className="text-sm font-semibold text-cyan-300 mb-2">Watched Entries</h4>
                {pinned.length === 0 ? (
                    <div className="text-xs text-gray-400">No watched entries. Use "Pin" on a ledger entry to keep a record.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-xs text-left">
                            <thead>
                                <tr>
                                    <th className="px-2 py-1 text-gray-400">URL</th>
                                    <th className="px-2 py-1 text-gray-400">Risk</th>
                                    <th className="px-2 py-1 text-gray-400">Verdict</th>
                                    <th className="px-2 py-1 text-gray-400">Added</th>
                                    <th className="px-2 py-1 text-gray-400">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pinned.map(p => (
                                    <tr key={p.url} className="border-t border-gray-800">
                                        <td className="px-2 py-2 text-white truncate max-w-xs">{p.url}</td>
                                        <td className="px-2 py-2">{p.snapshotRiskScore ? `${p.snapshotRiskScore.toFixed(1)}%` : '—'}</td>
                                        <td className="px-2 py-2">{p.snapshotVerdict || '—'}</td>
                                        <td className="px-2 py-2">{new Date(p.addedAt).toLocaleString()}</td>
                                        <td className="px-2 py-2">
                                            <button onClick={() => handleUnpin(p.url)} className="text-sm text-red-400">Remove</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Entries List */}
            <div className="space-y-3">
                <div className="flex items-center justify-between mb-3">
                    <h4 className="text-lg font-semibold text-white">
                        Recent Entries {!showAll && `(Last 10)`}
                    </h4>
                    <button
                        onClick={() => {
                            setShowAll(!showAll);
                            loadLedger();
                        }}
                        className="text-sm text-cyan-400 hover:text-cyan-300"
                    >
                        {showAll ? 'Show Less' : 'Show All'}
                    </button>
                </div>

                {entries.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                        No entries in ledger yet. Scan a URL to create the first entry.
                    </div>
                ) : (
                    entries.map((entry, index) => (
                        <div
                            key={entry.id}
                            className={`p-4 rounded-lg border ${getVerdictBg(entry.verdict)} transition-all hover:scale-[1.01]`}
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-xs text-gray-500">#{entries.length - index}</span>
                                        <span className={`text-sm font-semibold ${getVerdictColor(entry.verdict)}`}>
                                            {entry.verdict.toUpperCase()}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            {new Date(entry.timestamp).toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="text-sm text-white font-mono truncate mb-2">
                                        {entry.url}
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
                                        <div>
                                            <span className="text-gray-500">Heuristic:</span>
                                            <span className="text-white ml-1">{entry.moduleScores.heuristic.toFixed(1)}%</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Quantum:</span>
                                            <span className="text-white ml-1">{entry.moduleScores.quantum.toFixed(1)}%</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Visual:</span>
                                            <span className="text-white ml-1">{entry.moduleScores.visual.toFixed(1)}%</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Transformer:</span>
                                            <span className="text-white ml-1">{entry.moduleScores.transformer.toFixed(1)}%</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Ensemble:</span>
                                            <span className="text-white ml-1">{entry.moduleScores.ensemble.toFixed(1)}%</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-white mb-1">
                                        {entry.riskScore.toFixed(1)}%
                                    </div>
                                    <div className="text-xs text-gray-500">Risk Score</div>
                                </div>
                            </div>
                            <div className="mt-3 pt-3 border-t border-gray-700/50">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-mono">
                                        <div>
                                            <div>
                                                <span className="text-gray-500">Prev Hash:</span>
                                                <span className="text-cyan-400 ml-2">{entry.previousHash.substring(0, 16)}...</span>
                                            </div>
                                            <div className="text-xs text-gray-400 mt-1">
                                                <span className="text-gray-500">Prev URL:</span>
                                                <span className="text-white ml-2 truncate">
                                                    {prevUrlMap[entry.previousHash] ? prevUrlMap[entry.previousHash] : '—'}
                                                </span>
                                            </div>
                                        </div>
                                        <div>
                                            <div>
                                                <span className="text-gray-500">Curr Hash:</span>
                                                <span className="text-cyan-400 ml-2">{entry.currentHash.substring(0, 16)}...</span>
                                            </div>
                                            <div className="text-xs text-gray-400 mt-1">
                                                <span className="text-gray-500">Curr URL:</span>
                                                <span className="text-white ml-2 truncate">{entry.url}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-2 flex items-center justify-end gap-2">
                                        {pinned.find(p => p.url === entry.url) ? (
                                            <button onClick={() => handleUnpin(entry.url)} className="text-sm text-red-400">Unpin</button>
                                        ) : (
                                            <button onClick={() => handlePin(entry)} className="text-sm text-cyan-400">Pin</button>
                                        )}
                                    </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
