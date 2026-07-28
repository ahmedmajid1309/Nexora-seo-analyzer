import { z } from "zod";

export const RENDERED_DOM_CONTRACT_VERSION = "1.0.0";

export const RenderRequestSchema = z.object({
  requestId: z.string().min(1).max(100),
  url: z.string().url(),
  timeoutMs: z.number().int().positive().max(30_000),
});

export type RenderRequest = z.infer<typeof RenderRequestSchema>;

export interface RenderedDomSnapshot {
  schemaVersion: typeof RENDERED_DOM_CONTRACT_VERSION;
  requestedUrl: string;
  finalUrl: string;
  statusCode: number | null;
  renderedAt: string;
  durationMs: number;
  document: {
    title: string | null;
    lang: string | null;
    viewport: string | null;
    canonical: string | null;
    metaDescription: string | null;
    robots: string | null;
    h1Texts: string[];
    headingCounts: { h1: number; h2: number; total: number };
    linkCount: number;
    internalLinkCount: number;
    externalLinkCount: number;
    imageCount: number;
    imageAlt: { total: number; withAlt: number; withoutAlt: number };
    structuredDataCount: number;
    structuredDataTypes: string[];
    forms: { total: number; inputs: number; passwordInputs: number };
    visibleTextLength: number;
    meaningfulTextLength: number;
    approxDomNodeCount: number;
    domContentHash: string;
  };
  javascript: {
    enabled: true;
    consoleErrorCount: number;
    consoleErrors: string[];
    requestFailedCount: number;
    failedResources: { url: string; resourceType: string; failureText: string | null }[];
    timedOut: boolean;
  };
  lab: {
    source: "Rendered browser lab observation";
    navigationTtfbMs: number | null;
    fcpMs: number | null;
    observedLcpMs: number | null;
    observedCls: number | null;
    longTaskCount: number | null;
    totalLongTaskDurationMs: number | null;
    domContentLoadedMs: number | null;
    loadMs: number | null;
    resourceCount: number | null;
    transferredBytesEstimate: number | null;
  };
}
