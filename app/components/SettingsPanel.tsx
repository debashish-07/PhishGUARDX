'use client';

import React, { useEffect, useState } from 'react';
import { enableOfflineMode, isOfflineMode } from '@/app/utils/privacy';
import { getStorage } from '@/src/lib/storage';

interface SettingsPanelProps {
  open: boolean;
  onClose: () => void;
  onToast?: (msg: string, type?: 'info' | 'success' | 'error') => void;
}

export function SettingsPanel({ open, onClose, onToast }: SettingsPanelProps) {
  const [offline, setOffline] = useState(false);
  const [disableQuantum, setDisableQuantum] = useState(false);
  const [disableVisual, setDisableVisual] = useState(false);
  const [disableAudio, setDisableAudio] = useState(false);
  const storage = getStorage();

  useEffect(() => {
    setOffline(isOfflineMode());
    try {
      setDisableQuantum(localStorage.getItem('pd_disable_quantum') === '1');
      setDisableVisual(localStorage.getItem('pd_disable_visual') === '1');
      setDisableAudio(localStorage.getItem('pd_disable_audio') === '1');
    } catch { }
  }, [open]);

  const toggleOffline = () => {
    const next = !offline;
    enableOfflineMode(next);
    setOffline(next);
    onToast?.(next ? 'Offline mode enabled (no network calls)' : 'Offline mode disabled', 'info');
  };

  const clearHistory = async () => {
    try {
      await storage.clearHistory();
      onToast?.('Analysis history cleared', 'success');
    } catch (e) {
      onToast?.('Failed to clear history', 'error');
    }
  };

  const exportHistory = async () => {
    try {
      const allHistory = await storage.exportHistory();
      const rows = allHistory.map(r => ({
        timestamp: new Date(r.timestamp).toISOString(),
        url: r.url,
        score: r.score,
        verdict: r.verdict,
      }));
      const json = JSON.stringify(rows, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analysis-history-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      onToast?.('History exported', 'success');
    } catch (e) {
      onToast?.('Failed to export history', 'error');
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-lg mx-4 glass rounded-xl border border-cyan-500/40 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-cyan-300">Settings</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-200">✕</button>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-white font-semibold">Offline Mode</div>
              <div className="text-xs text-gray-400">Disable remote model downloads; use heuristics + workers only</div>
            </div>
            <button
              onClick={toggleOffline}
              className={`px-3 py-1 rounded text-xs border transition-colors ${offline ? 'bg-yellow-600/20 border-yellow-500/50 text-yellow-300 hover:bg-yellow-600/30' : 'bg-cyan-600/20 border-cyan-500/50 text-cyan-300 hover:bg-cyan-600/30'}`}
            >
              {offline ? 'Disable' : 'Enable'}
            </button>
          </div>

          {/* Worker Toggles */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-white font-semibold">Disable Modules</div>
              <div className="text-xs text-gray-400">Toggle individual workers for testing stability</div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => { const v = !disableQuantum; setDisableQuantum(v); localStorage.setItem('pd_disable_quantum', v ? '1' : '0'); onToast?.(`Quantum ${v ? 'disabled' : 'enabled'}`, 'info'); }}
                className={`px-3 py-1 rounded text-xs border ${disableQuantum ? 'bg-gray-700/40 border-gray-500 text-gray-300' : 'bg-purple-700/30 border-purple-500/50 text-purple-300'}`}
              >Quantum</button>
              <button
                onClick={() => { const v = !disableVisual; setDisableVisual(v); localStorage.setItem('pd_disable_visual', v ? '1' : '0'); onToast?.(`Visual ${v ? 'disabled' : 'enabled'}`, 'info'); }}
                className={`px-3 py-1 rounded text-xs border ${disableVisual ? 'bg-gray-700/40 border-gray-500 text-gray-300' : 'bg-pink-700/30 border-pink-500/50 text-pink-300'}`}
              >Visual</button>
              <button
                onClick={() => { const v = !disableAudio; setDisableAudio(v); localStorage.setItem('pd_disable_audio', v ? '1' : '0'); onToast?.(`Audio ${v ? 'disabled' : 'enabled'}`, 'info'); }}
                className={`px-3 py-1 rounded text-xs border ${disableAudio ? 'bg-gray-700/40 border-gray-500 text-gray-300' : 'bg-cyan-700/30 border-cyan-500/50 text-cyan-300'}`}
              >Audio</button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-white font-semibold">Analysis History</div>
              <div className="text-xs text-gray-400">Stored locally in IndexedDB; export or clear</div>
            </div>
            <div className="flex gap-2">
              <button onClick={exportHistory} className="px-3 py-1 rounded text-xs border bg-cyan-600/20 border-cyan-500/50 text-cyan-300 hover:bg-cyan-600/30">Export</button>
              <button onClick={clearHistory} className="px-3 py-1 rounded text-xs border bg-red-600/20 border-red-500/50 text-red-300 hover:bg-red-600/30">Clear</button>
            </div>
          </div>

          <div className="text-xs text-gray-500">
            Privacy-first: all computation is in-browser. No telemetry. Trust Ledger and history remain on-device.
          </div>
        </div>
      </div>
    </div>
  );
}
