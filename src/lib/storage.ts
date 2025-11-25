// IndexedDB Storage for Analysis History and Cache

const DB_NAME = 'PhishingDetectorDB';
const DB_VERSION = 1;
const HISTORY_STORE = 'analysisHistory';
const CACHE_STORE = 'featureCache';

export interface AnalysisRecord {
    id: string;
    url: string;
    timestamp: number;
    score: number;
    breakdown: {
        heuristic: number;
        quantum: number;
        visual: number;
        transformer: number;
        ensemble: number;
    };
    verdict: 'safe' | 'suspicious' | 'phishing';
}

export interface CacheEntry {
    url: string;
    features: any;
    timestamp: number;
    ttl: number; // Time to live in milliseconds
}

class StorageManager {
    private db: IDBDatabase | null = null;

    async init(): Promise<void> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;

                // Create history store
                if (!db.objectStoreNames.contains(HISTORY_STORE)) {
                    const historyStore = db.createObjectStore(HISTORY_STORE, { keyPath: 'id' });
                    historyStore.createIndex('timestamp', 'timestamp', { unique: false });
                    historyStore.createIndex('url', 'url', { unique: false });
                }

                // Create cache store
                if (!db.objectStoreNames.contains(CACHE_STORE)) {
                    const cacheStore = db.createObjectStore(CACHE_STORE, { keyPath: 'url' });
                    cacheStore.createIndex('timestamp', 'timestamp', { unique: false });
                }
            };
        });
    }

    async saveAnalysis(record: AnalysisRecord): Promise<void> {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([HISTORY_STORE], 'readwrite');
            const store = transaction.objectStore(HISTORY_STORE);
            const request = store.put(record);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async getHistory(limit: number = 50): Promise<AnalysisRecord[]> {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([HISTORY_STORE], 'readonly');
            const store = transaction.objectStore(HISTORY_STORE);
            const index = store.index('timestamp');
            const request = index.openCursor(null, 'prev'); // Descending order

            const results: AnalysisRecord[] = [];
            request.onsuccess = (event) => {
                const cursor = (event.target as IDBRequest).result;
                if (cursor && results.length < limit) {
                    results.push(cursor.value);
                    cursor.continue();
                } else {
                    resolve(results);
                }
            };
            request.onerror = () => reject(request.error);
        });
    }

    async getCachedFeatures(url: string): Promise<any | null> {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([CACHE_STORE], 'readonly');
            const store = transaction.objectStore(CACHE_STORE);
            const request = store.get(url);

            request.onsuccess = () => {
                const entry = request.result as CacheEntry;
                if (entry && Date.now() - entry.timestamp < entry.ttl) {
                    resolve(entry.features);
                } else {
                    resolve(null);
                }
            };
            request.onerror = () => reject(request.error);
        });
    }

    async cacheFeatures(url: string, features: any, ttl: number = 3600000): Promise<void> {
        if (!this.db) await this.init();

        const entry: CacheEntry = {
            url,
            features,
            timestamp: Date.now(),
            ttl
        };

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([CACHE_STORE], 'readwrite');
            const store = transaction.objectStore(CACHE_STORE);
            const request = store.put(entry);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async clearHistory(): Promise<void> {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([HISTORY_STORE], 'readwrite');
            const store = transaction.objectStore(HISTORY_STORE);
            const request = store.clear();

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async exportHistory(): Promise<AnalysisRecord[]> {
        return this.getHistory(1000); // Export all (up to 1000)
    }
}

// Singleton instance
let storageInstance: StorageManager | null = null;

export function getStorage(): StorageManager {
    if (!storageInstance) {
        storageInstance = new StorageManager();
    }
    return storageInstance;
}
