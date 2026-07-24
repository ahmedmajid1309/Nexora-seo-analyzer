import { NextRequest, NextResponse } from "next/server";
import { safeFetch } from "@/lib/network";
import { FetchPreviewInputSchema } from "@/lib/network";
import { isNexoraError } from "@/lib/errors";
import { productionGuard } from "@/lib/internal-guard";

const inMemoryRateLimit = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 5;

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

  try {
    const result = await safeFetch(parsed.data.url);

    const previewHtml =
      result.html.length > 2000
        ? result.html.slice(0, 2000) + "\n<!-- ... truncated for preview -->"
        : result.html;

    return NextResponse.json({
      success: true,
      requestId,
      data: {
        requestedUrl: result.requestedUrl,
        normalizedUrl: result.normalizedUrl,
        finalUrl: result.finalUrl,
        status: result.status,
        statusText: result.statusText,
        contentType: result.contentType,
        byteLength: result.byteLength,
        redirectChain: result.redirectChain,
        timing: result.timing,
        htmlPreview: previewHtml,
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
