'use client';

import { useState, useEffect } from 'react';
import { PerformanceMonitor, PerformanceMetric } from '../utils/performance';

export function PerformanceMonitorView() {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'duration'>('duration');

  useEffect(() => {
    const interval = setInterval(() => {
      if (isOpen) {
        setMetrics(PerformanceMonitor.getMetrics());
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen]);

  const handleClear = () => {
    PerformanceMonitor.clearMetrics();
    setMetrics([]);
  };

  const handleExportReport = () => {
    const report = PerformanceMonitor.getReport();
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-report-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Group metrics by name
  const groupedMetrics = new Map<string, PerformanceMetric[]>();
  metrics.forEach(metric => {
    if (!groupedMetrics.has(metric.name)) {
      groupedMetrics.set(metric.name, []);
    }
    groupedMetrics.get(metric.name)!.push(metric);
  });

  const summaryData = Array.from(groupedMetrics.entries()).map(([name, items]) => {
    const durations = items.map(m => m.duration);
    const avg = durations.reduce((sum, d) => sum + d, 0) / durations.length;
    const min = Math.min(...durations);
    const max = Math.max(...durations);
    return { name, count: items.length, avg, min, max };
  });

  const sortedData = [...summaryData].sort((a, b) => {
    if (sortBy === 'duration') {
      return b.avg - a.avg;
    }
    return a.name.localeCompare(b.name);
  });

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-cyan-500 transition-all"
        title="Performance Monitor"
      >
        <span className="text-xl">⚡</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-gray-900 rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-cyan-500/30">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-cyan-400">⚡ Performance Monitor</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            <div className="flex gap-2 mb-4">
              <button
                onClick={handleClear}
                className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500/50 rounded text-red-400 text-sm"
              >
                Clear Metrics
              </button>
              <button
                onClick={handleExportReport}
                className="px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/50 rounded text-purple-400 text-sm"
              >
                Export Report
              </button>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
              >
                <option value="duration">Sort by Duration</option>
                <option value="name">Sort by Name</option>
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left p-3 text-cyan-400">Operation</th>
                    <th className="text-right p-3 text-cyan-400">Count</th>
                    <th className="text-right p-3 text-cyan-400">Avg (ms)</th>
                    <th className="text-right p-3 text-cyan-400">Min (ms)</th>
                    <th className="text-right p-3 text-cyan-400">Max (ms)</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedData.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center p-8 text-gray-400">
                        No performance metrics collected yet
                      </td>
                    </tr>
                  ) : (
                    sortedData.map((item, idx) => (
                      <tr key={idx} className="border-b border-gray-800 hover:bg-gray-800/40">
                        <td className="p-3 text-white font-mono text-xs">{item.name}</td>
                        <td className="p-3 text-right text-gray-300">{item.count}</td>
                        <td className="p-3 text-right text-white font-bold">
                          {item.avg.toFixed(2)}
                        </td>
                        <td className="p-3 text-right text-green-400">{item.min.toFixed(2)}</td>
                        <td className="p-3 text-right text-red-400">{item.max.toFixed(2)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {metrics.length > 0 && (
              <div className="mt-4 p-4 bg-gray-800/40 rounded">
                <p className="text-sm text-gray-400">
                  Total operations: {metrics.length}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
