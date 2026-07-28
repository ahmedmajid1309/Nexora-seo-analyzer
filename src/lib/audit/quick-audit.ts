import { buildPageSnapshot } from "@/lib/extraction";
import type { PageSnapshot } from "@/lib/extraction/types";
import { safeFetch } from "@/lib/network";
import type { SafeFetchOptions } from "@/lib/network/safe-fetch";
import type { PageSpeedOutput } from "@/lib/pagespeed/types";
import { runAll, getRuleCount } from "@/lib/rules";
import type { RuleResult } from "@/lib/rules/types";
import { calculateScores } from "@/lib/rules/scoring/engine";
import { CALCULATION_VERSION, type ScoreBreakdown } from "@/lib/rules/scoring/types";
import { buildQuickEvidencePack, generateAiExecutiveSummary } from "@/lib/ai-summary";
import type { AuditResponseData } from "./types";

function sourceForRule(
  result: RuleResult,
): AuditResponseData["findings"][number]["evidence"]["source"] {
  if (result.source === "http-response") return "response-header";
  if (result.source === "rendered-dom") return "rendered-dom";
  if (result.source === "external-api") return "pagespeed";
  if (result.category === "url") return "url";
  return "static-html";
}

function pageContext(snapshot: PageSnapshot): AuditResponseData["findings"][number]["page"] {
  let pathname = "/";
  try {
    pathname = new URL(snapshot.finalUrl).pathname || "/";
  } catch {}
  return {
    requestedUrl: snapshot.requestedUrl,
    finalUrl: snapshot.finalUrl,
    pathname,
    pageTitle: snapshot.document.title,
  };
}

function stringifyExpected(result: RuleResult): string | null {
  const value = result.evidence.expectedValue;
  if (value === null || value === undefined) return null;
  return String(value);
}

function observedValueFor(result: RuleResult): string | number | boolean | string[] | null {
  if (result.checkId === "META-007" && result.state === "failed")
    return "Canonical tag is missing.";
  if (result.evidence.observedValue !== null && result.evidence.observedValue !== undefined)
    return result.evidence.observedValue;
  if (result.evidence.samples?.length) return result.evidence.samples.slice(0, 5);
  return null;
}

function elementSnippetFor(result: RuleResult): string | null {
  if (result.evidence.samples?.length) return result.evidence.samples.slice(0, 3).join(" | ");
  return null;
}

function unavailableReasonFor(result: RuleResult): string | null {
  if (result.unavailableReason) return result.unavailableReason;
  const observed = observedValueFor(result);
  if ((result.state === "failed" || result.state === "warning") && observed === null) {
    return "This rule did not emit a discrete observed value; use the evidence summary and selector/snippet when present.";
  }
  return null;
}

function expectedValueFor(result: RuleResult): string | null {
  if (result.checkId === "META-007") {
    return "A self-referencing canonical URL matching the preferred final page URL.";
  }
  if (typeof result.evidence.expectedValue === "boolean") return result.evidence.summary;
  return stringifyExpected(result) ?? result.evidence.summary;
}

function remediationSummaryFor(result: RuleResult, snapshot: PageSnapshot): string {
  if (result.checkId === "META-007" && result.state === "failed") {
    return `Insert <link rel="canonical" href="${snapshot.finalUrl}" /> inside the document head.`;
  }
  return result.remediation.summary;
}

function firstMetadata(snapshot: PageSnapshot, name: string): string | null {
  const entry = snapshot.metadata.find((m) => m.name.toLowerCase() === name.toLowerCase());
  return entry?.normalizedValue?.trim() || entry?.rawValue?.trim() || null;
}

function firstOpenGraph(snapshot: PageSnapshot, property: string): string | null {
  return (
    snapshot.social.openGraph
      .find((entry) => entry.property.toLowerCase() === property.toLowerCase())
      ?.content.trim() || null
  );
}

function firstTwitter(snapshot: PageSnapshot, name: string): string | null {
  return (
    snapshot.social.twitter
      .find((entry) => entry.name.toLowerCase() === name.toLowerCase())
      ?.content.trim() || null
  );
}

