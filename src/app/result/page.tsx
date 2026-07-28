"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, useRef, useMemo, Suspense, useCallback } from "react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { ScoreCard } from "@/components/report/ScoreCard";
import { HEADER_OFFSET, PAGE_TOP_OFFSET, REPORT_NAV_GAP, REPORT_NAV_HEIGHT } from "@/lib/constants";
import { FindingCard } from "@/components/report/FindingCard";
import { FindingFilters } from "@/components/report/FindingFilters";
import { PerformanceSection } from "@/components/report/PerformanceSection";
import { SerpPreview } from "@/components/report/SerpPreview";
import { SocialPreview } from "@/components/report/SocialPreview";
import { AuditScanExperience } from "@/components/audit-progress/AuditScanExperience";
import type { AuditFinding, AuditResponse, AuditResponseData, ScoreCap } from "@/lib/audit/types";

const SCROLL_MT = HEADER_OFFSET + REPORT_NAV_HEIGHT + REPORT_NAV_GAP * 2;

type AuditStatus = "loading" | "error" | "done";
type Section =
  | "overview"
  | "actionable"
  | "quickwins"
  | "findings"
  | "performance"
  | "search-social"
  | "final-cta";

const navSections: { id: Section; label: string }[] = [
  { id: "overview", label: "Audit Summary" },
  { id: "actionable", label: "Actionable Issues" },
  { id: "quickwins", label: "Quick Wins" },
  { id: "findings", label: "All Checks" },
  { id: "performance", label: "Performance" },
  { id: "search-social", label: "Search & Social" },
  { id: "final-cta", label: "Next Step" },
];

