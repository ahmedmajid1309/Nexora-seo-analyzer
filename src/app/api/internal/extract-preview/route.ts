import { NextRequest, NextResponse } from "next/server";
import { safeFetch } from "@/lib/network";
import { FetchPreviewInputSchema } from "@/lib/network";
import { buildPageSnapshot } from "@/lib/extraction";
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

  try {
    const fetchResult = await safeFetch(parsed.data.url);
    const snapshot = buildPageSnapshot(fetchResult);

    return NextResponse.json({
      success: true,
      requestId,
      data: {
        schemaVersion: snapshot.schemaVersion,
        extractedAt: snapshot.extractedAt,
        requestedUrl: snapshot.requestedUrl,
        finalUrl: snapshot.finalUrl,
        response: {
          status: snapshot.response.status,
          contentType: snapshot.response.contentType,
          byteLength: snapshot.response.byteLength,
          timing: snapshot.response.timing,
        },
        document: {
          title: snapshot.document.title,
          lang: snapshot.document.lang,
          declaredLanguage: snapshot.document.declaredLanguage,
          approxDomNodeCount: snapshot.document.approxDomNodeCount,
          hasHead: snapshot.document.hasHead,
          hasBody: snapshot.document.hasBody,
          charsetDeclarations: snapshot.document.charsetDeclarations.length,
          viewportDeclarations: snapshot.document.viewportDeclarations.length,
        },
        metadata: {
          total: snapshot.metadata.length,
          titleCount: snapshot.metadata.filter((m) => m.name === "title").length,
          descriptionCount: snapshot.metadata.filter((m) => m.name === "description").length,
          canonicalCount: snapshot.metadata.filter((m) => m.name === "canonical").length,
        },
        headings: {
          total: snapshot.headings.length,
          byLevel: [1, 2, 3, 4, 5, 6].map((l) => ({
            level: l,
            count: snapshot.headings.filter((h) => h.level === l).length,
          })),
        },
        links: {
          total: snapshot.links.length,
          internalCount: snapshot.links.filter((l) => l.isSameOrigin).length,
          externalCount: snapshot.links.filter(
            (l) => !l.isSameOrigin && l.protocol?.startsWith("http"),
          ).length,
        },
        images: {
          total: snapshot.images.length,
          withAlt: snapshot.images.filter((i) => i.hasAlt).length,
          withoutAlt: snapshot.images.filter((i) => !i.hasAlt).length,
        },
        structuredData: {
          total: snapshot.structuredData.length,
          validCount: snapshot.structuredData.filter((b) => b.parseSuccess).length,
          types: [...new Set(snapshot.structuredData.flatMap((b) => b.parsedTypes))],
          microdataPresent: snapshot.microdata.present,
          rdfaPresent: snapshot.rdfa.present,
        },
        social: {
          ogTotal: snapshot.social.openGraph.length,
          twitterTotal: snapshot.social.twitter.length,
        },
        content: {
          wordCount: snapshot.content.wordCount,
          paragraphCount: snapshot.content.paragraphCount,
          sentenceCount: snapshot.content.sentenceCount,
          tableCount: snapshot.content.tableCount,
          listCount: snapshot.content.listCount,
          truncated: snapshot.content.isTruncated,
        },
        accessibility: {
          imageAltIssues: snapshot.accessibility.imageAltPresent.withoutAlt,
          formLabelIssues: snapshot.accessibility.formLabelRelationships.withoutLabel,
          buttonTextIssues: snapshot.accessibility.buttonTextSignals.withoutText,
          duplicateIds: snapshot.accessibility.duplicateIds.length,
          landmarkCount: Object.values(snapshot.accessibility.landmarkElements).reduce(
            (a: number, b: number) => a + b,
            0,
          ),
          viewportZoomRestricted: snapshot.accessibility.viewportZoomRestricted,
        },
        forms: {
          total: snapshot.forms.formCount,
          totalInputs: snapshot.forms.forms.reduce((a: number, f) => a + f.inputs.length, 0),
        },
        resources: {
          total: snapshot.resources.length,
          scripts: snapshot.resources.filter((r) => r.type === "script").length,
          stylesheets: snapshot.resources.filter((r) => r.type === "stylesheet").length,
        },
        extractionWarnings: snapshot.extractionWarnings.map((w) => ({
          code: w.code,
          message: w.message,
        })),
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
