import { z } from "zod";

export const AuditJobPayloadSchema = z.object({
  jobType: z.enum(["quick-audit", "site-audit"]),
  url: z.string().url(),
  requestId: z.string().min(8).max(128),
  accessTokenHash: z.string().regex(/^[a-f0-9]{64}$/),
  accessTokenHashes: z.array(z.string().regex(/^[a-f0-9]{64}$/)).optional(),
  pageLimit: z.number().int().positive().max(25).optional(),
  crawlMode: z.enum(["links-and-sitemap", "links-only", "sitemap-first"]).optional(),
  idempotencyKey: z.string().min(8).max(200).optional(),
});

export const AuditJobRequestSchema = z.object({
  jobType: z.enum(["quick-audit", "site-audit"]),
  url: z.string().url(),
  pageLimit: z.number().int().positive().max(25).optional(),
  crawlMode: z.enum(["links-and-sitemap", "links-only", "sitemap-first"]).optional(),
  idempotencyKey: z.string().min(8).max(200).optional(),
});
