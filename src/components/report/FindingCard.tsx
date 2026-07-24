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
    <div className={`rounded-lg border border-zinc-800 border-l-4 overflow-hidden ${borderClass}`}>
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-start justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-bg-hover/50"
        aria-expanded={expanded}
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className={`rounded px-1.5 py-0.5 text-[10px] font-medium uppercase ${badgeClass}`}
            >
              {state}
            </span>
            {severity && severity !== "informational" && (
              <span
                className={`rounded px-1.5 py-0.5 text-[10px] font-medium uppercase ${
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
            <span className="technical-value text-[10px] text-text-tertiary">{checkId}</span>
          </div>
          <p className="mt-1.5 text-sm font-medium text-text-primary break-words">{summary}</p>
        </div>
        <motion.span
          className="mt-1 shrink-0 text-text-tertiary"
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
            <div className="border-t border-zinc-800 px-4 pb-4 pt-3">
              {impact && (
                <div className="mb-3">
                  <p className="text-xs font-medium text-text-tertiary uppercase tracking-wider">
                    Impact
                  </p>
                  <p className="mt-0.5 text-sm text-text-secondary">{impact}</p>
                </div>
              )}

              {remediationSummary && (
                <div className="mb-3">
                  <p className="text-xs font-medium text-text-tertiary uppercase tracking-wider">
                    How to fix
                  </p>
                  <p className="mt-0.5 text-sm text-text-secondary">{remediationSummary}</p>
                </div>
              )}

              {remediationSteps.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-medium text-text-tertiary uppercase tracking-wider">
                    Steps
                  </p>
                  <ol className="mt-1 list-decimal pl-4 text-sm text-text-secondary">
                    {remediationSteps.map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ol>
                </div>
              )}

              <div className="mt-3 flex flex-wrap gap-3 text-xs text-text-tertiary">
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
                {evidenceValue !== null && evidenceValue !== undefined && (
                  <span className="technical-value">
                    <span className="font-medium text-text-tertiary">Value:</span>{" "}
                    {String(evidenceValue)}
                  </span>
                )}
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
