"use client";

import { useState } from "react";
import type { PageSpeedSideData } from "@/lib/audit/types";

type PerfProps = {
  mobile: PageSpeedSideData | null;
  desktop: PageSpeedSideData | null;
  score: number | null;
  status: string;
  source: string | null;
  explanation: string;
  performanceConfidence: number | null;
};

function metricScoreClass(score: number): string {
  if (score >= 90) return "text-success";
  if (score >= 50) return "text-warning";
  return "text-critical";
}

function fieldCategoryClass(cat: string): string {
  if (cat === "FAST" || cat === "good") return "text-success";
  if (cat === "AVERAGE" || cat === "needs-improvement") return "text-warning";
  return "text-critical";
}

export function PerformanceSection({
  mobile,
  desktop,
  score,
  status,
  source,
  explanation,
  performanceConfidence,
}: PerfProps) {
  const [tab, setTab] = useState<"mobile" | "desktop">("mobile");
  const side = tab === "mobile" ? mobile : desktop;

  if (status === "unavailable") {
    return (
      <div className="rounded-xl border border-zinc-800 bg-bg-card p-4 sm:p-5">
        <p className="text-xs font-medium uppercase tracking-wider text-text-tertiary">
          Performance
        </p>
        <p className="mt-2 text-4xl font-bold text-text-tertiary">&mdash;</p>
        <p className="mt-1 text-xs text-text-tertiary">{explanation}</p>
      </div>
    );
  }

  const scoreColor =
    score !== null
      ? score >= 90
        ? "text-success"
        : score >= 50
          ? "text-warning"
          : "text-critical"
      : "text-text-tertiary";

  return (
    <div className="rounded-xl border border-zinc-800 bg-bg-card p-5">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-wider text-text-tertiary">
          Performance
        </p>
        {source && (
          <span className="shrink-0 rounded bg-brand-muted px-1.5 py-0.5 text-[13px] font-medium uppercase tracking-wider text-brand">
            {source === "pagespeed-mobile" ? "Mobile Primary" : "Desktop Fallback"}
          </span>
        )}
      </div>

      <div className="mt-3 flex items-baseline gap-3">
        <span className={`text-4xl font-bold tabular-nums ${scoreColor}`}>
          {score !== null ? Math.round(score) : "\u2014"}
        </span>
        {score !== null && (
          <span className="text-xs text-text-tertiary">
            {score >= 90 ? "Excellent" : score >= 50 ? "Needs Work" : "Poor"}
          </span>
        )}
      </div>

      <div className="mt-1 flex flex-wrap gap-2 text-xs text-text-tertiary">
        {explanation && <span>{explanation}</span>}
        {performanceConfidence !== null && performanceConfidence !== undefined && (
          <span>Confidence: {performanceConfidence}%</span>
        )}
        {source === "pagespeed-desktop-fallback" && (
          <span className="text-warning">
            * Desktop fallback &mdash; lower confidence than mobile-primary
          </span>
        )}
      </div>

      <div className="mt-4 flex gap-2 border-b border-zinc-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setTab("mobile")}
          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
            tab === "mobile"
              ? "bg-brand/15 text-brand"
              : "text-text-tertiary hover:text-text-primary"
          }`}
          aria-pressed={tab === "mobile"}
        >
          Mobile
        </button>
        <button
          onClick={() => setTab("desktop")}
          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
            tab === "desktop"
              ? "bg-brand/15 text-brand"
              : "text-text-tertiary hover:text-text-primary"
          }`}
          aria-pressed={tab === "desktop"}
        >
          Desktop
        </button>
      </div>

      {side && <LabMetricsTable metrics={side.labMetrics} />}
      {side?.fieldData && <FieldDataTable fieldData={side.fieldData} />}
      {side && side.opportunities.length > 0 && (
        <OpportunityList opportunities={side.opportunities} />
      )}
    </div>
  );
}

