import { NextRequest, NextResponse } from "next/server";
import { SiteAuditRequestSchema } from "@/lib/site-audit/schemas";
import { runSiteAudit, type SiteAuditResponse } from "@/lib/site-audit";
import { isNexoraError } from "@/lib/errors";
import {
  acquireConcurrentSlot,
  checkHostCooldown,
  checkRateLimit,
  releaseConcurrentSlot,
  setHostCooldown,
} from "@/lib/audit/abuse-protection";
import {
  captureError,
  trackAuditError,
  trackAuditRequest,
  trackRateLimitHit,
} from "@/lib/monitoring";
import { auditLogger } from "@/lib/logging";

export const runtime = "nodejs";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const requestId = crypto.randomUUID();
  trackAuditRequest();

  const rateCheck = checkRateLimit(request);
  if (!rateCheck.allowed) {
    trackRateLimitHit();
    auditLogger.warn("Site audit rate limit hit", { requestId });
    return NextResponse.json(
      {
        success: false,
        requestId,
        error: {
          code: "RATE_LIMITED",
          message: "Too many requests. Please wait before trying again.",
        },
      } satisfies SiteAuditResponse,
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
      } satisfies SiteAuditResponse,
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
        } satisfies SiteAuditResponse,
        { status: 400 },
      );
    }

    const parsed = SiteAuditRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          requestId,
          error: {
            code: "VALIDATION_ERROR",
            message: parsed.error.issues[0]?.message ?? "Invalid input",
          },
        } satisfies SiteAuditResponse,
        { status: 400 },
      );
    }

    const { url, pageLimit, crawlMode } = parsed.data;
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
        } satisfies SiteAuditResponse,
        { status: 429, headers: { "Retry-After": String(cooldownCheck.retryAfter ?? 30) } },
      );
    }

    try {
      const data = await runSiteAudit({ requestId, url, pageLimit, crawlMode });
      return NextResponse.json({ success: true, requestId, data } satisfies SiteAuditResponse, {
        status: 200,
      });
    } catch (err) {
      setHostCooldown(url);
      trackAuditError();
      captureError("site-audit", err);
      if (isNexoraError(err)) {
        const resp = err.toPublicResponse();
        return NextResponse.json(
          {
            success: false,
            requestId,
            error: { code: resp.error.code, message: resp.error.message },
          } satisfies SiteAuditResponse,
          { status: err.httpStatus },
        );
      }
      return NextResponse.json(
        {
          success: false,
          requestId,
          error: { code: "SITE_AUDIT_FAILED", message: "The site audit could not be completed." },
        } satisfies SiteAuditResponse,
        { status: 502 },
      );
    }
  } finally {
    releaseConcurrentSlot();
  }
}
