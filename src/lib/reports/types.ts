import type { AuditResponseData } from "@/lib/audit/types";
import type { SiteAuditResponseData } from "@/lib/site-audit/types";

export type PersistableReportData = AuditResponseData | SiteAuditResponseData;
export type ReportType = "quick" | "site";
export type ReportStatus = "complete" | "partial" | "failed" | "deleted" | "expired";

export interface ReportAccessContext {
  userId?: string | null;
  anonymousToken?: string | null;
  shareToken?: string | null;
}

export interface SaveReportResult {
  stored: boolean;
  reason: string | null;
  reportId?: string;
  ownerToken?: string;
  expiresAt?: string;
}

export interface ReportListItem {
  reportId: string;
  reportType: ReportType;
  status: string;
  requestedUrl: string;
  finalUrl: string;
  createdAt: string;
  expiresAt: string;
  overallScore: number | null;
}
