'use client';

import { useState, useEffect } from 'react';
import { TrustLedger, LedgerEntry } from '../utils/trustLedger';

interface AnalyticsData {
  totalScans: number;
  todayScans: number;
  weekScans: number;
  avgRiskScore: number;
  verdictDistribution: { safe: number; suspicious: number; phishing: number };
  topDomains: Array<{ domain: string; count: number }>;
  riskTrend: Array<{ date: string; avgRisk: number }>;
}

export function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const entries = await TrustLedger.getAllEntries();
      
      const now = Date.now();
      const dayAgo = now - 24 * 60 * 60 * 1000;
      const weekAgo = now - 7 * 24 * 60 * 60 * 1000;

      const todayScans = entries.filter(e => e.timestamp > dayAgo).length;
      const weekScans = entries.filter(e => e.timestamp > weekAgo).length;

      const verdictDistribution = {
        safe: entries.filter(e => e.verdict === 'safe').length,
        suspicious: entries.filter(e => e.verdict === 'suspicious').length,
        phishing: entries.filter(e => e.verdict === 'phishing').length,
      };

      const avgRiskScore = entries.length > 0
        ? entries.reduce((sum, e) => sum + e.riskScore, 0) / entries.length
        : 0;

      // Extract domains
      const domainMap = new Map<string, number>();
      entries.forEach(e => {
        try {
          const domain = new URL(e.url).hostname;
          domainMap.set(domain, (domainMap.get(domain) || 0) + 1);
        } catch {}
      });

      const topDomains = Array.from(domainMap.entries())
        .map(([domain, count]) => ({ domain, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Calculate 7-day risk trend
      const riskTrend: Array<{ date: string; avgRisk: number }> = [];
      for (let i = 6; i >= 0; i--) {
        const dayStart = now - i * 24 * 60 * 60 * 1000;
        const dayEnd = dayStart + 24 * 60 * 60 * 1000;
        const dayEntries = entries.filter(e => e.timestamp >= dayStart && e.timestamp < dayEnd);
        const avgRisk = dayEntries.length > 0
          ? dayEntries.reduce((sum, e) => sum + e.riskScore, 0) / dayEntries.length
          : 0;
        
        riskTrend.push({
          date: new Date(dayStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          avgRisk,
        });
      }

      setAnalytics({
        totalScans: entries.length,
        todayScans,
        weekScans,
        avgRiskScore,
        verdictDistribution,
        topDomains,
        riskTrend,
      });
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-400">Loading analytics...</div>;
  }

  if (!analytics) {
    return <div className="text-center py-8 text-gray-400">No data available</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-cyan-400">📊 Analytics Dashboard</h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 glass rounded-lg border border-cyan-500/30">
          <div className="text-3xl font-bold text-white">{analytics.totalScans}</div>
          <div className="text-xs text-gray-400">Total Scans</div>
        </div>
        <div className="p-4 glass rounded-lg border border-purple-500/30">
          <div className="text-3xl font-bold text-white">{analytics.todayScans}</div>
          <div className="text-xs text-gray-400">Today</div>
        </div>
        <div className="p-4 glass rounded-lg border border-pink-500/30">
          <div className="text-3xl font-bold text-white">{analytics.weekScans}</div>
          <div className="text-xs text-gray-400">This Week</div>
        </div>
        <div className="p-4 glass rounded-lg border border-yellow-500/30">
          <div className="text-3xl font-bold text-white">{analytics.avgRiskScore.toFixed(1)}%</div>
          <div className="text-xs text-gray-400">Avg Risk</div>
        </div>
      </div>

      {/* Verdict Distribution */}
      <div className="p-6 glass rounded-lg border border-cyan-500/30">
        <h3 className="text-lg font-bold text-cyan-400 mb-4">Verdict Distribution</h3>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-green-400">Safe</span>
              <span className="text-white">{analytics.verdictDistribution.safe}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full"
                style={{ width: `${(analytics.verdictDistribution.safe / analytics.totalScans) * 100}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-yellow-400">Suspicious</span>
              <span className="text-white">{analytics.verdictDistribution.suspicious}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-yellow-500 h-2 rounded-full"
                style={{ width: `${(analytics.verdictDistribution.suspicious / analytics.totalScans) * 100}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-red-400">Phishing</span>
              <span className="text-white">{analytics.verdictDistribution.phishing}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-red-500 h-2 rounded-full"
                style={{ width: `${(analytics.verdictDistribution.phishing / analytics.totalScans) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Risk Trend */}
      <div className="p-6 glass rounded-lg border border-cyan-500/30">
        <h3 className="text-lg font-bold text-cyan-400 mb-4">7-Day Risk Trend</h3>
        <div className="flex items-end justify-between h-48 gap-2">
          {analytics.riskTrend.map((day, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center">
              <div className="w-full bg-gradient-to-t from-cyan-500 to-purple-600 rounded-t"
                style={{ height: `${(day.avgRisk / 100) * 100}%`, minHeight: '4px' }}
              />
              <span className="text-xs text-gray-400 mt-2">{day.date}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top Domains */}
      <div className="p-6 glass rounded-lg border border-cyan-500/30">
        <h3 className="text-lg font-bold text-cyan-400 mb-4">Top Scanned Domains</h3>
        <div className="space-y-2">
          {analytics.topDomains.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between p-2 bg-gray-800/40 rounded">
              <span className="text-sm text-white truncate flex-1">{item.domain}</span>
              <span className="text-sm text-cyan-400 ml-2">{item.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
