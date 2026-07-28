import type { AuditResponseData } from "@/lib/audit/types";
import type { SiteAuditResponseData, SitePageResult } from "@/lib/site-audit/types";
import { AI_SUMMARY_SCHEMA_VERSION, type EvidenceFinding, type SummaryEvidencePack } from "./types";
import { sanitizeSummaryText, sanitizeUrlForEvidence } from "./sanitization";

const SEVERITY_WEIGHT: Record<string, number> = {
  critical: 5,
  high: 4,
  medium: 3,
  low: 2,
  informational: 1,
};

const STATE_WEIGHT: Record<string, number> = { failed: 3, warning: 2, unavailable: 1, passed: 0 };

function priorityScore(finding: EvidenceFinding): number {
  return (SEVERITY_WEIGHT[finding.severity] ?? 0) * 10 + (STATE_WEIGHT[finding.state] ?? 0);
}

function sortFindings(findings: EvidenceFinding[]): EvidenceFinding[] {
  return [...findings].sort(
    (a, b) => priorityScore(b) - priorityScore(a) || a.id.localeCompare(b.id),
  );
}

function pageScore(page: SitePageResult): number | null {
  const family = page.scoreFamilies.find((scoreFamily) => scoreFamily.family === "overall");
  return family?.cappedScore ?? page.scoreFamilies[0]?.cappedScore ?? null;
}

function strongestWeakest(scoreFamilies: AuditResponseData["scoreFamilies"]): {
  strongestArea: string | null;
  weakestArea: string | null;
} {
  if (scoreFamilies.length === 0) return { strongestArea: null, weakestArea: null };
  const sorted = [...scoreFamilies].sort((a, b) => b.cappedScore - a.cappedScore);
  return {
    strongestArea: sorted[0]?.name ?? null,
    weakestArea: sorted.at(-1)?.name ?? null,
  };
}

export function buildQuickEvidencePack(data: AuditResponseData): SummaryEvidencePack {
  const findings = sortFindings(
    data.findings
      .filter((finding) => finding.state === "failed" || finding.state === "warning")
      .slice(0, 40)
      .map((finding) => ({
        id: finding.checkId,
        summary: sanitizeSummaryText(finding.summary, 280),
        severity: finding.severity,
        state: finding.state,
        effort: finding.effort,
        responsibleRole: finding.responsible,
        impact: sanitizeSummaryText(finding.impact, 360),
        remediation: sanitizeSummaryText(finding.remediationSummary, 360),
        affectedUrls: [sanitizeUrlForEvidence(data.finalUrl)],
      })),
  );
  const renderedFindingIds = (data.renderedDom?.findings ?? [])
    .filter((finding) => finding.state !== "passed")
    .map((finding) => finding.checkId);
  const { strongestArea, weakestArea } = strongestWeakest(data.scoreFamilies);

  return {
    schemaVersion: AI_SUMMARY_SCHEMA_VERSION,
    auditType: "quick",
    requestId: data.requestId,
    finalUrl: sanitizeUrlForEvidence(data.finalUrl),
    generatedAt: new Date().toISOString(),
    scores: Object.fromEntries(
      data.scoreFamilies.map((family) => [family.name, family.cappedScore]),
    ),
    confidence: data.confidence,
    appliedCaps: data.appliedCaps
      .filter((cap) => cap.applied)
      .map((cap) => `${cap.capId}: ${cap.reason}`),
    findings,
    quickWins: sortFindings(findings.filter((finding) => finding.effort === "low")).slice(0, 5),
    strongestArea,
    weakestArea,
    performance: {
      status: data.performanceStatus,
      source: data.performanceSource,
      score: data.performanceScore,
    },
    renderedDom: { status: data.renderedDom?.status ?? "disabled", findingIds: renderedFindingIds },
  };
}

