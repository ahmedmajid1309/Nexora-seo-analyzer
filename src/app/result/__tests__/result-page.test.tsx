import { describe, it, expect, vi, beforeEach } from "vitest";
import { StrictMode } from "react";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";

const mockUrl = "https://example.com";
let mockSearchParams = new URLSearchParams(`url=${encodeURIComponent(mockUrl)}`);

const pageContext = {
  requestedUrl: "https://example.com",
  finalUrl: "https://example.com",
  pathname: "/",
  pageTitle: "Example page",
};

const staticEvidence = {
  source: "static-html" as const,
  observedValue: "missing",
  expectedValue: "Present and descriptive metadata",
  selector: "head > meta[name='description']",
  elementSnippet: null,
  unavailableReason: null,
};

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => mockSearchParams,
}));

vi.mock("@/components/layout/SiteHeader", () => ({
  SiteHeader: () => <header data-testid="site-header" />,
}));

vi.mock("@/components/layout/SiteFooter", () => ({
  SiteFooter: () => <footer data-testid="site-footer" />,
}));

function createMockResponse(overrides: Record<string, unknown> = {}) {
  return {
    success: true,
    requestId: "test-123",
    data: {
      requestId: "test-123",
      requestedUrl: "https://example.com",
      finalUrl: "https://example.com",
      responseStatus: 200,
      contentType: "text/html",
      byteLength: 15000,
      durationMs: 2341,
      totalRules: 120,
      stateCounts: { passed: 80, warning: 10, failed: 5, "not-applicable": 20, unavailable: 5 },
      findings: [
        {
          checkId: "META-001",
          state: "failed",
          category: "metadata",
          severity: "critical",
          scored: true,
          summary: "Missing meta description",
          impact: "Search results may show irrelevant snippets",
          effort: "low",
          remediationSummary: "Add a compelling meta description",
          remediationSteps: ["Write a 150-160 character description", "Include target keyword"],
          responsible: "content",
          confidence: 100,
          page: pageContext,
          evidence: staticEvidence,
        },
        {
          checkId: "META-002",
          state: "passed",
          category: "metadata",
          severity: "low",
          scored: true,
          summary: "Title tag is present",
          impact: "Good for SEO",
          effort: "low",
          remediationSummary: "",
          remediationSteps: [],
          responsible: "developer",
          confidence: 100,
          page: pageContext,
          evidence: { ...staticEvidence, observedValue: "Title tag is present" },
        },
        {
          checkId: "A11Y-001",
          state: "warning",
          category: "accessibility",
          severity: "medium",
          scored: true,
          summary: "Missing alt text on images",
          impact: "Screen readers cannot describe images",
          effort: "low",
          remediationSummary: "Add alt attributes to all images",
          remediationSteps: ["Add descriptive alt text to each image"],
          responsible: "developer",
          confidence: 90,
          page: pageContext,
          evidence: {
            ...staticEvidence,
            observedValue: "3 images without alt text",
            selector: "img:not([alt])",
            elementSnippet: '<img src="/hero.jpg">',
          },
        },
      ],
      findingsTruncated: false,
      categoryBreakdowns: [
        {
          category: "metadata",
          rawScore: 75,
          cappedScore: 75,
          passed: 1,
          warning: 0,
          failed: 1,
          notApplicable: 0,
          unavailable: 0,
          informational: 0,
        },
      ],
      scoreFamilies: [
        {
          family: "seo-health",
          name: "SEO Health",
          rawScore: 82,
          cappedScore: 82,
          confidence: 100,
        },
        {
          family: "accessibility",
          name: "Accessibility",
          rawScore: 65,
          cappedScore: 65,
          confidence: 90,
        },
        {
          family: "security-trust",
          name: "Security & Trust",
          rawScore: 90,
          cappedScore: 90,
          confidence: 100,
        },
        {
          family: "aeo-readiness",
          name: "AEO Readiness",
          rawScore: 70,
          cappedScore: 70,
          confidence: 100,
        },
        {
          family: "geo-readiness",
          name: "GEO Readiness",
          rawScore: 60,
          cappedScore: 60,
          confidence: 100,
        },
      ],
      confidence: 95,
      appliedCaps: [],
      extractionWarnings: [],
      partialStage: null,
      unavailableStage: null,
      performanceScore: 85,
      performanceStatus: "available",
      performanceSource: "pagespeed-mobile",
      performanceConfidence: 100,
      performanceExplanation: "Lighthouse performance score from mobile device",
      performanceMobile: {
        labMetrics: {
          lcp: { value: 2500, score: 75 },
          cls: { value: 0.1, score: 90 },
          tbt: { value: 200, score: 80 },
          si: { value: 3000, score: 75 },
          fcp: { value: 1500, score: 85 },
          performanceScore: 85,
          lighthouseAccessibilityScore: null,
          lighthouseSeoScore: null,
          lighthouseBestPracticesScore: null,
        },
        fieldData: {
          lcp: { p75Ms: 2400, category: "AVERAGE" },
          cls: { p75: 0.08, category: "GOOD" },
          inp: { p75Ms: 150, category: "GOOD" },
          fcp: { p75Ms: 1400, category: "GOOD" },
          overallCategory: "AVERAGE",
        },
        opportunities: [
          {
            id: "opp-1",
            title: "Optimize images",
            description: "",
            score: 45,
            estimatedSavingsMs: 500,
            details: [],
          },
        ],
      },
      performanceDesktop: null,
      serpPreview: {
        title: "Real SERP Title",
        description: "Real meta description for the result page",
        canonicalUrl: "https://example.com/canonical",
        displayUrl: "https://example.com/canonical",
      },
      socialPreview: {
        ogTitle: "Real OG Title",
        ogDescription: "Real OG Description",
        ogImage: "https://example.com/og.jpg",
        ogUrl: "https://example.com/share",
        ogType: "website",
        twitterCard: "summary_large_image",
        twitterTitle: "Real Twitter Title",
        twitterDescription: "Real Twitter Description",
        twitterImage: "https://example.com/twitter.jpg",
      },
      calculationVersion: "1.0",
      snapshotSchemaVersion: "1.0",
      ...overrides,
    },
  };
}

