'use client';

import { useState, useEffect } from 'react';
import { AccessibilityManager } from '../utils/accessibility';

export function AccessibilityMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState(AccessibilityManager.getSettings());

  useEffect(() => {
    setSettings(AccessibilityManager.getSettings());
  }, []);

  const handleHighContrastToggle = () => {
    const newValue = !settings.highContrast;
    AccessibilityManager.setHighContrast(newValue);
    setSettings(AccessibilityManager.getSettings());
  };

  const handleFontSizeChange = (size: 'normal' | 'large' | 'x-large') => {
    AccessibilityManager.setFontSize(size);
    setSettings(AccessibilityManager.getSettings());
  };

  const handleScreenReaderToggle = () => {
    const newValue = !settings.screenReaderMode;
    AccessibilityManager.setScreenReaderMode(newValue);
    setSettings(AccessibilityManager.getSettings());
    AccessibilityManager.announceToScreenReader(
      newValue ? 'Screen reader mode enabled' : 'Screen reader mode disabled'
    );
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-cyan-500 transition-all"
        title="Accessibility"
        aria-label="Open accessibility menu"
      >
        <span className="text-xl">♿</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-gray-900 rounded-xl p-6 max-w-md w-full border border-cyan-500/30">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-cyan-400">♿ Accessibility</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white text-2xl"
                aria-label="Close accessibility menu"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              {/* High Contrast */}
              <div>
                <label className="flex items-center justify-between p-3 bg-gray-800/40 rounded cursor-pointer">
                  <span className="text-gray-300">High Contrast Mode</span>
                  <input
                    type="checkbox"
                    checked={settings.highContrast}
                    onChange={handleHighContrastToggle}
                    className="w-5 h-5"
                    aria-label="Toggle high contrast mode"
                  />
                </label>
              </div>

              {/* Font Size */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Text Size</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleFontSizeChange('normal')}
                    className={`flex-1 px-4 py-2 rounded ${
                      settings.fontSize === 'normal'
                        ? 'bg-cyan-600 text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                    aria-label="Normal text size"
                    aria-pressed={settings.fontSize === 'normal'}
                  >
                    A
                  </button>
                  <button
                    onClick={() => handleFontSizeChange('large')}
                    className={`flex-1 px-4 py-2 rounded text-lg ${
                      settings.fontSize === 'large'
                        ? 'bg-cyan-600 text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                    aria-label="Large text size"
                    aria-pressed={settings.fontSize === 'large'}
                  >
                    A
                  </button>
                  <button
                    onClick={() => handleFontSizeChange('x-large')}
                    className={`flex-1 px-4 py-2 rounded text-xl ${
                      settings.fontSize === 'x-large'
                        ? 'bg-cyan-600 text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                    aria-label="Extra large text size"
                    aria-pressed={settings.fontSize === 'x-large'}
                  >
                    A
                  </button>
                </div>
              </div>

              {/* Screen Reader */}
              <div>
                <label className="flex items-center justify-between p-3 bg-gray-800/40 rounded cursor-pointer">
                  <span className="text-gray-300">Enhanced Screen Reader</span>
                  <input
                    type="checkbox"
                    checked={settings.screenReaderMode}
                    onChange={handleScreenReaderToggle}
                    className="w-5 h-5"
                    aria-label="Toggle enhanced screen reader mode"
                  />
                </label>
                <p className="text-xs text-gray-500 mt-2 px-3">
                  Provides additional announcements and descriptions for screen readers
                </p>
              </div>

              {/* Info */}
              <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded">
                <p className="text-sm text-blue-400">
                  💡 Use keyboard navigation: Tab to move between elements, Enter/Space to activate
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
