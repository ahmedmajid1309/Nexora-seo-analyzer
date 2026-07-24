import type { PSILoadingExperience } from "./schemas";
import type { PageSpeedFieldData } from "./types";

interface CrUXMetric {
  percentile?: number;
  category?: string;
}

function extractCrUXMetric(
  metrics: Record<string, unknown> | undefined,
  metricName: string,
): { p75: number; category: string } | null {
  if (!metrics) return null;
  const raw = metrics[metricName] as CrUXMetric | undefined;
  if (!raw) return null;
  return {
    p75: raw.percentile ?? 0,
    category: raw.category ?? "UNKNOWN",
  };
}

export function extractFieldData(
  loadingExperience: PSILoadingExperience | undefined,
): PageSpeedFieldData | null {
  if (!loadingExperience) return null;

  const metrics = loadingExperience.metrics as Record<string, unknown> | undefined;

  const lcp = extractCrUXMetric(metrics, "LARGEST_CONTENTFUL_PAINT_MS");
  const cls = extractCrUXMetric(metrics, "CUMULATIVE_LAYOUT_SHIFT_SCORE");
  const inp = extractCrUXMetric(metrics, "INTERACTION_TO_NEXT_PAINT");
  const fcp = extractCrUXMetric(metrics, "FIRST_CONTENTFUL_PAINT_MS");

  return {
    lcp: lcp ? { p75Ms: lcp.p75, category: lcp.category } : null,
    cls: cls ? { p75: cls.p75, category: cls.category } : null,
    inp: inp ? { p75Ms: inp.p75, category: inp.category } : null,
    fcp: fcp ? { p75Ms: fcp.p75, category: fcp.category } : null,
    overallCategory: loadingExperience.overall_category ?? "UNKNOWN",
  };
}
