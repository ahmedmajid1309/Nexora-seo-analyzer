import { describe, it, expect } from "vitest";
import { extractLabMetrics } from "../metrics";

function makeLhr(overrides?: Record<string, unknown>) {
  return {
    requestedUrl: "https://example.com",
    finalUrl: "https://example.com",
    lighthouseVersion: "11.0.0",
    userAgent: "Chrome",
    fetchTime: new Date().toISOString(),
    environment: { networkUserAgent: "Chrome", benchmarkIndex: 1 },
    categories: {
      performance: { id: "performance", title: "Performance", score: 0.85 },
    },
    audits: {
      "largest-contentful-paint": {
        id: "largest-contentful-paint",
        title: "LCP",
        description: "LCP metric",
        score: 0.9,
        numericValue: 2500,
      },
      "cumulative-layout-shift": {
        id: "cumulative-layout-shift",
        title: "CLS",
        description: "CLS metric",
        score: 0.8,
        numericValue: 0.15,
      },
      "total-blocking-time": {
        id: "total-blocking-time",
        title: "TBT",
        description: "TBT metric",
        score: 0.7,
        numericValue: 350,
      },
      "speed-index": {
        id: "speed-index",
        title: "SI",
        description: "SI metric",
        score: 0.85,
        numericValue: 3200,
      },
      "first-contentful-paint": {
        id: "first-contentful-paint",
        title: "FCP",
        description: "FCP metric",
        score: 0.9,
        numericValue: 1800,
      },
    },
    ...overrides,
  };
}

describe("extractLabMetrics", () => {
  it("extracts all metrics from a complete Lighthouse result", () => {
    const result = extractLabMetrics(makeLhr());
    expect(result.performanceScore).toBe(85);
    expect(result.lcp).toEqual({ value: 2500, score: 90 });
    expect(result.cls).toEqual({ value: 0.15, score: 80 });
    expect(result.tbt).toEqual({ value: 350, score: 70 });
    expect(result.si).toEqual({ value: 3200, score: 85 });
    expect(result.fcp).toEqual({ value: 1800, score: 90 });
    expect(result.lighthouseAccessibilityScore).toBeNull();
    expect(result.lighthouseSeoScore).toBeNull();
    expect(result.lighthouseBestPracticesScore).toBeNull();
  });

  it("extracts Lighthouse category scores when available", () => {
    const lhr = makeLhr({
      categories: {
        performance: { id: "performance", title: "Performance", score: 0.85 },
        accessibility: { id: "accessibility", title: "Accessibility", score: 0.92 },
        "best-practices": { id: "best-practices", title: "Best Practices", score: 0.78 },
        seo: { id: "seo", title: "SEO", score: 0.95 },
      },
    });
    const result = extractLabMetrics(lhr);
    expect(result.performanceScore).toBe(85);
    expect(result.lighthouseAccessibilityScore).toBe(92);
    expect(result.lighthouseSeoScore).toBe(95);
    expect(result.lighthouseBestPracticesScore).toBe(78);
  });

  it("performance category score null → unavailable, not 0", () => {
    const lhr = makeLhr({
      categories: { performance: { id: "performance", title: "Performance", score: null } },
    });
    const result = extractLabMetrics(lhr);
    expect(result.performanceScore).toBeNull();
    expect(result.lighthouseAccessibilityScore).toBeNull();
  });

  it("missing performance category → unavailable", () => {
    const lhr = makeLhr({ categories: {} });
    const result = extractLabMetrics(lhr);
    expect(result.performanceScore).toBeNull();
    expect(result.lighthouseAccessibilityScore).toBeNull();
    expect(result.lighthouseSeoScore).toBeNull();
  });

  it("genuine score 0 → available score 0", () => {
    const lhr = makeLhr({
      categories: { performance: { id: "performance", title: "Performance", score: 0 } },
    });
    const result = extractLabMetrics(lhr);
    expect(result.performanceScore).toBe(0);
  });

  it("handles missing audits gracefully", () => {
    const lhr = makeLhr({ audits: {} });
    const result = extractLabMetrics(lhr);
    expect(result.performanceScore).toBe(85);
    expect(result.lcp).toBeNull();
    expect(result.cls).toBeNull();
  });

  it("handles undefined numeric values", () => {
    const lhr = makeLhr({
      audits: {
        "largest-contentful-paint": {
          id: "largest-contentful-paint",
          title: "LCP",
          description: "",
          score: 0.5,
        },
      },
    });
    const result = extractLabMetrics(lhr);
    expect(result.lcp).toEqual({ value: 0, score: 50 });
  });
});
