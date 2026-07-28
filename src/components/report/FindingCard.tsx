"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import type { FindingEvidence, FindingPageContext } from "@/lib/audit/types";

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

function sanitizeDisplayUrl(value: string) {
  try {
    const url = new URL(value);
    url.search = "";
    url.hash = "";
    return url.toString();
  } catch {
    return value;
  }
}

function normalizeCopy(value: string | null | undefined) {
  return (value ?? "").trim().replace(/\s+/g, " ").toLowerCase();
}

type FindingCardProps = {
  id?: string;
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
  page: FindingPageContext;
  evidence: FindingEvidence;
  scored: boolean;
  confidence?: number;
  applicabilityReason?: string;
  unavailableReason?: string;
};

export function FindingCard({
  id,
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
  page,
  evidence,
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
  const observedValue = Array.isArray(evidence.observedValue)
    ? evidence.observedValue.join(", ")
    : evidence.observedValue;
  const fixText = [remediationSummary, ...remediationSteps].filter(Boolean).join("\n");
  const sanitizedFinalUrl = sanitizeDisplayUrl(page.finalUrl);
  const remediationDuplicatesImpact =
    normalizeCopy(remediationSummary) !== "" &&
    normalizeCopy(remediationSummary) === normalizeCopy(impact);

  async function copyText(value: string) {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
      }
    } catch {
      // Clipboard permission can be denied in automated or locked-down browsers.
    }
  }

  return (
    <div
      id={id}
      tabIndex={id ? -1 : undefined}
      className={`overflow-hidden rounded-2xl border border-zinc-800 border-l-4 ${borderClass}`}
    >
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
            <span className="normal-case tracking-normal">Page: {page.pathname}</span>
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
            <div className="border-t border-zinc-800 px-3 pb-5 pt-3 sm:px-5 sm:pt-4">
              <div className="grid gap-2 sm:grid-cols-3">
                <div className="rounded-xl border border-zinc-800 bg-bg-primary/60 p-3">
                  <p className="text-[12px] font-semibold uppercase tracking-wider text-text-tertiary">
                    Affected Page
                  </p>
                  <div className="mt-1.5 space-y-1 text-sm leading-5 text-text-secondary">
                    <p className="break-words">{page.pageTitle || "Unavailable"}</p>
                    <p>Pathname: {page.pathname}</p>
                  </div>
                </div>

                <div className="rounded-xl border border-zinc-800 bg-bg-primary/60 p-3">
                  <p className="text-[12px] font-semibold uppercase tracking-wider text-text-tertiary">
                    Observed
                  </p>
                  <p className="mt-1.5 text-sm leading-5 text-text-secondary">
                    {observedValue !== null && observedValue !== undefined
                      ? String(observedValue)
                      : evidence.unavailableReason
                        ? `Unavailable (${evidence.unavailableReason})`
                        : "Unavailable"}
                  </p>
                </div>

                <div className="rounded-xl border border-zinc-800 bg-bg-primary/60 p-3">
                  <p className="text-[12px] font-semibold uppercase tracking-wider text-text-tertiary">
                    Expected State
                  </p>
                  <p className="mt-1.5 text-sm leading-5 text-text-secondary">
                    {evidence.expectedValue || "Meet the documented rule expectation."}
                  </p>
                </div>
              </div>

              <div className="my-3 rounded-xl border border-zinc-800 bg-bg-primary/60 p-3">
                <p className="text-[12px] font-semibold uppercase tracking-wider text-text-tertiary">
                  Actions
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <a
                    href={page.finalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-9 items-center justify-center rounded-xl border border-zinc-700 px-3 py-1.5 text-sm font-semibold text-text-primary transition-colors hover:bg-bg-hover"
                  >
                    Open Page
                  </a>
                  <button
                    type="button"
                    onClick={() => void copyText(page.finalUrl)}
                    className="inline-flex min-h-9 items-center justify-center rounded-xl border border-zinc-700 px-3 py-1.5 text-sm font-semibold text-text-primary transition-colors hover:bg-bg-hover"
                  >
                    Copy URL
                  </button>
                  {fixText && (
                    <button
                      type="button"
                      onClick={() => void copyText(fixText)}
                      className="inline-flex min-h-9 items-center justify-center rounded-xl bg-brand px-3 py-1.5 text-sm font-semibold text-black transition-colors hover:bg-brand-hover"
                    >
                      Copy Fix
                    </button>
                  )}
                </div>
              </div>

              {impact && (
                <div className="mb-4">
                  <p className="text-[13px] font-semibold text-text-tertiary uppercase tracking-wider">
                    Impact
                  </p>
                  <p className="mt-1 text-base leading-relaxed text-text-secondary">{impact}</p>
                </div>
              )}

              {remediationSummary && !remediationDuplicatesImpact && (
                <div className="mb-4">
                  <p className="text-[13px] font-semibold text-text-tertiary uppercase tracking-wider">
                    Remediation
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

              {(applicabilityReason || unavailableReason) && (
                <div className="mb-4 text-[15px] leading-relaxed text-text-secondary">
                  {applicabilityReason && <p>{applicabilityReason}</p>}
                  {unavailableReason && <p>{unavailableReason}</p>}
                </div>
              )}

              <details className="mt-3 rounded-xl border border-zinc-800 bg-bg-primary/40 p-4">
                <summary className="cursor-pointer text-[13px] font-semibold text-text-tertiary uppercase tracking-wider">
                  Technical metadata
                </summary>
                <div className="mt-3 space-y-2 text-[13px] text-text-tertiary">
                  <div className="flex flex-wrap gap-3">
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
                    <span>
                      <span className="font-medium text-text-tertiary">Source:</span>{" "}
                      {evidence.source}
                    </span>
                    {!scored && <span className="text-warning">Informational</span>}
                  </div>
                  <p className="break-all">Final URL: {sanitizedFinalUrl}</p>
                  {page.requestedUrl !== page.finalUrl && (
                    <p className="break-all">Requested URL: {page.requestedUrl}</p>
                  )}
                  {evidence.selector && (
                    <p className="font-mono break-all">Selector: {evidence.selector}</p>
                  )}
                  {evidence.elementSnippet && (
                    <p className="font-mono break-words">
                      Snippet: {String(evidence.elementSnippet).slice(0, 240)}
                    </p>
                  )}
                </div>
              </details>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
