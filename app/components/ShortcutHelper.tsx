'use client';

import { useState, useEffect } from 'react';
import { KeyboardShortcuts } from '../utils/shortcuts';

export function ShortcutHelper() {
  const [isOpen, setIsOpen] = useState(false);
  const [shortcuts, setShortcuts] = useState<Array<{ id: string; shortcut: any }>>([]);

  useEffect(() => {
    // Register global shortcuts
    KeyboardShortcuts.register('help', {
      key: '?',
      shift: true,
      handler: () => setIsOpen(prev => !prev),
      description: 'Toggle keyboard shortcuts help',
    });

    KeyboardShortcuts.register('escape', {
      key: 'Escape',
      handler: () => setIsOpen(false),
      description: 'Close dialogs',
    });

    loadShortcuts();
  }, []);

  const loadShortcuts = () => {
    setShortcuts(KeyboardShortcuts.getShortcuts());
  };

  const formatShortcut = (shortcut: any): string => {
    const parts: string[] = [];
    if (shortcut.ctrl) parts.push('Ctrl');
    if (shortcut.shift) parts.push('Shift');
    if (shortcut.alt) parts.push('Alt');
    parts.push(shortcut.key.toUpperCase());
    return parts.join(' + ');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="bg-gray-900 rounded-xl p-6 max-w-2xl w-full border border-cyan-500/30">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-cyan-400">⌨️ Keyboard Shortcuts</h3>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        <div className="space-y-2">
          {shortcuts.map(({ id, shortcut }) => (
            <div
              key={id}
              className="flex items-center justify-between p-3 bg-gray-800/40 rounded"
            >
              <span className="text-sm text-gray-300">{shortcut.description}</span>
              <kbd className="px-3 py-1 bg-gray-700 border border-gray-600 rounded text-sm text-cyan-400 font-mono">
                {formatShortcut(shortcut)}
              </kbd>
            </div>
          ))}
        </div>

        <div className="mt-4 text-xs text-gray-500 text-center">
          Press <kbd className="px-2 py-1 bg-gray-700 rounded">Shift + ?</kbd> to toggle this help
        </div>
      </div>
    </div>
  );
}
