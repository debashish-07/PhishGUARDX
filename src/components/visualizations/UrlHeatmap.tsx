'use client';

import { useMemo } from 'react';

interface HeatmapProps {
  url: string;
  heatmapData?: number[];
  className?: string;
}

export function UrlHeatmap({ url, heatmapData = [], className = '' }: HeatmapProps) {
  const normalizedData = useMemo(() => {
    if (!heatmapData || heatmapData.length === 0) {
      return Array(url.length).fill(0.5);
    }
    
    // Normalize heatmap data to 0-1 range
    const max = Math.max(...heatmapData, 1);
    return heatmapData.map(v => Math.min(v / max, 1));
  }, [heatmapData, url]);

  const getColorForRisk = (riskScore: number): string => {
    // 0 = safe (green), 0.5 = medium (yellow), 1 = risky (red)
    if (riskScore < 0.33) {
      return 'bg-green-600';
    } else if (riskScore < 0.67) {
      return 'bg-yellow-600';
    } else {
      return 'bg-red-600';
    }
  };

  const getBgColorForRisk = (riskScore: number): string => {
    if (riskScore < 0.33) {
      return 'bg-green-900/30';
    } else if (riskScore < 0.67) {
      return 'bg-yellow-900/30';
    } else {
      return 'bg-red-900/30';
    }
  };

  return (
    <div className={`${className}`}>
      <div className="bg-black border border-cyan-500/30 rounded-lg p-4">
        <h3 className="text-cyan-400 font-mono text-sm mb-3">Character Risk Attribution</h3>
        
        <div className="space-y-2">
          {/* URL Display with character-level heatmap */}
          <div className="bg-gray-900/50 border border-gray-700 rounded p-3 font-mono text-xs overflow-auto">
            <div className="flex flex-wrap gap-0.5 break-all">
              {url.split('').map((char, index) => {
                const riskScore = normalizedData[index] || 0.5;
                const bgColor = getBgColorForRisk(riskScore);
                const borderColor = getColorForRisk(riskScore);
                
                return (
                  <span
                    key={index}
                    className={`px-1 py-0.5 rounded border border-gray-600 ${bgColor} text-gray-100 group relative cursor-help`}
                    title={`Char: ${char} | Risk: ${(riskScore * 100).toFixed(0)}%`}
                  >
                    {char === ' ' ? '␣' : char}
                    
                    {/* Tooltip */}
                    <div className="invisible group-hover:visible absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 border border-gray-600 rounded text-xs whitespace-nowrap z-10">
                      {(riskScore * 100).toFixed(0)}%
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                    </div>
                  </span>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="flex justify-between text-xs mt-3 px-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-600 rounded"></div>
              <span className="text-gray-400">Safe (&lt;33%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-600 rounded"></div>
              <span className="text-gray-400">Medium (33-67%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-600 rounded"></div>
              <span className="text-gray-400">Risky (&gt;67%)</span>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
            <div className="bg-green-900/20 border border-green-700/30 rounded p-2 text-center">
              <div className="text-green-400 font-bold">{(normalizedData.filter(v => v < 0.33).length / url.length * 100).toFixed(0)}%</div>
              <div className="text-gray-400">Safe &lt;33%</div>
            </div>
            <div className="bg-yellow-900/20 border border-yellow-700/30 rounded p-2 text-center">
              <div className="text-yellow-400 font-bold">{(normalizedData.filter(v => v >= 0.33 && v < 0.67).length / url.length * 100).toFixed(0)}%</div>
              <div className="text-gray-400">Medium 33-67%</div>
            </div>
            <div className="bg-red-900/20 border border-red-700/30 rounded p-2 text-center">
              <div className="text-red-400 font-bold">{(normalizedData.filter(v => v >= 0.67).length / url.length * 100).toFixed(0)}%</div>
              <div className="text-gray-400">Risky &gt;67%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
