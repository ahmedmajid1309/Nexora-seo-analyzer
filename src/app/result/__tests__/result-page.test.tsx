import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";

const mockUrl = "https://example.com";
let mockSearchParams = new URLSearchParams(`url=${encodeURIComponent(mockUrl)}`);

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
