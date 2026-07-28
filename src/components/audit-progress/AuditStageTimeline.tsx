import { AuditStatusBadge } from "./AuditStatusBadge";
import type { AuditStageItem } from "./types";

export function AuditStageTimeline({ stages }: { stages: AuditStageItem[] }) {
  return (
    <section className="rounded-3xl border border-border-subtle bg-bg-card/90 p-5 sm:p-6">
      <h2 className="font-display text-xl font-semibold text-text-primary">Live audit timeline</h2>
      <ol className="mt-5 space-y-3" aria-label="Audit stages">
        {stages.map((stage) => (
          <li
            key={stage.id}
            className="rounded-2xl border border-border-subtle bg-bg-secondary/70 p-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium text-text-primary">{stage.label}</p>
                <p className="mt-1 text-sm leading-6 text-text-secondary">{stage.description}</p>
              </div>
              <AuditStatusBadge state={stage.state} />
            </div>
            {stage.optional ? (
              <p className="mt-2 text-xs text-text-tertiary">Optional subsystem</p>
            ) : null}
          </li>
        ))}
      </ol>
    </section>
  );
}
