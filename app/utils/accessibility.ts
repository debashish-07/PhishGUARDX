/**
 * Accessibility Features and Helpers
 */

export class AccessibilityManager {
  private static highContrast = false;
  private static fontSize: 'normal' | 'large' | 'x-large' = 'normal';
  private static screenReaderMode = false;

  static initialize() {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem('pd_accessibility');
      if (stored) {
        const settings = JSON.parse(stored);
        this.highContrast = settings.highContrast || false;
        this.fontSize = settings.fontSize || 'normal';
        this.screenReaderMode = settings.screenReaderMode || false;
      }
    } catch (e) {
      console.warn('Failed to load accessibility settings', e);
    }

    this.applySettings();
  }

  static setHighContrast(enabled: boolean) {
    this.highContrast = enabled;
    this.save();
    this.applySettings();
  }

  static setFontSize(size: 'normal' | 'large' | 'x-large') {
    this.fontSize = size;
    this.save();
    this.applySettings();
  }

  static setScreenReaderMode(enabled: boolean) {
    this.screenReaderMode = enabled;
    this.save();
  }

  static getSettings() {
    return {
      highContrast: this.highContrast,
      fontSize: this.fontSize,
      screenReaderMode: this.screenReaderMode,
    };
  }

  private static applySettings() {
    if (typeof document === 'undefined') return;

    // High contrast
    if (this.highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }

    // Font size
    document.documentElement.classList.remove('font-normal', 'font-large', 'font-x-large');
    document.documentElement.classList.add(`font-${this.fontSize}`);
  }

  private static save() {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem('pd_accessibility', JSON.stringify({
        highContrast: this.highContrast,
        fontSize: this.fontSize,
        screenReaderMode: this.screenReaderMode,
      }));
    } catch (e) {
      console.warn('Failed to save accessibility settings', e);
    }
  }

  static announceToScreenReader(message: string) {
    if (typeof document === 'undefined') return;

    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;

    document.body.appendChild(announcement);

    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }
}

// Initialize on load
if (typeof window !== 'undefined') {
  AccessibilityManager.initialize();
}
