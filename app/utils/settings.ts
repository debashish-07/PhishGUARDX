/**
 * Settings and Configuration Management
 */

export interface AppSettings {
  theme: 'dark' | 'light' | 'auto';
  notifications: boolean;
  autoRefresh: boolean;
  privacyMode: boolean;
  soundEffects: boolean;
  compactView: boolean;
  showThreatFeed: boolean;
  batchDelay: number;
  exportFormat: 'json' | 'csv' | 'markdown';
  riskThresholds: {
    safe: number;
    suspicious: number;
    phishing: number;
  };
}

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  notifications: true,
  autoRefresh: true,
  privacyMode: false,
  soundEffects: true,
  compactView: false,
  showThreatFeed: true,
  batchDelay: 1000,
  exportFormat: 'json',
  riskThresholds: {
    safe: 30,
    suspicious: 60,
    phishing: 60,
  },
};

const SETTINGS_KEY = 'pd_settings';

export class SettingsManager {
  private static settings: AppSettings = { ...DEFAULT_SETTINGS };
  private static listeners: Array<(settings: AppSettings) => void> = [];

  static initialize() {
    if (typeof window === 'undefined') return;
    
    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      if (stored) {
        this.settings = { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
      }
    } catch (e) {
      console.warn('Failed to load settings', e);
    }
  }

  static getSettings(): AppSettings {
    return { ...this.settings };
  }

  static updateSettings(updates: Partial<AppSettings>): void {
    this.settings = { ...this.settings, ...updates };
    this.save();
    this.notifyListeners();
  }

  static resetSettings(): void {
    this.settings = { ...DEFAULT_SETTINGS };
    this.save();
    this.notifyListeners();
  }

  static subscribe(listener: (settings: AppSettings) => void): () => void {
    this.listeners.push(listener);
    // Send current settings immediately
    listener(this.getSettings());
    
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private static notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.getSettings());
      } catch (e) {
        console.error('Settings listener error:', e);
      }
    });
  }

  private static save(): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(this.settings));
    } catch (e) {
      console.warn('Failed to save settings', e);
    }
  }
}

// Initialize on load
if (typeof window !== 'undefined') {
  SettingsManager.initialize();
}
