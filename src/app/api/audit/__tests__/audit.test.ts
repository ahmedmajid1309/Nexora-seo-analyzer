import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "../route";
import type { AuditResponse } from "@/lib/audit/types";

const hoisted = vi.hoisted(() => {
  type MockRule = {
    id: string;
    category: string;
    scored: boolean;
    name: string;
    description: string;
    executionMode: "static";
    defaultSeverity: string;
    defaultImpact: string;
    defaultEffort: string;
    signalOwner: string;
    ruleVersion: number;
    evaluator: () => Record<string, unknown>;
  };
  const arr: MockRule[] = [];
  for (let i = 1; i <= 85; i++) {
    const cat =
      i <= 14
        ? "metadata"
        : i <= 22
          ? "headings"
          : i <= 32
            ? "url"
            : i <= 40
              ? "links"
              : i <= 48
                ? "images"
                : i <= 54
                  ? "structured-data"
                  : i <= 60
                    ? "social"
                    : i <= 67
                      ? "content"
                      : i <= 80
                        ? "accessibility"
                        : "forms";
    arr.push({
      id: `TEST-${String(i).padStart(3, "0")}`,
      category: cat,
      scored: i % 5 !== 0,
      name: `Rule ${i}`,
      description: "Test",
      executionMode: "static" as const,
      defaultSeverity: "low",
      defaultImpact: "Test",
      defaultEffort: "medium",
      signalOwner: cat,
      ruleVersion: 1,
      evaluator: () => ({
        checkId: `TEST-${String(i).padStart(3, "0")}`,
        state: "passed" as const,
        evidence: { summary: "OK", observedValue: true, expectedValue: true },
        remediation: { summary: "Good", steps: ["Done"], responsible: "developer" },
        severity: "low",
        scored: i % 5 !== 0,
        impact: "",
        effort: "medium",
        confidence: 100,
        source: "html-parse",
        category: cat,
      }),
    });
  }
  return { MOCK_RULES: arr };
});

vi.mock("@/lib/network", () => ({
  safeFetch: vi.fn().mockResolvedValue({
    url: "https://example.com",
    status: 200,
    statusText: "OK",
    headers: new Headers({ "content-type": "text/html" }),
    redirected: false,
    redirectChain: [],
    body: "<html><head><title>Test</title></head><body><p>Hello</p></body></html>",
    byteLength: 100,
    timing: { dns: 5, connect: 10, tls: 3, firstByte: 50, total: 100 },
  }),
}));

vi.mock("@/lib/network/types", () => ({}));

vi.mock("@/lib/extraction", () => ({
  buildPageSnapshot: vi.fn().mockImplementation((fetchResult: Record<string, unknown>) => ({
    schemaVersion: "1.0.0",
    extractedAt: new Date().toISOString(),
    requestedUrl: fetchResult.url,
    finalUrl: fetchResult.url,
    response: {
      status: fetchResult.status,
      contentType: "text/html",
      byteLength: fetchResult.byteLength,
      redirectChain: [],
      timing: fetchResult.timing,
    },
    document: {
      url: fetchResult.url,
      lang: "en",
      dir: null,
      title: "Test",
      titleElementCount: 1,
      charsetDeclarations: [],
      viewportDeclarations: [],
      baseHref: null,
      hasBody: true,
      hasHead: true,
      approxDomNodeCount: 50,
      declaredLanguage: "en",
    },
    metadata: [],
    headings: [],
    links: [],
    images: [],
    structuredData: [],
    microdata: { present: false, itemCount: 0, itemTypes: [] },
    rdfa: { present: false, typeofCount: 0, propertyCount: 0 },
    social: { openGraph: [], twitter: [] },
    content: {
      visibleText: "Hello",
      totalChars: 5,
      wordCount: 1,
      paragraphCount: 1,
      sentenceCount: 1,
      listCount: 0,
      listItemCount: 0,
      tableCount: 0,
      blockquoteCount: 0,
      codePreCount: 0,
      hasMain: true,
      articleCount: 0,
      sectionCount: 0,
      navCount: 0,
      headerCount: 0,
      footerCount: 0,
      asideCount: 0,
      addressCount: 0,
      timeElements: [],
      questionHeadingCount: 0,
      isTruncated: false,
    },
    accessibility: {
      documentLanguage: "en",
      imageAltPresent: { total: 0, withAlt: 0, withoutAlt: 0 },
      formLabelRelationships: { total: 0, withLabel: 0, withoutLabel: 0 },
      inputAccessibleNames: { total: 0, withName: 0, withoutName: 0 },
      buttonTextSignals: { total: 0, withText: 0, withoutText: 0 },
      linkAccessibleNames: { total: 0, withName: 0, withoutName: 0 },
      landmarkElements: { nav: 0, header: 0, footer: 0, aside: 0, main: 1, section: 0 },
      headingElements: { total: 0 },
      skipLinkCandidates: [],
      tableHeaderCells: { totalTh: 0 },
      ariaAttributes: { total: 0, roles: [] },
      duplicateIds: [],
      tabindexValues: [],
      iframeTitles: { total: 0, withTitle: 0, withoutTitle: 0 },
      mediaCaptions: { total: 0, withTrack: 0, withoutTrack: 0 },
      viewportZoomRestricted: false,
    },
    forms: { formCount: 0, forms: [] },
    resources: [],
    extractionWarnings: [],
  })),
}));

