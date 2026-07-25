import { NextRequest, NextResponse } from "next/server";
import { AuditRequestSchema } from "@/lib/audit/schemas";
import type { AuditResponse } from "@/lib/audit/types";
import { isNexoraError } from "@/lib/errors";
import { runQuickAudit } from "@/lib/audit/quick-audit";
import {
  checkRateLimit,
  checkHostCooldown,
  setHostCooldown,
  acquireConcurrentSlot,
  releaseConcurrentSlot,
  getExecutionDeadline,
} from "@/lib/audit/abuse-protection";
import {
  trackAuditRequest,
  trackAuditError,
  trackRateLimitHit,
  captureError,
} from "@/lib/monitoring";
import { auditLogger } from "@/lib/logging";

export const runtime = "nodejs";

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
      const { data } = await runQuickAudit({
        url,
        requestId,
        signal: controller.signal,
        pagespeed: true,
        renderedDom: true,
      });
      clearTimeout(timeout);

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
