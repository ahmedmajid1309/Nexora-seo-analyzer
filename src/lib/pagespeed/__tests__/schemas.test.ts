import { describe, it, expect } from "vitest";
import { PSIResponseSchema } from "../schemas";

describe("PSIResponseSchema", () => {
  it("accepts a minimal valid response", () => {
    const result = PSIResponseSchema.safeParse({ kind: "pagespeedonline#result" });
    expect(result.success).toBe(true);
  });

  it("accepts a full Lighthouse result", () => {
    const data = {
      kind: "pagespeedonline#result",
      lighthouseResult: {
        requestedUrl: "https://example.com",
        finalUrl: "https://example.com",
        lighthouseVersion: "11.0.0",
        userAgent: "Chrome",
        fetchTime: "2024-01-01T00:00:00.000Z",
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
        },
      },
      loadingExperience: {
        id: "example.com",
        metrics: {
          LARGEST_CONTENTFUL_PAINT_MS: {
            percentile: 2500,
            distributions: [{ proportion: 0.5, min: 0, max: 1000 }],
            category: "AVERAGE",
          },
        },
        overall_category: "AVERAGE",
      },
    };
    const result = PSIResponseSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it("accepts partial data", () => {
    const data = {
      lighthouseResult: {
        requestedUrl: "https://example.com",
        finalUrl: "https://example.com",
        lighthouseVersion: "11.0.0",
        userAgent: "Chrome",
        fetchTime: "2024-01-01T00:00:00.000Z",
        environment: { networkUserAgent: "Chrome", benchmarkIndex: 1 },
        categories: {},
        audits: {},
      },
    };
    const result = PSIResponseSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it("rejects completely invalid data", () => {
    const result = PSIResponseSchema.safeParse(null);
    expect(result.success).toBe(false);
  });

  it("accepts empty object", () => {
    const result = PSIResponseSchema.safeParse({});
    expect(result.success).toBe(true);
  });
});
