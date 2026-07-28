import type { AuditProgressCounters } from "./types";

export function AuditCounters({
  counters,
  elapsedSeconds,
}: {
  counters: AuditProgressCounters;
  elapsedSeconds: number;
}) {
  const items = [
    ["Elapsed", `${elapsedSeconds}s`],
    ["Discovered", counters.discoveredPages ?? "—"],
    ["Selected", counters.selectedPages ?? "—"],
    ["Completed", counters.completedPages ?? "—"],
    ["Failed", counters.failedPages ?? "—"],
    ["Retries", counters.retryCount ?? 0],
  ];

  return (
    <div
      className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6"
      aria-label="Audit counters"
    >
      {items.map(([label, value]) => (
        <div key={label} className="rounded-2xl border border-border-subtle bg-bg-secondary p-3">
          <p className="text-xs uppercase tracking-[0.16em] text-text-tertiary">{label}</p>
          <p className="mt-1 font-mono text-lg font-semibold text-text-primary">{value}</p>
        </div>
      ))}
    </div>
  );
}
