import { z } from "zod/v4";

export const RuleStateSchema = z.enum([
  "passed",
  "warning",
  "failed",
  "not-applicable",
  "unavailable",
]);

export const SeveritySchema = z.enum(["critical", "high", "medium", "low", "informational"]);

export const EffortSchema = z.enum(["low", "medium", "high"]);

export const SourceSchema = z.enum([
  "http-response",
  "html-parse",
  "rendered-dom",
  "cross-page-analysis",
  "external-api",
]);

export const ResponsibleSchema = z.enum([
  "owner",
  "seo",
  "developer",
  "content-editor",
  "designer",
]);

export const DispositionSchema = z.enum([
  "PORT_AS_IS",
  "PORT_WITH_MODIFICATIONS",
  "USE_AS_REFERENCE",
  "REWRITE",
  "SKIP",
  "FUTURE",
]);

export const ProvenanceSchema = z.object({
  upstreamRuleId: z.string(),
  upstreamSourcePath: z.string(),
  upstreamCommitHash: z.string(),
  disposition: DispositionSchema,
  modifications: z.string().optional(),
});

export const RuleEvidenceSchema = z.object({
  summary: z.string(),
  observedValue: z.union([z.string(), z.number(), z.boolean(), z.null()]),
  expectedValue: z.union([z.string(), z.number(), z.boolean(), z.null()]),
  selector: z.string().optional(),
  samples: z.array(z.string()).max(3).optional(),
});

export const RuleRemediationSchema = z.object({
  summary: z.string(),
  steps: z.array(z.string()).min(1),
  developerNotes: z.string().optional(),
  contentNotes: z.string().optional(),
  responsible: ResponsibleSchema,
});

export const RuleResultSchema = z.object({
  checkId: z.string(),
  state: RuleStateSchema,
  evidence: RuleEvidenceSchema,
  remediation: RuleRemediationSchema,
  severity: SeveritySchema,
  scored: z.boolean(),
  impact: z.string(),
  effort: EffortSchema,
  confidence: z.number().min(0).max(100),
  source: SourceSchema,
  category: z.string(),
  applicabilityReason: z.string().optional(),
  unavailableReason: z.string().optional(),
});

export const RulePreviewResponseSchema = z.object({
  requestId: z.string(),
  url: z.string(),
  ruleCount: z.number(),
  stateCounts: z.object({
    passed: z.number(),
    warning: z.number(),
    failed: z.number(),
    "not-applicable": z.number(),
    unavailable: z.number(),
  }),
  categoryCounts: z.record(z.string(), z.number()),
  findings: z.array(RuleResultSchema),
});

export type RuleResultType = z.infer<typeof RuleResultSchema>;
export type RulePreviewResponse = z.infer<typeof RulePreviewResponseSchema>;
