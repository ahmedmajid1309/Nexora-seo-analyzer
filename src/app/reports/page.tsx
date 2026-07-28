"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { ReportListItem } from "@/lib/reports/types";

export default function ReportsPage() {
  const [reports, setReports] = useState<ReportListItem[]>([]);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");
  const [sort, setSort] = useState("newest");

  useEffect(() => {
    fetch("/api/reports")
      .then(async (response) => {
        const json = (await response.json()) as {
          success: boolean;
          reports?: ReportListItem[];
          error?: string;
        };
        if (!response.ok || !json.success) throw new Error(json.error ?? "Unable to load reports");
        setReports(json.reports ?? []);
      })
      .catch((err: Error) => setError(err.message));
  }, []);

  const filtered = useMemo(() => {
    const list = reports.filter((report) => {
      if (type !== "all" && report.reportType !== type) return false;
      return `${report.requestedUrl} ${report.finalUrl}`
        .toLowerCase()
        .includes(query.toLowerCase());
    });
    list.sort((a, b) => {
      if (sort === "oldest") return a.createdAt.localeCompare(b.createdAt);
      if (sort === "score") return (b.overallScore ?? -1) - (a.overallScore ?? -1);
      if (sort === "domain") return a.finalUrl.localeCompare(b.finalUrl);
      return b.createdAt.localeCompare(a.createdAt);
    });
    return list;
  }, [reports, query, type, sort]);

  return (
    <Container className="py-24">
      <meta name="robots" content="noindex" />
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-4xl font-semibold text-text-primary">Report History</h1>
          <p className="mt-3 text-text-secondary">
            Private saved reports for your signed-in account.
          </p>
        </div>
        <Card className="grid gap-3 p-4 md:grid-cols-3">
          <input
            className="rounded-xl border border-border bg-bg-elevated px-3 py-2 text-text-primary"
            placeholder="Search domain"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <select
            className="rounded-xl border border-border bg-bg-elevated px-3 py-2 text-text-primary"
            value={type}
            onChange={(event) => setType(event.target.value)}
          >
            <option value="all">All types</option>
            <option value="quick">Quick</option>
            <option value="site">Site</option>
          </select>
          <select
            className="rounded-xl border border-border bg-bg-elevated px-3 py-2 text-text-primary"
            value={sort}
            onChange={(event) => setSort(event.target.value)}
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="score">Score</option>
            <option value="domain">Domain</option>
          </select>
        </Card>
        {error ? <Card className="p-6 text-critical">{error}</Card> : null}
        {!error && filtered.length === 0 ? (
          <Card className="p-8 text-text-secondary">No saved reports yet.</Card>
        ) : null}
        <div className="space-y-4">
          {filtered.map((report) => (
            <Card
              key={report.reportId}
              className="grid gap-4 p-5 md:grid-cols-[1fr_120px_160px] md:items-center"
            >
              <div>
                <p className="font-mono text-xs text-text-muted">
                  {report.reportType} · {report.status}
                </p>
                <h2 className="mt-1 break-all font-semibold text-text-primary">
                  {report.finalUrl}
                </h2>
                <p className="mt-1 text-sm text-text-secondary">
                  Created {new Date(report.createdAt).toLocaleString()} · Expires{" "}
                  {new Date(report.expiresAt).toLocaleDateString()}
                </p>
              </div>
              <p className="text-3xl font-semibold text-brand">{report.overallScore ?? "—"}</p>
              <Link href={`/reports/${report.reportId}`}>
                <Button type="button">Open</Button>
              </Link>
            </Card>
          ))}
        </div>
      </div>
    </Container>
  );
}