function createJsonResponse(body: unknown, ok = true, status = 200) {
  return {
    ok,
    status,
    json: () => Promise.resolve(body),
  };
}

function createAbortAwareFetch(body: unknown) {
  return vi.fn().mockImplementation((_url: string, init?: RequestInit) => {
    const signal = init?.signal;
    return new Promise((resolve, reject) => {
      if (signal?.aborted) {
        reject(new DOMException("Aborted", "AbortError"));
        return;
      }
      signal?.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")), {
        once: true,
      });
      setTimeout(() => resolve(createJsonResponse(body)), 0);
    });
  });
}

function deferredResponse() {
  let resolve!: (value: unknown) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

describe("ResultPage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mockSearchParams = new URLSearchParams(`url=${encodeURIComponent(mockUrl)}`);
  });

  it("shows score cards when audit completes", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve(createMockResponse()),
    });

    const { default: ResultPage } = await import("@/app/result/page");
    render(<ResultPage />);

    await waitFor(() => {
      expect(screen.getAllByText("SEO Health").length).toBeGreaterThan(0);
    });
    expect(screen.getAllByText("Accessibility").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Security & Trust").length).toBeGreaterThan(0);
    expect(screen.getAllByText("AEO Readiness").length).toBeGreaterThan(0);
    expect(screen.getAllByText("GEO Readiness").length).toBeGreaterThan(0);
  });

  it("shows confidence display", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve(createMockResponse()),
    });

    const { default: ResultPage } = await import("@/app/result/page");
    render(<ResultPage />);

    await waitFor(() => {
      expect(screen.getAllByText(/Confidence: 95%/i).length).toBeGreaterThan(0);
    });
  });

  it("shows desktop fallback label when applicable", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      json: () =>
        Promise.resolve(
          createMockResponse({
            performanceSource: "pagespeed-desktop-fallback",
            performanceConfidence: 70,
          }),
        ),
    });

    const { default: ResultPage } = await import("@/app/result/page");
    render(<ResultPage />);

    await waitFor(() => {
      expect(screen.getAllByText(/Desktop.*fallback/i).length).toBeGreaterThan(0);
    });
  });

  it("shows unavailable performance state", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      json: () =>
        Promise.resolve(
          createMockResponse({
            performanceScore: null,
            performanceStatus: "unavailable",
            performanceSource: null,
            performanceConfidence: null,
            performanceExplanation: "No PageSpeed API key configured",
            performanceMobile: null,
            performanceDesktop: null,
          }),
        ),
    });

    const { default: ResultPage } = await import("@/app/result/page");
    render(<ResultPage />);

    await waitFor(() => {
      expect(screen.getAllByText(/No PageSpeed API key configured/i).length).toBeGreaterThan(0);
    });
  });

  it("shows score caps when applied", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      json: () =>
        Promise.resolve(
          createMockResponse({
            appliedCaps: [
              {
                capId: "CAP-NOINDEX",
                reason: "Page has noindex directive",
                maxScore: 40,
                applied: true,
              },
            ],
          }),
        ),
    });

    const { default: ResultPage } = await import("@/app/result/page");
    render(<ResultPage />);

    await waitFor(() => {
      expect(screen.getAllByText("CAP-NOINDEX").length).toBeGreaterThanOrEqual(1);
    });
  });

  it("separates score-driving issue from quickest recommended action", async () => {
    const base = createMockResponse();
    const baseFindings = base.data.findings;
    globalThis.fetch = vi.fn().mockResolvedValue({
      json: () =>
        Promise.resolve(
          createMockResponse({
            appliedCaps: [
              {
                capId: "CAP-INDEXABILITY",
                triggerCheckIds: ["ROBOTS-001"],
                reason: "Robots directive blocks indexability",
                maxScore: 35,
                applied: true,
              },
              {
                capId: "CAP-MINOR",
                reason: "Minor metadata issue",
                maxScore: 70,
                applied: true,
              },
            ],
            findings: [
              {
                ...baseFindings[0],
                checkId: "ROBOTS-001",
                severity: "high",
                effort: "high",
                summary: "Robots directive blocks indexability",
                remediationSummary: "Remove the blocking robots directive",
                evidence: {
                  ...staticEvidence,
                  observedValue: "noindex robots directive detected",
                  expectedValue: "Indexable page",
                },
              },
              {
                ...baseFindings[2],
                checkId: "IMG-001",
                severity: "medium",
                effort: "low",
                summary: "Add missing image alt text",
              },
            ],
          }),
        ),
    });

    const { default: ResultPage } = await import("@/app/result/page");
    render(<ResultPage />);

    await waitFor(() => {
      expect(screen.getByText("Score-driving issue")).toBeInTheDocument();
    });
    expect(screen.getAllByText("Robots directive blocks indexability").length).toBeGreaterThan(0);
    expect(screen.getByText("Maximum overall score: 35")).toBeInTheDocument();
    expect(screen.getByText("Quickest recommended action")).toBeInTheDocument();
    expect(screen.getAllByText("Add missing image alt text").length).toBeGreaterThan(0);
  });

  it("renders CAP-NOINDEX metadata instead of an unrelated canonical finding", async () => {
    const base = createMockResponse();
    globalThis.fetch = vi.fn().mockResolvedValue({
      json: () =>
        Promise.resolve(
          createMockResponse({
            appliedCaps: [
              {
                capId: "CAP-NOINDEX",
                triggerCheckIds: ["META-007"],
                reason: "Page has noindex directive — search engines cannot index this page",
                maxScore: 40,
                applied: true,
              },
            ],
            findings: [
              {
                ...base.data.findings[0],
                checkId: "META-007",
                summary: "No canonical tag found",
                impact: "Search engines may split ranking signals.",
              },
              {
                ...base.data.findings[2],
                checkId: "IMAGE-001",
                summary: "Missing alt text on images",
                effort: "low",
              },
            ],
          }),
        ),
    });

    const { default: ResultPage } = await import("@/app/result/page");
    render(<ResultPage />);

    const scoreCard = await screen.findByText("Score-driving issue");
    const card = scoreCard.closest("div");
    expect(card).not.toBeNull();
    expect(within(card!).getByText("Page is marked noindex")).toBeInTheDocument();
    expect(
      within(card!).getByText("Search engines are instructed not to index this page."),
    ).toBeInTheDocument();
    expect(within(card!).getByText("Maximum overall score: 40")).toBeInTheDocument();
    expect(within(card!).queryByText("No canonical tag found")).not.toBeInTheDocument();
    expect(screen.getByText("Quickest recommended action")).toBeInTheDocument();
    expect(screen.queryByText("Also the quickest fix")).not.toBeInTheDocument();
    expect(screen.getAllByText("No canonical tag found").length).toBeGreaterThan(0);
  });

  it("does not duplicate the same finding across recommendation cards", async () => {
    const base = createMockResponse();
    globalThis.fetch = vi.fn().mockResolvedValue({
      json: () =>
        Promise.resolve(
          createMockResponse({
            appliedCaps: [
              {
                capId: "CAP-NO-DESCRIPTION",
                triggerCheckIds: ["META-003"],
                reason: "Page is missing a meta description",
                maxScore: 80,
                applied: true,
              },
            ],
            findings: [
              {
                ...base.data.findings[0],
                checkId: "META-003",
                summary: "Missing meta description",
                effort: "low",
              },
            ],
          }),
        ),
    });

    const { default: ResultPage } = await import("@/app/result/page");
    render(<ResultPage />);

    await waitFor(() => {
      expect(screen.getByText("Also the quickest fix")).toBeInTheDocument();
    });
    expect(screen.queryByText("Quickest recommended action")).not.toBeInTheDocument();
    expect(screen.getAllByText("Missing meta description").length).toBeGreaterThan(0);
  });

  it("summary actions scroll to stable finding and cap detail targets", async () => {
    const scrollSpy = vi.spyOn(window, "scrollTo").mockImplementation(() => undefined);
    const base = createMockResponse();
    globalThis.fetch = vi.fn().mockResolvedValue({
      json: () =>
        Promise.resolve(
          createMockResponse({
            appliedCaps: [
              {
                capId: "CAP-NOINDEX",
                reason: "Page has noindex directive",
                maxScore: 40,
                applied: true,
              },
            ],
            findings: [
              {
                ...base.data.findings[0],
                checkId: "META-006",
                summary: "No canonical tag found",
                effort: "low",
              },
            ],
          }),
        ),
    });

    const { default: ResultPage } = await import("@/app/result/page");
    render(<ResultPage />);

    fireEvent.click(await screen.findByRole("button", { name: "View detailed issue" }));
    expect(document.getElementById("score-cap-details")).toBeInTheDocument();
    expect(scrollSpy).toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "View quick win" }));
    expect(document.getElementById("finding-META-006")).toBeInTheDocument();
    expect(scrollSpy).toHaveBeenCalledTimes(2);
  });

  it("summary text has explicit spaces and score cards use whole-number precision", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      json: () =>
        Promise.resolve(
          createMockResponse({
            scoreFamilies: [
              {
                family: "seo-health",
                name: "SEO Health",
                rawScore: 40.2,
                cappedScore: 40.2,
                confidence: 100,
              },
              {
                family: "accessibility",
                name: "Accessibility",
                rawScore: 77.5,
                cappedScore: 77.5,
                confidence: 90,
              },
              {
                family: "security-trust",
                name: "Security & Trust",
                rawScore: 74.85,
                cappedScore: 74.85,
                confidence: 100,
              },
              {
                family: "aeo-readiness",
                name: "AEO Readiness",
                rawScore: 96.35,
                cappedScore: 96.35,
                confidence: 100,
              },
              {
                family: "geo-readiness",
                name: "GEO Readiness",
                rawScore: 90.91,
                cappedScore: 90.91,
                confidence: 100,
              },
            ],
          }),
        ),
    });

    const { default: ResultPage } = await import("@/app/result/page");
    render(<ResultPage />);

    await waitFor(() => {
      expect(screen.getByText(/3 applicable checks/)).toBeInTheDocument();
    });
    expect(
      screen.getByText(
        /3 applicable checks · 0 not applicable or unavailable · 2 quick wins within 2 actionable issues/,
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText("77.5")).not.toBeInTheDocument();
    expect(screen.queryByText("74.85")).not.toBeInTheDocument();
    expect(screen.getAllByText("78").length).toBeGreaterThan(0);
    expect(screen.getAllByText("75").length).toBeGreaterThan(0);
  });

  it("rescans the current final URL once and preserves keyword", async () => {
    mockSearchParams = new URLSearchParams(
      `url=${encodeURIComponent(mockUrl)}&keyword=${encodeURIComponent("technical seo")}`,
    );
    const second = deferredResponse();
    globalThis.fetch = vi
      .fn()
      .mockResolvedValueOnce(
        createJsonResponse(createMockResponse({ finalUrl: "https://example.com/final" })),
      )
      .mockReturnValueOnce(second.promise);

    const { default: ResultPage } = await import("@/app/result/page");
    render(<ResultPage />);

    const rescan = await screen.findByRole("button", { name: "Rescan this URL" });
    expect(screen.getAllByRole("button", { name: "Rescan this URL" })).toHaveLength(1);
    fireEvent.click(rescan);
    fireEvent.click(rescan);

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledTimes(2);
    });
    const secondBody = JSON.parse(String(vi.mocked(globalThis.fetch).mock.calls[1]?.[1]?.body));
    expect(secondBody).toEqual({ url: "https://example.com/final", keyword: "technical seo" });
    expect(screen.getByText(/Analyzing your website/i)).toBeInTheDocument();

    second.resolve(
      createJsonResponse(createMockResponse({ finalUrl: "https://example.com/rescanned" })),
    );
    await waitFor(() => {
      expect(screen.getByText("https://example.com/rescanned")).toBeInTheDocument();
    });
  });

  it("uses an opaque sticky report navigation mask", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve(createMockResponse()),
    });

    const { default: ResultPage } = await import("@/app/result/page");
    render(<ResultPage />);

    const nav = await screen.findByTestId("report-navigation");
    expect(nav).toHaveClass("bg-bg-primary");
    expect(nav.className).toContain("shadow-[0_-18px_0_18px_var(--color-bg-primary)");
  });

  it("shows stable check IDs in compact All Checks rows", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve(createMockResponse()),
    });

    const { default: ResultPage } = await import("@/app/result/page");
    render(<ResultPage />);

    await waitFor(() => {
      expect(screen.getAllByText("META-001").length).toBeGreaterThan(0);
    });
    expect(screen.getAllByText("A11Y-001").length).toBeGreaterThan(0);
  });

  it("shows error state when audit fails", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      json: () =>
        Promise.resolve({
          success: false,
          requestId: "err-123",
          error: { code: "RATE_LIMITED", message: "Too many requests" },
        }),
    });

    const { default: ResultPage } = await import("@/app/result/page");
    render(<ResultPage />);

    await waitFor(() => {
      expect(screen.getByText(/audit failed/i)).toBeInTheDocument();
    });
  });

  it("setup cleanup setup performs a working second request", async () => {
    globalThis.fetch = createAbortAwareFetch(createMockResponse());

    const { default: ResultPage } = await import("@/app/result/page");
    render(
      <StrictMode>
        <ResultPage />
      </StrictMode>,
    );

    await waitFor(() => {
      expect(screen.getAllByText("SEO Health").length).toBeGreaterThan(0);
    });
    expect(globalThis.fetch).toHaveBeenCalledTimes(2);
  });

  it("aborted obsolete request does not update state", async () => {
    const first = deferredResponse();
    const second = deferredResponse();
    globalThis.fetch = vi
      .fn()
      .mockReturnValueOnce(first.promise)
      .mockReturnValueOnce(second.promise);

    const { default: ResultPage } = await import("@/app/result/page");
    const { rerender } = render(<ResultPage />);

    mockSearchParams = new URLSearchParams(`url=${encodeURIComponent("https://second.example")}`);
    rerender(<ResultPage />);

    first.resolve(createJsonResponse(createMockResponse({ finalUrl: "https://first.example" })));
    second.resolve(createJsonResponse(createMockResponse({ finalUrl: "https://second.example" })));

    await waitFor(() => {
      expect(screen.getByText("https://second.example")).toBeInTheDocument();
    });
    expect(screen.queryByText("https://first.example")).not.toBeInTheDocument();
  });

  it("HTTP 502 JSON response exits loading and displays public message", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      createJsonResponse(
        {
          success: false,
          requestId: "dns-123",
          error: {
            code: "DNS_RESOLUTION_FAILED",
            message: "DNS resolution failed for nexoracreation.com: no records found",
          },
        },
        false,
        502,
      ),
    );

    const { default: ResultPage } = await import("@/app/result/page");
    render(<ResultPage />);

    await waitFor(() => {
      expect(
        screen.getByText("DNS resolution failed for nexoracreation.com: no records found"),
      ).toBeInTheDocument();
    });
    expect(screen.queryByText("Analyzing your website")).not.toBeInTheDocument();
  });

  it("non-JSON HTTP response exits loading", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 502,
      json: () => Promise.reject(new Error("not json")),
    });

    const { default: ResultPage } = await import("@/app/result/page");
    render(<ResultPage />);

    await waitFor(() => {
      expect(
        screen.getByText("The audit service returned an unreadable response."),
      ).toBeInTheDocument();
    });
  });

  it("network rejection exits loading", async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error("network down"));

    const { default: ResultPage } = await import("@/app/result/page");
    render(<ResultPage />);

    await waitFor(() => {
      expect(
        screen.getByText("Network error. Please check your connection and try again."),
      ).toBeInTheDocument();
    });
  });

  it("successful response exits loading", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(createJsonResponse(createMockResponse()));

    const { default: ResultPage } = await import("@/app/result/page");
    render(<ResultPage />);

    await waitFor(() => {
      expect(screen.getAllByText("SEO Health").length).toBeGreaterThan(0);
    });
    expect(screen.queryByText("Analyzing your website")).not.toBeInTheDocument();
  });

  it("Retry starts a new request", async () => {
    globalThis.fetch = vi
      .fn()
      .mockResolvedValueOnce(
        createJsonResponse(
          {
            success: false,
            requestId: "err-123",
            error: { code: "FETCH_FAILED", message: "Temporary failure" },
          },
          false,
          502,
        ),
      )
      .mockResolvedValueOnce(createJsonResponse(createMockResponse()));

    const { default: ResultPage } = await import("@/app/result/page");
    render(<ResultPage />);

    await waitFor(() => {
      expect(screen.getByText("Temporary failure")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));

    await waitFor(() => {
      expect(screen.getAllByText("SEO Health").length).toBeGreaterThan(0);
    });
    expect(globalThis.fetch).toHaveBeenCalledTimes(2);
  });

  it("missing URL exits loading with a clear error", async () => {
    mockSearchParams = new URLSearchParams();
    globalThis.fetch = vi.fn();

    const { default: ResultPage } = await import("@/app/result/page");
    render(<ResultPage />);

    await waitFor(() => {
      expect(screen.getByText("Enter a website URL to run an audit.")).toBeInTheDocument();
    });
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("has noindex meta tag", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve(createMockResponse()),
    });

    const { default: ResultPage } = await import("@/app/result/page");
    render(<ResultPage />);

    await waitFor(() => {
      expect(screen.getAllByText("SEO Health").length).toBeGreaterThan(0);
    });

    const meta = document.querySelector('meta[name="robots"]');
    expect(meta).toBeTruthy();
    expect(meta?.getAttribute("content")).toBe("noindex");
  });

  it("renders Nexora CTA section", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve(createMockResponse()),
    });

    const { default: ResultPage } = await import("@/app/result/page");
    render(<ResultPage />);

    await waitFor(() => {
      expect(screen.getByText(/Ready for the next audit/i)).toBeInTheDocument();
    });
  });

  it("shows horizontally scrollable report navigation", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve(createMockResponse()),
    });

    const { default: ResultPage } = await import("@/app/result/page");
    render(<ResultPage />);

    await waitFor(() => {
      expect(screen.getAllByText("SEO Health").length).toBeGreaterThan(0);
    });

    expect(screen.getByRole("button", { name: "Search & Social" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Audit Summary" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Actionable Issues" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "All Checks" })).toBeInTheDocument();
  });

  it("renders affected page and structured evidence for findings", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve(createMockResponse()),
    });

    const { default: ResultPage } = await import("@/app/result/page");
    render(<ResultPage />);

    await waitFor(() => {
      expect(screen.getAllByText("Missing meta description").length).toBeGreaterThan(0);
    });

    fireEvent.click(screen.getAllByRole("button", { name: /Missing meta description/i })[0]);
    expect(screen.getByText("Affected Page")).toBeInTheDocument();
    expect(screen.getByText("Pathname: /")).toBeInTheDocument();
    expect(screen.getByText("Observed")).toBeInTheDocument();
    expect(screen.getByText("missing")).toBeInTheDocument();
    expect(screen.getByText("Expected State")).toBeInTheDocument();
    expect(screen.getByText("Present and descriptive metadata")).toBeInTheDocument();
    expect(screen.getByText("Technical metadata")).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Open Page" })).toHaveLength(1);
  });

  it("derives summary and group counts from displayed checks, not aggregate stateCounts", async () => {
    const base = createMockResponse();
    const baseFindings = base.data.findings;
    const normalizedResponse = createMockResponse({
      stateCounts: { passed: 80, warning: 10, failed: 5, "not-applicable": 20, unavailable: 5 },
      findings: [
        baseFindings[0],
        baseFindings[1],
        baseFindings[2],
        {
          ...baseFindings[1],
          checkId: "FAQ-001",
          state: "not-applicable",
          summary: "FAQ schema not required",
          scored: false,
        },
        {
          ...baseFindings[1],
          checkId: "PSI-001",
          state: "unavailable",
          summary: "PageSpeed diagnostics unavailable",
          scored: false,
        },
      ],
    });

    globalThis.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve(normalizedResponse),
    });

    const { default: ResultPage } = await import("@/app/result/page");
    render(<ResultPage />);

    await waitFor(() => {
      expect(screen.getByText("Checks evaluated")).toBeInTheDocument();
    });

    expect(screen.getByText(/3 applicable checks/)).toBeInTheDocument();
    expect(screen.getByText(/2 not applicable or unavailable/)).toBeInTheDocument();
    expect(screen.getAllByText(/2 quick wins within 2 actionable issues/).length).toBeGreaterThan(
      0,
    );
    expect(screen.getByRole("heading", { name: /Actionable Issues/i })).toHaveTextContent("2");
    expect(screen.getByText("2 quick wins within 2 actionable issues.")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Report section"), { target: { value: "findings" } });
    expect(screen.getByText("Showing 5 of 5 checks")).toBeInTheDocument();
    expect(screen.getAllByText("Failed").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Warnings").length).toBeGreaterThan(0);
    expect(screen.getByText("Passed checks")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Passed checks/i })).toHaveTextContent("1");
    expect(screen.getByRole("button", { name: /Not applicable/i })).toHaveTextContent("1");
    expect(screen.getByRole("button", { name: /Unavailable checks/i })).toHaveTextContent("1");
    expect(screen.queryByRole("link", { name: /Title tag is present/i })).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Filter by state"), { target: { value: "failed" } });
    expect(screen.getByText("Showing 1 of 5 checks")).toBeInTheDocument();
  });

  it("uses real response fields in Search/Social previews", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve(createMockResponse()),
    });

    const { default: ResultPage } = await import("@/app/result/page");
    render(<ResultPage />);

    await waitFor(() => {
      expect(screen.getByText("Real SERP Title")).toBeInTheDocument();
    });
    expect(screen.getByText("Real meta description for the result page")).toBeInTheDocument();
    expect(screen.getByText("Real OG Title")).toBeInTheDocument();
    expect(screen.getByText("Real OG Description")).toBeInTheDocument();
  });

  it("no body-level horizontal overflow", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve(createMockResponse()),
    });

    const { default: ResultPage } = await import("@/app/result/page");
    render(<ResultPage />);

    await waitFor(() => {
      expect(screen.getAllByText("SEO Health").length).toBeGreaterThan(0);
    });

    const body = document.body;
    expect(body.scrollWidth).toBeLessThanOrEqual(body.clientWidth + 1);
  });

  it("renders filter drawer open button", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve(createMockResponse()),
    });

    const { default: ResultPage } = await import("@/app/result/page");
    render(<ResultPage />);

    await waitFor(() => {
      expect(screen.getByLabelText("Open filters")).toBeInTheDocument();
    });

    const filterBtn = screen.getByLabelText("Open filters");
    expect(filterBtn).toHaveTextContent(/Filters/);
  });

  it("renders one full Performance diagnostics panel", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve(createMockResponse()),
    });

    const { default: ResultPage } = await import("@/app/result/page");
    render(<ResultPage />);

    await waitFor(() => {
      expect(screen.getAllByText("Performance diagnostics")).toHaveLength(1);
    });
    expect(screen.getByText("Performance summary")).toBeInTheDocument();
  });

  it("no unexpected console errors", async () => {
    const spy = vi.spyOn(console, "error");
    globalThis.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve(createMockResponse()),
    });

    const { default: ResultPage } = await import("@/app/result/page");
    render(<ResultPage />);

    await waitFor(() => {
      expect(screen.getAllByText("SEO Health").length).toBeGreaterThan(0);
    });
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });
});
