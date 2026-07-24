import type { PageSpeedResult } from "./types";

interface CacheEntry {
  result: PageSpeedResult;
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();

const TTL_MS = 5 * 60 * 1000;

const MAX_ENTRIES = 50;

export function getCachedPageSpeed(strategy: string, url: string): PageSpeedResult | null {
  const key = `${strategy}:${url}`;
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > TTL_MS) {
    cache.delete(key);
    return null;
  }
  return entry.result;
}

export function setCachedPageSpeed(strategy: string, url: string, result: PageSpeedResult): void {
  if (cache.size >= MAX_ENTRIES) {
    const oldest = cache.entries().next().value;
    if (oldest) cache.delete(oldest[0]);
  }
  cache.set(`${strategy}:${url}`, { result, timestamp: Date.now() });
}

export function clearPageSpeedCache(): void {
  cache.clear();
}
