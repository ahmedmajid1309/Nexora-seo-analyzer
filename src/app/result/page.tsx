"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, useRef, useMemo, Suspense, useCallback } from "react";
import { motion } from "motion/react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { ScoreCard } from "@/components/report/ScoreCard";
import { FindingCard } from "@/components/report/FindingCard";
import { FindingFilters } from "@/components/report/FindingFilters";
import { PerformanceSection } from "@/components/report/PerformanceSection";
import { SerpPreview } from "@/components/report/SerpPreview";
import { SocialPreview } from "@/components/report/SocialPreview";
import type { AuditResponse, AuditResponseData } from "@/lib/audit/types";

const HEADER_OFFSET = 84;
const NAV_OFFSET = 48;
const SCROLL_MT = HEADER_OFFSET + NAV_OFFSET;

type AuditStatus = "loading" | "error" | "done";
type Section =
  "overview" | "critical" | "quickwins" | "findings" | "performance" | "serp" | "social";

const navSections: { id: Section; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "critical", label: "Critical Issues" },
  { id: "quickwins", label: "Quick Wins" },
  { id: "findings", label: "All Findings" },
  { id: "performance", label: "Performance" },
  { id: "serp", label: "SERP Preview" },
  { id: "social", label: "Social Preview" },
];

function ResultContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const url = searchParams.get("url") ?? "";
  const keyword = searchParams.get("keyword") ?? undefined;

  const [status, setStatus] = useState<AuditStatus>("loading");
  const [data, setData] = useState<AuditResponseData | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [activeSection, setActiveSection] = useState<Section>("overview");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [filters, setFilters] = useState({
    state: "all",
    category: "all",
    severity: "all",
    effort: "all",
    search: "",
    sort: "priority",
  });
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    if (!url) return;

    const controller = new AbortController();

    const body: Record<string, unknown> = { url };
    if (keyword) body.keyword = keyword;

    let cancelled = false;

    fetch("/api/audit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    })
      .then(async (res) => {
        if (cancelled) return;
        const json: AuditResponse = await res.json();
        if (!json.success || !json.data) {
          setStatus("error");
          setErrorMsg(json.error?.message ?? "The audit could not be completed.");
          return;
        }
        setData(json.data);
        setStatus("done");
        document.title = `Audit Results — ${new URL(json.data.finalUrl).hostname} — Nexora SEO Analyzer`;
      })
      .catch((err: Error) => {
        if (cancelled || err.name === "AbortError") return;
        setStatus("error");
        setErrorMsg("Network error. Please check your connection and try again.");
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [url, keyword]);

  const findings = useMemo(() => {
    if (!data) return [];
    let list = [...data.findings];

    if (filters.state !== "all") list = list.filter((f) => f.state === filters.state);
    if (filters.category !== "all") list = list.filter((f) => f.category === filters.category);
    if (filters.severity !== "all") list = list.filter((f) => f.severity === filters.severity);
    if (filters.effort !== "all") list = list.filter((f) => f.effort === filters.effort);
    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (f) => f.checkId.toLowerCase().includes(q) || f.summary.toLowerCase().includes(q),
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

  const categories = useMemo(() => {
    if (!data) return [];
    return [...new Set(data.findings.map((f) => f.category))].sort();
  }, [data]);

  const quickWins = useMemo(() => {
    if (!data) return [];
    return data.findings.filter(
      (f) => (f.state === "failed" || f.state === "warning") && f.effort === "low",
    );
  }, [data]);

  const criticalIssues = useMemo(() => {
    if (!data) return [];
    return data.findings.filter((f) => f.state === "failed" && f.severity === "critical");
  }, [data]);

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
    setMobileNavOpen(false);
  }, []);

  useEffect(() => {
    const sectionIds: Section[] = [
      "overview",
      "critical",
      "quickwins",
      "findings",
      "performance",
      "serp",
      "social",
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

  const [stageIdx, setStageIdx] = useState(0);
  const loadStages = [
    "Securing the website connection",
    "Reading the page structure",
    "Running verified SEO checks",
    "Calculating scores",
    "Requesting performance diagnostics",
  ];

  useEffect(() => {
    if (status !== "loading") return;
    const t = setInterval(() => setStageIdx((i) => Math.min(i + 1, loadStages.length - 1)), 3000);
    return () => clearInterval(t);
  }, [status, loadStages.length]);

  if (status === "loading") {
    return (
      <div
        className="mx-auto w-full max-w-6xl px-4 py-20 text-center sm:px-6 lg:px-8"
        role="status"
        aria-live="polite"
        aria-label="Audit in progress"
        style={{ paddingTop: `${HEADER_OFFSET + 80}px` }}
      >
        <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute -left-32 -top-32 h-[500px] w-[500px] rounded-full bg-brand/5 blur-[120px]" />
          <div className="absolute -right-32 bottom-1/3 h-[400px] w-[400px] rounded-full bg-brand/3 blur-[100px]" />
        </div>
        <div className="mx-auto max-w-lg relative z-10">
          <div className="flex justify-center">
            <div className="relative h-16 w-16">
              <svg className="h-16 w-16 -rotate-90" viewBox="0 0 64 64" aria-hidden="true">
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  className="text-zinc-800"
                />
                <motion.circle
                  cx="32"
                  cy="32"
                  r="28"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  className="text-brand"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 28}
                  animate={{ strokeDashoffset: [2 * Math.PI * 28 * 0.75, 2 * Math.PI * 28 * 0.25] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                />
              </svg>
            </div>
          </div>
          <h1 className="mt-6 text-2xl font-bold text-text-primary">Analyzing your website</h1>
          <p className="mt-2 text-sm text-text-secondary break-all">{url}</p>
          <div className="mt-8 space-y-3 text-left max-w-sm mx-auto">
            {loadStages.map((stage, i) => {
              const isActive = i === stageIdx;
              const isDone = i < stageIdx;
              return (
                <div
                  key={stage}
                  className={`flex items-center gap-3 transition-all duration-300 ${
                    isActive ? "opacity-100" : isDone ? "opacity-60" : "opacity-30"
                  }`}
                >
                  <div
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-colors duration-300 ${
                      isDone
                        ? "bg-success/20 text-success"
                        : isActive
                          ? "bg-brand/20 text-brand"
                          : "bg-zinc-800 text-text-tertiary"
                    }`}
                  >
                    {isDone ? (
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        aria-hidden="true"
                      >
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    ) : (
                      <span className="text-[10px] font-bold">{i + 1}</span>
                    )}
                  </div>
                  <span
                    className={`text-sm ${isActive ? "text-text-primary font-medium" : "text-text-tertiary"}`}
                  >
                    {stage}
                  </span>
                </div>
              );
            })}
          </div>
          <p className="mt-8 text-xs text-text-tertiary">This usually takes a few seconds</p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div
        className="mx-auto w-full max-w-6xl px-4 py-20 text-center sm:px-6 lg:px-8"
        role="alert"
        style={{ paddingTop: `${HEADER_OFFSET + 80}px` }}
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
          <p className="mt-2 text-sm text-text-secondary">{errorMsg}</p>
          <div className="mt-6 flex justify-center gap-3">
            <Button onClick={() => router.push("/")}>Back to homepage</Button>
            <Button onClick={() => window.location.reload()} variant="secondary">
              Retry
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

  return (
    <>
      <meta name="robots" content="noindex" />

      {/* Result section navigation — below the global header */}
      <nav
        className="sticky z-30 border-b border-zinc-800 bg-bg-primary/95 backdrop-blur-sm no-print"
        style={{ top: `${HEADER_OFFSET}px` }}
        aria-label="Report sections"
      >
        <Container>
          <div className="flex h-12 items-center justify-between">
            {/* Mobile nav toggle */}
            <button
              className="sm:hidden flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-hover/50 transition-colors min-h-[44px]"
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              aria-expanded={mobileNavOpen}
              aria-label="Toggle report navigation"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <span className="font-medium">
                {navSections.find((s) => s.id === activeSection)?.label ?? "Navigate"}
              </span>
              <svg
                className={`h-4 w-4 transition-transform duration-200 ${mobileNavOpen ? "rotate-180" : ""}`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>

            {/* Desktop nav */}
            <div className="hidden sm:flex sm:gap-1 overflow-x-auto">
              {navSections.map((s) => (
                <button
                  key={s.id}
                  onClick={() => scrollTo(s.id)}
                  className={`whitespace-nowrap rounded px-3 py-1.5 text-xs font-medium transition-colors ${
                    activeSection === s.id
                      ? "bg-brand/15 text-brand"
                      : "text-text-tertiary hover:text-text-primary"
                  }`}
                  aria-current={activeSection === s.id ? "true" : undefined}
                >
                  {s.label}
                </button>
              ))}
            </div>

            <Button
              onClick={() => window.location.reload()}
              variant="ghost"
              className="shrink-0 text-xs py-1.5"
            >
              Rescan
            </Button>
          </div>

          {/* Mobile nav dropdown */}
          {mobileNavOpen && (
            <div className="border-t border-zinc-800 bg-bg-primary pb-3 sm:hidden">
              {navSections.map((s) => (
                <button
                  key={s.id}
                  onClick={() => scrollTo(s.id)}
                  className={`flex w-full items-center px-4 py-3 text-left text-sm min-h-[44px] ${
                    activeSection === s.id
                      ? "text-brand bg-brand/5 font-medium"
                      : "text-text-tertiary hover:text-text-primary hover:bg-bg-hover/30"
                  } transition-colors`}
                >
                  {s.id === "critical" && (
                    <svg
                      className="mr-2 h-4 w-4 text-critical shrink-0"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      aria-hidden="true"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 8v4M12 16h.01" />
                    </svg>
                  )}
                  {s.id === "quickwins" && (
                    <svg
                      className="mr-2 h-4 w-4 text-success shrink-0"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      aria-hidden="true"
                    >
                      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                    </svg>
                  )}
                  {s.label}
                  {activeSection === s.id && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-brand" />
                  )}
                </button>
              ))}
            </div>
          )}
        </Container>
      </nav>

      <Container className="py-6 sm:py-8 lg:py-12">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-text-primary sm:text-2xl">Audit Results</h1>
            <p className="mt-1 text-sm text-text-secondary break-all">{data.finalUrl}</p>
            <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-text-tertiary">
              <span>Completed</span>
              <span>{data.durationMs}ms</span>
              <span>Confidence: {data.confidence}%</span>
              {data.performanceSource && (
                <span className="text-brand">
                  {data.performanceSource === "pagespeed-mobile"
                    ? "Mobile-primary performance"
                    : "Desktop-fallback performance"}
                </span>
              )}
            </div>
          </div>
          <Button
            onClick={() => router.push("/")}
            variant="secondary"
            className="shrink-0 no-print"
          >
            New audit
          </Button>
        </div>

        {/* Overview - Briefing style */}
        <section
          id="section-overview"
          style={{ scrollMarginTop: `${SCROLL_MT}px` }}
          className="mt-6 sm:mt-8"
        >
          {/* Verdict banner */}
          {strongest && weakest && (
            <div className="rounded-lg border border-brand/20 bg-brand/[0.03] p-4 sm:p-5 mb-4 sm:mb-6">
              <div className="flex items-center gap-2 mb-2">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="text-brand"
                  aria-hidden="true"
                >
                  <path d="M12 2L2 12l10 10 10-10L12 2z" />
                </svg>
                <p className="text-xs font-semibold text-brand uppercase tracking-wider">
                  Executive Verdict
                </p>
              </div>
              <p className="text-sm text-text-secondary">
                Your site scores{" "}
                <span className="font-semibold text-text-primary">{seo?.cappedScore ?? 0}</span> on
                SEO health.{" "}
                {strongest.cappedScore >= 70
                  ? `Notable strength in ${strongest.name} (${strongest.cappedScore}). `
                  : `${strongest.name} (${strongest.cappedScore}) is the strongest area but needs improvement. `}
                {weakest.cappedScore < 50
                  ? `${weakest.name} (${weakest.cappedScore}) requires immediate attention.`
                  : `${weakest.name} (${weakest.cappedScore}) has room for improvement.`}
                {criticalIssues.length > 0 &&
                  ` ${criticalIssues.length} critical issue${criticalIssues.length > 1 ? "s" : ""} detected.`}
              </p>
              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-text-secondary">
                <span>
                  <span className="text-critical font-medium">{criticalIssues.length}</span>{" "}
                  critical issue{criticalIssues.length !== 1 ? "s" : ""}
                </span>
                <span>
                  <span className="text-success font-medium">{quickWins.length}</span> quick win
                  {quickWins.length !== 1 ? "s" : ""}
                </span>
                <span>
                  <span className="text-text-primary font-medium">{data.findings.length}</span>{" "}
                  total findings
                </span>
              </div>
              {data.appliedCaps.filter((c) => c.applied).length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {data.appliedCaps
                    .filter((c) => c.applied)
                    .map((cap) => (
                      <span
                        key={cap.capId}
                        className="rounded bg-warning/10 px-2 py-0.5 text-[11px] font-medium text-warning"
                        title={cap.reason}
                      >
                        {capLabel[cap.capId] ?? cap.capId}
                      </span>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* First recommended action */}
          {criticalIssues.length > 0 && (
            <div className="mb-4 sm:mb-6 rounded-lg border border-l-4 border-l-critical border-zinc-800 bg-bg-card p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-critical">
                First recommended action
              </p>
              <p className="mt-1 text-sm font-medium text-text-primary">
                {criticalIssues[0].summary}
              </p>
              <p className="mt-0.5 text-xs text-text-tertiary">
                Effort: {criticalIssues[0].effort} &middot;{" "}
                {criticalIssues[0].responsible && `Responsible: ${criticalIssues[0].responsible}`}
              </p>
            </div>
          )}

          {/* Score grid — compact, Performance separate */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
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

          {/* Performance as separate briefing panel */}
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

          {/* Confidence */}
          {data.confidence < 100 && (
            <div className="mt-4 rounded-lg border border-zinc-800 bg-bg-card p-4">
              <p className="text-sm text-text-secondary">
                Audit confidence: {data.confidence}% &mdash; based on available data.
                {data.partialStage && " Some rules could not be evaluated."}
              </p>
            </div>
          )}

          {/* Score Caps */}
          {data.appliedCaps.filter((c) => c.applied).length > 0 && (
            <div className="mt-4 rounded-lg border border-warning/30 bg-warning/5 p-4">
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

        {/* Critical Issues */}
        <section
          id="section-critical"
          style={{ scrollMarginTop: `${SCROLL_MT}px` }}
          className="mt-8 sm:mt-10 lg:mt-14"
        >
          <h2 className="text-base font-bold text-text-primary sm:text-lg">
            Critical Issues
            {criticalIssues.length > 0 && (
              <span className="ml-2 rounded bg-critical/15 px-2 py-0.5 text-xs font-medium text-critical">
                {criticalIssues.length}
              </span>
            )}
          </h2>
          {criticalIssues.length > 0 ? (
            <div className="mt-4 space-y-3 print-break-inside">
              {criticalIssues.map((f) => (
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
                  evidenceValue={null}
                  scored={f.scored}
                />
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-text-tertiary">No critical issues detected.</p>
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
                Low-effort, meaningful-impact findings you can fix quickly.
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
                    evidenceValue={null}
                    scored={f.scored}
                  />
                ))}
              </div>
            </>
          ) : (
            <p className="mt-4 text-sm text-text-tertiary">No quick wins identified.</p>
          )}
        </section>

        {/* All Findings */}
        <section
          id="section-findings"
          style={{ scrollMarginTop: `${SCROLL_MT}px` }}
          className="mt-8 sm:mt-10 lg:mt-14"
        >
          <h2 className="text-base font-bold text-text-primary sm:text-lg">All Findings</h2>
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
              findings.map((f) => (
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
                  evidenceValue={null}
                  scored={f.scored}
                />
              ))
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

        {/* SERP Preview */}
        <section
          id="section-serp"
          style={{ scrollMarginTop: `${SCROLL_MT}px` }}
          className="mt-8 sm:mt-10 lg:mt-14"
        >
          <h2 className="text-base font-bold text-text-primary sm:text-lg">SERP Preview</h2>
          <div className="mt-4 max-w-xl">
            <SerpPreview title={null} description={null} url={data.finalUrl} />
          </div>
        </section>

        {/* Social Preview */}
        <section
          id="section-social"
          style={{ scrollMarginTop: `${SCROLL_MT}px` }}
          className="mt-8 sm:mt-10 lg:mt-14"
        >
          <h2 className="text-base font-bold text-text-primary sm:text-lg">Social Preview</h2>
          <div className="mt-4 max-w-xl">
            <SocialPreview ogTitle={null} ogDescription={null} ogImage={null} twitterCard={null} />
          </div>
        </section>

        {/* Nexora CTA */}
        <section className="mt-8 rounded-xl border border-zinc-800 bg-bg-card p-6 text-center no-print print-break-before sm:mt-10 lg:mt-14 sm:p-8">
          <p className="text-lg font-semibold text-text-primary">Need help fixing these issues?</p>
          <p className="mt-2 text-sm text-text-secondary">
            Nexora Creation provides hands-on SEO technical services. Let us help you implement the
            improvements your site needs.
          </p>
          <a
            href={`https://nexora.de?ref=nexora-seo-audit&url=${encodeURIComponent(data.finalUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 rounded-lg border border-zinc-700 px-6 py-3 text-sm font-medium text-text-primary hover:bg-bg-hover transition-colors"
          >
            Talk to Nexora Creation
          </a>
          <p className="mt-4 text-xs text-text-tertiary">
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
              href="https://nexora.de"
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