export function resolveAgainstFinalUrl(value: string | null, finalUrl: string): string | null {
  if (!value) return null;
  try {
    return new URL(value, finalUrl).toString();
  } catch {
    return null;
  }
}

export function buildPreviewData(
  snapshot: PageSnapshot,
): Pick<AuditResponseData, "serpPreview" | "socialPreview"> {
  const metaDescription = firstMetadata(snapshot, "description");
  const canonicalUrl = resolveAgainstFinalUrl(
    firstMetadata(snapshot, "canonical"),
    snapshot.finalUrl,
  );
  const ogTitle = firstOpenGraph(snapshot, "og:title");
  const ogDescription = firstOpenGraph(snapshot, "og:description");
  const ogImage = resolveAgainstFinalUrl(firstOpenGraph(snapshot, "og:image"), snapshot.finalUrl);
  const ogUrl = resolveAgainstFinalUrl(firstOpenGraph(snapshot, "og:url"), snapshot.finalUrl);
  const twitterTitle = firstTwitter(snapshot, "twitter:title");
  const twitterDescription = firstTwitter(snapshot, "twitter:description");
  const twitterImage = resolveAgainstFinalUrl(
    firstTwitter(snapshot, "twitter:image"),
    snapshot.finalUrl,
  );

  return {
    serpPreview: {
      title: snapshot.document.title || ogTitle || null,
      description: metaDescription || ogDescription || null,
      canonicalUrl,
      displayUrl: canonicalUrl || snapshot.finalUrl,
    },
    socialPreview: {
      ogTitle,
      ogDescription,
      ogImage,
      ogUrl,
      ogType: firstOpenGraph(snapshot, "og:type"),
      twitterCard: firstTwitter(snapshot, "twitter:card"),
      twitterTitle,
      twitterDescription,
      twitterImage,
    },
  };
}

export function toPublicAuditData(input: {
  requestId: string;
  snapshot: PageSnapshot;
  results: RuleResult[];
  scores: ScoreBreakdown;
  durationMs: number;
  pagespeed?: PageSpeedOutput;
  renderedDom?: AuditResponseData["renderedDom"];
}): AuditResponseData {
  const { requestId, snapshot, results, scores, durationMs, pagespeed, renderedDom } = input;
  const stateCounts: Record<string, number> = {};
  const findings: AuditResponseData["findings"] = [];

  for (const r of results) {
    stateCounts[r.state] = (stateCounts[r.state] ?? 0) + 1;
    if (r.state === "failed" || r.state === "warning" || r.state === "passed") {
      findings.push({
        checkId: r.checkId,
        state: r.state,
        category: r.category,
        severity: r.severity,
        scored: r.scored,
        summary:
          r.evidence.summary.length > 200
            ? r.evidence.summary.slice(0, 200) + "..."
            : r.evidence.summary,
        impact: r.impact,
        effort: r.effort,
        remediationSummary: remediationSummaryFor(r, snapshot),
        remediationSteps: r.remediation.steps,
        responsible: r.remediation.responsible,
        confidence: r.confidence,
        page: pageContext(snapshot),
        evidence: {
          source: sourceForRule(r),
          observedValue: observedValueFor(r),
          expectedValue: expectedValueFor(r),
          selector: r.evidence.selector ?? null,
          elementSnippet: elementSnippetFor(r),
          unavailableReason: unavailableReasonFor(r),
        },
        applicabilityReason: r.applicabilityReason,
        unavailableReason: r.unavailableReason,
      });
    }
  }

  const previews = buildPreviewData(snapshot);
  const psMobile = pagespeed?.mobile ?? null;
  const psDesktop = pagespeed?.desktop ?? null;

  return {
    requestId,
    requestedUrl: snapshot.requestedUrl,
    finalUrl: snapshot.finalUrl,
    responseStatus: snapshot.response.status,
    contentType: snapshot.response.contentType,
    byteLength: snapshot.response.byteLength,
    durationMs,
    totalRules: getRuleCount(),
    stateCounts,
    findings: findings.slice(0, 200),
    findingsTruncated: findings.length > 200,
    categoryBreakdowns: scores.categoryContributions.map((c) => ({
      category: c.category,
      rawScore: c.rawScore,
      cappedScore: c.cappedScore,
      passed: c.passedCount,
      warning: c.warningCount,
      failed: c.failedCount,
      notApplicable: c.notApplicableCount,
      unavailable: c.unavailableCount,
      informational: c.informationalCount,
    })),
    scoreFamilies: scores.scoreFamilies.map((f) => ({
      family: f.family,
      name: f.name,
      rawScore: f.rawScore,
      cappedScore: f.cappedScore,
      confidence: f.confidence,
    })),
    confidence: scores.confidence,
    appliedCaps: scores.appliedCaps.map((c) => ({
      capId: c.capId,
      triggerCheckIds: c.triggerCheckIds,
      reason: c.reason,
      maxScore: c.maxScore,
      applied: c.applied,
    })),
    extractionWarnings: snapshot.extractionWarnings.map((w) => w.message).slice(0, 20),
    partialStage: null,
    unavailableStage: null,
    performanceScore: scores.performanceScore,
    performanceStatus: scores.performanceStatus,
    performanceSource: scores.performanceSource,
    performanceConfidence: scores.performanceConfidence,
    performanceExplanation: scores.performanceExplanation,
    performanceMobile: psMobile
      ? {
          labMetrics: psMobile.labMetrics,
          fieldData: psMobile.fieldData,
          opportunities: psMobile.opportunities.slice(0, 10),
        }
      : null,
    performanceDesktop: psDesktop
      ? {
          labMetrics: psDesktop.labMetrics,
          fieldData: psDesktop.fieldData,
          opportunities: psDesktop.opportunities.slice(0, 10),
        }
      : null,
    serpPreview: previews.serpPreview,
    socialPreview: previews.socialPreview,
    renderedDom: renderedDom ?? null,
    calculationVersion: CALCULATION_VERSION,
    snapshotSchemaVersion: snapshot.schemaVersion,
  };
}