function LabMetricsTable({ metrics }: { metrics: PageSpeedSideData["labMetrics"] }) {
  const rows: Array<{ label: string; value: string; score: number }> = [];
  if (metrics.lcp)
    rows.push({
      label: "LCP",
      value: `${(metrics.lcp.value / 1000).toFixed(2)}s`,
      score: metrics.lcp.score,
    });
  if (metrics.cls)
    rows.push({ label: "CLS", value: metrics.cls.value.toFixed(3), score: metrics.cls.score });
  if (metrics.tbt)
    rows.push({
      label: "TBT",
      value: `${metrics.tbt.value.toFixed(0)}ms`,
      score: metrics.tbt.score,
    });
  if (metrics.si)
    rows.push({
      label: "Speed Index",
      value: `${(metrics.si.value / 1000).toFixed(2)}s`,
      score: metrics.si.score,
    });
  if (metrics.fcp)
    rows.push({
      label: "FCP",
      value: `${(metrics.fcp.value / 1000).toFixed(2)}s`,
      score: metrics.fcp.score,
    });

  if (rows.length === 0) return null;

  return (
    <div className="mt-4">
      <p className="text-xs font-medium text-text-tertiary uppercase tracking-wider">
        Lab Data <span className="font-normal normal-case text-text-tertiary">(Lighthouse)</span>
      </p>
      <p className="mt-0.5 text-[13px] text-text-tertiary">
        Simulated performance metrics. Results may vary in real-world conditions.
      </p>
      <div className="mt-2 space-y-1.5">
        {rows.map((r) => (
          <div
            key={r.label}
            className="flex items-center justify-between rounded-lg bg-bg-elevated px-3 py-2"
          >
            <span className="text-xs font-medium text-text-primary">{r.label}</span>
            <div className="flex items-center gap-2">
              <span className="technical-value text-xs text-text-secondary">{r.value}</span>
              <span className={`technical-value text-xs font-medium ${metricScoreClass(r.score)}`}>
                {r.score}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FieldDataTable({ fieldData }: { fieldData: PageSpeedSideData["fieldData"] }) {
  if (!fieldData) return null;

  const rows: Array<{ label: string; value: string; category: string }> = [];
  if (fieldData.lcp)
    rows.push({
      label: "LCP",
      value: `${fieldData.lcp.p75Ms}ms`,
      category: fieldData.lcp.category,
    });
  if (fieldData.cls)
    rows.push({
      label: "CLS",
      value: fieldData.cls.p75.toFixed(3),
      category: fieldData.cls.category,
    });
  if (fieldData.inp)
    rows.push({
      label: "INP",
      value: `${fieldData.inp.p75Ms}ms`,
      category: fieldData.inp.category,
    });
  if (fieldData.fcp)
    rows.push({
      label: "FCP",
      value: `${fieldData.fcp.p75Ms}ms`,
      category: fieldData.fcp.category,
    });

  if (rows.length === 0) return null;

  return (
    <div className="mt-4">
      <p className="text-xs font-medium text-text-tertiary uppercase tracking-wider">
        Field Data <span className="font-normal normal-case text-text-tertiary">(CrUX)</span>
      </p>
      <p className="mt-0.5 text-[13px] text-text-tertiary">
        Real-world performance from Chrome users. Missing data does not indicate zero traffic.
      </p>
      {fieldData.overallCategory && (
        <p className="mt-1 text-xs text-text-secondary">
          Overall:{" "}
          <span className={`font-medium ${fieldCategoryClass(fieldData.overallCategory)}`}>
            {fieldData.overallCategory}
          </span>
        </p>
      )}
      <div className="mt-2 space-y-1.5">
        {rows.map((r) => (
          <div
            key={r.label}
            className="flex items-center justify-between rounded-lg bg-bg-elevated px-3 py-2"
          >
            <span className="text-xs font-medium text-text-primary">{r.label}</span>
            <div className="flex items-center gap-2">
              <span className="technical-value text-xs text-text-secondary">{r.value}</span>
              <span
                className={`technical-value text-xs font-medium ${fieldCategoryClass(r.category)}`}
              >
                {r.category}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function OpportunityList({ opportunities }: { opportunities: PageSpeedSideData["opportunities"] }) {
  if (opportunities.length === 0) return null;

  return (
    <div className="mt-4">
      <p className="text-xs font-medium text-text-tertiary uppercase tracking-wider">
        Opportunities ({opportunities.length})
      </p>
      <p className="mt-0.5 text-[13px] text-text-tertiary">
        Optimization suggestions to improve load performance.
      </p>
      <div className="mt-2 space-y-1.5">
        {opportunities.map((o) => (
          <div key={o.id} className="rounded-lg bg-bg-elevated px-3 py-2">
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs text-text-primary">{o.title}</p>
              <span
                className={`technical-value shrink-0 text-xs font-medium ${
                  o.score < 50 ? "text-critical" : o.score < 90 ? "text-warning" : "text-success"
                }`}
              >
                {o.score}
              </span>
            </div>
            {o.estimatedSavingsMs !== null && (
              <p className="mt-0.5 text-xs text-text-tertiary">
                Potential savings: ~{o.estimatedSavingsMs}ms
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
