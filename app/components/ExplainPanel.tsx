"use client";

import { Attribution } from "@/lib/explain";

interface ExplainPanelProps {
  attributions: Attribution;
  heatmapRanges: { start: number; end: number; weight: number }[];
  url: string;
  className?: string;
}

export function ExplainPanel({ attributions, heatmapRanges, url, className = "" }: ExplainPanelProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      <h3 className="text-xl font-bold text-cyber-blue-primary glow-text">Explainability Analysis</h3>
      
      {/* Token Attributions */}
      <div className="glass rounded-xl p-4 border border-cyber-blue-primary/30">
        <h4 className="font-semibold mb-3 text-cyber-teal-primary">Top Risk Factors</h4>
        <div className="space-y-2">
          {attributions.slice(0, 5).map((attr, i) => (
            <div key={i} className="flex justify-between items-center p-3 bg-cyber-bg-secondary rounded-lg border border-gray-600 hover:border-cyber-blue-primary transition-colors">
              <span className="font-mono text-sm text-gray-300">{attr.token}</span>
              <div className="flex items-center space-x-2">
                <div className="w-16 bg-gray-700 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full bg-gradient-to-r from-cyber-blue-primary to-cyber-purple-primary transition-all duration-500"
                    style={{ width: `${attr.importance * 100}%` }}
                  />
                </div>
                <span className="text-sm font-bold text-cyber-blue-primary w-8">{Math.round(attr.importance * 100)}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* URL Heatmap */}
      <div className="glass rounded-xl p-4 border border-cyber-purple-primary/30">
        <h4 className="font-semibold mb-3 text-cyber-purple-primary">URL Analysis</h4>
        <div className="p-4 bg-cyber-bg-primary rounded-lg border border-gray-600 font-mono text-sm overflow-x-auto">
          {url.split('').map((char, i) => {
            const range = heatmapRanges.find(r => i >= r.start && i < r.end);
            const intensity = range ? Math.min(5, Math.max(1, Math.round(range.weight * 5))) : 0;
            const bgColor = intensity > 0 ? `bg-red-${intensity}00` : '';
            const textColor = intensity > 0 ? 'text-white' : 'text-gray-400';
            return (
              <span key={i} className={`${bgColor} ${textColor} transition-colors duration-200`}>
                {char}
              </span>
            );
          })}
        </div>
      </div>

      {/* Feature Importance Chart */}
      <div className="glass rounded-xl p-4 border border-cyber-teal-primary/30">
        <h4 className="font-semibold mb-3 text-cyber-teal-primary">Feature Importance</h4>
        <div className="space-y-3">
          {attributions.slice(0, 8).map((attr, i) => (
            <div key={i} className="flex items-center space-x-3">
              <div className="w-20 text-xs text-gray-400 truncate font-mono">{attr.token}</div>
              <div className="flex-1 bg-cyber-bg-secondary rounded-full h-3 border border-gray-600 overflow-hidden">
                <div
                  className="h-3 rounded-full bg-gradient-to-r from-cyber-teal-primary to-cyber-blue-primary transition-all duration-700 ease-out relative"
                  style={{ width: `${attr.importance * 100}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 animate-pulse" />
                </div>
              </div>
              <div className="w-10 text-xs text-cyber-teal-primary font-bold">{Math.round(attr.importance * 100)}%</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}