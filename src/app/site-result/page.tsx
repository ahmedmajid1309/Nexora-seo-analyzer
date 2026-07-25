"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type {
  SiteAuditResponse,
  SiteAuditResponseData,
  SiteLevelFinding,
  SitePageResult,
} from "@/lib/site-audit/types";

type Status = "loading" | "done" | "error";

function severityClass(severity: string) {
  if (severity === "critical" || severity === "high") return "text-critical";
  if (severity === "medium") return "text-warning";
  return "text-text-secondary";
}

function FindingRow({ finding }: { finding: SiteLevelFinding }) {
  return (
    <details className="rounded-2xl border border-border bg-bg-elevated p-4">
      <summary className="cursor-pointer list-none">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-text-muted">
              {finding.checkId}
            </p>
            <h3 className="mt-1 font-display text-lg font-semibold text-text-primary">
              {finding.title}
            </h3>
          </div>
          <span className={`text-sm font-semibold uppercase ${severityClass(finding.severity)}`}>
            {finding.state} · {finding.severity}
          </span>
        </div>
      </summary>
      <div className="mt-4 space-y-3 text-sm leading-6 text-text-secondary">
        <p>{finding.evidence}</p>
        <p>
          <strong className="text-text-primary">Impact:</strong> {finding.impact}
        </p>
        <p>
          <strong className="text-text-primary">Fix:</strong> {finding.remediation}
        </p>
        <p>
          Role: {finding.responsibleRole} · Effort: {finding.effort} · Confidence:{" "}
          {finding.confidence}%
        </p>
        {finding.affectedPageUrls.length > 0 ? (
          <ul className="space-y-1 font-mono text-xs">
            {finding.affectedPageUrls.slice(0, 8).map((url) => (
              <li key={url} className="break-all">
                {url}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </details>
  );
}

function PageRow({ page }: { page: SitePageResult }) {
  const seo = page.scoreFamilies.find((family) => family.family === "seo-health");
  return (
    <details className="rounded-2xl border border-border bg-bg-card p-4">
      <summary className="cursor-pointer list-none">
        <div className="grid gap-3 md:grid-cols-[1fr_90px_90px_120px] md:items-center">
          <div className="min-w-0">
            <p className="break-all font-mono text-xs text-text-muted">
              {page.finalUrl ?? page.requestedUrl}
            </p>
            <h3 className="mt-1 truncate font-semibold text-text-primary">
              {page.title ?? "Untitled page"}
            </h3>
          </div>
          <span>{page.status}</span>
          <span>{seo ? Math.round(seo.cappedScore) : "—"}</span>
          <span>{page.criticalIssueCount} critical</span>
        </div>
      </summary>
      <div className="mt-4 grid gap-3 text-sm text-text-secondary sm:grid-cols-2">
        <p>
          <strong className="text-text-primary">Description:</strong>{" "}
          {page.description ?? "Missing"}
        </p>
        <p>
          <strong className="text-text-primary">Canonical:</strong> {page.canonical ?? "Missing"}
        </p>
        <p>
          <strong className="text-text-primary">Headings:</strong> {page.headings.total} total, H1:{" "}
          {page.headings.h1.join(" | ") || "none"}
        </p>
        <p>
          <strong className="text-text-primary">Links:</strong> {page.links.internal} internal,{" "}
          {page.links.external} external
        </p>
        {page.failureReason ? <p className="text-critical">{page.failureReason}</p> : null}
      </div>
    </details>
  );
}

function SiteResultContent() {
  const params = useSearchParams();
  const url = params.get("url") ?? "";
  const pageLimit = Number(params.get("pageLimit") ?? "10");
  const [status, setStatus] = useState<Status>(url ? "loading" : "error");
  const [data, setData] = useState<SiteAuditResponseData | null>(null);
  const [error, setError] = useState(url ? "" : "Enter a starting URL to run a site audit.");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("score");

  useEffect(() => {
    if (!url) return;
    const controller = new AbortController();
    fetch("/api/audit/site", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, pageLimit }),
      signal: controller.signal,
    })
      .then(async (response) => {
        const json = (await response.json()) as SiteAuditResponse;
        if (!json.success || !json.data)
          throw new Error(json.error?.message ?? "Site audit failed");
        setData(json.data);
        setStatus("done");
      })
      .catch((err: Error) => {
        if (err.name === "AbortError") return;
        setError(err.message);
        setStatus("error");
      });
    return () => controller.abort();
  }, [url, pageLimit]);

  const pages = useMemo(() => {
    const list = [...(data?.pages ?? [])].filter((page) =>
      `${page.finalUrl ?? page.requestedUrl} ${page.title ?? ""}`
        .toLowerCase()
        .includes(query.toLowerCase()),
    );
    list.sort((a, b) => {
      if (sort === "url")
        return (a.finalUrl ?? a.requestedUrl).localeCompare(b.finalUrl ?? b.requestedUrl);
      if (sort === "status") return a.status.localeCompare(b.status);
      const aScore = a.scoreFamilies.find((f) => f.family === "seo-health")?.cappedScore ?? -1;
      const bScore = b.scoreFamilies.find((f) => f.family === "seo-health")?.cappedScore ?? -1;
      return aScore - bScore;
    });
    return list;
  }, [data, query, sort]);

  if (status === "loading") {
    return (
      <main className="py-28">
        <Container>
          <Card className="p-8 text-center">
            <h1 className="font-display text-3xl text-text-primary">Running limited site audit</h1>
            <p className="mt-3 text-text-secondary">
              Validating domain, discovering URLs, crawling pages, and preparing a verified site
              report.
            </p>
          </Card>
        </Container>
      </main>
    );
  }

  if (status === "error" || !data) {
    return (
      <main className="py-28">
        <Container>
          <Card className="p-8">
            <h1 className="font-display text-3xl text-text-primary">Site audit unavailable</h1>
            <p className="mt-3 text-critical">{error}</p>
          </Card>
        </Container>
      </main>
    );
  }

  return (
    <main className="py-24 print:py-6">
      <Container>
        <div className="space-y-8">
          <section className="rounded-3xl border border-border bg-bg-card p-6 sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-brand">
              Full-Site SEO Report
            </p>
            <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_260px] lg:items-end">
              <div>
                <h1 className="font-display text-4xl font-semibold text-text-primary">
                  {data.normalizedOrigin}
                </h1>
                <p className="mt-3 text-text-secondary">{data.aggregate.explanation}</p>
              </div>
              <div className="rounded-2xl bg-bg-elevated p-5 text-center">
                <p className="text-sm uppercase tracking-[0.18em] text-text-muted">Site health</p>
                <p className="mt-2 font-display text-6xl font-semibold text-brand">
                  {data.aggregate.siteHealthScore}
                </p>
                <p className="text-sm text-text-secondary">
                  Confidence {data.aggregate.confidence}%
                </p>
              </div>
            </div>
          </section>

          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {[
              ["Discovered", data.aggregate.coverage.discovered],
              ["Selected", data.aggregate.coverage.selected],
              ["Audited", data.aggregate.coverage.audited],
              ["Skipped", data.aggregate.coverage.skipped + data.aggregate.coverage.blocked],
              ["Failed", data.aggregate.coverage.failed],
            ].map(([label, value]) => (
              <Card key={label} className="p-5">
                <p className="text-sm text-text-muted">{label}</p>
                <p className="mt-2 text-3xl font-semibold text-text-primary">{value}</p>
              </Card>
            ))}
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-2xl font-semibold text-text-primary">
              Critical Site-Wide Issues
            </h2>
            {data.siteFindings
              .filter((f) => f.state === "failed" || f.state === "warning")
              .slice(0, 12)
              .map((finding) => (
                <FindingRow key={finding.checkId} finding={finding} />
              ))}
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <Card className="p-5">
              <h2 className="font-display text-xl text-text-primary">Repeated Template Issues</h2>
              <p className="mt-2 text-text-secondary">
                {data.repeatedTemplateIssues.length} repeated failure group(s)
              </p>
            </Card>
            <Card className="p-5">
              <h2 className="font-display text-xl text-text-primary">Duplicate Metadata Groups</h2>
              <p className="mt-2 text-text-secondary">
                {data.duplicateMetadataGroups.length} title/description duplicate group(s)
              </p>
            </Card>
            <Card className="p-5">
              <h2 className="font-display text-xl text-text-primary">Internal-Link Findings</h2>
              <p className="mt-2 text-text-secondary">
                {data.internalLinkFindings.length} link/depth finding(s)
              </p>
            </Card>
            <Card className="p-5">
              <h2 className="font-display text-xl text-text-primary">Redirect & Orphan Signals</h2>
              <p className="mt-2 text-text-secondary">
                {data.redirectFindings.length} redirect finding(s), {data.orphanCandidates.length}{" "}
                orphan candidate group(s)
              </p>
            </Card>
          </section>

          <section className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="font-display text-2xl font-semibold text-text-primary">
                Page Inventory
              </h2>
              <div className="flex gap-2">
                <input
                  aria-label="Filter pages"
                  className="rounded-xl border border-border bg-bg-elevated px-3 py-2 text-sm text-text-primary"
                  placeholder="Filter pages"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
                <select
                  aria-label="Sort pages"
                  className="rounded-xl border border-border bg-bg-elevated px-3 py-2 text-sm text-text-primary"
                  value={sort}
                  onChange={(event) => setSort(event.target.value)}
                >
                  <option value="score">Score</option>
                  <option value="url">URL</option>
                  <option value="status">Status</option>
                </select>
              </div>
            </div>
            {pages.map((page) => (
              <PageRow key={page.requestedUrl} page={page} />
            ))}
          </section>

          <div className="no-print">
            <Button type="button" onClick={() => window.print()}>
              Export / Print Report
            </Button>
          </div>
        </div>
      </Container>
    </main>
  );
}

export default function SiteResultPage() {
  return (
    <Suspense
      fallback={
        <main className="py-28">
          <Container>Loading site report...</Container>
        </main>
      }
    >
      <SiteResultContent />
    </Suspense>
  );
}
