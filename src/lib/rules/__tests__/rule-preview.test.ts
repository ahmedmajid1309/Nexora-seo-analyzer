import { describe, it, expect, vi, beforeEach } from "vitest";
import { NexoraError } from "@/lib/errors";

vi.mock("@/lib/network", () => ({
  safeFetch: vi.fn(),
  FetchPreviewInputSchema: {
    safeParse: (body: unknown) => {
      if (
        typeof body === "object" &&
        body !== null &&
        "url" in body &&
        typeof (body as Record<string, unknown>).url === "string" &&
        ((body as Record<string, unknown>).url as string).startsWith("http")
      ) {
        return { success: true, data: body };
      }
      return {
        success: false,
        error: { issues: [{ path: ["url"], message: "Invalid url" }] },
      };
    },
  },
}));

vi.mock("@/lib/extraction", () => ({
  buildPageSnapshot: vi.fn(),
}));

vi.mock("@/lib/rules", () => ({
  runAll: vi.fn(),
  getRuleCount: vi.fn(),
  getAllRules: vi.fn(),
}));

import type { PageSnapshot } from "@/lib/extraction/schemas";
import type { RuleResult } from "@/lib/rules";

function makeMockSnapshot(): PageSnapshot {
  return {
    schemaVersion: "1.0.0",
    extractedAt: new Date().toISOString(),
    requestedUrl: "https://example.com",
    finalUrl: "https://example.com",
    response: {
      status: 200,
      contentType: "text/html",
      byteLength: 100,
      redirectChain: [],
      timing: { dns: 0, connect: 0, tls: 0, firstByte: 0, total: 10 },
    },
    document: {
      url: "https://example.com",
      lang: "en",
      dir: null,
      title: "Test",
      titleElementCount: 1,
      charsetDeclarations: [],
      viewportDeclarations: [],
      baseHref: null,
      hasBody: true,
      hasHead: true,
      approxDomNodeCount: 100,
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
      visibleText: "hello",
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
  };
}

function makeMockResult(): { results: RuleResult[]; durationMs: number; errorCount: number } {
  return {
    results: [
      {
        checkId: "META-001",
        state: "passed",
        category: "metadata",
        evidence: { summary: "Title present", observedValue: "Test", expectedValue: true },
        remediation: { summary: "", steps: [], responsible: "developer" },
        severity: "informational",
        scored: false,
        impact: "",
        effort: "low",
        confidence: 95,
        source: "html-parse",
      },
      {
        checkId: "URL-006",
        state: "warning",
        category: "url",
        evidence: { summary: "Tracking params found", observedValue: true, expectedValue: false },
        remediation: { summary: "", steps: [], responsible: "seo" },
        severity: "informational",
        scored: false,
        impact: "",
        effort: "low",
        confidence: 95,
        source: "http-response",
      },
      {
        checkId: "META-003",
        state: "failed",
        category: "metadata",
        evidence: {
          summary: "Missing description",
          observedValue: null,
          expectedValue: "description",
        },
        remediation: { summary: "", steps: [], responsible: "developer" },
        severity: "high",
        scored: true,
        impact: "",
        effort: "low",
        confidence: 95,
        source: "html-parse",
      },
      {
        checkId: "IMAGE-001",
        state: "unavailable",
        category: "images",
        evidence: { summary: "Evaluator crashed", observedValue: null, expectedValue: null },
        remediation: { summary: "", steps: [], responsible: "developer" },
        severity: "medium",
        scored: false,
        impact: "",
        effort: "medium",
        confidence: 0,
        source: "html-parse",
        unavailableReason: "Error",
      },
    ],
    durationMs: 15,
    errorCount: 1,
  };
}

function makeSuccessfulFetchResult() {
  return {
    html: "<html></html>",
    requestedUrl: "https://example.com",
    normalizedUrl: "https://example.com",
    finalUrl: "https://example.com",
    status: 200,
    statusText: "OK",
    contentType: "text/html",
    byteLength: 100,
    redirectChain: [],
    timing: { dns: 0, connect: 0, tls: 0, firstByte: 0, total: 10 },
  };
}

describe("POST /api/internal/rule-preview", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 for invalid JSON body", async () => {
    const { safeFetch } = await import("@/lib/network");
    const { buildPageSnapshot } = await import("@/lib/extraction");
    vi.mocked(safeFetch).mockResolvedValue(makeSuccessfulFetchResult());
    vi.mocked(buildPageSnapshot).mockReturnValue(makeMockSnapshot());
    const { runAll, getRuleCount } = await import("@/lib/rules");
    vi.mocked(runAll).mockReturnValue(makeMockResult());
    vi.mocked(getRuleCount).mockReturnValue(85);

    const { POST } = await import("@/app/api/internal/rule-preview/route");
    const req = new Request("http://localhost/api/internal/rule-preview", {
      method: "POST",
      body: "not-json",
    });
    const res = await POST(req as never);
    const json = await res.json();
    expect(res.status).toBe(400);
    expect(json.error.code).toBe("INVALID_REQUEST");
  });

  it("returns 400 for invalid URL", async () => {
    const { POST } = await import("@/app/api/internal/rule-preview/route");
    const req = new Request("http://localhost/api/internal/rule-preview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: "not-a-url" }),
    });
    const res = await POST(req as never);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error.code).toBe("VALIDATION_ERROR");
  });

  it("returns 500 on fetch failure", async () => {
    const { safeFetch } = await import("@/lib/network");
    vi.mocked(safeFetch).mockRejectedValue(new Error("Network failure"));

    const { POST } = await import("@/app/api/internal/rule-preview/route");
    const req = new Request("http://localhost/api/internal/rule-preview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: "https://example.com" }),
    });
    const res = await POST(req as never);
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error.code).toBe("INTERNAL_ERROR");
  });

  it("returns NexoraError on network policy failure", async () => {
    const { safeFetch } = await import("@/lib/network");
    vi.mocked(safeFetch).mockRejectedValue(
      new NexoraError({ code: "INVALID_URL", httpStatus: 400, userMessage: "Invalid URL" }),
    );

    const { POST } = await import("@/app/api/internal/rule-preview/route");
    const req = new Request("http://localhost/api/internal/rule-preview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: "https://example.com" }),
    });
    const res = await POST(req as never);
    const json = await res.json();
    expect(json.success).toBe(false);
  });

  it("returns success with full rule execution", async () => {
    const { safeFetch } = await import("@/lib/network");
    const { buildPageSnapshot } = await import("@/lib/extraction");
    const { runAll, getRuleCount } = await import("@/lib/rules");
    vi.mocked(safeFetch).mockResolvedValue(makeSuccessfulFetchResult());
    vi.mocked(buildPageSnapshot).mockReturnValue(makeMockSnapshot());
    vi.mocked(runAll).mockReturnValue(makeMockResult());
    vi.mocked(getRuleCount).mockReturnValue(85);

    const { POST } = await import("@/app/api/internal/rule-preview/route");
    const req = new Request("http://localhost/api/internal/rule-preview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: "https://example.com" }),
    });
    const res = await POST(req as never);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.requestId).toBeDefined();
    expect(json.data.requestedUrl).toBe("https://example.com");
    expect(json.data.finalUrl).toBe("https://example.com");
    expect(json.data.totalRegisteredRules).toBe(85);
    expect(json.data.stateCounts.passed).toBe(1);
    expect(json.data.stateCounts.warning).toBe(1);
    expect(json.data.stateCounts.failed).toBe(1);
    expect(json.data.stateCounts.unavailable).toBe(1);
    expect(json.data.partialCount).toBe(1);
    expect(json.data.unavailableCount).toBe(1);
  });

  it("does not leak sensitive values in response", async () => {
    const { safeFetch } = await import("@/lib/network");
    const { buildPageSnapshot } = await import("@/lib/extraction");
    const { runAll, getRuleCount } = await import("@/lib/rules");
    vi.mocked(safeFetch).mockResolvedValue({
      ...makeSuccessfulFetchResult(),
      html: "<html>password=secret</html>",
    });
    vi.mocked(buildPageSnapshot).mockReturnValue(makeMockSnapshot());
    vi.mocked(runAll).mockReturnValue(makeMockResult());
    vi.mocked(getRuleCount).mockReturnValue(85);

    const { POST } = await import("@/app/api/internal/rule-preview/route");
    const req = new Request("http://localhost/api/internal/rule-preview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: "https://example.com" }),
    });
    const res = await POST(req as never);
    const json = await res.json();
    const bodyStr = JSON.stringify(json);
    expect(bodyStr).not.toContain("password=");
    expect(bodyStr).not.toContain("stack");
  });

  it("returns findings for failed/warning rules only", async () => {
    const { safeFetch } = await import("@/lib/network");
    const { buildPageSnapshot } = await import("@/lib/extraction");
    const { runAll, getRuleCount } = await import("@/lib/rules");
    vi.mocked(safeFetch).mockResolvedValue(makeSuccessfulFetchResult());
    vi.mocked(buildPageSnapshot).mockReturnValue(makeMockSnapshot());
    vi.mocked(runAll).mockReturnValue(makeMockResult());
    vi.mocked(getRuleCount).mockReturnValue(85);

    const { POST } = await import("@/app/api/internal/rule-preview/route");
    const req = new Request("http://localhost/api/internal/rule-preview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: "https://example.com" }),
    });
    const res = await POST(req as never);
    const json = await res.json();
    expect(json.data.findings.length).toBe(2);
    expect(json.data.findings[0].state).toBe("warning");
    expect(json.data.findings[1].state).toBe("failed");
  });

  it("returns expected registry rule count", async () => {
    const { safeFetch } = await import("@/lib/network");
    const { buildPageSnapshot } = await import("@/lib/extraction");
    const { runAll, getRuleCount } = await import("@/lib/rules");
    vi.mocked(safeFetch).mockResolvedValue(makeSuccessfulFetchResult());
    vi.mocked(buildPageSnapshot).mockReturnValue(makeMockSnapshot());
    vi.mocked(runAll).mockReturnValue(makeMockResult());
    vi.mocked(getRuleCount).mockReturnValue(85);

    const { POST } = await import("@/app/api/internal/rule-preview/route");
    const req = new Request("http://localhost/api/internal/rule-preview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: "https://example.com" }),
    });
    const res = await POST(req as never);
    const json = await res.json();
    expect(json.data.totalRegisteredRules).toBe(85);
  });
});
