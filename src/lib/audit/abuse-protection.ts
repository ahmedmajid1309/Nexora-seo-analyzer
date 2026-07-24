import type { NextRequest } from "next/server";

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 10;
const HOST_COOLDOWN_MS = 30_000;
const MAX_CONCURRENT = 3;
const EXECUTION_DEADLINE_MS = 30_000;

const rateLimitMap = new Map<string, number[]>();
const hostCooldownMap = new Map<string, number>();
let concurrentCount = 0;

function getClientIp(request: NextRequest): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "127.0.0.1";
}

function getHost(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return "unknown";
  }
}

function cleanupExpired(): void {
  const now = Date.now();
  for (const [ip, timestamps] of rateLimitMap) {
    const recent = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
    if (recent.length === 0) rateLimitMap.delete(ip);
    else rateLimitMap.set(ip, recent);
  }
  for (const [host, ts] of hostCooldownMap) {
    if (now - ts >= HOST_COOLDOWN_MS) hostCooldownMap.delete(host);
  }
}

export function checkRateLimit(request: NextRequest): { allowed: boolean; retryAfter?: number } {
  cleanupExpired();
  const ip = getClientIp(request);
  const now = Date.now();
  const window = rateLimitMap.get(ip) ?? [];
  const recent = window.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  if (recent.length >= RATE_LIMIT_MAX) {
    return {
      allowed: false,
      retryAfter: Math.ceil((RATE_LIMIT_WINDOW_MS - (now - recent[0])) / 1000),
    };
  }
  recent.push(now);
  rateLimitMap.set(ip, recent);
  return { allowed: true };
}

export function checkHostCooldown(url: string): { allowed: boolean; retryAfter?: number } {
  cleanupExpired();
  const host = getHost(url);
  const cooldownUntil = hostCooldownMap.get(host);
  if (cooldownUntil && Date.now() < cooldownUntil) {
    return { allowed: false, retryAfter: Math.ceil((cooldownUntil - Date.now()) / 1000) };
  }
  return { allowed: true };
}

export function setHostCooldown(url: string): void {
  const host = getHost(url);
  hostCooldownMap.set(host, Date.now() + HOST_COOLDOWN_MS);
}

export function acquireConcurrentSlot(): boolean {
  if (concurrentCount >= MAX_CONCURRENT) return false;
  concurrentCount++;
  return true;
}

export function releaseConcurrentSlot(): void {
  if (concurrentCount > 0) concurrentCount--;
}

export function getExecutionDeadline(): number {
  return EXECUTION_DEADLINE_MS;
}

export function getConcurrentCount(): number {
  return concurrentCount;
}

export function resetConcurrentCount(): void {
  concurrentCount = 0;
}
