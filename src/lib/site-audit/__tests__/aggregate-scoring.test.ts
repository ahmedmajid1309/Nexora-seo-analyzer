import { describe, expect, it } from "vitest";
import { calculateSiteAggregate } from "../aggregate-scoring";
import type { SiteLevelFinding, SitePageResult } from "../types";

function scoredPage(score: number, status: SitePageResult["status"] = "audited"): SitePageResult {
  return {
    requestedUrl: `https://example.com/${score}`,
    finalUrl: `https://example.com/${score}`,
    status,
    responseStatus: status === "audited" ? 200 : null,
    title: "Page",
    description: "Desc",
    canonical: null,
    depth: 1,
    headings: { h1: ["Page"], h2Count: 0, total: 1 },
    links: { internal: 0, external: 0, brokenInternal: [] },
    findings: [],
    ruleResults: [],
    scoreFamilies:
      status === "audited"
        ? [
            {
              family: "seo-health",
              name: "SEO Health",
              rawScore: score,
              cappedScore: score,
              confidence: 100,
            },
          ]
        : [],
    criticalIssueCount: 0,
    warningCount: 0,
    crawlState: status === "audited" ? "selected" : "failed",
    failureReason: status === "audited" ? null : "Timeout",
    redirectChain: [],
  };
}

const highFinding: SiteLevelFinding = {
  checkId: "SITE-001-1",
  title: "Duplicate titles",
  state: "failed",
  severity: "high",
  affectedPageUrls: ["https://example.com/a", "https://example.com/b"],
  evidence: "Verified duplicate titles.",
  impact: "Search differentiation suffers.",
  remediation: "Write unique titles.",
  responsibleRole: "content-editor",
  effort: "medium",
  confidence: 90,
  applicability: "Site audit.",
};

describe("Phase 11 aggregate scoring", () => {
  it("does not treat failed pages as zero page scores", () => {
    const aggregate = calculateSiteAggregate({
      pages: [scoredPage(80), scoredPage(90), scoredPage(0, "failed")],
      findings: [],
      discoveredCount: 3,
      selectedCount: 3,
    });
    expect(aggregate.averageAuditedPageScore).toBe(85);
    expect(aggregate.coverageScore).toBe(67);
    expect(aggregate.siteHealthScore).toBeGreaterThan(75);
  });

  it("accounts for cross-page findings and exposes coverage separately", () => {
    const aggregate = calculateSiteAggregate({
      pages: [scoredPage(90), scoredPage(90)],
      findings: [highFinding],
      discoveredCount: 8,
      selectedCount: 2,
    });
    expect(aggregate.crossPageHealthScore).toBeLessThan(100);
    expect(aggregate.coverage.discovered).toBe(8);
    expect(aggregate.explanation).toContain("65% audited-page SEO average");
  });
});
