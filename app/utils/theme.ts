/**
 * Theme Management Utility
 * Supports: dark, light, auto (follows system preference)
 */

export type Theme = 'dark' | 'light' | 'auto';

const THEME_KEY = 'pd_theme';

export function getTheme(): Theme {
  if (typeof window === 'undefined') return 'dark';
  try {
    const stored = localStorage.getItem(THEME_KEY) as Theme;
    return stored || 'dark';
  } catch {
    return 'dark';
  }
}

export function setTheme(theme: Theme): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(THEME_KEY, theme);
    applyTheme(theme);
  } catch (e) {
    console.warn('Failed to save theme', e);
  }
}

export function applyTheme(theme: Theme): void {
  if (typeof window === 'undefined') return;
  
  const root = document.documentElement;
  
  if (theme === 'auto') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    theme = prefersDark ? 'dark' : 'light';
  }
  
  if (theme === 'dark') {
    root.classList.remove('light-theme');
    root.classList.add('dark-theme');
  } else {
    root.classList.remove('dark-theme');
    root.classList.add('light-theme');
  }
}

// Initialize theme on load
if (typeof window !== 'undefined') {
  applyTheme(getTheme());
  
  // Listen for system theme changes when in auto mode
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (getTheme() === 'auto') {
      applyTheme('auto');
    }
  });
}
