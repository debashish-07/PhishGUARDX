/**
 * Local Trust Ledger - Hash-Linked Audit Trail
 * 
 * This module implements a local hash-linked ledger for recording
 * all phishing detection scans with hash-chaining for integrity.
 */

export interface LedgerEntry {
  id: string;
  timestamp: number;
  url: string;
  riskScore: number;
  verdict: 'safe' | 'suspicious' | 'phishing';
  previousHash: string;
  currentHash: string;
  signature: string;
  moduleScores: {
    heuristic: number;
    quantum: number;
    visual: number;
    transformer: number;
    ensemble: number;
  };
}

export interface LedgerStats {
  totalScans: number;
  safeCount: number;
  suspiciousCount: number;
  phishingCount: number;
  averageRiskScore: number;
  chainIntegrity: boolean;
}

const DB_NAME = 'PhishingDetectorLedger';
const STORE_NAME = 'trustLedger';
const WATCH_STORE = 'watchedUrls';
const DB_VERSION = 2;

/**
 * Simple hash function for hash-linked chaining
 */
async function simpleHash(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Open IndexedDB connection
 */
function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('timestamp', 'timestamp', { unique: false });
        store.createIndex('url', 'url', { unique: false });
        store.createIndex('verdict', 'verdict', { unique: false });
      }
      // Create a separate store to keep pinned/watched URLs and metadata
      if (!db.objectStoreNames.contains(WATCH_STORE)) {
        const watch = db.createObjectStore(WATCH_STORE, { keyPath: 'url' });
        watch.createIndex('addedAt', 'addedAt', { unique: false });
      }
    };
  });
}

/**
 * Trust Ledger Class
 */
export class TrustLedger {
  /**
   * Add a new entry to the ledger with hash-chaining
   */
  static async addEntry(
    url: string,
    riskScore: number,
    moduleScores: LedgerEntry['moduleScores']
  ): Promise<LedgerEntry> {
    const db = await openDatabase();

    // Get the last entry to chain from
    const lastEntry = await this.getLastEntry();
    const previousHash = lastEntry?.currentHash || '0'.repeat(64);

    // Determine verdict
    let verdict: LedgerEntry['verdict'] = 'safe';
    if (riskScore >= 70) verdict = 'phishing';
    else if (riskScore >= 40) verdict = 'suspicious';

    // Create new entry
    const entry: LedgerEntry = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      url,
      riskScore,
      verdict,
      previousHash,
      currentHash: '', // Will be computed
      signature: '', // Will be computed
      moduleScores,
    };

    // Compute current hash
    const dataToHash = JSON.stringify({
      id: entry.id,
      timestamp: entry.timestamp,
      url: entry.url,
      riskScore: entry.riskScore,
      previousHash: entry.previousHash,
    });
    entry.currentHash = await simpleHash(dataToHash);
    entry.signature = await simpleHash(entry.currentHash + previousHash);

    // Store in IndexedDB
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.add(entry);

