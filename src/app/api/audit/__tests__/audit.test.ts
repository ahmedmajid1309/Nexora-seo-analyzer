import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "../route";
import type { AuditResponse } from "@/lib/audit/types";
import { buildPageSnapshot } from "@/lib/extraction";

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
    finalUrl: "https://example.com/path/page",
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
    metadata: [
      {
        name: "description",
        rawValue: "Meta description from page",
        normalizedValue: "Meta description from page",
        sourceAttribute: "name",
        elementOrder: 1,
      },
      {
        name: "canonical",
        rawValue: "/canonical-page",
        normalizedValue: "/canonical-page",
        sourceAttribute: "href",
        elementOrder: 2,
      },
    ],
    headings: [],
    links: [],
    images: [],
    structuredData: [],
    microdata: { present: false, itemCount: 0, itemTypes: [] },
    rdfa: { present: false, typeofCount: 0, propertyCount: 0 },
    social: {
      openGraph: [
        { property: "og:title", content: "OG Title", elementOrder: 0 },
        { property: "og:description", content: "OG Description", elementOrder: 1 },
        { property: "og:image", content: "/og-image.jpg", elementOrder: 2 },
        { property: "og:url", content: "/share", elementOrder: 3 },
        { property: "og:type", content: "website", elementOrder: 4 },
      ],
      twitter: [
        { name: "twitter:card", content: "summary_large_image", elementOrder: 0 },
        { name: "twitter:title", content: "Twitter Title", elementOrder: 1 },
        { name: "twitter:description", content: "Twitter Description", elementOrder: 2 },
        { name: "twitter:image", content: "/twitter-image.jpg", elementOrder: 3 },
      ],
    },
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

vi.mock("@/lib/audit/abuse-protection", () => ({
  checkRateLimit: vi.fn().mockReturnValue({ allowed: true }),
  checkHostCooldown: vi.fn().mockReturnValue({ allowed: true }),
  setHostCooldown: vi.fn(),
  acquireConcurrentSlot: vi.fn().mockReturnValue(true),
  releaseConcurrentSlot: vi.fn(),
  getExecutionDeadline: vi.fn().mockReturnValue(30_000),
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

  it("returns real SERP preview fields from metadata", async () => {
    const res = await POST(createRequest({ url: "https://example.com" }));
    const json: AuditResponse = await res.json();
    expect(json.data!.serpPreview.title).toBe("Test");
    expect(json.data!.serpPreview.description).toBe("Meta description from page");
    expect(json.data!.serpPreview.canonicalUrl).toBe("https://example.com/canonical-page");
    expect(json.data!.serpPreview.displayUrl).toBe("https://example.com/canonical-page");
  });

  it("returns real Open Graph and Twitter preview fields", async () => {
    const res = await POST(createRequest({ url: "https://example.com" }));
    const json: AuditResponse = await res.json();
    expect(json.data!.socialPreview.ogTitle).toBe("OG Title");
    expect(json.data!.socialPreview.ogDescription).toBe("OG Description");
    expect(json.data!.socialPreview.ogImage).toBe("https://example.com/og-image.jpg");
    expect(json.data!.socialPreview.twitterCard).toBe("summary_large_image");
    expect(json.data!.socialPreview.twitterTitle).toBe("Twitter Title");
    expect(json.data!.socialPreview.twitterImage).toBe("https://example.com/twitter-image.jpg");
  });

  it("uses Twitter fallback for social title and description when Open Graph is missing", async () => {
    const original = vi.mocked(buildPageSnapshot).getMockImplementation() as (
      fetchResult: never,
    ) => ReturnType<typeof buildPageSnapshot>;
    vi.mocked(buildPageSnapshot).mockImplementationOnce((fetchResult) => ({
      ...original(fetchResult as never),
      document: { ...original(fetchResult as never).document, title: null },
      metadata: [],
      social: {
        openGraph: [],
        twitter: [
          { name: "twitter:title", content: "Fallback Twitter Title", elementOrder: 0 },
          { name: "twitter:description", content: "Fallback Twitter Description", elementOrder: 1 },
        ],
      },
    }));

    const res = await POST(createRequest({ url: "https://example.com" }));
    const json: AuditResponse = await res.json();
    expect(json.data!.socialPreview.ogTitle).toBeNull();
    expect(json.data!.socialPreview.twitterTitle).toBe("Fallback Twitter Title");
    expect(json.data!.socialPreview.twitterDescription).toBe("Fallback Twitter Description");
  });

  it("returns honest null preview values when metadata is missing", async () => {
    const original = vi.mocked(buildPageSnapshot).getMockImplementation() as (
      fetchResult: never,
    ) => ReturnType<typeof buildPageSnapshot>;
    vi.mocked(buildPageSnapshot).mockImplementationOnce((fetchResult) => ({
      ...original(fetchResult as never),
      document: { ...original(fetchResult as never).document, title: null },
      metadata: [],
      social: { openGraph: [], twitter: [] },
    }));

    const res = await POST(createRequest({ url: "https://example.com" }));
    const json: AuditResponse = await res.json();
    expect(json.data!.serpPreview.title).toBeNull();
    expect(json.data!.serpPreview.description).toBeNull();
    expect(json.data!.serpPreview.canonicalUrl).toBeNull();
    expect(json.data!.socialPreview.ogImage).toBeNull();
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
