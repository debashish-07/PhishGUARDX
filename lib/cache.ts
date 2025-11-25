import { set, get, del } from "idb-keyval";

export type CacheEntry<T> = {
  value: T;
  updatedAt: number;
  ttlMs?: number;
};

const DEFAULT_TTL_MS = 1000 * 60 * 60; // 1 hour

export async function readCache<T = unknown>(key: string): Promise<T | null> {
  const entry = (await get(key)) as CacheEntry<T> | undefined;
  if (!entry) return null;
  const now = Date.now();
  if (entry.ttlMs && now - entry.updatedAt > entry.ttlMs) {
    await del(key);
    return null;
  }
  return entry.value;
}

export async function writeCache<T = unknown>(key: string, value: T, ttlMs: number = DEFAULT_TTL_MS) {
  // Avoid storing non-structured-cloneable values (functions, class instances, etc.)
  try {
    // structuredClone throws for non-cloneables in supported browsers
    if (typeof structuredClone === "function") {
      structuredClone(value as any);
    }
    const entry: CacheEntry<T> = { value, updatedAt: Date.now(), ttlMs };
    await set(key, entry);
  } catch {
    // Skip caching silently if value cannot be cloned for IDB
    return;
  }
}

export async function withCache<T>(key: string, compute: () => Promise<T>, ttlMs: number = DEFAULT_TTL_MS): Promise<T> {
  const cached = await readCache<T>(key);
  if (cached !== null) return cached;
  const value = await compute();
  await writeCache(key, value, ttlMs);
  return value;
}