vi.mock("@/lib/rules", () => ({
  getAllRules: () => hoisted.MOCK_RULES,
  getRuleCount: () => 85,
  runAll: vi.fn().mockImplementation(() => ({
    results: hoisted.MOCK_RULES.map((r) => r.evaluator()),
    durationMs: 100,
    errorCount: 0,
  })),
  runCategory: vi.fn(),
  runRules: vi.fn(),
}));

vi.mock("@/lib/rules/scoring/engine", () => ({
  calculateScores: vi.fn().mockImplementation(() => ({
    calculationVersion: "1.0.0",
    rawScore: 95.5,
    cappedScore: 95.5,
    confidence: 100,
    applicableScoredRuleCount: 68,
    evaluatedRuleCount: 68,
    unavailableRuleCount: 0,
    notApplicableRuleCount: 0,
    informationalRuleCount: 17,
    maxAvailableWeight: 8500,
    earnedWeight: 8500,
    appliedCaps: [],
    scoreFamilies: [
      {
        family: "seo-health",
        name: "SEO Health",
        rawScore: 95,
        cappedScore: 95,
        confidence: 100,
        categories: [],
      },
      {
        family: "accessibility",
        name: "Accessibility",
        rawScore: 100,
        cappedScore: 100,
        confidence: 100,
        categories: [],
      },
      {
        family: "security-trust",
        name: "Security and Trust",
        rawScore: 100,
        cappedScore: 100,
        confidence: 100,
        categories: [],
      },
      {
        family: "aeo-readiness",
        name: "AEO Readiness",
        rawScore: 90,
        cappedScore: 90,
        confidence: 100,
        categories: [],
      },
      {
        family: "geo-readiness",
        name: "GEO Readiness",
        rawScore: 85,
        cappedScore: 85,
        confidence: 100,
        categories: [],
      },
    ],
    categoryContributions: [],
    excludedSignals: [],
    performanceScore: null,
    performanceStatus: "unavailable" as const,
    performanceSource: null,
    performanceConfidence: null,
    performanceExplanation: "PageSpeed not implemented.",
  })),
}));

vi.mock("@/config/env", () => ({
  env: { PAGESPEED_API_KEY: undefined },
}));

vi.mock("@/lib/errors", () => ({
  isNexoraError: vi.fn().mockReturnValue(false),
}));

vi.mock("@/lib/rules/scoring/types", () => ({
  CALCULATION_VERSION: "1.0.0",
}));

