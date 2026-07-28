"use client";

import { useEffect, useState } from "react";
import { AuditActivityFeed } from "./AuditActivityFeed";
import { AuditCounters } from "./AuditCounters";
import { AuditStageTimeline } from "./AuditStageTimeline";
import { AuditTargetCard } from "./AuditTargetCard";
import { ScanViewport } from "./ScanViewport";
import type {
  AuditActivityItem,
  AuditProgressCounters,
  AuditProgressMode,
  AuditStageItem,
} from "./types";

function useElapsedSeconds() {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  useEffect(() => {
    const timer = window.setInterval(() => setElapsedSeconds((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, []);
  return elapsedSeconds;
}

function useReducedMotion() {
  const [reduced, setReduced] = useState(
    () =>
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const listener = () => setReduced(query.matches);
    query.addEventListener("change", listener);
    return () => query.removeEventListener("change", listener);
  }, []);
  return reduced;
}

function defaultStages(mode: AuditProgressMode): AuditStageItem[] {
  if (mode === "site") {
    return [
      {
        id: "request",
        label: "Audit request sent",
        description: "The browser submitted the site-audit request to Nexora.",
        state: "complete",
      },
      {
        id: "server",
        label: "Server-side crawl running",
        description:
          "The backend validates the origin, discovers eligible same-origin pages, and runs bounded checks.",
        state: "active",
      },
      {
        id: "optional-render",
        label: "Rendered analysis",
        description: "Rendered DOM diagnostics run only when the isolated worker is enabled.",
        state: "pending",
        optional: true,
      },
      {
        id: "summary",
        label: "Report preparation",
        description: "The report opens immediately when the verified API response returns.",
        state: "pending",
      },
    ];
  }
  return [
    {
      id: "request",
      label: "Request submitted",
      description: "The browser submitted the page-audit request to Nexora.",
      state: "complete",
    },
    {
      id: "server",
      label: "Secure server analysis active",
      description:
        "The backend validates the target, fetches the page, extracts metadata, runs rules, and calculates scores.",
      state: "active",
    },
    {
      id: "pagespeed",
      label: "Optional diagnostics",
      description: "PageSpeed data is requested only when a server-side API key is configured.",
      state: "pending",
      optional: true,
    },
    {
      id: "render",
      label: "Optional diagnostics",
      description: "Rendered DOM comparison runs only when the isolated worker is enabled.",
      state: "pending",
      optional: true,
    },
    {
      id: "summary",
      label: "Preparing report",
      description:
        "AI summaries use verified evidence only when enabled; deterministic fallback remains available.",
      state: "pending",
      optional: true,
    },
  ];
}

const STATE_COPY = {
  active: null,
  partial: {
    label: "Partial audit result",
    detail:
      "The audit returned usable verified data, but one or more optional systems were unavailable.",
  },
  failed: {
    label: "Audit failed",
    detail:
      "The audit could not complete. Verified failures are shown without converting unavailable data to zero.",
  },
  cancelled: {
    label: "Audit cancelled",
    detail: "The audit was cancelled before completion. No artificial progress is displayed.",
  },
} satisfies Record<
  "active" | "partial" | "failed" | "cancelled",
  { label: string; detail: string } | null
>;

export function AuditScanExperience({
  mode,
  url,
  counters = {},
  stages,
  activity,
  state = "active",
  requestId,
}: {
  mode: AuditProgressMode;
  url: string;
  counters?: AuditProgressCounters;
  stages?: AuditStageItem[];
  activity?: AuditActivityItem[];
  state?: "active" | "partial" | "failed" | "cancelled";
  requestId?: string | null;
}) {
  const elapsedSeconds = useElapsedSeconds();
  const reduced = useReducedMotion();
  const resolvedStages = stages ?? defaultStages(mode);
  const stateCopy = STATE_COPY[state];
  const activeStage = resolvedStages.find((stage) => stage.state === "active") ?? resolvedStages[0];
  const resolvedActivity =
    activity ??
    ([
      {
        id: "submitted",
        label: "Request accepted by browser",
        detail:
          "Waiting for the server to return verified audit data. No client-side fake stage completion is shown.",
      },
      {
        id: "privacy",
        label: "Progress is sanitized",
        detail:
          "The progress UI hides query strings and never displays cookies, headers, form values, or secrets.",
      },
    ] satisfies AuditActivityItem[]);

  return (
    <main
      className="px-4 py-24 sm:px-6 lg:px-8"
      role="status"
      aria-live="polite"
      aria-label="Audit in progress"
    >
      <h1 className="sr-only">
        {mode === "site" ? "Running limited site audit" : "Analyzing your website"}
      </h1>
      <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-5">
          <AuditTargetCard url={url} mode={mode} />
          {stateCopy ? (
            <section className="rounded-2xl border border-warning/30 bg-warning/10 p-4 text-sm text-text-secondary">
              <h2 className="font-display text-lg font-semibold text-text-primary">
                {stateCopy.label}
              </h2>
              <p className="mt-1 leading-6">{stateCopy.detail}</p>
            </section>
          ) : null}
          {mode === "site" ? (
            <AuditCounters counters={counters} elapsedSeconds={elapsedSeconds} />
          ) : (
            <div className="rounded-2xl border border-border-subtle bg-bg-secondary p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-text-tertiary">Elapsed</p>
              <p className="mt-1 font-mono text-lg font-semibold text-text-primary">
                {elapsedSeconds}s
              </p>
              {activeStage ? (
                <div className="mt-4 rounded-2xl border border-brand/25 bg-brand/10 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">
                    Current stage
                  </p>
                  <p className="mt-2 text-sm font-semibold text-text-primary">
                    {activeStage.label}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-text-secondary">
                    {activeStage.description}
                  </p>
                  <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-text-tertiary">
                    Status: {activeStage.state}
                    {activeStage.optional ? " optional" : ""}
                  </p>
                </div>
              ) : null}
              <p className="mt-2 text-sm leading-6 text-text-secondary">
                Auditing only the submitted page. No crawl totals or artificial progress are shown.
              </p>
            </div>
          )}
          {requestId ? (
            <p className="break-all font-mono text-xs text-text-tertiary">
              Request ID: {requestId}
            </p>
          ) : null}
        </div>
        <div className="space-y-5">
          <ScanViewport reduced={reduced} />
          <div className="grid gap-5 xl:grid-cols-2">
            <AuditStageTimeline
              stages={resolvedStages.map((stage) =>
                state === "failed" && stage.state === "active"
                  ? { ...stage, state: "failed" }
                  : stage,
              )}
            />
            <AuditActivityFeed items={resolvedActivity} />
          </div>
        </div>
      </div>
    </main>
  );
}
