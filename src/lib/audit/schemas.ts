import { z } from "zod";

export const AuditRequestSchema = z.object({
  url: z
    .string()
    .min(1, "URL is required")
    .max(2048, "URL must be 2048 characters or fewer")
    .transform((val) =>
      val.startsWith("http://") || val.startsWith("https://") ? val : `https://${val}`,
    )
    .pipe(z.string().url("Invalid URL format")),
  keyword: z.string().max(500, "Keyword must be 500 characters or fewer").trim().optional(),
  expectIndexable: z.boolean().optional(),
});

export type AuditRequestInput = z.infer<typeof AuditRequestSchema>;