function CollapsedFindingGroup({
  title,
  description,
  findings,
  expanded,
  onToggle,
}: {
  title: string;
  description: string;
  findings: AuditFinding[];
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-bg-card">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left transition-colors hover:bg-bg-hover/50 sm:px-5"
        aria-expanded={expanded}
      >
        <div>
          <p className="text-base font-semibold text-text-primary">
            {title}
            <span className="ml-2 rounded bg-zinc-700/50 px-2 py-0.5 text-xs font-medium text-text-tertiary">
              {findings.length}
            </span>
          </p>
          <p className="mt-1 text-sm text-text-tertiary">{description}</p>
        </div>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-zinc-700 text-text-tertiary">
          {expanded ? "-" : "+"}
        </span>
      </button>
      {expanded ? (
        <div className="space-y-3 border-t border-zinc-800 p-3 sm:p-4">
          {findings.map((f) => (
            <FindingCard
              key={f.checkId}
              state={f.state}
              severity={f.severity}
              checkId={f.checkId}
              category={f.category}
              summary={f.summary}
              impact={f.impact}
              remediationSummary={f.remediationSummary}
              remediationSteps={f.remediationSteps}
              responsible={f.responsible}
              effort={f.effort}
              page={f.page}
              evidence={f.evidence}
              scored={f.scored}
              confidence={f.confidence}
              applicabilityReason={f.applicabilityReason}
              unavailableReason={f.unavailableReason}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function AuditTrailRow({ finding }: { finding: AuditFinding }) {
  const targetId = `finding-${finding.checkId}`;
  return (
    <a
      href={`#${targetId}`}
      className="block rounded-2xl border border-zinc-800 bg-bg-card p-4 transition-colors hover:bg-bg-hover/40"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`rounded px-1.5 py-0.5 text-[13px] font-medium uppercase ${
            finding.state === "failed"
              ? "bg-critical/15 text-critical"
              : "bg-warning/15 text-warning"
          }`}
        >
          {finding.state}
        </span>
        <span className="text-[13px] font-medium uppercase tracking-[0.11em] text-text-tertiary">
          {finding.category}
        </span>
        <span className="font-mono text-[13px] font-semibold text-text-tertiary">
          {finding.checkId}
        </span>
        <span className="text-[13px] text-text-tertiary">Page: {finding.page.pathname}</span>
      </div>
      <p className="mt-2 text-base font-semibold text-text-primary">{finding.summary}</p>
      <p className="mt-1 text-sm text-text-secondary">
        Jump to detailed evidence in Actionable Issues.
      </p>
    </a>
  );
}

const CAP_PRESENTATION: Record<
  string,
  { title: string; explanation: string; triggerCheckIds: string[] }
> = {
  "CAP-NOINDEX": {
    title: "Page is marked noindex",
    explanation: "Search engines are instructed not to index this page.",
    triggerCheckIds: ["META-011"],
  },
  "CAP-NO-TITLE": {
    title: "Page is missing a title tag",
    explanation: "The primary SERP title signal is absent.",
    triggerCheckIds: ["META-001"],
  },
  "CAP-NO-DESCRIPTION": {
    title: "Page is missing a meta description",
    explanation: "The page cannot directly control its search result description.",
    triggerCheckIds: ["META-003"],
  },
  "CAP-NO-HTTPS": {
    title: "Page does not use HTTPS",
    explanation: "The page is missing a baseline security and trust signal.",
    triggerCheckIds: ["URL-001"],
  },
  "CAP-CANONICAL-INVALID": {
    title: "Canonical URL is invalid or conflicting",
    explanation: "Search engines may receive conflicting preferred URL signals.",
    triggerCheckIds: ["META-006"],
  },
};

function findScoreDrivingIssue(caps: ScoreCap[], findings: AuditFinding[]) {
  const strongestCap = caps.filter((cap) => cap.applied).sort((a, b) => a.maxScore - b.maxScore)[0];
  if (!strongestCap) return null;

  const presentation = CAP_PRESENTATION[strongestCap.capId];
  const triggerCheckIds = strongestCap.triggerCheckIds?.length
    ? strongestCap.triggerCheckIds
    : (presentation?.triggerCheckIds ?? []);
  const finding = findings.find((item) => triggerCheckIds.includes(item.checkId)) ?? null;
  const capFinding =
    strongestCap.capId === "CAP-NOINDEX" &&
    finding &&
    !/noindex|robots|indexing directive|indexability/i.test(
      `${finding.summary} ${finding.impact ?? ""} ${finding.evidence.observedValue ?? ""}`,
    )
      ? null
      : finding;

  return {
    cap: strongestCap,
    finding: capFinding,
    title: capFinding?.summary ?? presentation?.title ?? strongestCap.capId,
    explanation: capFinding?.impact ?? presentation?.explanation ?? strongestCap.reason,
  };
}

function ResultContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const url = searchParams.get("url") ?? "";
  const keyword = searchParams.get("keyword") ?? undefined;

  const [manualAuditUrl, setManualAuditUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<AuditStatus>(() => (url ? "loading" : "error"));
  const [data, setData] = useState<AuditResponseData | null>(null);
  const [errorMsg, setErrorMsg] = useState(() =>
    url ? "" : "Enter a website URL to run an audit.",
  );
  const [errorRequestId, setErrorRequestId] = useState<string | null>(null);
  const [retryNonce, setRetryNonce] = useState(0);
  const [activeSection, setActiveSection] = useState<Section>("overview");
  const [passedExpanded, setPassedExpanded] = useState(false);
  const [notApplicableExpanded, setNotApplicableExpanded] = useState(false);
  const [unavailableExpanded, setUnavailableExpanded] = useState(false);
  const [filters, setFilters] = useState({
    state: "all",
    category: "all",
    severity: "all",
    effort: "all",
    evidenceSource: "all",
    search: "",
    sort: "priority",
  });
  const requestSeqRef = useRef(0);
  const rescanLockRef = useRef(false);

  const auditUrl = manualAuditUrl ?? url;

  useEffect(() => {
    if (!auditUrl) return;

    const controller = new AbortController();
    const requestSeq = requestSeqRef.current + 1;
    requestSeqRef.current = requestSeq;

    const body: Record<string, unknown> = { url: auditUrl };
    if (keyword) body.keyword = keyword;

    let cancelled = false;

    const isCurrentRequest = () => !cancelled && requestSeqRef.current === requestSeq;

    fetch("/api/audit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    })
      .then(async (res) => {
        if (!isCurrentRequest()) return;
        let json: AuditResponse;
        try {
          json = (await res.json()) as AuditResponse;
        } catch {
          if (!isCurrentRequest()) return;
          setStatus("error");
          setErrorMsg("The audit service returned an unreadable response.");
          setErrorRequestId(null);
          return;
        }
        if (!isCurrentRequest()) return;
        if (!json.success || !json.data) {
          setStatus("error");
          rescanLockRef.current = false;
          setErrorMsg(
            json.error?.message ??
              (res.ok
                ? "The audit could not be completed."
                : `Audit failed with HTTP ${res.status}.`),
          );
          setErrorRequestId(json.requestId ?? null);
          return;
        }
        setData(json.data);
        setStatus("done");
        rescanLockRef.current = false;
        document.title = `Audit Results — ${new URL(json.data.finalUrl).hostname} — Nexora SEO Analyzer`;
      })
      .catch((err: Error) => {
        if (!isCurrentRequest()) return;
        if (err.name === "AbortError") return;
        setStatus("error");
        rescanLockRef.current = false;
        setErrorMsg("Network error. Please check your connection and try again.");
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [auditUrl, keyword, retryNonce]);

  const retryAudit = useCallback(() => {
    setStatus("loading");
    setData(null);
    setErrorMsg("");
    setErrorRequestId(null);
    setRetryNonce((n) => n + 1);
  }, []);

  const rescanAudit = () => {
    if (status === "loading" || rescanLockRef.current || !data?.finalUrl) return;
    rescanLockRef.current = true;
    setManualAuditUrl(data.finalUrl);
    retryAudit();
  };

  const findings = useMemo(() => {
    if (!data) return [];
    let list = [...data.findings];

    if (filters.state !== "all") list = list.filter((f) => f.state === filters.state);
    if (filters.category !== "all") list = list.filter((f) => f.category === filters.category);
    if (filters.severity !== "all") list = list.filter((f) => f.severity === filters.severity);
    if (filters.effort !== "all") list = list.filter((f) => f.effort === filters.effort);
    if (filters.evidenceSource !== "all")
      list = list.filter((f) => f.evidence.source === filters.evidenceSource);
    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (f) =>
          f.checkId.toLowerCase().includes(q) ||
          f.summary.toLowerCase().includes(q) ||
          f.page.finalUrl.toLowerCase().includes(q),
      );
    }

    const sevRank: Record<string, number> = {
      critical: 0,
      high: 1,
      medium: 2,
      low: 3,
      informational: 4,
    };
    const stateRank: Record<string, number> = {
      failed: 0,
      warning: 1,
      passed: 2,
      "not-applicable": 3,
      unavailable: 4,
    };
    const effortRank: Record<string, number> = { low: 0, medium: 1, high: 2 };

    list.sort((a, b) => {
      if (filters.sort === "severity")
        return (sevRank[a.severity] ?? 5) - (sevRank[b.severity] ?? 5);
      if (filters.sort === "impact") return (stateRank[a.state] ?? 5) - (stateRank[b.state] ?? 5);
      if (filters.sort === "effort")
        return (effortRank[a.effort] ?? 3) - (effortRank[b.effort] ?? 3);
      if (filters.sort === "category") return a.category.localeCompare(b.category);
      return (sevRank[a.severity] ?? 5) - (sevRank[b.severity] ?? 5);
    });

    return list;
  }, [data, filters]);

  const allChecks = useMemo(() => (data ? [...data.findings] : []), [data]);

  const categories = useMemo(() => {
    if (!data) return [];
    return [...new Set(data.findings.map((f) => f.category))].sort();
  }, [data]);

  const actionableChecks = useMemo(
    () => findings.filter((f) => f.state === "failed" || f.state === "warning"),
    [findings],
  );
  const passedChecks = useMemo(() => findings.filter((f) => f.state === "passed"), [findings]);
  const notApplicableChecks = useMemo(
    () => findings.filter((f) => f.state === "not-applicable"),
    [findings],
  );
  const unavailableChecks = useMemo(
    () => findings.filter((f) => f.state === "unavailable"),
    [findings],
  );

  const allFailedChecks = useMemo(() => allChecks.filter((f) => f.state === "failed"), [allChecks]);
  const allWarningChecks = useMemo(
    () => allChecks.filter((f) => f.state === "warning"),
    [allChecks],
  );
  const allPassedChecks = useMemo(() => allChecks.filter((f) => f.state === "passed"), [allChecks]);
  const allNotApplicableChecks = useMemo(
    () => allChecks.filter((f) => f.state === "not-applicable"),
    [allChecks],
  );
  const allUnavailableChecks = useMemo(
    () => allChecks.filter((f) => f.state === "unavailable"),
    [allChecks],
  );
  const allActionableIssues = useMemo(
    () => allChecks.filter((f) => f.state === "failed" || f.state === "warning"),
    [allChecks],
  );

  const quickWins = useMemo(
    () => allActionableIssues.filter((f) => f.effort === "low"),
    [allActionableIssues],
  );

  const criticalIssues = useMemo(
    () => allActionableIssues.filter((f) => f.state === "failed" && f.severity === "critical"),
    [allActionableIssues],
  );

  const seo = data?.scoreFamilies.find((f) => f.family === "seo-health");
  const a11y = data?.scoreFamilies.find((f) => f.family === "accessibility");
  const security = data?.scoreFamilies.find((f) => f.family === "security-trust");
  const aeo = data?.scoreFamilies.find((f) => f.family === "aeo-readiness");
  const geo = data?.scoreFamilies.find((f) => f.family === "geo-readiness");

  const scrollTo = useCallback((sectionId: Section) => {
    const el = document.getElementById(`section-${sectionId}`);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - SCROLL_MT;
      window.scrollTo({ top, behavior: "smooth" });
      setActiveSection(sectionId);
    }
  }, []);

  const scrollToTarget = useCallback((targetId: string) => {
    const el = document.getElementById(targetId);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - SCROLL_MT;
    window.scrollTo({ top, behavior: "smooth" });
    window.setTimeout(() => el.focus({ preventScroll: true }), 350);
  }, []);

  useEffect(() => {
    const sectionIds: Section[] = [
      "overview",
      "actionable",
      "quickwins",
      "findings",
      "performance",
      "search-social",
      "final-cta",
    ];
    const observers: IntersectionObserver[] = [];

    sectionIds.forEach((id) => {
      const el = document.getElementById(`section-${id}`);
      if (!el) return;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveSection(id);
        },
        { rootMargin: `-${SCROLL_MT + 40}px 0px -60% 0px`, threshold: 0 },
      );
      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, [status]);

  if (status === "loading") {
    return <AuditScanExperience mode="quick" url={auditUrl || url} />;
  }

  if (status === "error") {
    return (
      <div
        className="mx-auto w-full max-w-6xl px-4 py-20 text-center sm:px-6 lg:px-8"
        role="alert"
        style={{ paddingTop: `${PAGE_TOP_OFFSET + 64}px` }}
      >
        <div className="mx-auto max-w-lg">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-critical/10">
            <svg
              className="h-8 w-8 text-critical"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="m15 9-6 6M9 9l6 6" />
            </svg>
          </div>
          <h1 className="mt-4 text-2xl font-bold text-text-primary">Audit failed</h1>
          <p className="mt-2 text-base text-text-secondary">{errorMsg}</p>
          {errorRequestId && (
            <p className="mt-3 text-[13px] text-text-tertiary">Request ID: {errorRequestId}</p>
          )}
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Button onClick={retryAudit}>Retry</Button>
            <Button onClick={() => router.push("/")} variant="secondary">
              Back to homepage
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const strongest = [seo, a11y, security, aeo, geo]
    .filter(Boolean)
    .sort((a, b) => (b?.cappedScore ?? 0) - (a?.cappedScore ?? 0))[0];
  const weakest = [seo, a11y, security, aeo, geo]
    .filter(Boolean)
    .sort((a, b) => (a?.cappedScore ?? 0) - (b?.cappedScore ?? 0))[0];

  const capLabel: Record<string, string> = {
    "keyword-density-index": "Keyword Density Index",
    "entity-topical-depth": "Entity Topical Depth",
  };
  const failedCount = allFailedChecks.length;
  const warningCount = allWarningChecks.length;
  const passedCount = allPassedChecks.length;
  const notApplicableCount = allNotApplicableChecks.length;
  const unavailableCount = allUnavailableChecks.length;
  const applicableCount = failedCount + warningCount + passedCount;
  const inactiveCount = notApplicableCount + unavailableCount;
  const evaluatedCount = applicableCount + inactiveCount;
  const appliedCapSummaries = data.appliedCaps
    .filter((cap) => cap.applied)
    .map((cap) => `${capLabel[cap.capId] ?? cap.capId}: max ${cap.maxScore}`);
  const scoreDrivingIssue = findScoreDrivingIssue(data.appliedCaps, allActionableIssues);
  const firstQuickAction = quickWins[0] ?? criticalIssues[0] ?? allActionableIssues[0] ?? null;
  const quickestIsScoreDriving =
    Boolean(scoreDrivingIssue?.finding && firstQuickAction) &&
    scoreDrivingIssue?.finding?.checkId === firstQuickAction?.checkId;
  const quickestRecommendedAction = quickestIsScoreDriving ? null : firstQuickAction;
  const scoreDrivingTargetId = scoreDrivingIssue?.finding
    ? `finding-${scoreDrivingIssue.finding.checkId}`
    : "score-cap-details";

  return (
    <>
      <meta name="robots" content="noindex" />

      <Container
        as="main"
        className="pb-8 sm:pb-10 lg:pb-14"
        style={{ paddingTop: `${PAGE_TOP_OFFSET}px` }}
      >
        {/* Header */}
        <div
          data-testid="report-header"
          className="rounded-3xl border border-zinc-800 bg-gradient-to-br from-bg-card via-bg-primary to-bg-elevated p-5 shadow-2xl shadow-black/25 sm:p-7"
        >
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <p className="text-[13px] font-semibold uppercase tracking-[0.16em] text-brand">
                SEO Intelligence Report
              </p>
              <h1 className="mt-3 text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
                Audit complete
              </h1>
              <p className="mt-3 break-all text-base text-text-secondary">{data.finalUrl}</p>
              <div className="mt-5 flex flex-wrap gap-2 text-[13px] font-semibold uppercase tracking-[0.12em] text-text-secondary">
                <span className="rounded-full border border-success/25 bg-success/10 px-3 py-1 text-success">
                  Completed
                </span>
                <span className="rounded-full border border-zinc-700 px-3 py-1">
                  Confidence: {data.confidence}%
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Button onClick={rescanAudit} className="min-h-11 shrink-0 no-print">
                Rescan this URL
              </Button>
              <Button onClick={() => router.push("/")} className="min-h-11 shrink-0 no-print">
                New Audit
              </Button>
            </div>
          </div>
        </div>

        {/* Result section navigation — normal flow first, sticky only after reaching this position */}
        <nav
          data-testid="report-navigation"
          className="sticky z-30 mt-4 rounded-2xl border border-zinc-800 bg-bg-primary shadow-[0_-18px_0_18px_var(--color-bg-primary),0_18px_34px_rgba(0,0,0,0.32)] no-print"
          style={{ top: `${HEADER_OFFSET + REPORT_NAV_GAP}px` }}
          aria-label="Report sections"
        >
          <div className="flex min-h-14 items-center gap-3 px-3 sm:px-4">
            <label htmlFor="report-section-select" className="sr-only">
              Report section
            </label>
            <select
              id="report-section-select"
              value={activeSection}
              onChange={(event) => scrollTo(event.target.value as Section)}
              className="min-h-11 min-w-0 flex-1 rounded-xl border border-zinc-700 bg-bg-card px-3 py-2 text-base font-semibold text-text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-brand sm:hidden"
              aria-label="Report section"
            >
              {navSections.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
            <div className="hidden flex-1 gap-2 overflow-x-auto py-2 sm:flex sm:flex-nowrap">
              {navSections.map((s) => (
                <button
                  key={s.id}
                  onClick={() => scrollTo(s.id)}
                  className={`min-h-11 whitespace-nowrap rounded-xl px-4 py-2 text-base font-semibold transition-colors ${
                    activeSection === s.id
                      ? "bg-brand text-black shadow-lg shadow-brand/15"
                      : "text-text-secondary hover:bg-bg-hover/50 hover:text-text-primary"
                  }`}
                  aria-current={activeSection === s.id ? "true" : undefined}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </nav>

        {/* Overview - Briefing style */}
        <section
          id="section-overview"
          style={{ scrollMarginTop: `${SCROLL_MT}px` }}
          className="mt-6 sm:mt-8"
        >
          {/* Command center */}
          {strongest && weakest && (
            <>
              <div className="grid items-start gap-5 lg:grid-cols-[0.95fr_1.05fr]">
                <div className="rounded-3xl border border-brand/20 bg-gradient-to-br from-brand/[0.10] via-bg-card to-bg-elevated p-5 sm:p-7">
                  <p className="text-[13px] font-semibold uppercase tracking-[0.16em] text-brand">
                    Executive overview
                  </p>
                  <div className="mt-5 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="text-base text-text-secondary">Overall Audit Score</p>
                      <p className="mt-1 text-7xl font-bold leading-none text-brand tabular-nums">
                        {Math.round(seo?.cappedScore ?? 0)}
                      </p>
                    </div>
                    <div className="grid max-w-md gap-3">
                      <div className="rounded-2xl border border-zinc-800 bg-bg-primary/70 p-4">
                        <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-critical">
                          Score-driving issue
                        </p>
                        <p className="mt-2 text-base font-semibold text-text-primary">
                          {scoreDrivingIssue?.title ?? "No active score cap was applied."}
                        </p>
                        <p className="mt-2 text-[13px] text-text-tertiary">
                          {scoreDrivingIssue?.explanation ??
                            "Review all remaining warnings and unavailable checks."}
                        </p>
                        {scoreDrivingIssue ? (
                          <p className="mt-2 text-[13px] font-semibold text-warning">
                            Maximum overall score: {scoreDrivingIssue.cap.maxScore}
                          </p>
                        ) : null}
                        {quickestIsScoreDriving ? (
                          <span className="mt-3 inline-flex w-fit rounded-full border border-success/25 bg-success/10 px-2.5 py-1 text-[12px] font-semibold uppercase tracking-[0.1em] text-success">
                            Also the quickest fix
                          </span>
                        ) : null}
                        {scoreDrivingIssue ? (
                          <button
                            type="button"
                            onClick={() => scrollToTarget(scoreDrivingTargetId)}
                            className="mt-3 inline-flex min-h-10 items-center justify-center rounded-xl border border-zinc-700 px-4 py-2 text-sm font-semibold text-text-primary transition-colors hover:bg-bg-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                          >
                            View detailed issue
                          </button>
                        ) : null}
                      </div>
                      {quickestRecommendedAction ? (
                        <div className="rounded-2xl border border-zinc-800 bg-bg-primary/70 p-4">
                          <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-success">
                            Quickest recommended action
                          </p>
                          <p className="mt-2 text-base font-semibold text-text-primary">
                            {quickestRecommendedAction.summary}
                          </p>
                          <p className="mt-2 text-[13px] text-text-tertiary">
                            Role: {quickestRecommendedAction.responsible} · Effort:{" "}
                            {quickestRecommendedAction.effort}
                          </p>
                          <button
                            type="button"
                            onClick={() =>
                              scrollToTarget(`finding-${quickestRecommendedAction.checkId}`)
                            }
                            className="mt-3 inline-flex min-h-10 items-center justify-center rounded-xl border border-zinc-700 px-4 py-2 text-sm font-semibold text-text-primary transition-colors hover:bg-bg-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                          >
                            View quick win
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </div>
                  <p className="mt-5 text-base leading-relaxed text-text-secondary">
                    Strongest area:{" "}
                    <span className="font-semibold text-text-primary">{strongest.name}</span>.
                    Weakest area:{" "}
                    <span className="font-semibold text-text-primary">{weakest.name}</span>.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {[
                    ["Checks evaluated", evaluatedCount],
                    ["Failed", failedCount],
                    ["Warnings", warningCount],
                    ["Passed", passedCount],
                    ["Not applicable", notApplicableCount],
                    ["Unavailable", unavailableCount],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-2xl border border-zinc-800 bg-bg-card p-4">
                      <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-text-tertiary">
                        {label}
                      </p>
                      <p className="mt-2 text-3xl font-bold text-text-primary tabular-nums">
                        {value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              <p className="mt-4 text-sm font-medium text-text-secondary">
                {`${applicableCount} applicable checks · ${inactiveCount} not applicable or unavailable · ${quickWins.length} quick wins within ${allActionableIssues.length} actionable issues`}
              </p>
            </>
          )}

          {/* Score grid — compact, Performance separate */}
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            <ScoreCard
              label="SEO Health"
              score={seo?.cappedScore ?? 0}
              confidence={data.confidence}
            />
            <ScoreCard
              label="Accessibility"
              score={a11y?.cappedScore ?? 0}
              confidence={a11y?.confidence ?? null}
            />
            <ScoreCard
              label="Security & Trust"
              score={security?.cappedScore ?? 0}
              confidence={security?.confidence ?? null}
            />
            <ScoreCard
              label="AEO Readiness"
              score={aeo?.cappedScore ?? 0}
              confidence={aeo?.confidence ?? null}
              info
            />
            <ScoreCard
              label="GEO Readiness"
              score={geo?.cappedScore ?? 0}
              confidence={geo?.confidence ?? null}
              info
            />
          </div>

          <div className="mt-5 rounded-2xl border border-zinc-800 bg-bg-card p-5">
            <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-brand">
              Why this score?
            </p>
            <p className="mt-2 text-base leading-relaxed text-text-secondary">
              Raw SEO Health category score: {seo?.rawScore ?? "unavailable"}. Applied cap:{" "}
              {appliedCapSummaries.length > 0 ? appliedCapSummaries.join(", ") : "none"}. Final
              overall audit score: {seo?.cappedScore ?? "unavailable"}. Failed checks: {failedCount}
              ; warnings: {warningCount}. Strongest category: {strongest?.name ?? "unavailable"}.
              Weakest category: {weakest?.name ?? "unavailable"}.
            </p>
          </div>

          <div className="mt-5 rounded-2xl border border-zinc-800 bg-bg-card p-5">
            <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-brand">
              Performance summary
            </p>
            <p className="mt-2 text-base leading-relaxed text-text-secondary">
              {data.performanceStatus === "available"
                ? `Optional Performance diagnostics returned ${data.performanceScore ?? "an available"} score from ${data.performanceSource ?? "PageSpeed"}. Full details appear below.`
                : "Optional Performance diagnostics were unavailable. The core SEO audit still completed, and unavailable is not a zero score."}
            </p>
          </div>

          {data.executiveSummary ? (
            <div className="mt-5 rounded-3xl border border-brand/20 bg-bg-card p-5 sm:p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-brand">
                    Executive Intelligence
                  </p>
                  <h2 className="mt-2 text-xl font-bold text-text-primary">
                    {data.executiveSummary.headline}
                  </h2>
                </div>
                <span className="w-fit rounded-full border border-zinc-700 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-text-secondary">
                  {data.executiveSummary.source}
                </span>
              </div>
              <p className="mt-4 text-sm leading-6 text-text-secondary">
                {data.executiveSummary.executiveSummary}
              </p>
              <p className="mt-3 text-sm leading-6 text-text-secondary">
                {data.executiveSummary.businessImpact}
              </p>
              {data.executiveSummary.topPriorities.length > 0 ? (
                <div className="mt-5 grid gap-3 lg:grid-cols-2">
                  {data.executiveSummary.topPriorities.slice(0, 4).map((priority) => (
                    <div
                      key={`${priority.rank}-${priority.findingIds.join("-")}`}
                      className="rounded-2xl border border-zinc-800 bg-bg-primary/50 p-4"
                    >
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-tertiary">
                        Priority {priority.rank} · {priority.severity} · {priority.effort} effort
                      </p>
                      <p className="mt-2 font-semibold text-text-primary">{priority.title}</p>
                      <p className="mt-2 text-sm text-text-secondary">{priority.reason}</p>
                      <p className="mt-2 font-mono text-xs text-text-tertiary">
                        Evidence: {priority.findingIds.join(", ")}
                      </p>
                    </div>
                  ))}
                </div>
              ) : null}
              <p className="mt-4 text-xs leading-5 text-text-tertiary">
                {data.executiveSummary.disclaimer}
              </p>
            </div>
          ) : null}

          {/* Confidence */}
          {data.confidence < 100 && (
            <div className="mt-4 rounded-lg border border-zinc-800 bg-bg-card p-4">
              <p className="text-sm text-text-secondary">
                Audit confidence: {data.confidence}% &mdash; based on available data.
                {data.partialStage && " Some rules could not be evaluated."}
              </p>
            </div>
          )}

          <details className="mt-4 rounded-lg border border-zinc-800 bg-bg-card p-4">
            <summary className="cursor-pointer text-sm font-semibold text-text-primary">
              Technical Details
            </summary>
            <div className="mt-3 grid gap-2 text-sm text-text-secondary sm:grid-cols-2">
              <p className="break-all">Request ID: {data.requestId}</p>
              <p>Rule evaluation time: {data.durationMs}ms</p>
              <p>Status: {data.responseStatus}</p>
              <p className="break-all">Content type: {data.contentType}</p>
              <p>Bytes: {data.byteLength}</p>
              <p>Calculation: {data.calculationVersion}</p>
            </div>
          </details>

          {/* Score Caps */}
          {data.appliedCaps.filter((c) => c.applied).length > 0 && (
            <div
              id="score-cap-details"
              tabIndex={-1}
              className="mt-4 rounded-lg border border-warning/30 bg-warning/5 p-4"
            >
              <h3 className="text-sm font-semibold text-warning">Score Caps Applied</h3>
              {data.appliedCaps
                .filter((c) => c.applied)
                .map((cap) => {
                  const displayName = capLabel[cap.capId] ?? cap.capId;
                  return (
                    <div key={cap.capId} className="mt-1">
                      <p className="text-sm text-warning/90">
                        <span className="font-medium">{displayName}</span> — {cap.reason}
                      </p>
                      <p className="text-xs text-warning/60">Maximum score: {cap.maxScore}</p>
                    </div>
                  );
                })}
            </div>
          )}

          {/* Extraction notes */}
          {data.extractionWarnings.length > 0 && (
            <div className="mt-4 rounded-lg border border-zinc-800 bg-bg-card p-4">
              <h3 className="text-sm font-semibold text-text-primary">Extraction Notes</h3>
              <ul className="mt-2 list-disc pl-5 text-sm text-text-secondary">
                {data.extractionWarnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          )}
        </section>

        {/* Actionable Issues */}
        <section
          id="section-actionable"
          style={{ scrollMarginTop: `${SCROLL_MT}px` }}
          className="mt-8 sm:mt-10 lg:mt-14"
        >
          <h2 className="text-base font-bold text-text-primary sm:text-lg">
            Actionable Issues
            {allActionableIssues.length > 0 && (
              <span className="ml-2 rounded bg-critical/15 px-2 py-0.5 text-xs font-medium text-critical">
                {allActionableIssues.length}
              </span>
            )}
          </h2>
          {allActionableIssues.length > 0 ? (
            <div className="mt-4 space-y-3 print-break-inside">
              {allActionableIssues.map((f) => (
                <FindingCard
                  key={f.checkId}
                  id={`finding-${f.checkId}`}
                  state={f.state}
                  severity={f.severity}
                  checkId={f.checkId}
                  category={f.category}
                  summary={f.summary}
                  impact={f.impact}
                  remediationSummary={f.remediationSummary}
                  remediationSteps={f.remediationSteps}
                  responsible={f.responsible}
                  effort={f.effort}
                  page={f.page}
                  evidence={f.evidence}
                  scored={f.scored}
                  confidence={f.confidence}
                  applicabilityReason={f.applicabilityReason}
                  unavailableReason={f.unavailableReason}
                />
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-text-tertiary">No failed or warning checks detected.</p>
          )}
        </section>

        {/* Quick Wins */}
        <section
          id="section-quickwins"
          style={{ scrollMarginTop: `${SCROLL_MT}px` }}
          className="mt-8 sm:mt-10 lg:mt-14"
        >
          <h2 className="text-base font-bold text-text-primary sm:text-lg">
            Quick Wins
            {quickWins.length > 0 && (
              <span className="ml-2 rounded bg-success/15 px-2 py-0.5 text-xs font-medium text-success">
                {quickWins.length}
              </span>
            )}
          </h2>
          {quickWins.length > 0 ? (
            <>
              <p className="mt-1 text-sm text-text-secondary">
                {quickWins.length} quick wins within {allActionableIssues.length} actionable issues.
              </p>
              <div className="mt-4 space-y-3 print-break-inside">
                {quickWins.map((f) => (
                  <FindingCard
                    key={f.checkId}
                    state={f.state}
                    severity={f.severity}
                    checkId={f.checkId}
                    category={f.category}
                    summary={f.summary}
                    impact={f.impact}
                    remediationSummary={f.remediationSummary}
                    remediationSteps={f.remediationSteps}
                    responsible={f.responsible}
                    effort={f.effort}
                    page={f.page}
                    evidence={f.evidence}
                    scored={f.scored}
                    confidence={f.confidence}
                    applicabilityReason={f.applicabilityReason}
                    unavailableReason={f.unavailableReason}
                  />
                ))}
              </div>
            </>
          ) : (
            <p className="mt-4 text-sm text-text-tertiary">No quick wins identified.</p>
          )}
        </section>

        {/* All Checks */}
        <section
          id="section-findings"
          style={{ scrollMarginTop: `${SCROLL_MT}px` }}
          className="mt-8 sm:mt-10 lg:mt-14"
        >
          <h2 className="text-base font-bold text-text-primary sm:text-lg">All Checks</h2>
          <div className="mt-4 no-print">
            <FindingFilters
              filters={filters}
              onChange={setFilters}
              categories={categories}
              totalCount={data.findings.length}
              filteredCount={findings.length}
            />
          </div>
          <div className="mt-4 space-y-3">
            {findings.length > 0 ? (
              <>
                {actionableChecks.filter((f) => f.state === "failed").length > 0 && (
                  <div className="space-y-3">
                    <p className="text-sm font-semibold uppercase tracking-[0.12em] text-critical">
                      Failed
                      <span className="ml-2 rounded bg-critical/15 px-2 py-0.5 text-xs">
                        {actionableChecks.filter((f) => f.state === "failed").length}
                      </span>
                    </p>
                    {actionableChecks
                      .filter((f) => f.state === "failed")
                      .map((f) => (
                        <AuditTrailRow key={f.checkId} finding={f} />
                      ))}
                  </div>
                )}
                {actionableChecks.filter((f) => f.state === "warning").length > 0 && (
                  <div className="space-y-3">
                    <p className="text-sm font-semibold uppercase tracking-[0.12em] text-warning">
                      Warnings
                      <span className="ml-2 rounded bg-warning/15 px-2 py-0.5 text-xs">
                        {actionableChecks.filter((f) => f.state === "warning").length}
                      </span>
                    </p>
                    {actionableChecks
                      .filter((f) => f.state === "warning")
                      .map((f) => (
                        <AuditTrailRow key={f.checkId} finding={f} />
                      ))}
                  </div>
                )}
                <CollapsedFindingGroup
                  title="Passed checks"
                  description="Successful checks are collapsed by default to keep the report focused. Expand only when you need the audit trail."
                  findings={passedChecks}
                  expanded={passedExpanded}
                  onToggle={() => setPassedExpanded((value) => !value)}
                />
                <CollapsedFindingGroup
                  title="Not applicable"
                  description="Checks that do not apply to this page are grouped separately and hidden by default."
                  findings={notApplicableChecks}
                  expanded={notApplicableExpanded}
                  onToggle={() => setNotApplicableExpanded((value) => !value)}
                />
                {unavailableChecks.length > 0 && (
                  <CollapsedFindingGroup
                    title="Unavailable checks"
                    description="Signals that could not be observed are grouped separately and do not become fake zero scores."
                    findings={unavailableChecks}
                    expanded={unavailableExpanded}
                    onToggle={() => setUnavailableExpanded((value) => !value)}
                  />
                )}
              </>
            ) : (
              <div className="rounded-lg border border-zinc-800 bg-bg-card p-8 text-center">
                <p className="text-sm text-text-tertiary">No findings match the current filters.</p>
              </div>
            )}
            {data.findingsTruncated && (
              <p className="text-sm text-text-tertiary text-center">
                Showing {data.findings.length} findings. Refine filters to see specific results.
              </p>
            )}
          </div>
        </section>

        {/* Performance */}
        <section
          id="section-performance"
          style={{ scrollMarginTop: `${SCROLL_MT}px` }}
          className="mt-8 sm:mt-10 lg:mt-14"
        >
          <h2 className="text-base font-bold text-text-primary sm:text-lg">Performance</h2>
          <div className="mt-4">
            <PerformanceSection
              mobile={data.performanceMobile}
              desktop={data.performanceDesktop}
              score={data.performanceScore}
              status={data.performanceStatus}
              source={data.performanceSource}
              explanation={data.performanceExplanation}
              performanceConfidence={data.performanceConfidence ?? null}
            />
          </div>
        </section>

        {/* Search and Social */}
        <section
          id="section-search-social"
          style={{ scrollMarginTop: `${SCROLL_MT}px` }}
          className="mt-8 sm:mt-10 lg:mt-14"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-text-primary">Search &amp; Social</h2>
              <p className="mt-1 text-base text-text-secondary">
                Real extracted metadata rendered as preview approximations.
              </p>
            </div>
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            <SerpPreview
              title={data.serpPreview.title}
              description={data.serpPreview.description}
              canonicalUrl={data.serpPreview.canonicalUrl}
              displayUrl={data.serpPreview.displayUrl}
            />
            <SocialPreview
              ogTitle={data.socialPreview.ogTitle}
              ogDescription={data.socialPreview.ogDescription}
              ogImage={data.socialPreview.ogImage}
              ogUrl={data.socialPreview.ogUrl}
              ogType={data.socialPreview.ogType}
              twitterCard={data.socialPreview.twitterCard}
              twitterTitle={data.socialPreview.twitterTitle}
              twitterDescription={data.socialPreview.twitterDescription}
              twitterImage={data.socialPreview.twitterImage}
            />
          </div>
        </section>

        {/* Nexora CTA */}
        <section
          id="section-final-cta"
          style={{ scrollMarginTop: `${SCROLL_MT}px` }}
          className="mt-8 rounded-3xl border border-brand/20 bg-gradient-to-br from-brand/[0.10] via-bg-card to-bg-primary p-6 text-center shadow-2xl shadow-brand/5 no-print print-break-before sm:mt-10 lg:mt-14 sm:p-8"
        >
          <p className="text-2xl font-bold text-text-primary">Ready for the next audit?</p>
          <p className="mx-auto mt-3 max-w-2xl text-base leading-relaxed text-text-secondary">
            Start another evidence-led audit, or talk to Nexora Creation when you want expert help
            prioritizing implementation.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Button onClick={() => router.push("/")} className="min-h-12">
              Start another audit
            </Button>
            <a
              href={`https://nexoracreation.com/?ref=nexora-seo-audit&url=${encodeURIComponent(data.finalUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-zinc-700 px-6 py-3 text-base font-semibold text-text-primary transition-colors hover:bg-bg-hover"
            >
              Talk to Nexora Creation
            </a>
          </div>
          <p className="mt-4 text-[13px] text-text-tertiary">
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
              className="inline-block text-brand mr-1 -mt-0.5"
            >
              <path d="M12 2L2 12l10 10 10-10L12 2z" />
            </svg>
            Powered by{" "}
            <a
              href="https://nexoracreation.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand hover:underline"
            >
              Nexora Creation
            </a>
            <span className="mx-1">&middot;</span>
            <a href="/methodology" className="text-brand hover:underline">
              Methodology
            </a>
          </p>
        </section>
      </Container>
    </>
  );
}

export default function ResultPage() {
  return (
    <Suspense
      fallback={
        <Container className="py-20 text-center">
          <p className="text-text-secondary">Loading...</p>
        </Container>
      }
    >
      <ResultContent />
    </Suspense>
  );
}
