"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { AuditResponseData } from "@/lib/audit/types";
import type { SiteAuditResponseData } from "@/lib/site-audit/types";

export default function ReportDetailPage() {
  const params = useParams<{ reportId: string }>();
  const search = useSearchParams();
  const [data, setData] = useState<AuditResponseData | SiteAuditResponseData | null>(null);
  const [error, setError] = useState("");
  const ownerToken = search.get("ownerToken");
  const shareToken = search.get("shareToken");

  useEffect(() => {
    const qs = new URLSearchParams();
    if (ownerToken) qs.set("ownerToken", ownerToken);
    if (shareToken) qs.set("shareToken", shareToken);
    fetch(`/api/reports/${params.reportId}?${qs.toString()}`)
      .then(async (response) => {
        const json = (await response.json()) as {
          success: boolean;
          data?: AuditResponseData | SiteAuditResponseData;
          error?: string;
        };
        if (!response.ok || !json.success || !json.data)
          throw new Error(json.error ?? "Report unavailable");
        setData(json.data);
      })
      .catch((err: Error) => setError(err.message));
  }, [params.reportId, ownerToken, shareToken]);

  return (
    <Container className="py-24">
      <meta name="robots" content="noindex" />
      {error ? <Card className="p-8 text-critical">{error}</Card> : null}
      {!error && !data ? <Card className="p-8 text-text-secondary">Loading report...</Card> : null}
      {data ? (
        <Card className="space-y-5 p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand">
            Persisted Report
          </p>
          <h1 className="break-all font-display text-3xl font-semibold text-text-primary">
            {"auditType" in data ? data.normalizedOrigin : data.finalUrl}
          </h1>
          <p className="text-text-secondary">
            This private route reuses the persisted audit result contract. Report pages are noindex
            and unavailable after deletion or expiry.
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="p-4">
              <p className="text-sm text-text-muted">Type</p>
              <p className="mt-1 text-xl text-text-primary">
                {"auditType" in data ? "Site" : "Quick"}
              </p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-text-muted">Score</p>
              <p className="mt-1 text-xl text-brand">
                {"auditType" in data
                  ? data.aggregate.siteHealthScore
                  : data.scoreFamilies.find((f) => f.family === "seo-health")?.cappedScore}
              </p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-text-muted">Request</p>
              <p className="mt-1 truncate text-sm text-text-primary">{data.requestId}</p>
            </Card>
          </div>
          <Button type="button" onClick={() => window.print()}>
            Print Report
          </Button>
        </Card>
      ) : null}
    </Container>
  );
}
