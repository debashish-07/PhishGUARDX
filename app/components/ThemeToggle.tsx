'use client';

import { useState, useEffect } from 'react';
import { getTheme, setTheme, Theme } from '../utils/theme';

export function ThemeToggle() {
  const [theme, setThemeState] = useState<Theme>('dark');

  useEffect(() => {
    setThemeState(getTheme());
  }, []);

  const handleChange = (newTheme: Theme) => {
    setTheme(newTheme);
    setThemeState(newTheme);
  };

  return (
    <div className="flex items-center gap-2 p-2 bg-gray-800/50 rounded-lg border border-gray-700">
      <span className="text-xs text-gray-400">Theme:</span>
      <button
        onClick={() => handleChange('dark')}
        className={`px-3 py-1 text-xs rounded transition-all ${
          theme === 'dark'
            ? 'bg-cyan-600 text-white'
            : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
        }`}
      >
        🌙 Dark
      </button>
      <button
        onClick={() => handleChange('light')}
        className={`px-3 py-1 text-xs rounded transition-all ${
          theme === 'light'
            ? 'bg-cyan-600 text-white'
            : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
        }`}
      >
        ☀️ Light
      </button>
      <button
        onClick={() => handleChange('auto')}
        className={`px-3 py-1 text-xs rounded transition-all ${
          theme === 'auto'
            ? 'bg-cyan-600 text-white'
            : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
        }`}
      >
        🔄 Auto
      </button>
    </div>
  );
}
