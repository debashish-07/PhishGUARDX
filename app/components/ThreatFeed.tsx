'use client';

import { useState, useEffect } from 'react';
import { ThreatFeedManager, ThreatFeedItem } from '../utils/threatFeed';

export function ThreatFeed() {
  const [feeds, setFeeds] = useState<ThreatFeedItem[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    setFeeds(ThreatFeedManager.getFeeds(10));
    
    const unsubscribe = ThreatFeedManager.subscribe((item) => {
      setFeeds(prev => [item, ...prev].slice(0, 10));
    });

    return unsubscribe;
  }, []);

  return (
    <div className="glass rounded-lg border border-red-500/30 overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-red-500/5 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-red-400 animate-pulse">🔴</span>
          <span className="font-bold text-red-400">Live Threat Feed</span>
        </div>
        <span className="text-gray-400">{isExpanded ? '−' : '+'}</span>
      </button>

      {isExpanded && (
        <div className="p-4 border-t border-red-500/30 max-h-96 overflow-y-auto">
          {feeds.length === 0 ? (
            <p className="text-center text-gray-400 py-4">No recent threats</p>
          ) : (
            <div className="space-y-2">
              {feeds.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-red-500/10 rounded border border-red-500/30 text-sm"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-red-400 font-semibold">{item.source}</span>
                    <span className="text-xs text-gray-400">
                      {new Date(item.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-xs font-mono text-gray-300 truncate mb-1">{item.url}</p>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-gray-400">{item.threatType}</span>
                    <span className="text-gray-500">•</span>
                    <span className="text-yellow-400">
                      {(item.confidence * 100).toFixed(0)}% confidence
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
