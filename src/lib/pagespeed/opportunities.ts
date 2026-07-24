import type { PSILighthouseResult, PSIAuditMetric } from "./schemas";
import type { PageSpeedOpportunity } from "./types";

interface DetailItem {
  url?: string;
  [key: string]: unknown;
}

function extractDetails(audit: PSIAuditMetric): string[] {
  const details = audit.details as Record<string, unknown> | undefined;
  if (!details) return [];

  const items = details.items as DetailItem[] | undefined;
  if (!items || !Array.isArray(items)) return [];

  return items.slice(0, 10).map((item) => {
    if (item.url) return item.url;
    return JSON.stringify(item);
  });
}

function extractSavings(audit: PSIAuditMetric): number | null {
  const details = audit.details as Record<string, unknown> | undefined;
  if (!details) return null;
  const overallSavingsMs = details.overallSavingsMs as number | undefined;
  return overallSavingsMs ?? null;
}

export function extractOpportunities(lhr: PSILighthouseResult): PageSpeedOpportunity[] {
  const audits = lhr.audits;
  if (!audits) return [];

  return Object.values(audits)
    .filter((a) => a.score !== null && a.score < 0.99 && (a.details !== undefined || a.score < 0.9))
    .map((a) => ({
      id: a.id,
      title: a.title,
      description: a.description,
      score: a.score !== null ? Math.round(a.score * 100) : 0,
      estimatedSavingsMs: extractSavings(a),
      details: extractDetails(a),
    }))
    .sort((a, b) => a.score - b.score)
    .slice(0, 20);
}

export function extractDiagnostics(lhr: PSILighthouseResult): PageSpeedOpportunity[] {
  const audits = lhr.audits;
  if (!audits) return [];

  return Object.values(audits)
    .filter((a) => a.score !== null && a.score >= 0.99 && !a.details)
    .slice(0, 10)
    .map((a) => ({
      id: a.id,
      title: a.title,
      description: a.description,
      score: a.score !== null ? Math.round(a.score * 100) : 0,
      estimatedSavingsMs: null,
      details: [],
    }));
}
