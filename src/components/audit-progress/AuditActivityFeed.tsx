import type { AuditActivityItem } from "./types";

const TONE = {
  neutral: "text-text-secondary",
  success: "text-success",
  warning: "text-warning",
  critical: "text-critical",
};

export function AuditActivityFeed({ items }: { items: AuditActivityItem[] }) {
  return (
    <section className="rounded-3xl border border-border-subtle bg-bg-card/90 p-5 sm:p-6">
      <h2 className="font-display text-xl font-semibold text-text-primary">Observed activity</h2>
      <div className="mt-5 space-y-3" aria-live="polite" aria-atomic="false">
        {items.map((item) => (
          <div key={item.id} className="rounded-2xl bg-bg-secondary p-4">
            <p className={`text-sm font-semibold ${TONE[item.tone ?? "neutral"]}`}>{item.label}</p>
            <p className="mt-1 text-sm leading-6 text-text-secondary">{item.detail}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
