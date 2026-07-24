import { createLogger } from "@/lib/logging";

const monitorLogger = createLogger("monitoring");
const counters = new Map<string, number>();
const startTime = Date.now();

export function incrementCounter(name: string, delta = 1): void {
  const current = counters.get(name) ?? 0;
  counters.set(name, current + delta);
}

export function getCounter(name: string): number {
  return counters.get(name) ?? 0;
}

export function getAllCounters(): Record<string, number> {
  const result: Record<string, number> = {};
  for (const [key, value] of counters) {
    result[key] = value;
  }
  return result;
}

export function resetCounters(): void {
  counters.clear();
}

export interface HealthStatus {
  status: "ok" | "degraded" | "down";
  version: string;
  uptimeSeconds: number;
  environment: string;
  timestamp: string;
  counters: Record<string, number>;
}

export function getHealthStatus(): HealthStatus {
  const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);
  return {
    status: "ok",
    version: process.env.NEXT_PUBLIC_APP_VERSION ?? "0.1.0",
    uptimeSeconds,
    environment: process.env.NODE_ENV ?? "development",
    timestamp: new Date().toISOString(),
    counters: getAllCounters(),
  };
}

export function trackAuditRequest(): void {
  incrementCounter("audit.requests.total");
}

export function trackAuditError(): void {
  incrementCounter("audit.errors.total");
}

export function trackRateLimitHit(): void {
  incrementCounter("rate_limit.hits.total");
}

export function trackHealthCheck(): void {
  incrementCounter("health.checks.total");
}

export function captureError(context: string, error: unknown): void {
  incrementCounter("errors.total");
  monitorLogger.error(`Error in ${context}`, {
    errorName: error instanceof Error ? error.name : typeof error,
    errorMessage: error instanceof Error ? error.message : String(error),
  });
}
