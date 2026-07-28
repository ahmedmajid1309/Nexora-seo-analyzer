import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import SiteResultPage from "../page";
import type { SiteAuditResponseData } from "@/lib/site-audit/types";

let mockSearchParams = new URLSearchParams("url=https%3A%2F%2Fexample.com&pageLimit=3");

vi.mock("next/navigation", () => ({
  useSearchParams: () => mockSearchParams,
}));

function data(): SiteAuditResponseData {
  return {
    requestId: "req",
    auditType: "site",
    requestedUrl: "https://example.com",
    normalizedOrigin: "https://example.com",
    startedAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
    durationMs: 10,
    pageLimit: 3,
    crawlMode: "links-and-sitemap",
    progress: [
      {
        state: "complete",
        discoveredPageCount: 3,
        selectedPageCount: 2,
        completedPageCount: 2,
        failedPageCount: 0,
        currentPathname: null,
        elapsedMs: 10,
      },
    ],
    decisions: [],
    pages: [
      {
        requestedUrl: "https://example.com/a",
        finalUrl: "https://example.com/a",
        status: "audited",
        responseStatus: 200,
        title: "Alpha",
        description: "Alpha description",
        canonical: "https://example.com/a",
        depth: 0,
        headings: { h1: ["Alpha"], h2Count: 0, total: 1 },
        links: { internal: 1, external: 0, brokenInternal: [] },
        findings: [],
        ruleResults: [],
        scoreFamilies: [
          {
            family: "seo-health",
            name: "SEO Health",
            rawScore: 80,
            cappedScore: 80,
            confidence: 100,
          },
        ],
        criticalIssueCount: 0,
        warningCount: 0,
        crawlState: "selected",
        failureReason: null,
        redirectChain: [],
      },
      {
        requestedUrl: "https://example.com/b",
        finalUrl: "https://example.com/b",
        status: "audited",
        responseStatus: 200,
        title: "Beta",
        description: null,
        canonical: null,
        depth: 1,
        headings: { h1: ["Beta"], h2Count: 0, total: 1 },
        links: { internal: 0, external: 1, brokenInternal: [] },
        findings: [],
        ruleResults: [],
        scoreFamilies: [
          {
            family: "seo-health",
            name: "SEO Health",
            rawScore: 60,
            cappedScore: 60,
            confidence: 100,
          },
        ],
        criticalIssueCount: 1,
        warningCount: 2,
        crawlState: "selected",
        failureReason: null,
        redirectChain: [],
      },
    ],
    siteFindings: [
      {
        checkId: "SITE-004",
        title: "Missing meta descriptions",
        state: "warning",
        severity: "medium",
        affectedPageUrls: ["https://example.com/b"],
        evidence: "1 page missing description.",
        impact: "SERP snippets may be weak.",
        remediation: "Add descriptions.",
        responsibleRole: "content-editor",
        effort: "low",
        confidence: 90,
        applicability: "Site audit.",
      },
    ],
    aggregate: {
      siteHealthScore: 76,
      averageAuditedPageScore: 70,
      crossPageHealthScore: 90,
      coverageScore: 100,
      confidence: 95,
      coverage: { discovered: 3, selected: 2, audited: 2, failed: 0, skipped: 0, blocked: 0 },
      appliedCaps: [],
      explanation: "Site health = formula.",
    },
    repeatedTemplateIssues: [],
    duplicateMetadataGroups: [],
    internalLinkFindings: [],
    redirectFindings: [],
    orphanCandidates: [],
  };
}

describe("site report page", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mockSearchParams = new URLSearchParams("url=https%3A%2F%2Fexample.com&pageLimit=3");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        json: vi.fn().mockResolvedValue({ success: true, requestId: "req", data: data() }),
      }),
    );
    vi.stubGlobal("scrollTo", vi.fn());
    vi.stubGlobal("print", vi.fn());
  });

  it("renders aggregate score, findings, and page inventory", async () => {
    render(<SiteResultPage />);
    expect(screen.getByText(/Running limited site audit/i)).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText("https://example.com")).toBeInTheDocument());
    expect(screen.getByText("76")).toBeInTheDocument();
    expect(screen.getByText("Missing meta descriptions")).toBeInTheDocument();
    expect(screen.getByText("Alpha")).toBeInTheDocument();
  });

  it("filters page inventory and exposes print support", async () => {
    render(<SiteResultPage />);
    await waitFor(() => expect(screen.getByText("Alpha")).toBeInTheDocument());
    fireEvent.change(screen.getByLabelText("Filter pages"), { target: { value: "beta" } });
    expect(screen.queryByText("Alpha")).not.toBeInTheDocument();
    expect(screen.getByText("Beta")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Export \/ Print Report/i }));
    expect(window.print).toHaveBeenCalled();
  });
});
