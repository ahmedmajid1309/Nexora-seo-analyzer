import { NextRequest, NextResponse } from "next/server";
import { AuditRequestSchema } from "@/lib/audit/schemas";
import type { AuditResponse, AuditResponseData } from "@/lib/audit/types";
import { safeFetch } from "@/lib/network";
import { isNexoraError } from "@/lib/errors";
import { buildPageSnapshot } from "@/lib/extraction";
import { runAll, getRuleCount } from "@/lib/rules";
import { calculateScores } from "@/lib/rules/scoring/engine";
import {
  checkRateLimit,
  checkHostCooldown,
  setHostCooldown,
  acquireConcurrentSlot,
  releaseConcurrentSlot,
  getExecutionDeadline,
} from "@/lib/audit/abuse-protection";
import { CALCULATION_VERSION } from "@/lib/rules/scoring/types";
import { env } from "@/config/env";
import type { PageSpeedOutput } from "@/lib/pagespeed/types";
import {
  trackAuditRequest,
  trackAuditError,
  trackRateLimitHit,
  captureError,
} from "@/lib/monitoring";
import { auditLogger } from "@/lib/logging";
import type { PageSnapshot } from "@/lib/extraction/types";

export const runtime = "nodejs";

function firstMetadata(snapshot: PageSnapshot, name: string): string | null {
  const entry = snapshot.metadata.find((m) => m.name.toLowerCase() === name.toLowerCase());
  return entry?.normalizedValue?.trim() || entry?.rawValue?.trim() || null;
}

function firstOpenGraph(snapshot: PageSnapshot, property: string): string | null {
  return (
    snapshot.social.openGraph
      .find((entry) => entry.property.toLowerCase() === property.toLowerCase())
      ?.content.trim() || null
  );
}

function firstTwitter(snapshot: PageSnapshot, name: string): string | null {
  return (
    snapshot.social.twitter
      .find((entry) => entry.name.toLowerCase() === name.toLowerCase())
      ?.content.trim() || null
  );
}

function resolveAgainstFinalUrl(value: string | null, finalUrl: string): string | null {
  if (!value) return null;
  try {
    return new URL(value, finalUrl).toString();
  } catch {
    return null;
  }
}

