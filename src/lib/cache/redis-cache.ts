import { env } from "@/config/env";
import { getRedisConnection, isQueueConfigured } from "@/lib/jobs/queue";
import { hashSecret } from "@/lib/reports/tokens";

const SCHEMA_VERSION = "phase16-v1";

export function createAuditCacheKey(parts: {
  auditType: "quick" | "site";
  url: string;
  calculationVersion: string;
  ruleVersion: string;
}): string {
  const digest = hashSecret(
    [SCHEMA_VERSION, parts.auditType, parts.url, parts.calculationVersion, parts.ruleVersion].join(
      "|",
    ),
  );
  return `audit-cache:${digest}`;
}

export async function getAuditCache<T>(key: string): Promise<T | null> {
  if (!env.AUDIT_QUEUE_ENABLED || !isQueueConfigured()) return null;
  const raw = await getRedisConnection().get(key);
  return raw ? (JSON.parse(raw) as T) : null;
}

export async function setAuditCache(
  key: string,
  value: unknown,
  ttlMs = env.AUDIT_CACHE_TTL_MS,
): Promise<void> {
  if (!env.AUDIT_QUEUE_ENABLED || !isQueueConfigured()) return;
  await getRedisConnection().set(key, JSON.stringify(value), "PX", ttlMs);
}

export async function withSingleFlight<T>(key: string, fn: () => Promise<T>): Promise<T> {
  if (!env.AUDIT_QUEUE_ENABLED || !isQueueConfigured()) return fn();
  const lockKey = `single-flight:${key}`;
  const lock = await getRedisConnection().set(lockKey, "1", "PX", 30_000, "NX");
  if (lock) {
    try {
      return await fn();
    } finally {
      await getRedisConnection().del(lockKey);
    }
  }
  for (let i = 0; i < 20; i += 1) {
    await new Promise((resolve) => setTimeout(resolve, 50));
    const cached = await getAuditCache<T>(key);
    if (cached) return cached;
  }
  return fn();
}
