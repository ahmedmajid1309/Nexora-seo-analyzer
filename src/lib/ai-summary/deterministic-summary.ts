import {
  AI_SUMMARY_DISCLAIMER,
  type AiExecutiveSummary,
  type EvidenceFinding,
  type SummaryEvidencePack,
} from "./types";

function priorityFromFinding(finding: EvidenceFinding, rank: number) {
  return {
    rank,
    title: finding.summary,
    reason: finding.impact,
    findingIds: [finding.id],
    affectedUrls: finding.affectedUrls,
    state: finding.state,
    severity: finding.severity,
    effort: finding.effort,
    responsibleRole: finding.responsibleRole,
  };
}

export function buildDeterministicSummary(input: {
  evidence: SummaryEvidencePack;
  status?: AiExecutiveSummary["status"];
  failureReason?: string | null;
  fallbackUsed?: boolean;
}): AiExecutiveSummary {
  const { evidence } = input;
  const topFindings = evidence.findings.slice(0, 5);
  const quickWins = evidence.quickWins.slice(0, 5);
  const scoreEntries = Object.entries(evidence.scores).filter(
    (entry): entry is [string, number] => typeof entry[1] === "number",
  );
  const mainScore = scoreEntries[0]?.[1] ?? null;
  const findingPhrase =
    evidence.findings.length === 0
      ? "no failed or warning findings"
      : `${evidence.findings.length} prioritized findings`;
  const scorePhrase =
    mainScore === null ? "with no overall score available" : `with a score of ${mainScore}`;

  return {
    status: input.status ?? "deterministic",
    source: "deterministic",
    model: null,
    generatedAt: new Date().toISOString(),
    disclaimer: AI_SUMMARY_DISCLAIMER,
    headline: `${evidence.auditType === "site" ? "Site" : "Page"} audit completed ${scorePhrase}`,
    executiveSummary:
      `The verified audit found ${findingPhrase}. ${evidence.weakestArea ? `The weakest area is ${evidence.weakestArea}. ` : ""}${evidence.strongestArea ? `The strongest area is ${evidence.strongestArea}.` : ""}`.trim(),
    businessImpact:
      topFindings[0]?.impact ??
      "No high-priority business impact was identified by the verified audit data.",
    topPriorities: topFindings.map((finding, index) => priorityFromFinding(finding, index + 1)),
    quickWins: quickWins.map((finding, index) => priorityFromFinding(finding, index + 1)),
    strengths: evidence.strongestArea ? [`Strongest verified area: ${evidence.strongestArea}`] : [],
    risks: topFindings
      .map((finding) => `${finding.severity} ${finding.state}: ${finding.summary}`)
      .slice(0, 5),
    recommendedSequence: topFindings
      .map((finding, index) => `${index + 1}. ${finding.remediation}`)
      .slice(0, 5),
    evidenceReferences: topFindings.map((finding) => ({
      findingId: finding.id,
      summary: finding.summary,
      affectedUrls: finding.affectedUrls,
    })),
    warnings: [
      "This summary is evidence-bounded and does not alter scores, findings, severity, confidence, or remediation.",
      ...(input.failureReason ? [`Provider summary unavailable: ${input.failureReason}`] : []),
    ],
    providerAttempt: {
      primary: null,
      fallbackUsed: input.fallbackUsed ?? false,
      failureReason: input.failureReason ?? null,
    },
  };
}