function buildPreviewData(
  snapshot: PageSnapshot,
): Pick<AuditResponseData, "serpPreview" | "socialPreview"> {
  const metaDescription = firstMetadata(snapshot, "description");
  const canonicalUrl = resolveAgainstFinalUrl(
    firstMetadata(snapshot, "canonical"),
    snapshot.finalUrl,
  );
  const ogTitle = firstOpenGraph(snapshot, "og:title");
  const ogDescription = firstOpenGraph(snapshot, "og:description");
  const ogImage = resolveAgainstFinalUrl(firstOpenGraph(snapshot, "og:image"), snapshot.finalUrl);
  const ogUrl = resolveAgainstFinalUrl(firstOpenGraph(snapshot, "og:url"), snapshot.finalUrl);
  const twitterTitle = firstTwitter(snapshot, "twitter:title");
  const twitterDescription = firstTwitter(snapshot, "twitter:description");
  const twitterImage = resolveAgainstFinalUrl(
    firstTwitter(snapshot, "twitter:image"),
    snapshot.finalUrl,
  );

  return {
    serpPreview: {
      title: snapshot.document.title || ogTitle || null,
      description: metaDescription || ogDescription || null,
      canonicalUrl,
      displayUrl: canonicalUrl || snapshot.finalUrl,
    },
    socialPreview: {
      ogTitle,
      ogDescription,
      ogImage,
      ogUrl,
      ogType: firstOpenGraph(snapshot, "og:type"),
      twitterCard: firstTwitter(snapshot, "twitter:card"),
      twitterTitle,
      twitterDescription,
      twitterImage,
    },
  };
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const requestId = crypto.randomUUID();
  trackAuditRequest();

  const rateCheck = checkRateLimit(request);
  if (!rateCheck.allowed) {
    trackRateLimitHit();
    auditLogger.warn("Rate limit hit", { requestId });
    return NextResponse.json(
      {
        success: false,
        requestId,
        error: {
          code: "RATE_LIMITED",
          message: "Too many requests. Please wait before trying again.",
        },
      } satisfies AuditResponse,
      { status: 429, headers: { "Retry-After": String(rateCheck.retryAfter ?? 60) } },
    );
  }

  if (!acquireConcurrentSlot()) {
    return NextResponse.json(
      {
        success: false,
        requestId,
        error: {
          code: "CAPACITY_EXHAUSTED",
          message: "The audit system is at capacity. Please try again shortly.",
        },
      } satisfies AuditResponse,
      { status: 503 },
    );
  }

  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          requestId,
          error: { code: "INVALID_REQUEST", message: "Invalid JSON body" },
        } satisfies AuditResponse,
        { status: 400 },
      );
    }

    const parsed = AuditRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          requestId,
          error: {
            code: "VALIDATION_ERROR",
            message: parsed.error.issues[0]?.message ?? "Invalid input",
          },
        } satisfies AuditResponse,
        { status: 400 },
      );
    }

    const { url } = parsed.data;

    const cooldownCheck = checkHostCooldown(url);
    if (!cooldownCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          requestId,
          error: {
            code: "HOST_COOLDOWN",
            message: "This website was recently audited. Please wait before scanning it again.",
          },
        } satisfies AuditResponse,
        { status: 429, headers: { "Retry-After": String(cooldownCheck.retryAfter ?? 30) } },
      );
    }

    const deadline = getExecutionDeadline();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), deadline);

    try {
      const fetchResult = await safeFetch(url, { signal: controller.signal });
      clearTimeout(timeout);

      const snapshot = buildPageSnapshot(fetchResult);
      const runResult = runAll(snapshot);

      let pagespeed: PageSpeedOutput | undefined;
      if (env.PAGESPEED_API_KEY) {
        try {
          const { fetchPageSpeedBoth } = await import("@/lib/pagespeed/parser");
          pagespeed = await fetchPageSpeedBoth({ url, timeoutMs: 15000 });
        } catch {
          // PageSpeed is optional — continue without it
        }
      }

      const scores = calculateScores({ results: runResult.results, snapshot, pagespeed });

      const stateCounts: Record<string, number> = {};
      const findings: AuditResponseData["findings"] = [];

      for (const r of runResult.results) {
        stateCounts[r.state] = (stateCounts[r.state] ?? 0) + 1;

        if (r.state === "failed" || r.state === "warning" || r.state === "passed") {
          findings.push({
            checkId: r.checkId,
            state: r.state,
            category: r.category,
            severity: r.severity,
            scored: r.scored,
            summary:
              r.evidence.summary.length > 200
                ? r.evidence.summary.slice(0, 200) + "..."
                : r.evidence.summary,
            impact: r.impact,
            effort: r.effort,
            remediationSummary: r.remediation.summary,
            remediationSteps: r.remediation.steps,
            responsible: r.remediation.responsible,
            confidence: r.confidence,
            applicabilityReason: r.applicabilityReason,
            unavailableReason: r.unavailableReason,
          });
        }
      }

      const categoryBreakdowns: AuditResponseData["categoryBreakdowns"] =
        scores.categoryContributions.map((c) => ({
          category: c.category,
          rawScore: c.rawScore,
          cappedScore: c.cappedScore,
          passed: c.passedCount,
          warning: c.warningCount,
          failed: c.failedCount,
          notApplicable: c.notApplicableCount,
          unavailable: c.unavailableCount,
          informational: c.informationalCount,
        }));

      const scoreFamilies: AuditResponseData["scoreFamilies"] = scores.scoreFamilies.map((f) => ({
        family: f.family,
        name: f.name,
        rawScore: f.rawScore,
        cappedScore: f.cappedScore,
        confidence: f.confidence,
      }));

      const psMobile = pagespeed?.mobile ?? null;
      const psDesktop = pagespeed?.desktop ?? null;
      const previews = buildPreviewData(snapshot);

      const data: AuditResponseData = {
        requestId,
        requestedUrl: snapshot.requestedUrl,
        finalUrl: snapshot.finalUrl,
        responseStatus: snapshot.response.status,
        contentType: snapshot.response.contentType,
        byteLength: snapshot.response.byteLength,
        durationMs: runResult.durationMs,
        totalRules: getRuleCount(),
        stateCounts,
        findings: findings.slice(0, 200),
        findingsTruncated: findings.length > 200,
        categoryBreakdowns,
        scoreFamilies,
        confidence: scores.confidence,
        appliedCaps: scores.appliedCaps.map((c) => ({
          capId: c.capId,
          reason: c.reason,
          maxScore: c.maxScore,
          applied: c.applied,
        })),
        extractionWarnings: snapshot.extractionWarnings.map((w) => w.message).slice(0, 20),
        partialStage: runResult.errorCount > 0 ? "rule-execution" : null,
        unavailableStage: null,
        performanceScore: scores.performanceScore,
        performanceStatus: scores.performanceStatus,
        performanceSource: scores.performanceSource,
        performanceConfidence: scores.performanceConfidence,
        performanceExplanation: scores.performanceExplanation,
        performanceMobile: psMobile
          ? {
              labMetrics: psMobile.labMetrics,
              fieldData: psMobile.fieldData,
              opportunities: psMobile.opportunities.slice(0, 10),
            }
          : null,
        performanceDesktop: psDesktop
          ? {
              labMetrics: psDesktop.labMetrics,
              fieldData: psDesktop.fieldData,
              opportunities: psDesktop.opportunities.slice(0, 10),
            }
          : null,
        serpPreview: previews.serpPreview,
        socialPreview: previews.socialPreview,
        calculationVersion: CALCULATION_VERSION,
        snapshotSchemaVersion: snapshot.schemaVersion,
      };

      return NextResponse.json({ success: true, requestId, data } satisfies AuditResponse, {
        status: 200,
      });
    } catch (err: unknown) {
      clearTimeout(timeout);
      setHostCooldown(url);
      trackAuditError();
      captureError("audit", err);

      if (isNexoraError(err)) {
        const resp = err.toPublicResponse();
        return NextResponse.json(
          {
            success: false,
            requestId,
            error: { code: resp.error.code, message: resp.error.message },
          } satisfies AuditResponse,
          { status: err.httpStatus },
        );
      }

      if (err instanceof DOMException && err.name === "AbortError") {
        return NextResponse.json(
          {
            success: false,
            requestId,
            error: {
              code: "TIMEOUT",
              message: "The audit timed out. The page may be too slow or too large.",
            },
          } satisfies AuditResponse,
          { status: 504 },
        );
      }

      return NextResponse.json(
        {
          success: false,
          requestId,
          error: {
            code: "FETCH_FAILED",
            message: "Failed to fetch the URL. The page may be unreachable.",
          },
        } satisfies AuditResponse,
        { status: 502 },
      );
    }
  } finally {
    releaseConcurrentSlot();
  }
}
