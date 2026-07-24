import type { PSILighthouseResult, PSIAuditMetric } from "./schemas";
import type { PageSpeedLabMetrics } from "./types";

interface NumericAudit {
  numericValue?: number;
  score: number | null;
}

function extractNumeric(audit: PSIAuditMetric | undefined): NumericAudit | null {
  if (!audit) return null;
  return {
    numericValue: audit.numericValue,
    score: audit.score ?? 0,
  };
}

function scoreToPercentage(score: number | null): number {
  if (score === null) return 0;
  return Math.round(score * 100);
}

function categoryScore(
  categories: Record<string, { score?: number | null }> | undefined,
  id: string,
): number | null {
  const cat = categories?.[id];
  if (cat === undefined || cat === null) return null;
  if (cat.score === null || cat.score === undefined) return null;
  return scoreToPercentage(cat.score);
}

export function extractLabMetrics(lhr: PSILighthouseResult): PageSpeedLabMetrics {
  const audits = lhr.audits;

  const lcpAudit = extractNumeric(audits?.["largest-contentful-paint"]);
  const clsAudit = extractNumeric(audits?.["cumulative-layout-shift"]);
  const tbtAudit = extractNumeric(audits?.["total-blocking-time"]);
  const siAudit = extractNumeric(audits?.["speed-index"]);
  const fcpAudit = extractNumeric(audits?.["first-contentful-paint"]);

  const categories = lhr.categories as Record<string, { score?: number | null }> | undefined;

  return {
    lcp: lcpAudit
      ? { value: lcpAudit.numericValue ?? 0, score: scoreToPercentage(lcpAudit.score) }
      : null,
    cls: clsAudit
      ? { value: clsAudit.numericValue ?? 0, score: scoreToPercentage(clsAudit.score) }
      : null,
    tbt: tbtAudit
      ? { value: tbtAudit.numericValue ?? 0, score: scoreToPercentage(tbtAudit.score) }
      : null,
    si: siAudit
      ? { value: siAudit.numericValue ?? 0, score: scoreToPercentage(siAudit.score) }
      : null,
    fcp: fcpAudit
      ? { value: fcpAudit.numericValue ?? 0, score: scoreToPercentage(fcpAudit.score) }
      : null,
    performanceScore: categoryScore(categories, "performance"),
    lighthouseAccessibilityScore: categoryScore(categories, "accessibility"),
    lighthouseSeoScore: categoryScore(categories, "seo"),
    lighthouseBestPracticesScore: categoryScore(categories, "best-practices"),
  };
}
