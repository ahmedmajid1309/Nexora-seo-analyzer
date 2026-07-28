export type AuditProgressMode = "quick" | "site";
export type AuditStageState =
  "pending" | "active" | "complete" | "skipped" | "unavailable" | "failed";

export interface AuditStageItem {
  id: string;
  label: string;
  description: string;
  state: AuditStageState;
  optional?: boolean;
}

export interface AuditProgressCounters {
  discoveredPages?: number;
  selectedPages?: number;
  completedPages?: number;
  failedPages?: number;
  skippedPages?: number;
  renderedPages?: number;
  retryCount?: number;
}

export interface AuditActivityItem {
  id: string;
  label: string;
  detail: string;
  tone?: "neutral" | "success" | "warning" | "critical";
}
