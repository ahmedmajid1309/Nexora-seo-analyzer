"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

type FindingCardProps = {
  state: string;
  severity: string;
  checkId: string;
  category: string;
  summary: string;
  impact: string | null;
  remediationSummary: string | null;
  remediationSteps: string[];
  responsible: string | null;
  effort: string | null;
  evidenceValue: string | number | boolean | null;
  scored: boolean;
  confidence?: number;
  applicabilityReason?: string;
  unavailableReason?: string;
};

export function FindingCard({
  state,
  severity,
  checkId,
  category,
  summary,
  impact,
  remediationSummary,
  remediationSteps,
  responsible,
  effort,
  evidenceValue,
  scored,
  confidence,
  applicabilityReason,
  unavailableReason,
}: FindingCardProps) {
  const [expanded, setExpanded] = useState(false);
  const reduced = useReducedMotion();

  const stateColors: Record<string, string> = {
    failed: "border-l-critical bg-critical/5",
    warning: "border-l-warning bg-warning/5",
    passed: "border-l-success bg-success/5",
    "not-applicable": "border-l-zinc-600 bg-zinc-800/20",
    unavailable: "border-l-zinc-600 bg-zinc-800/20",
  };

  const stateBadge: Record<string, string> = {
    failed: "bg-critical/15 text-critical",
    warning: "bg-warning/15 text-warning",
    passed: "bg-success/15 text-success",
    "not-applicable": "bg-zinc-700/50 text-text-tertiary",
    unavailable: "bg-zinc-700/50 text-text-tertiary",
  };

  const borderClass = stateColors[state] || "border-l-zinc-600 bg-zinc-800/20";
  const badgeClass = stateBadge[state] || "bg-zinc-700/50 text-text-tertiary";

  return (
    <div className={`overflow-hidden rounded-2xl border border-zinc-800 border-l-4 ${borderClass}`}>
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex min-h-[72px] w-full items-start justify-between gap-4 px-4 py-4 text-left transition-colors hover:bg-bg-hover/50 sm:px-5"
        aria-expanded={expanded}
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded px-1.5 py-0.5 text-[13px] font-medium uppercase ${badgeClass}`}
            >
              {state}
            </span>
            {severity && severity !== "informational" && (
              <span
                className={`rounded px-1.5 py-0.5 text-[13px] font-medium uppercase ${
                  severity === "critical"
                    ? "bg-critical/15 text-critical"
                    : severity === "high"
                      ? "bg-warning/15 text-warning"
                      : severity === "medium"
                        ? "bg-info/15 text-info"
                        : "bg-zinc-700/50 text-text-tertiary"
                }`}
              >
                {severity}
              </span>
            )}
            <span className="technical-value text-[13px] text-text-tertiary">{checkId}</span>
          </div>
          <p className="mt-2 break-words text-base font-semibold text-text-primary">{summary}</p>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[13px] font-medium uppercase tracking-[0.11em] text-text-secondary">
            <span>{category}</span>
            {impact && <span>Impact: {impact}</span>}
            {effort && <span>Effort: {effort}</span>}
            {responsible && <span>Role: {responsible}</span>}
          </div>
        </div>
        <motion.span
          className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-zinc-700 text-text-tertiary"
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2, ease: EASE_OUT_EXPO }}
        >
          &#9660;
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="content"
            initial={reduced ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reduced ? undefined : { height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: EASE_OUT_EXPO }}
            style={{ overflow: "hidden" }}
          >
            <div className="border-t border-zinc-800 px-4 pb-5 pt-4 sm:px-5">
              {impact && (
                <div className="mb-4">
                  <p className="text-[13px] font-semibold text-text-tertiary uppercase tracking-wider">
                    Impact
                  </p>
                  <p className="mt-1 text-base leading-relaxed text-text-secondary">{impact}</p>
                </div>
              )}

              {remediationSummary && (
                <div className="mb-4">
                  <p className="text-[13px] font-semibold text-text-tertiary uppercase tracking-wider">
                    Remediation summary
                  </p>
                  <p className="mt-1 text-base leading-relaxed text-text-secondary">
                    {remediationSummary}
                  </p>
                </div>
              )}

              {remediationSteps.length > 0 && (
                <div className="mb-4">
                  <p className="text-[13px] font-semibold text-text-tertiary uppercase tracking-wider">
                    Steps
                  </p>
                  <ol className="mt-2 list-decimal space-y-1 pl-5 text-base leading-relaxed text-text-secondary">
                    {remediationSteps.map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ol>
                </div>
              )}

              {(applicabilityReason || unavailableReason || evidenceValue !== null) && (
                <div className="mb-4 rounded-xl border border-zinc-800 bg-bg-primary/60 p-4">
                  <p className="text-[13px] font-semibold uppercase tracking-wider text-text-tertiary">
                    Evidence and applicability
                  </p>
                  <div className="mt-2 space-y-1 text-[15px] leading-relaxed text-text-secondary">
                    {evidenceValue !== null && evidenceValue !== undefined && (
                      <p className="technical-value">Observed value: {String(evidenceValue)}</p>
                    )}
                    {applicabilityReason && <p>{applicabilityReason}</p>}
                    {unavailableReason && <p>{unavailableReason}</p>}
                  </div>
                </div>
              )}

              <div className="mt-3 flex flex-wrap gap-3 text-[13px] text-text-tertiary">
                {responsible && (
                  <span>
                    <span className="font-medium text-text-tertiary">Responsible:</span>{" "}
                    {responsible}
                  </span>
                )}
                {effort && (
                  <span>
                    <span className="font-medium text-text-tertiary">Effort:</span> {effort}
                  </span>
                )}
                {confidence !== undefined && <span>Confidence: {confidence}%</span>}
                <span>
                  <span className="font-medium text-text-tertiary">Category:</span> {category}
                </span>
                {!scored && <span className="text-warning">Informational</span>}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
