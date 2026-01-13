'use client';

import { useState, useEffect } from 'react';
import { ComparisonManager, ComparisonItem } from '../utils/comparison';

export function ComparisonView() {
  const [items, setItems] = useState<ComparisonItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    loadItems();

    const handler = () => loadItems();
    window.addEventListener('comparison:updated', handler);
    return () => window.removeEventListener('comparison:updated', handler);
  }, []);

  const loadItems = () => {
    setItems(ComparisonManager.getItems());
  };

  const handleRemove = (entryId: string) => {
    ComparisonManager.removeItem(entryId);
  };

  const handleClear = () => {
    ComparisonManager.clear();
    setIsOpen(false);
  };

  if (items.length === 0) return null;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow-lg border border-purple-500 flex items-center gap-2 z-40"
      >
        <span>🔄</span>
        <span>Compare ({items.length})</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-auto bg-black/80 p-4">
          <div className="max-w-7xl mx-auto">
            <div className="bg-gray-900 rounded-xl p-6 border border-cyan-500/30">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-cyan-400">🔄 Comparison View</h2>
                <div className="flex gap-2">
                  <button
                    onClick={handleClear}
                    className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500/50 rounded text-red-400 text-sm"
                  >
                    Clear All
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-gray-400 hover:text-white text-2xl"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {items.map(({ entry }) => (
                  <div
                    key={entry.id}
                    className={`p-4 rounded-lg border ${
                      entry.verdict === 'phishing' ? 'bg-red-500/10 border-red-500/50' :
                      entry.verdict === 'suspicious' ? 'bg-yellow-500/10 border-yellow-500/50' :
                      'bg-green-500/10 border-green-500/50'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-xs font-bold uppercase text-white">
                        {entry.verdict}
                      </span>
                      <button
                        onClick={() => handleRemove(entry.id)}
                        className="text-gray-400 hover:text-red-400"
                      >
                        ×
                      </button>
                    </div>

                    <div className="text-3xl font-bold text-white mb-2">
                      {entry.riskScore.toFixed(1)}%
                    </div>

                    <div className="text-xs text-gray-400 mb-3 truncate">
                      {entry.url}
                    </div>

                    <div className="space-y-2 text-xs">
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
                      <div className="flex justify-between">
                        <span className="text-gray-400">Ensemble:</span>
                        <span className="text-white">{entry.moduleScores.ensemble.toFixed(1)}%</span>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-700 text-xs text-gray-500">
                      {new Date(entry.timestamp).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
