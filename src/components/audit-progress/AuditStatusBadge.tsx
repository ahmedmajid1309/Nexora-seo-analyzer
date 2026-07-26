import type { AuditStageState } from "./types";

const LABELS: Record<AuditStageState, string> = {
  pending: "Pending",
  active: "Active",
  complete: "Complete",
  skipped: "Skipped",
  unavailable: "Unavailable",
  failed: "Failed",
};

const CLASSES: Record<AuditStageState, string> = {
  pending: "border-border-subtle bg-bg-tertiary text-text-tertiary",
  active: "border-brand/40 bg-brand/10 text-brand",
  complete: "border-success/30 bg-success/10 text-success",
  skipped: "border-border-subtle bg-bg-tertiary text-text-tertiary",
  unavailable: "border-warning/30 bg-warning/10 text-warning",
  failed: "border-critical/30 bg-critical/10 text-critical",
};

export function AuditStatusBadge({ state }: { state: AuditStageState }) {
  return (
    <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${CLASSES[state]}`}>
      {LABELS[state]}
    </span>
  );
}