export async function runQuickAudit(input: {
  url: string;
  requestId: string;
  signal?: AbortSignal;
  fetchOptions?: Omit<SafeFetchOptions, "signal">;
  pagespeed?: boolean;
  renderedDom?: boolean;
  executiveSummary?: boolean;
}): Promise<{
  data: AuditResponseData;
  snapshot: PageSnapshot;
  results: RuleResult[];
  scores: ScoreBreakdown;
}> {
  const fetchResult = await safeFetch(input.url, { ...input.fetchOptions, signal: input.signal });
  const snapshot = buildPageSnapshot(fetchResult);
  const runResult = runAll(snapshot);

  let pagespeed: PageSpeedOutput | undefined;
  if (input.pagespeed) {
    try {
      const { fetchPageSpeedBoth } = await import("@/lib/pagespeed/parser");
      pagespeed = await fetchPageSpeedBoth({ url: input.url, timeoutMs: 15000 });
    } catch {
      // PageSpeed is optional — continue without it.
    }
  }

  const scores = calculateScores({ results: runResult.results, snapshot, pagespeed });
  let renderedDom: AuditResponseData["renderedDom"] = null;
  if (input.renderedDom) {
    try {
      const { analyzeRenderedDom } = await import("@/lib/rendered-dom");
      renderedDom = await analyzeRenderedDom({
        requestId: input.requestId,
        snapshot,
        signal: input.signal,
      });
    } catch {
      renderedDom = null;
    }
  }
  const data = toPublicAuditData({
    requestId: input.requestId,
    snapshot,
    results: runResult.results,
    scores,
    durationMs: runResult.durationMs,
    pagespeed,
    renderedDom,
  });

  if (input.executiveSummary) {
    const evidence = buildQuickEvidencePack(data);
    const { summary } = await generateAiExecutiveSummary(evidence);
    data.executiveSummary = summary;
  }

  return { data, snapshot, results: runResult.results, scores };
}
