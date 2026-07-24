import { describe, it, expect, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import {
  checkRateLimit,
  checkHostCooldown,
  setHostCooldown,
  acquireConcurrentSlot,
  releaseConcurrentSlot,
  getConcurrentCount,
  getExecutionDeadline,
  resetConcurrentCount,
} from "../abuse-protection";

function createRequest(ip: string): NextRequest {
  return new NextRequest("http://localhost/api/audit", {
    method: "POST",
    headers: { "x-forwarded-for": ip, "Content-Type": "application/json" },
    body: JSON.stringify({ url: "https://example.com" }),
  });
}

describe("checkRateLimit", () => {
  it("allows first request", () => {
    const result = checkRateLimit(createRequest("1.2.3.4"));
    expect(result.allowed).toBe(true);
  });

  it("blocks after 10 requests in a window", () => {
    for (let i = 0; i < 10; i++) {
      const r = checkRateLimit(createRequest("5.6.7.8"));
      expect(r.allowed).toBe(true);
    }
    const blocked = checkRateLimit(createRequest("5.6.7.8"));
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfter).toBeGreaterThan(0);
  });

  it("allows different IPs independently", () => {
    for (let i = 0; i < 10; i++) {
      checkRateLimit(createRequest("10.0.0.1"));
    }
    const result = checkRateLimit(createRequest("10.0.0.2"));
    expect(result.allowed).toBe(true);
  });

  it("returns retry-after on rate limit", () => {
    for (let i = 0; i < 10; i++) {
      checkRateLimit(createRequest("9.9.9.9"));
    }
    const blocked = checkRateLimit(createRequest("9.9.9.9"));
    expect(blocked.retryAfter).toBeGreaterThanOrEqual(1);
  });
});

describe("host cooldown", () => {
  it("allows new host", () => {
    const result = checkHostCooldown("https://fresh-site.com");
    expect(result.allowed).toBe(true);
  });

  it("blocks host during cooldown", () => {
    setHostCooldown("https://hot-site.com");
    const result = checkHostCooldown("https://hot-site.com");
    expect(result.allowed).toBe(false);
    expect(result.retryAfter).toBeGreaterThan(0);
  });

  it("allows different host during cooldown", () => {
    setHostCooldown("https://site-a.com");
    const result = checkHostCooldown("https://site-b.com");
    expect(result.allowed).toBe(true);
  });
});

describe("concurrent slots", () => {
  beforeEach(() => {
    resetConcurrentCount();
  });

  it("allows up to 3 concurrent slots", () => {
    expect(acquireConcurrentSlot()).toBe(true);
    expect(acquireConcurrentSlot()).toBe(true);
    expect(acquireConcurrentSlot()).toBe(true);
    expect(acquireConcurrentSlot()).toBe(false);
  });

  it("releases slot correctly", () => {
    acquireConcurrentSlot();
    acquireConcurrentSlot();
    releaseConcurrentSlot();
    expect(acquireConcurrentSlot()).toBe(true);
  });

  it("reports current count", () => {
    expect(getConcurrentCount()).toBe(0);
    acquireConcurrentSlot();
    expect(getConcurrentCount()).toBe(1);
    releaseConcurrentSlot();
    expect(getConcurrentCount()).toBe(0);
  });

  it("does not decrement below zero", () => {
    releaseConcurrentSlot();
    expect(getConcurrentCount()).toBe(0);
  });
});

describe("execution deadline", () => {
  it("returns positive number", () => {
    const deadline = getExecutionDeadline();
    expect(deadline).toBeGreaterThan(0);
    expect(Number.isInteger(deadline)).toBe(true);
  });
});
