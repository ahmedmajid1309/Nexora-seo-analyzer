import { z } from "zod";

export const RENDERED_DOM_CONTRACT_VERSION = "1.0.0";

export const RenderWorkerRequestSchema = z.object({
  requestId: z.string().min(1).max(100),
  url: z.string().url(),
  timeoutMs: z.number().int().positive().max(30_000),
});

export const RenderedDomSnapshotSchema = z.object({
  schemaVersion: z.literal(RENDERED_DOM_CONTRACT_VERSION),
  requestedUrl: z.string().url(),
  finalUrl: z.string().url(),
  statusCode: z.number().int().nullable(),
  renderedAt: z.string(),
  durationMs: z.number().int().nonnegative(),
  document: z.object({
    title: z.string().nullable(),
    lang: z.string().nullable(),
    viewport: z.string().nullable(),
    canonical: z.string().nullable(),
    metaDescription: z.string().nullable(),
    robots: z.string().nullable(),
    h1Texts: z.array(z.string()).max(10),
    headingCounts: z.object({
      h1: z.number().int().nonnegative(),
      h2: z.number().int().nonnegative(),
      total: z.number().int().nonnegative(),
    }),
    linkCount: z.number().int().nonnegative(),
    internalLinkCount: z.number().int().nonnegative(),
    externalLinkCount: z.number().int().nonnegative(),
    imageCount: z.number().int().nonnegative(),
    imageAlt: z.object({
      total: z.number().int().nonnegative(),
      withAlt: z.number().int().nonnegative(),
      withoutAlt: z.number().int().nonnegative(),
    }),
    structuredDataCount: z.number().int().nonnegative(),
    structuredDataTypes: z.array(z.string()).max(40),
    forms: z.object({
      total: z.number().int().nonnegative(),
      inputs: z.number().int().nonnegative(),
      passwordInputs: z.number().int().nonnegative(),
    }),
    visibleTextLength: z.number().int().nonnegative(),
    meaningfulTextLength: z.number().int().nonnegative(),
    approxDomNodeCount: z.number().int().nonnegative(),
    domContentHash: z.string().min(1).max(128),
  }),
  javascript: z.object({
    enabled: z.literal(true),
    consoleErrorCount: z.number().int().nonnegative(),
    consoleErrors: z.array(z.string()).max(10),
    requestFailedCount: z.number().int().nonnegative(),
    failedResources: z
      .array(
        z.object({ url: z.string(), resourceType: z.string(), failureText: z.string().nullable() }),
      )
      .max(10),
    timedOut: z.boolean(),
  }),
  lab: z.object({
    source: z.literal("Rendered browser lab observation"),
    navigationTtfbMs: z.number().nonnegative().nullable(),
    fcpMs: z.number().nonnegative().nullable(),
    observedLcpMs: z.number().nonnegative().nullable(),
    observedCls: z.number().nonnegative().nullable(),
    longTaskCount: z.number().int().nonnegative().nullable(),
    totalLongTaskDurationMs: z.number().nonnegative().nullable(),
    domContentLoadedMs: z.number().nonnegative().nullable(),
    loadMs: z.number().nonnegative().nullable(),
    resourceCount: z.number().int().nonnegative().nullable(),
    transferredBytesEstimate: z.number().int().nonnegative().nullable(),
  }),
});

export const RenderWorkerResponseSchema = z.object({
  success: z.boolean(),
  requestId: z.string().min(1),
  snapshot: RenderedDomSnapshotSchema.optional(),
  error: z
    .object({
      code: z.string(),
      message: z.string(),
    })
    .optional(),
});

export type RenderWorkerRequest = z.infer<typeof RenderWorkerRequestSchema>;
export type RenderedDomSnapshot = z.infer<typeof RenderedDomSnapshotSchema>;
export type RenderWorkerResponse = z.infer<typeof RenderWorkerResponseSchema>;

export interface RenderedDomFinding {
  checkId: string;
  state: "passed" | "warning" | "failed" | "unavailable";
  severity: "high" | "medium" | "low" | "informational";
  summary: string;
  evidence: string;
  impact: string;
  remediation: string;
  responsible: "owner" | "seo" | "developer" | "content-editor" | "designer";
  effort: "low" | "medium" | "high";
  applicability: string;
  staticValue: string | number | null;
  renderedValue: string | number | null;
  confidence: number;
}

export interface RenderedDomAnalysis {
  status: "disabled" | "available" | "unavailable";
  workerStatus: "not-configured" | "healthy" | "unreachable" | "error" | "circuit-open";
  renderedUrl: string | null;
  durationMs: number | null;
  domNodeDelta: number | null;
  visibleTextDelta: number | null;
  consoleErrorCount: number | null;
  requestFailedCount: number | null;
  lab: RenderedDomSnapshot["lab"] | null;
  findings: RenderedDomFinding[];
  unavailableReason: string | null;
  schemaVersion: string;
}

export function unavailableRenderedAnalysis(
  workerStatus: RenderedDomAnalysis["workerStatus"],
  reason: string,
): RenderedDomAnalysis {
  return {
    status: workerStatus === "not-configured" ? "disabled" : "unavailable",
    workerStatus,
    renderedUrl: null,
    durationMs: null,
    domNodeDelta: null,
    visibleTextDelta: null,
    consoleErrorCount: null,
    requestFailedCount: null,
    lab: null,
    findings: [
      {
        checkId: "JS-014",
        state: "unavailable",
        severity: "informational",
        summary: "Rendered DOM analysis unavailable.",
        evidence: reason,
        impact:
          "Rendered diagnostics are unavailable; static SEO scoring still completed without penalty.",
        remediation:
          "Configure or restore the isolated render worker if rendered diagnostics are required.",
        responsible: "developer",
        effort: "medium",
        applicability: "Applies when rendered DOM analysis was requested but could not run.",
        staticValue: null,
        renderedValue: null,
        confidence: 100,
      },
    ],
    unavailableReason: reason,
    schemaVersion: RENDERED_DOM_CONTRACT_VERSION,
  };
}
