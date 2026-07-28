import { z } from "zod";

export const SaveReportRequestSchema = z.object({
  reportType: z.enum(["quick", "site"]),
  data: z.unknown(),
  idempotencyKey: z.string().min(8).max(200).optional(),
});

export const ReportAccessSchema = z.object({
  ownerToken: z.string().min(20).optional(),
  shareToken: z.string().min(20).optional(),
});

export const ReportHistoryQuerySchema = z.object({
  type: z.enum(["all", "quick", "site"]).default("all"),
  status: z.string().default("all"),
  q: z.string().max(200).default(""),
  sort: z.enum(["newest", "oldest", "score", "domain"]).default("newest"),
  cursor: z.string().optional(),
});
