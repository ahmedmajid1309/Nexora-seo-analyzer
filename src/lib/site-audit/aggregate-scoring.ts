import type { SiteAggregateScore, SiteLevelFinding, SitePageResult } from "./types";

const SEVERITY_PENALTY = {
  critical: 25,
  high: 14,
  medium: 8,
  low: 3,
  informational: 0,
} as const;

export function calculateSiteAggregate(input: {
  pages: SitePageResult[];
  findings: SiteLevelFinding[];
  discoveredCount: number;
  selectedCount: number;
}): SiteAggregateScore {
  const audited = input.pages.filter((p) => p.status === "audited");
  const failed = input.pages.filter((p) => p.status === "failed").length;
  const skipped = input.pages.filter((p) => p.status === "skipped").length;
  const blocked = input.pages.filter((p) => p.status === "blocked").length;
  const seoScores = audited
    .map((p) => p.scoreFamilies.find((f) => f.family === "seo-health")?.cappedScore)
    .filter((score): score is number => typeof score === "number");
  const averageAuditedPageScore = seoScores.length
    ? Math.round((seoScores.reduce((sum, score) => sum + score, 0) / seoScores.length) * 100) / 100
    : 0;

  const penalty = input.findings.reduce((sum, finding) => {
    if (finding.state !== "failed" && finding.state !== "warning") return sum;
    const spread = Math.min(finding.affectedPageUrls.length / Math.max(audited.length, 1), 1);
    const templateCap = finding.checkId.startsWith("SITE-013") ? 2 : 1;
    return sum + SEVERITY_PENALTY[finding.severity] * Math.max(0.4, spread) * templateCap;
  }, 0);
  const crossPageHealthScore = Math.max(0, Math.round(100 - penalty));
  const coverageScore = input.selectedCount
    ? Math.round((audited.length / input.selectedCount) * 100)
    : 0;
  const siteHealthScore = Math.round(
    averageAuditedPageScore * 0.65 + crossPageHealthScore * 0.25 + coverageScore * 0.1,
  );
  const confidence = Math.max(
    0,
    Math.min(
      100,
      Math.round(coverageScore * 0.7 + Math.min(input.discoveredCount, input.selectedCount) * 1.2),
    ),
  );

  return {
    siteHealthScore,
    averageAuditedPageScore,
    crossPageHealthScore,
    coverageScore,
    confidence,
    coverage: {
      discovered: input.discoveredCount,
      selected: input.selectedCount,
      audited: audited.length,
      failed,
      skipped,
      blocked,
    },
    appliedCaps:
      input.selectedCount > 0 && audited.length / input.selectedCount < 0.5
        ? [
            {
              capId: "SITE-COVERAGE-LOW",
              reason:
                "Less than half of selected pages completed; confidence is reduced and coverage is reported separately.",
              maxScore: siteHealthScore,
              applied: true,
            },
          ]
        : [],
    explanation:
      "Site health = 65% audited-page SEO average + 25% verified cross-page health + 10% crawl coverage. Failed or unavailable pages reduce coverage/confidence, not page score as zero.",
  };
}
