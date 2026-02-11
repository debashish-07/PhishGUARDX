'use client';

import { useState, useEffect } from 'react';
import { TrustLedger, LedgerEntry } from '../utils/trustLedger';

export function URLHistory() {
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [selectedUrl, setSelectedUrl] = useState<string>('');
  const [history, setHistory] = useState<LedgerEntry[]>([]);

  useEffect(() => {
    loadEntries();
  }, []);

  useEffect(() => {
    if (selectedUrl) {
      loadHistory(selectedUrl);
    }
  }, [selectedUrl]);

  const loadEntries = async () => {
    const allEntries = await TrustLedger.getAllEntries();
    setEntries(allEntries);
  };

  const loadHistory = async (url: string) => {
    const allEntries = await TrustLedger.getAllEntries();
    const urlHistory = allEntries
      .filter(e => e.url === url)
      .sort((a, b) => b.timestamp - a.timestamp);
    setHistory(urlHistory);
  };

  // Get unique URLs
  const uniqueUrls = Array.from(new Set(entries.map(e => e.url)));

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-cyan-400">📜 URL History Timeline</h3>

      <div>
        <label className="block text-sm text-gray-400 mb-2">Select URL</label>
        <select
          value={selectedUrl}
          onChange={(e) => setSelectedUrl(e.target.value)}
          className="w-full px-4 py-2 bg-gray-800 border border-cyan-500/30 rounded-lg text-white"
        >
          <option value="">Choose a URL...</option>
          {uniqueUrls.map((url, idx) => (
            <option key={idx} value={url}>
              {url}
            </option>
          ))}
        </select>
      </div>

      {history.length > 0 && (
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-cyan-500 to-purple-600" />

          <div className="space-y-4 pl-12">
            {history.map((entry, idx) => (
              <div key={entry.id} className="relative">
                {/* Timeline Dot */}
                <div className={`absolute -left-10 mt-2 w-4 h-4 rounded-full ${
                  entry.verdict === 'phishing' ? 'bg-red-500' :
                  entry.verdict === 'suspicious' ? 'bg-yellow-500' :
                  'bg-green-500'
                } border-4 border-gray-900`} />

                <div className={`p-4 rounded-lg border ${
                  entry.verdict === 'phishing' ? 'bg-red-500/10 border-red-500/50' :
                  entry.verdict === 'suspicious' ? 'bg-yellow-500/10 border-yellow-500/50' :
                  'bg-green-500/10 border-green-500/50'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-white uppercase text-sm">
                      {entry.verdict}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(entry.timestamp).toLocaleString()}
                    </span>
                  </div>

                  <div className="text-2xl font-bold text-white mb-2">
                    Risk: {entry.riskScore.toFixed(1)}%
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Heuristic:</span>
                      <span className="text-white">{entry.moduleScores.heuristic.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Quantum:</span>
                      <span className="text-white">{entry.moduleScores.quantum.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Visual:</span>
                      <span className="text-white">{entry.moduleScores.visual.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Transformer:</span>
                      <span className="text-white">{entry.moduleScores.transformer.toFixed(1)}%</span>
                    </div>
                  </div>

                  {idx === 0 && (
                    <div className="mt-2 text-xs text-cyan-400 font-semibold">
                      ← Latest Scan
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 text-center text-sm text-gray-400">
            Total scans: {history.length}
          </div>
        </div>
      )}

      {selectedUrl && history.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          No history found for this URL
        </div>
      )}
    </div>
  );
}
