/**
 * Real-time Monitoring & Alert System
 */

export interface Alert {
  id: string;
  timestamp: number;
  type: 'high-risk' | 'new-threat' | 'pattern-detected';
  url: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

const ALERT_KEY = 'pd_alerts';

export class AlertSystem {
  private static alerts: Alert[] = [];
  private static listeners: Array<(alert: Alert) => void> = [];

  static initialize() {
    if (typeof window === 'undefined') return;
    
    try {
      const stored = localStorage.getItem(ALERT_KEY);
      if (stored) {
        this.alerts = JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to load alerts', e);
    }

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }

  static addAlert(alert: Omit<Alert, 'id' | 'timestamp'>): Alert {
    const newAlert: Alert = {
      ...alert,
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };

    this.alerts.unshift(newAlert);
    
    // Keep only last 100 alerts
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(0, 100);
    }

    this.saveAlerts();
    this.notifyListeners(newAlert);
    this.showNotification(newAlert);

    return newAlert;
  }

  static getAlerts(limit: number = 50): Alert[] {
    return this.alerts.slice(0, limit);
  }

  static clearAlerts(): void {
    this.alerts = [];
    this.saveAlerts();
  }

  static subscribe(listener: (alert: Alert) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private static notifyListeners(alert: Alert): void {
    this.listeners.forEach(listener => {
      try {
        listener(alert);
      } catch (e) {
        console.error('Alert listener error:', e);
      }
    });
  }

  private static showNotification(alert: Alert): void {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    
    if (Notification.permission === 'granted' && alert.severity in ['high', 'critical']) {
      new Notification('Phishing Detector Alert', {
        body: alert.message,
        icon: '/icon.png',
        tag: alert.id,
      });
    }
  }

  private static saveAlerts(): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(ALERT_KEY, JSON.stringify(this.alerts));
    } catch (e) {
      console.warn('Failed to save alerts', e);
    }
  }
}

// Initialize on load
if (typeof window !== 'undefined') {
  AlertSystem.initialize();
}