function createRequest(body: unknown): NextRequest {
  return new NextRequest("http://localhost/api/audit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/audit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 200 for a valid audit request", async () => {
    const res = await POST(createRequest({ url: "https://example.com" }));
    const json: AuditResponse = await res.json();
    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.requestId).toBeTruthy();
    expect(json.data).toBeDefined();
  });

  it("includes actual registry rule count", async () => {
    const res = await POST(createRequest({ url: "https://example.com" }));
    const json: AuditResponse = await res.json();
    expect(json.data!.totalRules).toBe(85);
  });

  it("includes all 5 score families", async () => {
    const res = await POST(createRequest({ url: "https://example.com" }));
    const json: AuditResponse = await res.json();
    const families = json.data!.scoreFamilies.map((f) => f.family);
    expect(families).toContain("seo-health");
    expect(families).toContain("accessibility");
    expect(families).toContain("security-trust");
    expect(families).toContain("aeo-readiness");
    expect(families).toContain("geo-readiness");
  });

  it("reports performance as unavailable", async () => {
    const res = await POST(createRequest({ url: "https://example.com" }));
    const json: AuditResponse = await res.json();
    expect(json.data!.performanceStatus).toBe("unavailable");
  });

  it("returns 400 for invalid URL", async () => {
    const res = await POST(createRequest({ url: " " }));
    expect(res.status).toBe(400);
    const json: AuditResponse = await res.json();
    expect(json.success).toBe(false);
  });

  it("returns 400 for missing URL", async () => {
    const res = await POST(createRequest({}));
    expect(res.status).toBe(400);
  });

  it("returns 400 for invalid JSON body", async () => {
    const req = new NextRequest("http://localhost/api/audit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not-json",
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("does not include full HTML in response", async () => {
    const res = await POST(createRequest({ url: "https://example.com" }));
    const json: AuditResponse = await res.json();
    const text = JSON.stringify(json);
    expect(text).not.toContain("<html");
    expect(text).not.toContain("<body");
  });

  it("includes requestId in error responses", async () => {
    const res = await POST(createRequest({}));
    const json: AuditResponse = await res.json();
    expect(json.requestId).toBeTruthy();
    expect(json.success).toBe(false);
  });

  it("accepts optional keyword parameter", async () => {
    const res = await POST(createRequest({ url: "https://example.com", keyword: "seo tools" }));
    expect(res.status).toBe(200);
  });

  it("returns findings array when data is present", async () => {
    const res = await POST(createRequest({ url: "https://example.com" }));
    const json: AuditResponse = await res.json();
    if (json.data) {
      expect(Array.isArray(json.data.findings)).toBe(true);
    } else {
      expect(json.success).toBe(false);
    }
  });

  it("no sensitive-data leakage in findings", async () => {
    const res = await POST(createRequest({ url: "https://example.com" }));
    const json: AuditResponse = await res.json();
    const text = JSON.stringify(json);
    expect(text).not.toContain("password");
    expect(text).not.toContain("secret");
    expect(text).not.toContain("token");
  });

  it("returns bounded extraction warnings", async () => {
    const res = await POST(createRequest({ url: "https://example.com" }));
    const json: AuditResponse = await res.json();
    if (json.data) {
      expect(Array.isArray(json.data.extractionWarnings)).toBe(true);
      expect(json.data.extractionWarnings.length).toBeLessThanOrEqual(20);
    }
  });

  it("returns bounded findings", async () => {
    const res = await POST(createRequest({ url: "https://example.com" }));
    const json: AuditResponse = await res.json();
    if (json.data) {
      expect(Array.isArray(json.data.findings)).toBe(true);
      expect(json.data.findings.length).toBeLessThanOrEqual(200);
    }
  });

  it("indicates when findings are truncated", async () => {
    const res = await POST(createRequest({ url: "https://example.com" }));
    const json: AuditResponse = await res.json();
    if (json.data) {
      expect(typeof json.data.findingsTruncated).toBe("boolean");
    }
  });

  it("does not expose the raw page HTML or full page text", async () => {
    const res = await POST(createRequest({ url: "https://example.com" }));
    const json: AuditResponse = await res.json();
    const text = JSON.stringify(json);
    expect(text).not.toContain("<html");
    expect(text).not.toContain("<body");
    expect(text).not.toContain("<!DOCTYPE");
    expect(text.length).toBeLessThan(100000);
  });

  it("response has bounded size", async () => {
    const res = await POST(createRequest({ url: "https://example.com" }));
    const text = await res.text();
    expect(text.length).toBeLessThan(50000);
  });
});
