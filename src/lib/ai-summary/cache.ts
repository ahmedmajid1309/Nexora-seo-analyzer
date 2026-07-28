import { createHash } from "node:crypto";

interface CacheEntry<T> {
  insertedAt: number;
  expiresAt: number;
  value: T;
}

const cache = new Map<string, CacheEntry<unknown>>();

export function hashEvidence(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

export function getCachedSummary<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (entry.expiresAt <= Date.now()) {
    cache.delete(key);
    return null;
  }
  return entry.value as T;
}

export function setCachedSummary<T>(key: string, value: T, ttlMs: number): void {
  setCachedSummaryWithLimit(key, value, ttlMs, 100);
}

export function setCachedSummaryWithLimit<T>(
  key: string,
  value: T,
  ttlMs: number,
  maxEntries: number,
): void {
  const now = Date.now();
  for (const [entryKey, entry] of cache.entries()) {
    if (entry.expiresAt <= now) cache.delete(entryKey);
  }
  cache.set(key, { value, insertedAt: now, expiresAt: now + ttlMs });
  while (cache.size > maxEntries) {
    const oldest = [...cache.entries()].sort((a, b) => a[1].insertedAt - b[1].insertedAt)[0]?.[0];
    if (!oldest) break;
    cache.delete(oldest);
  }
}

export function getAiSummaryCacheSize(): number {
  return cache.size;
}

export function clearAiSummaryCacheForTests(): void {
  cache.clear();
}
