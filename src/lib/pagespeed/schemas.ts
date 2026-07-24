import { z } from "zod";

export const PSIAuditMetricSchema = z
  .object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    score: z.number().nullable(),
    numericValue: z.number().optional(),
    displayValue: z.string().optional(),
    details: z.unknown().optional(),
    warnings: z.unknown().optional(),
  })
  .passthrough();

export const PSICategorySchema = z
  .object({
    id: z.string(),
    title: z.string(),
    score: z.number().nullable(),
  })
  .passthrough();

export const PSIEnvironmentSchema = z
  .object({
    networkUserAgent: z.string(),
    benchmarkIndex: z.number(),
  })
  .passthrough();

export const PSILighthouseResultSchema = z
  .object({
    requestedUrl: z.string(),
    finalUrl: z.string(),
    lighthouseVersion: z.string(),
    userAgent: z.string(),
    fetchTime: z.string(),
    environment: PSIEnvironmentSchema,
    categories: z.record(z.string(), PSICategorySchema),
    audits: z.record(z.string(), PSIAuditMetricSchema),
  })
  .passthrough();

export const PSICrUXMetricSchema = z
  .object({
    percentile: z.number(),
    distributions: z.array(
      z.object({
        proportion: z.number(),
        min: z.number().optional(),
        max: z.number().optional(),
      }),
    ),
    category: z.string(),
  })
  .passthrough();

export const PSILoadingExperienceSchema = z
  .object({
    id: z.string().optional(),
    metrics: z.record(z.string(), PSICrUXMetricSchema).optional(),
    overall_category: z.string().optional(),
    initial_url: z.string().optional(),
  })
  .passthrough();

export const PSIResponseSchema = z
  .object({
    captchaResult: z.string().optional(),
    kind: z.string().optional(),
    id: z.string().optional(),
    loadingExperience: PSILoadingExperienceSchema.optional(),
    lighthouseResult: PSILighthouseResultSchema.optional(),
    analysisUTCTimestamp: z.string().optional(),
  })
  .passthrough();

export type PSIResponse = z.infer<typeof PSIResponseSchema>;
export type PSILighthouseResult = z.infer<typeof PSILighthouseResultSchema>;
export type PSILoadingExperience = z.infer<typeof PSILoadingExperienceSchema>;
export type PSIAuditMetric = z.infer<typeof PSIAuditMetricSchema>;
