import { describe, expect, it } from "vitest";
import { analyzeCrossPage } from "../cross-page";
import type { SitePageResult } from "../types";
import type { RuleResult } from "@/lib/rules/types";

function page(partial: Partial<SitePageResult>): SitePageResult {
  return {
    requestedUrl: partial.requestedUrl ?? "https://example.com/",
    finalUrl: partial.finalUrl ?? partial.requestedUrl ?? "https://example.com/",
    status: "audited",
    responseStatus: 200,
    title: "Title",
    description: "Description",
    canonical: partial.finalUrl ?? partial.requestedUrl ?? "https://example.com/",
    depth: 1,
    headings: { h1: ["Heading"], h2Count: 0, total: 1 },
    links: { internal: 1, external: 0, brokenInternal: [] },
    findings: [],
    ruleResults: [],
    scoreFamilies: [],
    criticalIssueCount: 0,
    warningCount: 0,
    crawlState: "selected",
    failureReason: null,
    redirectChain: [],
    ...partial,
  };
}

describe("Phase 11 cross-page analysis", () => {
  it("finds duplicate titles, descriptions, H1s, and canonical conflicts", () => {
    const findings = analyzeCrossPage(
      [
        page({
          requestedUrl: "https://example.com/a",
          finalUrl: "https://example.com/a",
          title: "Same",
          description: "Same desc",
          headings: { h1: ["Same H1"], h2Count: 0, total: 1 },
          canonical: "https://example.com/c",
        }),
        page({
          requestedUrl: "https://example.com/b",
          finalUrl: "https://example.com/b",
          title: "Same",
          description: "Same desc",
          headings: { h1: ["Same H1"], h2Count: 0, total: 1 },
          canonical: "https://example.com/c",
        }),
      ],
      [],
    );
    expect(findings.some((f) => f.title === "Duplicate page titles")).toBe(true);
    expect(findings.some((f) => f.title === "Duplicate meta descriptions")).toBe(true);
    expect(findings.some((f) => f.title === "Duplicate H1 patterns")).toBe(true);
    expect(findings.some((f) => f.title === "Multiple pages share one canonical target")).toBe(
      true,
    );
  });

  it("labels orphan findings as candidates", () => {
    const findings = analyzeCrossPage(
      [
        page({ requestedUrl: "https://example.com/a", finalUrl: "https://example.com/a" }),
        page({ requestedUrl: "https://example.com/b", finalUrl: "https://example.com/b" }),
      ],
      ["https://example.com/a", "https://example.com/b", "https://example.com/orphan"],
    );
    const orphan = findings.find((f) => f.checkId === "SITE-010");
    expect(orphan?.title).toContain("Orphan candidates");
    expect(orphan?.confidence).toBeLessThan(100);
  });

  it("detects repeated template-level failures", () => {
    const ruleResults: RuleResult[] = [
      {
        checkId: "META-007",
        state: "failed",
        category: "metadata",
        severity: "low",
        scored: true,
        evidence: { summary: "Missing canonical", observedValue: null, expectedValue: "canonical" },
        remediation: { summary: "Add canonical", steps: ["Add tag"], responsible: "developer" },
        impact: "",
        effort: "low",
        confidence: 100,
        source: "html-parse",
      },
    ];
    const findings = analyzeCrossPage(
      [
        page({ requestedUrl: "https://example.com/a", ruleResults: [...ruleResults] }),
        page({ requestedUrl: "https://example.com/b", ruleResults: [...ruleResults] }),
        page({ requestedUrl: "https://example.com/c", ruleResults: [...ruleResults] }),
      ],
      [],
    );
    expect(findings.some((f) => f.checkId === "SITE-013-META-007")).toBe(true);
  });
});
