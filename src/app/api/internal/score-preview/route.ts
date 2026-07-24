import { NextRequest, NextResponse } from "next/server";
import { safeFetch } from "@/lib/network";
import { FetchPreviewInputSchema } from "@/lib/network";
import { buildPageSnapshot } from "@/lib/extraction";
import { runAll, getRuleCount } from "@/lib/rules";
import { calculateScores } from "@/lib/rules/scoring/engine";
import { isNexoraError } from "@/lib/errors";
import { CALCULATION_VERSION } from "@/lib/rules/scoring/types";
import type { ScorePreviewData } from "@/lib/rules/scoring/types";
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
  const totalRules = getRuleCount();

  try {
    const fetchResult = await safeFetch(parsed.data.url);
    const snapshot = buildPageSnapshot(fetchResult);
    const runResult = runAll(snapshot);
    const scores = calculateScores({ results: runResult.results, snapshot });

    const stateCounts: Record<string, number> = {};
    for (const r of runResult.results) {
      stateCounts[r.state] = (stateCounts[r.state] ?? 0) + 1;
    }

    const topFindings: Array<{
      checkId: string;
      state: string;
      category: string;
      summary: string;
    }> = [];
    for (const r of runResult.results) {
      if (r.state === "failed" || r.state === "warning") {
        topFindings.push({
          checkId: r.checkId,
          state: r.state,
          category: r.category,
          summary:
            r.evidence.summary.length > 200
              ? r.evidence.summary.slice(0, 200) + "..."
              : r.evidence.summary,
        });
      }
    }

    const partialStage = runResult.errorCount > 0 ? "rule-execution" : null;

    const data: ScorePreviewData = {
      requestId,
      requestedUrl: snapshot.requestedUrl,
      finalUrl: snapshot.finalUrl,
      totalRules,
      stateCounts,
      scoreFamilies: scores.scoreFamilies,
      confidence: scores.confidence,
      appliedCaps: scores.appliedCaps,
      topFindings: topFindings.slice(0, 50),
      findingsTruncated: topFindings.length > 50,
      partialStage,
      unavailableStage: null,
      performanceScore: scores.performanceScore,
      performanceStatus: scores.performanceStatus,
      performanceSource: scores.performanceSource,
      performanceConfidence: scores.performanceConfidence,
      calculationVersion: CALCULATION_VERSION,
    };

    return NextResponse.json({ success: true, requestId, data });
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
