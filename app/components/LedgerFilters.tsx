'use client';

import { useState } from 'react';

export interface FilterOptions {
  searchTerm: string;
  verdictFilter: 'all' | 'safe' | 'suspicious' | 'phishing';
  riskMin: number;
  riskMax: number;
}

interface LedgerFiltersProps {
  onFilterChange: (filters: FilterOptions) => void;
}

export function LedgerFilters({ onFilterChange }: LedgerFiltersProps) {
  const [filters, setFilters] = useState<FilterOptions>({
    searchTerm: '',
    verdictFilter: 'all',
    riskMin: 0,
    riskMax: 100,
  });

  const handleChange = (updates: Partial<FilterOptions>) => {
    const newFilters = { ...filters, ...updates };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleReset = () => {
    const defaultFilters: FilterOptions = {
      searchTerm: '',
      verdictFilter: 'all',
      riskMin: 0,
      riskMax: 100,
    };
    setFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };

  return (
    <div className="p-4 bg-gray-800/40 rounded-lg border border-gray-700 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-cyan-300">🔍 Filters</h4>
        <button
          onClick={handleReset}
          className="text-xs text-gray-400 hover:text-white"
        >
          Reset
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search */}
        <div>
          <label className="text-xs text-gray-400 block mb-1">Search URL</label>
          <input
            type="text"
            value={filters.searchTerm}
            onChange={(e) => handleChange({ searchTerm: e.target.value })}
            placeholder="Filter by URL..."
            className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-sm text-white"
          />
        </div>

        {/* Verdict Filter */}
        <div>
          <label className="text-xs text-gray-400 block mb-1">Verdict</label>
          <select
            value={filters.verdictFilter}
            onChange={(e) => handleChange({ verdictFilter: e.target.value as any })}
            className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-sm text-white"
          >
            <option value="all">All Verdicts</option>
            <option value="safe">✓ Safe</option>
            <option value="suspicious">⚠ Suspicious</option>
            <option value="phishing">⚡ Phishing</option>
          </select>
        </div>

        {/* Risk Range */}
        <div>
          <label className="text-xs text-gray-400 block mb-1">Min Risk %</label>
          <input
            type="number"
            min="0"
            max="100"
            value={filters.riskMin}
            onChange={(e) => handleChange({ riskMin: parseInt(e.target.value) || 0 })}
            className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-sm text-white"
          />
        </div>

        <div>
          <label className="text-xs text-gray-400 block mb-1">Max Risk %</label>
          <input
            type="number"
            min="0"
            max="100"
            value={filters.riskMax}
            onChange={(e) => handleChange({ riskMax: parseInt(e.target.value) || 100 })}
            className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-sm text-white"
          />
        </div>
      </div>
    </div>
  );
}
