export const AI_SUMMARY_SCHEMA_VERSION = "1.0.0";
export const AI_SUMMARY_PROMPT_VERSION = "1.0.0";
export const AI_SUMMARY_DISCLAIMER =
  "AI-generated summary based only on verified audit findings. Deterministic audit findings and scores remain authoritative.";

export type AiSummaryProvider = "gemini" | "groq" | "deterministic";
export type AiSummaryStatus =
  "available" | "deterministic" | "disabled" | "unavailable" | "timed-out" | "failed";

export interface EvidenceFinding {
  id: string;
  summary: string;
  severity: string;
  state: string;
  effort: string;
  responsibleRole: string;
  impact: string;
  remediation: string;
  affectedUrls: string[];
}

export interface SummaryEvidencePack {
  schemaVersion: string;
  auditType: "quick" | "site";
  requestId: string;
  finalUrl: string;
  generatedAt: string;
  scores: Record<string, number | null>;
  confidence: number;
  appliedCaps: string[];
  findings: EvidenceFinding[];
  quickWins: EvidenceFinding[];
  strongestArea: string | null;
  weakestArea: string | null;
  performance: { status: string; source: string | null; score: number | null };
  renderedDom: { status: string; findingIds: string[] };
  site?: {
    coverage: {
      discovered: number;
      selected: number;
      audited: number;
      failed: number;
      skipped: number;
      blocked: number;
    };
    crossPageFindingIds: string[];
    repeatedTemplateIssueCount: number;
    duplicateMetadataGroupCount: number;
    internalLinkFindingCount: number;
    redirectFindingCount: number;
    orphanCandidateCount: number;
    highestRiskPages: string[];
    strongestPages: string[];
    weakestPages: string[];
    renderedPages: { url: string; status: string; reason: string }[];
  };
}

export interface SummaryPriority {
  rank: number;
  title: string;
  reason: string;
  findingIds: string[];
  affectedUrls: string[];
  state: string;
  severity: string;
  effort: string;
  responsibleRole: string;
}

export interface EvidenceReference {
  findingId: string;
  summary: string;
  affectedUrls: string[];
}

export interface AiProviderAttempt {
  primary: "gemini" | "groq" | null;
  fallbackUsed: boolean;
  failureReason: string | null;
}

export interface AiExecutiveSummary {
  status: AiSummaryStatus;
  source: AiSummaryProvider;
  model: string | null;
  generatedAt: string;
  disclaimer: string;
  headline: string;
  executiveSummary: string;
  businessImpact: string;
  topPriorities: SummaryPriority[];
  quickWins: SummaryPriority[];
  strengths: string[];
  risks: string[];
  recommendedSequence: string[];
  evidenceReferences: EvidenceReference[];
  warnings: string[];
  providerAttempt: AiProviderAttempt;
}

export interface AiSummaryProgressEvent {
  state:
    | "preparing-summary-evidence"
    | "generating-deterministic-summary"
    | "requesting-gemini-summary"
    | "validating-gemini-summary"
    | "requesting-groq-summary"
    | "validating-groq-summary"
    | "summary-complete"
    | "summary-fallback"
    | "summary-unavailable";
  provider: "gemini" | "groq" | null;
  fallbackUsed: boolean;
  elapsedMs: number;
  evidenceFindingCount: number;
  finalSummarySource: AiSummaryProvider | null;
}

export interface AiSummaryResult {
  summary: AiExecutiveSummary;
  progress: AiSummaryProgressEvent[];
}
