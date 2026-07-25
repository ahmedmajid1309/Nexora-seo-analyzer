import type { AuditFinding, ScoreCap, ScoreFamilyOutput } from "@/lib/audit/types";
import type { RuleResult } from "@/lib/rules/types";

export const SITE_AUDIT_MAX_PAGES = 25;
export const SITE_AUDIT_DEFAULT_LIMIT = 10;
export const SITE_AUDIT_DEFAULT_CONCURRENCY = 3;
export const SITE_AUDIT_DEADLINE_MS = 45_000;

export type SiteAuditProgressState =
  | "validating-domain"
  | "fetching-entry-page"
  | "discovering-sitemap"
  | "discovering-links"
  | "crawling-pages"
  | "running-page-checks"
  | "running-cross-page-checks"
  | "calculating-site-score"
  | "preparing-report"
  | "complete"
  | "partial"
  | "failed";

export interface SiteAuditProgress {
  state: SiteAuditProgressState;
  discoveredPageCount: number;
  selectedPageCount: number;
  completedPageCount: number;
  failedPageCount: number;
  currentPathname: string | null;
  elapsedMs: number;
}

export type CrawlUrlState = "selected" | "skipped" | "blocked" | "failed" | "redirected";

export interface CrawlUrlDecision {
  url: string;
  state: CrawlUrlState;
  reason: string;
  source: "entry" | "sitemap" | "link" | "robots" | "redirect";
  fromUrl?: string;
}

export interface SitePageResult {
  requestedUrl: string;
  finalUrl: string | null;
  status: "audited" | "failed" | "blocked" | "skipped";
  responseStatus: number | null;
  title: string | null;
  description: string | null;
  canonical: string | null;
  depth: number;
  headings: { h1: string[]; h2Count: number; total: number };
  links: { internal: number; external: number; brokenInternal: string[] };
  findings: AuditFinding[];
  ruleResults: RuleResult[];
  scoreFamilies: ScoreFamilyOutput[];
  criticalIssueCount: number;
  warningCount: number;
  crawlState: CrawlUrlState;
  failureReason: string | null;
  redirectChain: { url: string; statusCode: number }[];
}

export interface SiteLevelFinding {
  checkId: string;
  title: string;
  state: "passed" | "warning" | "failed" | "not-applicable" | "unavailable";
  severity: "critical" | "high" | "medium" | "low" | "informational";
  affectedPageUrls: string[];
  evidence: string;
  impact: string;
  remediation: string;
  responsibleRole: "owner" | "seo" | "developer" | "content-editor" | "designer";
  effort: "low" | "medium" | "high";
  confidence: number;
  applicability: string;
}

export interface SiteAggregateScore {
  siteHealthScore: number;
  averageAuditedPageScore: number;
  crossPageHealthScore: number;
  coverageScore: number;
  confidence: number;
  coverage: {
    discovered: number;
    selected: number;
    audited: number;
    failed: number;
    skipped: number;
    blocked: number;
  };
  appliedCaps: ScoreCap[];
  explanation: string;
}

export interface SiteAuditResponseData {
  requestId: string;
  auditType: "site";
  requestedUrl: string;
  normalizedOrigin: string;
  startedAt: string;
  completedAt: string;
  durationMs: number;
  pageLimit: number;
  crawlMode: "links-and-sitemap" | "links-only" | "sitemap-first";
  progress: SiteAuditProgress[];
  decisions: CrawlUrlDecision[];
  pages: SitePageResult[];
  siteFindings: SiteLevelFinding[];
  aggregate: SiteAggregateScore;
  repeatedTemplateIssues: SiteLevelFinding[];
  duplicateMetadataGroups: SiteLevelFinding[];
  internalLinkFindings: SiteLevelFinding[];
  redirectFindings: SiteLevelFinding[];
  orphanCandidates: SiteLevelFinding[];
}

export interface SiteAuditResponse {
  success: boolean;
  requestId: string;
  data?: SiteAuditResponseData;
  error?: { code: string; message: string };
}
