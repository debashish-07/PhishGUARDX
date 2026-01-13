'use client';

import { useState, useEffect } from 'react';
import { SettingsManager, AppSettings } from '../utils/settings';

export function AdvancedSettings() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = SettingsManager.subscribe((newSettings) => {
      setSettings(newSettings);
    });

    return unsubscribe;
  }, []);

  const handleUpdate = (updates: Partial<AppSettings>) => {
    SettingsManager.updateSettings(updates);
  };

  const handleReset = () => {
    if (confirm('Reset all settings to defaults?')) {
      SettingsManager.resetSettings();
    }
  };

  if (!settings) return null;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-cyan-500 transition-all"
        title="Settings"
      >
        <span className="text-xl">⚙️</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-gray-900 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-cyan-500/30">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-cyan-400">⚙️ Settings</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              {/* General Settings */}
              <section>
                <h3 className="text-lg font-bold text-purple-400 mb-3">General</h3>
                <div className="space-y-3">
                  <label className="flex items-center justify-between p-3 bg-gray-800/40 rounded">
                    <span className="text-gray-300">Enable Notifications</span>
                    <input
                      type="checkbox"
                      checked={settings.notifications}
                      onChange={(e) => handleUpdate({ notifications: e.target.checked })}
                      className="w-5 h-5"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 bg-gray-800/40 rounded">
                    <span className="text-gray-300">Auto Refresh</span>
                    <input
                      type="checkbox"
                      checked={settings.autoRefresh}
                      onChange={(e) => handleUpdate({ autoRefresh: e.target.checked })}
                      className="w-5 h-5"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 bg-gray-800/40 rounded">
                    <span className="text-gray-300">Privacy Mode</span>
                    <input
                      type="checkbox"
                      checked={settings.privacyMode}
                      onChange={(e) => handleUpdate({ privacyMode: e.target.checked })}
                      className="w-5 h-5"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 bg-gray-800/40 rounded">
                    <span className="text-gray-300">Sound Effects</span>
                    <input
                      type="checkbox"
                      checked={settings.soundEffects}
                      onChange={(e) => handleUpdate({ soundEffects: e.target.checked })}
                      className="w-5 h-5"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 bg-gray-800/40 rounded">
                    <span className="text-gray-300">Compact View</span>
                    <input
                      type="checkbox"
                      checked={settings.compactView}
                      onChange={(e) => handleUpdate({ compactView: e.target.checked })}
                      className="w-5 h-5"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 bg-gray-800/40 rounded">
                    <span className="text-gray-300">Show Threat Feed</span>
                    <input
                      type="checkbox"
                      checked={settings.showThreatFeed}
                      onChange={(e) => handleUpdate({ showThreatFeed: e.target.checked })}
                      className="w-5 h-5"
                    />
                  </label>
                </div>
              </section>

              {/* Batch Processing */}
              <section>
                <h3 className="text-lg font-bold text-purple-400 mb-3">Batch Processing</h3>
                <label className="block p-3 bg-gray-800/40 rounded">
                  <span className="text-gray-300 block mb-2">Delay Between Scans (ms)</span>
                  <input
                    type="number"
                    value={settings.batchDelay}
                    onChange={(e) => handleUpdate({ batchDelay: parseInt(e.target.value) || 1000 })}
                    min="100"
                    max="10000"
                    step="100"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                  />
                </label>
              </section>

              {/* Export Settings */}
              <section>
                <h3 className="text-lg font-bold text-purple-400 mb-3">Export</h3>
                <label className="block p-3 bg-gray-800/40 rounded">
                  <span className="text-gray-300 block mb-2">Default Format</span>
                  <select
                    value={settings.exportFormat}
                    onChange={(e) => handleUpdate({ exportFormat: e.target.value as any })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                  >
                    <option value="json">JSON</option>
                    <option value="csv">CSV</option>
                    <option value="markdown">Markdown</option>
                  </select>
                </label>
              </section>

              {/* Risk Thresholds */}
              <section>
                <h3 className="text-lg font-bold text-purple-400 mb-3">Risk Thresholds</h3>
                <div className="space-y-3">
                  <label className="block p-3 bg-gray-800/40 rounded">
                    <span className="text-green-400 block mb-2">Safe (0-{settings.riskThresholds.safe}%)</span>
                    <input
                      type="range"
                      value={settings.riskThresholds.safe}
                      onChange={(e) => handleUpdate({
                        riskThresholds: { ...settings.riskThresholds, safe: parseInt(e.target.value) }
                      })}
                      min="0"
                      max="100"
                      className="w-full"
                    />
                  </label>

                  <label className="block p-3 bg-gray-800/40 rounded">
                    <span className="text-yellow-400 block mb-2">Suspicious ({settings.riskThresholds.safe}-{settings.riskThresholds.suspicious}%)</span>
                    <input
                      type="range"
                      value={settings.riskThresholds.suspicious}
                      onChange={(e) => handleUpdate({
                        riskThresholds: { ...settings.riskThresholds, suspicious: parseInt(e.target.value) }
                      })}
                      min="0"
                      max="100"
                      className="w-full"
                    />
                  </label>

                  <div className="p-3 bg-gray-800/40 rounded">
                    <span className="text-red-400">Phishing ({settings.riskThresholds.suspicious}%+)</span>
                  </div>
                </div>
              </section>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={handleReset}
                  className="flex-1 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500/50 rounded text-red-400"
                >
                  Reset to Defaults
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="flex-1 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded text-white"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
