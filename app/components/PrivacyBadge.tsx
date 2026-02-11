'use client';

import { useState } from 'react';

export function PrivacyBadge() {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="privacy-badge fixed bottom-6 right-6 z-50">
            {isExpanded ? (
                <div className="bg-gray-900/95 backdrop-blur-lg p-6 rounded-lg border-2 border-green-500/50 shadow-2xl max-w-sm animate-in fade-in slide-in-from-bottom-4">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="text-4xl">🔒</div>
                            <div>
                                <h3 className="text-xl font-bold text-green-400">100% Client-Side</h3>
                                <p className="text-xs text-gray-400">Privacy-First Architecture</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsExpanded(false)}
                            className="text-gray-400 hover:text-white transition-colors"
                        >
                            ✕
                        </button>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-start gap-3 p-3 bg-green-900/20 rounded-lg border border-green-500/30">
                            <div className="text-green-400 text-xl">✓</div>
                            <div className="flex-1">
                                <div className="text-sm font-semibold text-white">Zero Data Sent to Servers</div>
                                <div className="text-xs text-gray-400 mt-1">
                                    All analysis happens in your browser. No URLs or results ever leave your device.
                                </div>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 p-3 bg-green-900/20 rounded-lg border border-green-500/30">
                            <div className="text-green-400 text-xl">✓</div>
                            <div className="flex-1">
                                <div className="text-sm font-semibold text-white">Offline Capable</div>
                                <div className="text-xs text-gray-400 mt-1">
                                    Works without internet after initial load. Perfect for secure environments.
                                </div>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 p-3 bg-green-900/20 rounded-lg border border-green-500/30">
                            <div className="text-green-400 text-xl">✓</div>
                            <div className="flex-1">
                                <div className="text-sm font-semibold text-white">No Tracking</div>
                                <div className="text-xs text-gray-400 mt-1">
                                    Zero analytics, cookies, or telemetry. Your privacy is guaranteed.
                                </div>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 p-3 bg-green-900/20 rounded-lg border border-green-500/30">
                            <div className="text-green-400 text-xl">✓</div>
                            <div className="flex-1">
                                <div className="text-sm font-semibold text-white">Local Storage Only</div>
                                <div className="text-xs text-gray-400 mt-1">
                                    History stored in IndexedDB on your device. You control your data.
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 p-3 bg-blue-900/20 rounded-lg border border-blue-500/30">
                        <div className="text-xs text-gray-300">
                            <strong className="text-blue-400">How it works:</strong> We use WebAssembly, TensorFlow.js, and
                            Transformers.js to run all ML models directly in your browser. This ensures complete privacy
                            while maintaining high accuracy and fast performance.
                        </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            <span>Privacy Protected</span>
                        </div>
                        <div>GDPR Compliant</div>
                    </div>
                </div>
            ) : (
                <button
                    onClick={() => setIsExpanded(true)}
                    className="flex items-center gap-2 px-4 py-3 bg-green-600/20 hover:bg-green-600/30 backdrop-blur-lg border-2 border-green-500/50 rounded-full shadow-lg transition-all hover:scale-105 group"
                >
                    <div className="text-2xl">🔒</div>
                    <div className="text-left">
                        <div className="text-sm font-bold text-green-400 group-hover:text-green-300">
                            100% Private
                        </div>
                        <div className="text-xs text-gray-400">Client-Side Only</div>
                    </div>
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                </button>
            )}
        </div>
    );
}
