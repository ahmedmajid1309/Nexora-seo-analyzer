import { describe, it, expect, beforeEach } from "vitest";
import { getCachedPageSpeed, setCachedPageSpeed, clearPageSpeedCache } from "../cache";
import type { PageSpeedResult } from "../types";

function makeResult(strategy: "mobile" | "desktop"): PageSpeedResult {
  return {
    strategy,
    labMetrics: {
      lcp: null,
      cls: null,
      tbt: null,
      si: null,
      fcp: null,
      performanceScore: strategy === "mobile" ? 75 : 85,
      lighthouseAccessibilityScore: null,
      lighthouseSeoScore: null,
      lighthouseBestPracticesScore: null,
    },
    fieldData: null,
    opportunities: [],
    diagnostics: [],
  };
}

describe("PageSpeed cache", () => {
  beforeEach(() => {
    clearPageSpeedCache();
  });

  it("stores and retrieves a cached result", () => {
    const result = makeResult("mobile");
    setCachedPageSpeed("mobile", "https://example.com", result);
    const cached = getCachedPageSpeed("mobile", "https://example.com");
    expect(cached).not.toBeNull();
    expect(cached!.labMetrics.performanceScore).toBe(75);
  });

  it("returns null for uncached entries", () => {
    const cached = getCachedPageSpeed("mobile", "https://example.com");
    expect(cached).toBeNull();
  });

  it("distinguishes between mobile and desktop caches", () => {
    const mobile = makeResult("mobile");
    const desktop = makeResult("desktop");
    setCachedPageSpeed("mobile", "https://example.com", mobile);
    setCachedPageSpeed("desktop", "https://example.com", desktop);

    const cachedMobile = getCachedPageSpeed("mobile", "https://example.com");
    const cachedDesktop = getCachedPageSpeed("desktop", "https://example.com");

    expect(cachedMobile!.labMetrics.performanceScore).toBe(75);
    expect(cachedDesktop!.labMetrics.performanceScore).toBe(85);
  });

  it("distinguishes between different URLs", () => {
    const a = makeResult("mobile");
    const b = makeResult("mobile");
    setCachedPageSpeed("mobile", "https://example.com/a", a);
    setCachedPageSpeed("mobile", "https://example.com/b", b);

    expect(getCachedPageSpeed("mobile", "https://example.com/a")).not.toBeNull();
    expect(getCachedPageSpeed("mobile", "https://example.com/b")).not.toBeNull();
    expect(getCachedPageSpeed("mobile", "https://example.com/c")).toBeNull();
  });

  it("clears all entries", () => {
    setCachedPageSpeed("mobile", "https://example.com", makeResult("mobile"));
    clearPageSpeedCache();
    expect(getCachedPageSpeed("mobile", "https://example.com")).toBeNull();
  });
});