      request.onsuccess = () => {
        try {
          // notify UI components that a new entry was added
          TrustLedger.dispatchEntryAdded(entry);
        } catch (e) {
          // ignore dispatch errors
        }
        resolve(entry);
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Dispatch a DOM event so UI components can react to ledger changes
  static dispatchEntryAdded(entry: LedgerEntry) {
    try {
      if (typeof window !== 'undefined' && 'CustomEvent' in window) {
        const ev = new CustomEvent('trustledger:entryAdded', { detail: entry });
        window.dispatchEvent(ev);
      }
    } catch (e) {
      console.warn('Failed to dispatch ledger event', e);
    }
  }

  /**
   * Get the last entry in the ledger
   */
  static async getLastEntry(): Promise<LedgerEntry | null> {
    const db = await openDatabase();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('timestamp');
      const request = index.openCursor(null, 'prev');

      request.onsuccess = () => {
        const cursor = request.result;
        resolve(cursor ? cursor.value : null);
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get all ledger entries
   */
  static async getAllEntries(): Promise<LedgerEntry[]> {
    const db = await openDatabase();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
  * Verify the integrity of the hash-linked chain
   */
  static async verifyChain(): Promise<boolean> {
    const entries = await this.getAllEntries();
    
    if (entries.length === 0) return true;

    // Sort by timestamp
    entries.sort((a, b) => a.timestamp - b.timestamp);

    for (let i = 1; i < entries.length; i++) {
      const current = entries[i];
      const previous = entries[i - 1];

      // Verify that current entry's previousHash matches previous entry's currentHash
      if (current.previousHash !== previous.currentHash) {
        console.error(`Chain broken at entry ${current.id}`);
        return false;
      }

      // Verify current entry's hash
      const dataToHash = JSON.stringify({
        id: current.id,
        timestamp: current.timestamp,
        url: current.url,
        riskScore: current.riskScore,
        previousHash: current.previousHash,
      });
      const computedHash = await simpleHash(dataToHash);

      if (computedHash !== current.currentHash) {
        console.error(`Hash mismatch at entry ${current.id}`);
        return false;
      }
    }

    return true;
  }

  /**
   * Get ledger statistics
   */
  static async getStats(): Promise<LedgerStats> {
    const entries = await this.getAllEntries();
    const chainIntegrity = await this.verifyChain();

    const safeCount = entries.filter(e => e.verdict === 'safe').length;
    const suspiciousCount = entries.filter(e => e.verdict === 'suspicious').length;
    const phishingCount = entries.filter(e => e.verdict === 'phishing').length;
    const averageRiskScore = entries.length > 0
      ? entries.reduce((sum, e) => sum + e.riskScore, 0) / entries.length
      : 0;

    return {
      totalScans: entries.length,
      safeCount,
      suspiciousCount,
      phishingCount,
      averageRiskScore,
      chainIntegrity,
    };
  }

  /**
   * Export ledger as JSON
   */
  static async exportAsJSON(): Promise<string> {
    const entries = await this.getAllEntries();
    const stats = await this.getStats();

    const exportData = {
      exportDate: new Date().toISOString(),
      stats,
      entries: entries.sort((a, b) => a.timestamp - b.timestamp),
    };

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Export ledger as CSV
   */
  static async exportAsCSV(): Promise<string> {
    const entries = await this.getAllEntries();
    entries.sort((a, b) => a.timestamp - b.timestamp);

    const headers = [
      'ID',
      'Timestamp',
      'Date',
      'URL',
      'Risk Score',
      'Verdict',
      'Previous Hash',
      'Current Hash',
      'Signature',
    ];

    const rows = entries.map(entry => [
      entry.id,
      entry.timestamp,
      new Date(entry.timestamp).toISOString(),
      entry.url,
      entry.riskScore.toFixed(2),
      entry.verdict,
      entry.previousHash.substring(0, 16) + '...',
      entry.currentHash.substring(0, 16) + '...',
      entry.signature.substring(0, 16) + '...',
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  /**
   * Clear all ledger entries (for testing/demo)
   */
  static async clearLedger(): Promise<void> {
    const db = await openDatabase();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get recent entries (last N)
   */
  static async getRecentEntries(limit: number = 10): Promise<LedgerEntry[]> {
    const entries = await this.getAllEntries();
    return entries
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  /**
   * Find an entry by its current hash
   */
  static async getEntryByHash(hash: string): Promise<LedgerEntry | null> {
    if (!hash) return null;
    const entries = await this.getAllEntries();
    const found = entries.find(e => e.currentHash === hash);
    return found || null;
  }

  /**
   * Pin (watch) a URL so it remains in a quick-access list
   */
  /**
   * Add a watched entry record. Stores a snapshot of the ledger entry so
   * the watched table can persist even if the ledger changes.
   */
  static async pinUrl(url: string, snapshot?: Partial<LedgerEntry> & { note?: string }): Promise<void> {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([WATCH_STORE], 'readwrite');
      const store = tx.objectStore(WATCH_STORE);
      const record = {
        url,
        note: snapshot?.note || '',
        addedAt: Date.now(),
        snapshotId: snapshot?.id || null,
        snapshotTimestamp: snapshot?.timestamp || null,
        snapshotRiskScore: snapshot?.riskScore || null,
        snapshotVerdict: snapshot?.verdict || null,
        snapshotHash: snapshot?.currentHash || null,
      };
      const req = store.put(record);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  static async unpinUrl(url: string): Promise<void> {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([WATCH_STORE], 'readwrite');
      const store = tx.objectStore(WATCH_STORE);
      const req = store.delete(url);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  static async getPinnedUrls(): Promise<Array<{url:string; note:string; addedAt:number; snapshotId?:string|null; snapshotTimestamp?:number|null; snapshotRiskScore?:number|null; snapshotVerdict?:string|null; snapshotHash?:string|null;}>> {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([WATCH_STORE], 'readonly');
      const store = tx.objectStore(WATCH_STORE);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }
}
