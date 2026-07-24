import { NextRequest, NextResponse } from "next/server";
import { safeFetch } from "@/lib/network";
import { FetchPreviewInputSchema } from "@/lib/network";
import { buildPageSnapshot } from "@/lib/extraction";
import { runAll, getRuleCount } from "@/lib/rules";
import { isNexoraError } from "@/lib/errors";
import { productionGuard } from "@/lib/internal-guard";

const inMemoryRateLimit = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 10;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const window = inMemoryRateLimit.get(ip) ?? [];
  const recent = window.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  if (recent.length >= RATE_LIMIT_MAX) return false;
  recent.push(now);
  inMemoryRateLimit.set(ip, recent);
  return true;
}

export async function POST(request: NextRequest) {
  const guard = productionGuard();
  if (guard) return guard;

  const ip = request.headers.get("x-forwarded-for") ?? "127.0.0.1";
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { success: false, error: { code: "RATE_LIMITED", message: "Too many requests" } },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: { code: "INVALID_REQUEST", message: "Invalid JSON body" } },
      { status: 400 },
    );
  }

  const parsed = FetchPreviewInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid input",
          validationErrors: parsed.error.issues.map((i) => ({
            path: i.path.join("."),
            message: i.message,
          })),
        },
      },
      { status: 400 },
    );
  }

  const requestId = crypto.randomUUID();
  const registeredCount = getRuleCount();

  try {
    const fetchResult = await safeFetch(parsed.data.url);
    const snapshot = buildPageSnapshot(fetchResult);
    const runResult = runAll(snapshot);

    const stateCounts: Record<string, number> = {};
    const categoryCounts: Record<string, number> = {};
    const findings: Array<{
      checkId: string;
      state: string;
      category: string;
      summary: string;
    }> = [];
    const extractionWarnings = snapshot.extractionWarnings.map((w) => ({
      code: w.code,
      message: w.message,
    }));
    let partialCount = 0;
    let unavailableCount = 0;

    for (const r of runResult.results) {
      stateCounts[r.state] = (stateCounts[r.state] ?? 0) + 1;
      categoryCounts[r.category] = (categoryCounts[r.category] ?? 0) + 1;

      if (r.state === "failed" || r.state === "warning") {
        findings.push({
          checkId: r.checkId,
          state: r.state,
          category: r.category,
          summary:
            r.evidence.summary.length > 200
              ? r.evidence.summary.slice(0, 200) + "..."
              : r.evidence.summary,
        });
      }

      if (r.state === "unavailable") {
        unavailableCount++;
      }
    }

    partialCount = runResult.errorCount;

    return NextResponse.json({
      success: true,
      requestId,
      data: {
        requestedUrl: snapshot.requestedUrl,
        finalUrl: snapshot.finalUrl,
        totalRegisteredRules: registeredCount,
        executedRules: runResult.results.length,
        durationMs: runResult.durationMs,
        stateCounts,
        categoryCounts,
        findings: findings.slice(0, 100),
        findingsTruncated: findings.length > 100,
        extractionWarnings: extractionWarnings.slice(0, 20),
        extractionWarningsTruncated: extractionWarnings.length > 20,
        partialCount,
        unavailableCount,
      },
    });
  } catch (err) {
    if (isNexoraError(err)) {
      return NextResponse.json(err.toPublicResponse(), { status: err.httpStatus });
    }
    return NextResponse.json(
      {
        success: false,
        requestId,
        error: { code: "INTERNAL_ERROR", message: "An internal error occurred" },
      },
      { status: 500 },
    );
  }
}
