export type AuditJobType = "quick-audit" | "site-audit";
export type AuditJobState = "queued" | "active" | "complete" | "partial" | "failed" | "cancelled";

export interface AuditJobPayload {
  jobType: AuditJobType;
  url: string;
  requestId: string;
  pageLimit?: number;
  crawlMode?: "links-and-sitemap" | "links-only" | "sitemap-first";
  idempotencyKey?: string;
}

export interface AuditJobProgress {
  state: string;
  selectedPageCount?: number;
  completedPageCount?: number;
  failedPageCount?: number;
  currentPathname?: string | null;
  elapsedMs: number;
  retryCount: number;
}
