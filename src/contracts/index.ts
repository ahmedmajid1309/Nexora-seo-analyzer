import { z } from "zod";

export const AuditModeSchema = z.enum(["quick", "site"]);
export type AuditMode = z.infer<typeof AuditModeSchema>;

export const CategoryIdSchema = z.enum([
  "technical-seo",
  "crawlability-indexability",
  "metadata",
  "on-page-seo",
  "security-headers",
  "performance",
  "content-structure",
  "internal-links",
  "external-links",
  "images",
  "structured-data",
  "urls",
  "accessibility",
  "mobile",
  "trust-legal",
  "eeat",
  "social-metadata",
  "international-seo",
  "javascript-seo",
  "aeo-readiness",
  "geo-readiness",
  "ai-crawler-llmstxt",
  "cross-page-site-arch",
]);
export type CategoryId = z.infer<typeof CategoryIdSchema>;

export const FindingStateSchema = z.enum([
  "passed",
  "warning",
  "failed",
  "not-applicable",
  "unavailable",
]);
export type FindingState = z.infer<typeof FindingStateSchema>;

export const SeveritySchema = z.enum(["critical", "high", "medium", "low", "informational"]);
export type Severity = z.infer<typeof SeveritySchema>;

export const ImpactSchema = z.string();
export type Impact = z.infer<typeof ImpactSchema>;

export const EffortSchema = z.enum(["low", "medium", "high"]);
export type Effort = z.infer<typeof EffortSchema>;

export const ApplicabilitySchema = z.enum(["applicable", "not-applicable", "unavailable"]);
export type Applicability = z.infer<typeof ApplicabilitySchema>;

export const EvidenceSchema = z.object({
  summary: z.string(),
  observedValue: z.union([z.string(), z.number(), z.boolean(), z.null()]),
  expectedValue: z.union([z.string(), z.number(), z.boolean(), z.null()]),
  selector: z.string().optional(),
  samples: z.array(z.string()).max(3).optional(),
  affectedUrls: z.array(z.string()).optional(),
});
export type Evidence = z.infer<typeof EvidenceSchema>;

export const RemediationSchema = z.object({
  summary: z.string(),
  steps: z.array(z.string()),
  developerNotes: z.string().optional(),
  contentNotes: z.string().optional(),
  responsible: z.enum(["developer", "content", "both"]),
});
export type Remediation = z.infer<typeof RemediationSchema>;

export const ResultSourceSchema = z.enum([
  "http-response",
  "html-parse",
  "rendered-dom",
  "cross-page-analysis",
  "external-api",
]);
export type ResultSource = z.infer<typeof ResultSourceSchema>;

export const PartialCompletionStatusSchema = z.enum(["completed", "partial", "pending", "skipped"]);
export type PartialCompletionStatus = z.infer<typeof PartialCompletionStatusSchema>;

export const ReportVisibilitySchema = z.enum(["unlisted", "public"]);
export type ReportVisibility = z.infer<typeof ReportVisibilitySchema>;

export const PublicApiSuccessResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.literal(true),
    data: dataSchema,
  });

export const PublicApiErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.string(),
    requestId: z.string().optional(),
    validationErrors: z
      .array(
        z.object({
          path: z.string(),
          message: z.string(),
        }),
      )
      .optional(),
  }),
});

export type PublicApiErrorResponse = z.infer<typeof PublicApiErrorResponseSchema>;