export function buildSiteEvidencePack(data: SiteAuditResponseData): SummaryEvidencePack {
  const pageFindings = data.pages.flatMap((page) =>
    page.findings
      .filter((finding) => finding.state === "failed" || finding.state === "warning")
      .map((finding) => ({
        id: `${finding.checkId}:${page.finalUrl ?? page.requestedUrl}`,
        summary: sanitizeSummaryText(finding.summary, 280),
        severity: finding.severity,
        state: finding.state,
        effort: finding.effort,
        responsibleRole: finding.responsible,
        impact: sanitizeSummaryText(finding.impact, 360),
        remediation: sanitizeSummaryText(finding.remediationSummary, 360),
        affectedUrls: [sanitizeUrlForEvidence(page.finalUrl ?? page.requestedUrl)],
      })),
  );
  const siteFindings = data.siteFindings
    .filter((finding) => finding.state === "failed" || finding.state === "warning")
    .map((finding) => ({
      id: finding.checkId,
      summary: sanitizeSummaryText(finding.title, 280),
      severity: finding.severity,
      state: finding.state,
      effort: finding.effort,
      responsibleRole: finding.responsibleRole,
      impact: sanitizeSummaryText(finding.impact, 360),
      remediation: sanitizeSummaryText(finding.remediation, 360),
      affectedUrls: finding.affectedPageUrls.slice(0, 8).map(sanitizeUrlForEvidence),
    }));
  const findings = sortFindings([...siteFindings, ...pageFindings]).slice(0, 60);
  const scoredPages = data.pages
    .filter((page) => page.status === "audited")
    .map((page) => ({
      url: page.finalUrl ?? page.requestedUrl,
      score: pageScore(page),
      risk: page.criticalIssueCount * 10 + page.warningCount,
    }))
    .filter((page): page is { url: string; score: number; risk: number } => page.score !== null);
  const byScore = [...scoredPages].sort((a, b) => b.score - a.score);

  return {
    schemaVersion: AI_SUMMARY_SCHEMA_VERSION,
    auditType: "site",
    requestId: data.requestId,
    finalUrl: sanitizeUrlForEvidence(data.normalizedOrigin),
    generatedAt: new Date().toISOString(),
    scores: {
      siteHealthScore: data.aggregate.siteHealthScore,
      averageAuditedPageScore: data.aggregate.averageAuditedPageScore,
      crossPageHealthScore: data.aggregate.crossPageHealthScore,
      coverageScore: data.aggregate.coverageScore,
    },
    confidence: data.aggregate.confidence,
    appliedCaps: data.aggregate.appliedCaps
      .filter((cap) => cap.applied)
      .map((cap) => `${cap.capId}: ${cap.reason}`),
    findings,
    quickWins: sortFindings(findings.filter((finding) => finding.effort === "low")).slice(0, 5),
    strongestArea: data.aggregate.coverageScore >= 85 ? "Coverage" : null,
    weakestArea:
      data.aggregate.crossPageHealthScore < data.aggregate.averageAuditedPageScore
        ? "Cross-page health"
        : "Page-level health",
    performance: { status: "site-aggregate", source: null, score: data.aggregate.siteHealthScore },
    renderedDom: {
      status: data.renderedDom?.status ?? "disabled",
      findingIds: (data.renderedDom?.findings ?? []).map((finding) => finding.checkId),
    },
    site: {
      coverage: data.aggregate.coverage,
      crossPageFindingIds: data.siteFindings.map((finding) => finding.checkId),
      repeatedTemplateIssueCount: data.repeatedTemplateIssues.length,
      duplicateMetadataGroupCount: data.duplicateMetadataGroups.length,
      internalLinkFindingCount: data.internalLinkFindings.length,
      redirectFindingCount: data.redirectFindings.length,
      orphanCandidateCount: data.orphanCandidates.length,
      highestRiskPages: scoredPages
        .sort((a, b) => b.risk - a.risk)
        .slice(0, 5)
        .map((page) => sanitizeUrlForEvidence(page.url)),
      strongestPages: byScore.slice(0, 5).map((page) => sanitizeUrlForEvidence(page.url)),
      weakestPages: byScore
        .slice(-5)
        .reverse()
        .map((page) => sanitizeUrlForEvidence(page.url)),
      renderedPages: (data.renderedDom?.selectedPages ?? []).map((page) => ({
        url: sanitizeUrlForEvidence(page.url),
        status: page.renderedStatus,
        reason: sanitizeSummaryText(page.selectionReason, 160),
      })),
    },
  };
}
