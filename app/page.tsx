"use client";

import { useEffect, useState } from "react";
import { useDetection } from "@/src/hooks/useDetection";
import { Dashboard } from "@/src/components/Dashboard";
import { CyberBackground } from "@/app/components/CyberBackground";
import { CyberInput } from "@/app/components/CyberInput";
import { CyberButton } from "@/app/components/CyberButton";
import { DNA3D } from "@/app/components/DNA3D";
import { ToastContainer, ToastType } from "@/app/components/Toast";
import { PrivacyBadge } from "@/app/components/PrivacyBadge";
import { enableOfflineMode, isOfflineMode } from "@/app/utils/privacy";
import { SettingsPanel } from "./components/SettingsPanel";

export default function Page() {
  const [url, setUrl] = useState("");
  const { scanUrl, isScanning, result, error } = useDetection();
  const [toasts, setToasts] = useState<Array<{ id: string; message: string; type: ToastType }>>([]);
  const [offline, setOffline] = useState<boolean>(false);
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false);

  const addToast = (message: string, type: ToastType) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const handleAnalyze = async () => {
    if (!url) return;
    await scanUrl(url);
    if (error) {
      addToast(error, "error");
    } else {
      addToast("Analysis complete", "success");
    }
  };

  useEffect(() => {
    const current = isOfflineMode();
    if (!current) {
      try {
        const hasFlag = typeof window !== 'undefined' && localStorage.getItem('pd_offline_mode') !== null;
        if (!hasFlag) {
          enableOfflineMode(true);
          setOffline(true);
          addToast('Offline mode enabled for faster tests', 'info');
          return;
        }
      } catch { }
    }
    setOffline(current);
  }, []);

  const toggleOffline = () => {
    const next = !offline;
    enableOfflineMode(next);
    setOffline(next);
    addToast(next ? "Offline mode enabled (no network calls)" : "Offline mode disabled", "info");
  };

  return (
    <main className="max-w-7xl mx-auto p-6 animate-fade-in relative z-10 min-h-screen text-white">
      <CyberBackground />
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <div className="text-center mb-12 pt-10">
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent glow-text">
          Quantum Phishing Detector
        </h1>
        <p className="text-gray-400 text-xl">
          Privacy-First • Quantum-Inspired • Multi-Modal
        </p>
      </div>

      <div className="max-w-3xl mx-auto mb-12">
        <div className="glass rounded-xl p-8 border border-cyan-500/30 shadow-lg shadow-cyan-500/10">
          <div className="flex gap-4">
            <CyberInput
              value={url}
              onChange={setUrl}
              placeholder="Enter URL to analyze (e.g., http://example.com)"
              className="flex-1 text-lg"
            />
            <CyberButton
              onClick={handleAnalyze}
              disabled={isScanning}
              className="min-w-[120px]"
            >
              {isScanning ? 'Scanning...' : 'Analyze'}
            </CyberButton>
          </div>
          <div className="flex items-center justify-between mt-4">
            <div className="text-xs text-gray-400">
              {offline ? 'Offline Mode: Models disabled, heuristics + workers only' : 'Online Mode: Models available when permitted'}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setSettingsOpen(true)}
                className={`px-3 py-1 rounded text-xs border bg-indigo-600/20 border-indigo-500/50 text-indigo-300 hover:bg-indigo-600/30`}
              >
                Settings
              </button>
              <button
                onClick={toggleOffline}
                className={`px-3 py-1 rounded text-xs border transition-colors ${offline ? 'bg-yellow-600/20 border-yellow-500/50 text-yellow-300 hover:bg-yellow-600/30' : 'bg-cyan-600/20 border-cyan-500/50 text-cyan-300 hover:bg-cyan-600/30'}`}
              >
                {offline ? 'Disable Offline Mode' : 'Enable Offline Mode'}
              </button>
            </div>
          </div>
        </div>

        {url && (
          <div className="mt-8 flex justify-center">
            <div className="w-full max-w-md">
              <DNA3D input={url} width={400} height={400} />
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="max-w-3xl mx-auto mb-8 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-200 text-center">
          {error}
        </div>
      )}

      {result && (
        <div className="animate-slide-up">
          <Dashboard result={result} url={url} />
        </div>
      )}

      <div className="mt-20 text-center text-gray-500 text-sm">
        <p>Powered by WebWorkers & ONNX Runtime</p>
      </div>

      {/* Privacy Badge - Always visible */}
      <PrivacyBadge />

      <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} onToast={(msg, type) => addToast(msg, type ?? 'info')} />
    </main>
  );
}
