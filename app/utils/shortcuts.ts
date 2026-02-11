/**
 * Keyboard Shortcuts System
 */

type ShortcutHandler = () => void;

interface Shortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  handler: ShortcutHandler;
  description: string;
}

export class KeyboardShortcuts {
  private static shortcuts: Map<string, Shortcut> = new Map();
  private static enabled = true;

  static initialize() {
    if (typeof window === 'undefined') return;

    window.addEventListener('keydown', this.handleKeyDown.bind(this));
  }

  static register(id: string, shortcut: Shortcut): void {
    this.shortcuts.set(id, shortcut);
  }

  static unregister(id: string): void {
    this.shortcuts.delete(id);
  }

  static enable(): void {
    this.enabled = true;
  }

  static disable(): void {
    this.enabled = false;
  }

  static getShortcuts(): Array<{ id: string; shortcut: Shortcut }> {
    return Array.from(this.shortcuts.entries()).map(([id, shortcut]) => ({ id, shortcut }));
  }

  private static handleKeyDown(event: KeyboardEvent): void {
    if (!this.enabled) return;

    // Don't trigger shortcuts when typing in inputs
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      return;
    }

    for (const [id, shortcut] of this.shortcuts) {
      if (this.matchesShortcut(event, shortcut)) {
        event.preventDefault();
        shortcut.handler();
        break;
      }
    }
  }

  private static matchesShortcut(event: KeyboardEvent, shortcut: Shortcut): boolean {
    const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();
    const ctrlMatch = shortcut.ctrl ? (event.ctrlKey || event.metaKey) : !event.ctrlKey && !event.metaKey;
    const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;
    const altMatch = shortcut.alt ? event.altKey : !event.altKey;

    return keyMatch && ctrlMatch && shiftMatch && altMatch;
  }
}

// Initialize on load
if (typeof window !== 'undefined') {
  KeyboardShortcuts.initialize();
}
