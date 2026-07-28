import type { AiExecutiveSummary } from "@/lib/ai-summary/types";

export interface AuditRequest {
  url: string;
  keyword?: string;
  expectIndexable?: boolean;
}

export interface FindingPageContext {
  requestedUrl: string;
  finalUrl: string;
  pathname: string;
  pageTitle: string | null;
}

export interface FindingEvidence {
  source: "url" | "response-header" | "static-html" | "rendered-dom" | "pagespeed";
  observedValue: string | number | boolean | string[] | null;
  expectedValue: string | null;
  selector: string | null;
  elementSnippet: string | null;
  unavailableReason: string | null;
}

export interface AuditFinding {
  checkId: string;
  state: string;
  category: string;
  severity: string;
  scored: boolean;
  summary: string;
  impact: string;
  effort: string;
  remediationSummary: string;
  remediationSteps: string[];
  responsible: string;
  confidence: number;
  page: FindingPageContext;
  evidence: FindingEvidence;
  applicabilityReason?: string;
  unavailableReason?: string;
}

export interface CategoryBreakdown {
  category: string;
  rawScore: number;
  cappedScore: number;
  passed: number;
  warning: number;
  failed: number;
  notApplicable: number;
  unavailable: number;
  informational: number;
}

export interface ScoreCap {
  capId: string;
  triggerCheckIds?: string[];
  reason: string;
  maxScore: number;
  applied: boolean;
}

export interface ScoreFamilyOutput {
  family: string;
  name: string;
  rawScore: number;
  cappedScore: number;
  confidence: number;
}

export interface PageSpeedLabMetricsOutput {
  lcp: { value: number; score: number } | null;
  cls: { value: number; score: number } | null;
  tbt: { value: number; score: number } | null;
  si: { value: number; score: number } | null;
  fcp: { value: number; score: number } | null;
  performanceScore: number | null;
  lighthouseAccessibilityScore: number | null;
  lighthouseSeoScore: number | null;
  lighthouseBestPracticesScore: number | null;
}

export interface PageSpeedFieldDataOutput {
  lcp: { p75Ms: number; category: string } | null;
  cls: { p75: number; category: string } | null;
  inp: { p75Ms: number; category: string } | null;
  fcp: { p75Ms: number; category: string } | null;
  overallCategory: string;
}

export interface PageSpeedOpportunityOutput {
  id: string;
  title: string;
  description: string;
  score: number;
  estimatedSavingsMs: number | null;
  details: string[];
}

export interface PageSpeedSideData {
  labMetrics: PageSpeedLabMetricsOutput;
  fieldData: PageSpeedFieldDataOutput | null;
  opportunities: PageSpeedOpportunityOutput[];
}

export type AuditPerformanceSource = "pagespeed-mobile" | "pagespeed-desktop-fallback" | null;

export interface SerpPreviewData {
  title: string | null;
  description: string | null;
  canonicalUrl: string | null;
  displayUrl: string;
}

export interface SocialPreviewData {
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
  ogUrl: string | null;
  ogType: string | null;
  twitterCard: string | null;
  twitterTitle: string | null;
  twitterDescription: string | null;
  twitterImage: string | null;
}

export interface RenderedDomFindingOutput {
  checkId: string;
  state: "passed" | "warning" | "failed" | "unavailable";
  severity: "high" | "medium" | "low" | "informational";
  summary: string;
  evidence: string;
  impact: string;
  remediation: string;
  responsible: "owner" | "seo" | "developer" | "content-editor" | "designer";
  effort: "low" | "medium" | "high";
  applicability: string;
  staticValue: string | number | null;
  renderedValue: string | number | null;
  confidence: number;
}

export interface RenderedDomLabOutput {
  source: "Rendered browser lab observation";
  navigationTtfbMs: number | null;
  fcpMs: number | null;
  observedLcpMs: number | null;
  observedCls: number | null;
  longTaskCount: number | null;
  totalLongTaskDurationMs: number | null;
  domContentLoadedMs: number | null;
  loadMs: number | null;
  resourceCount: number | null;
  transferredBytesEstimate: number | null;
}

export interface RenderedDomAnalysisOutput {
  status: "disabled" | "available" | "unavailable";
  workerStatus: "not-configured" | "healthy" | "unreachable" | "error" | "circuit-open";
  renderedUrl: string | null;
  durationMs: number | null;
  domNodeDelta: number | null;
  visibleTextDelta: number | null;
  consoleErrorCount: number | null;
  requestFailedCount: number | null;
  lab: RenderedDomLabOutput | null;
  findings: RenderedDomFindingOutput[];
  unavailableReason: string | null;
  schemaVersion: string;
}

export interface AuditResponseData {
  requestId: string;
  requestedUrl: string;
  finalUrl: string;
  responseStatus: number;
  contentType: string;
  byteLength: number;
  durationMs: number;
  totalRules: number;
  stateCounts: Record<string, number>;
  findings: AuditFinding[];
  findingsTruncated: boolean;
  categoryBreakdowns: CategoryBreakdown[];
  scoreFamilies: ScoreFamilyOutput[];
  confidence: number;
  appliedCaps: ScoreCap[];
  extractionWarnings: string[];
  partialStage: string | null;
  unavailableStage: string | null;
  performanceScore: number | null;
  performanceStatus: "unavailable" | "available";
  performanceSource: AuditPerformanceSource;
  performanceConfidence: number | null;
  performanceExplanation: string;
  performanceMobile: PageSpeedSideData | null;
  performanceDesktop: PageSpeedSideData | null;
  serpPreview: SerpPreviewData;
  socialPreview: SocialPreviewData;
  renderedDom?: RenderedDomAnalysisOutput | null;
  executiveSummary?: AiExecutiveSummary;
  reportStorage?: {
    stored: boolean;
    reason: string | null;
    reportId?: string;
    ownerToken?: string;
    expiresAt?: string;
  };
  calculationVersion: string;
  snapshotSchemaVersion: string;
}

export interface AuditResponse {
  success: boolean;
  requestId: string;
  data?: AuditResponseData;
  error?: {
    code: string;
    message: string;
  };
}
