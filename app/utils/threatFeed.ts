/**
 * Real-time Threat Feed Integration
 */

export interface ThreatFeedItem {
  url: string;
  source: string;
  timestamp: number;
  threatType: string;
  confidence: number;
}

export class ThreatFeedManager {
  private static feeds: ThreatFeedItem[] = [];
  private static listeners: Array<(item: ThreatFeedItem) => void> = [];
  private static updateInterval: NodeJS.Timeout | null = null;

  static initialize() {
    if (typeof window === 'undefined') return;
    
    // Start polling threat feeds every 5 minutes
    this.startPolling();
  }

  static startPolling() {
    if (this.updateInterval) return;
    
    this.updateInterval = setInterval(() => {
      this.fetchLatestThreats();
    }, 5 * 60 * 1000); // 5 minutes

    // Initial fetch
    this.fetchLatestThreats();
  }

  static stopPolling() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  private static async fetchLatestThreats() {
    try {
      // In production, this would fetch from real threat feeds
      // For now, simulate threat feed updates
      if (Math.random() > 0.7) {
        const mockThreat: ThreatFeedItem = {
          url: `https://malicious-site-${Date.now()}.com`,
          source: 'PhishTank',
          timestamp: Date.now(),
          threatType: 'phishing',
          confidence: 0.85 + Math.random() * 0.15,
        };

        this.feeds.unshift(mockThreat);
        this.feeds = this.feeds.slice(0, 100); // Keep last 100
        this.notifyListeners(mockThreat);
      }
    } catch (error) {
      console.error('Failed to fetch threat feeds:', error);
    }
  }

  static getFeeds(limit: number = 50): ThreatFeedItem[] {
    return this.feeds.slice(0, limit);
  }

  static subscribe(listener: (item: ThreatFeedItem) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private static notifyListeners(item: ThreatFeedItem) {
    this.listeners.forEach(listener => {
      try {
        listener(item);
      } catch (e) {
        console.error('Threat feed listener error:', e);
      }
    });
  }

  static checkUrl(url: string): ThreatFeedItem | null {
    return this.feeds.find(item => item.url === url) || null;
  }
}

// Initialize on load
if (typeof window !== 'undefined') {
  ThreatFeedManager.initialize();
}
