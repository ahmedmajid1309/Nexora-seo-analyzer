import { describe, it, expect } from "vitest";
import { extractOpportunities, extractDiagnostics } from "../opportunities";

type AuditRecord = Record<string, unknown>;
type LhrRecord = Record<string, unknown>;

function makeAudit(id: string, overrides?: Record<string, unknown>): AuditRecord {
  return {
    id,
    title: `Title for ${id}`,
    description: `Description for ${id}`,
    score: 0.5,
    ...overrides,
  };
}

function makeLhr(audits: Record<string, AuditRecord>): LhrRecord {
  return {
    requestedUrl: "https://example.com",
    finalUrl: "https://example.com",
    lighthouseVersion: "11.0.0",
    userAgent: "Chrome",
    fetchTime: new Date().toISOString(),
    environment: { networkUserAgent: "Chrome", benchmarkIndex: 1 },
    categories: { performance: { id: "performance", title: "Performance", score: 0.8 } },
    audits,
  };
}

describe("extractOpportunities", () => {
  it("returns empty array when no audits exist", () => {
    const lhr = makeLhr({});
    expect(extractOpportunities(lhr as Parameters<typeof extractOpportunities>[0])).toEqual([]);
  });

  it("returns opportunities sorted by score ascending", () => {
    const lhr = makeLhr({
      "render-blocking-resources": makeAudit("render-blocking-resources", {
        score: 0.3,
        details: { overallSavingsMs: 1500, items: [{ url: "https://example.com/style.css" }] },
      }),
      "unused-javascript": makeAudit("unused-javascript", {
        score: 0.6,
        details: { overallSavingsMs: 500, items: [{ url: "https://example.com/app.js" }] },
      }),
    });
    const ops = extractOpportunities(lhr as Parameters<typeof extractOpportunities>[0]);
    expect(ops.length).toBe(2);
    expect(ops[0].score).toBeLessThanOrEqual(ops[1].score);
  });

  it("includes estimated savings from details", () => {
    const lhr = makeLhr({
      "test-opportunity": makeAudit("test-opportunity", {
        score: 0.2,
        details: { overallSavingsMs: 2000, items: [] },
      }),
    });
    const ops = extractOpportunities(lhr as Parameters<typeof extractOpportunities>[0]);
    expect(ops[0].estimatedSavingsMs).toBe(2000);
  });

  it("extracts detail URLs", () => {
    const lhr = makeLhr({
      "test-opp": makeAudit("test-opp", {
        score: 0.1,
        details: {
          items: [{ url: "https://example.com/a.js" }, { url: "https://example.com/b.js" }],
        },
      }),
    });
    const ops = extractOpportunities(lhr as Parameters<typeof extractOpportunities>[0]);
    expect(ops[0].details).toContain("https://example.com/a.js");
    expect(ops[0].details).toContain("https://example.com/b.js");
  });

  it("limits to 20 opportunities", () => {
    const audits: Record<string, AuditRecord> = {};
    for (let i = 0; i < 30; i++) {
      audits[`opp-${i}`] = makeAudit(`opp-${i}`, {
        score: 0.1,
        details: { items: [] },
      });
    }
    const lhr = makeLhr(audits);
    const ops = extractOpportunities(lhr as Parameters<typeof extractOpportunities>[0]);
    expect(ops.length).toBeLessThanOrEqual(20);
  });
});

describe("extractDiagnostics", () => {
  it("returns diagnostics with score >= 0.99 and no details", () => {
    const lhr = makeLhr({
      "uses-http2": makeAudit("uses-http2", { score: 1, title: "Uses HTTP/2" }),
      "diagnostic-passed": makeAudit("diagnostic-passed", { score: 0.99, title: "OK" }),
    });
    const diags = extractDiagnostics(lhr as Parameters<typeof extractDiagnostics>[0]);
    expect(diags.length).toBe(2);
  });

  it("excludes audits with details even if score >= 0.99", () => {
    const lhr = makeLhr({
      "has-details": makeAudit("has-details", {
        score: 1,
        details: { items: [] },
      }),
    });
    const diags = extractDiagnostics(lhr as Parameters<typeof extractDiagnostics>[0]);
    expect(diags.length).toBe(0);
  });

  it("limits to 10 diagnostics", () => {
    const audits: Record<string, AuditRecord> = {};
    for (let i = 0; i < 20; i++) {
      audits[`diag-${i}`] = makeAudit(`diag-${i}`, { score: 1 });
    }
    const lhr = makeLhr(audits);
    const diags = extractDiagnostics(lhr as Parameters<typeof extractDiagnostics>[0]);
    expect(diags.length).toBeLessThanOrEqual(10);
  });
});
