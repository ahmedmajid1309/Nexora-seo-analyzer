import { z } from "zod";
import { SITE_AUDIT_DEFAULT_LIMIT, SITE_AUDIT_MAX_PAGES } from "./types";

export const SiteAuditRequestSchema = z.object({
  url: z
    .string()
    .min(1, "URL is required")
    .max(2048, "URL must be 2048 characters or fewer")
    .refine((val) => !/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(val) || /^https?:\/\//i.test(val), {
      message: "Only HTTP and HTTPS URLs are supported",
    })
    .transform((val) =>
      val.startsWith("http://") || val.startsWith("https://") ? val : `https://${val}`,
    )
    .pipe(z.string().url("Invalid URL format")),
  pageLimit: z
    .number()
    .int("Page limit must be an integer")
    .min(1, "Page limit must be at least 1")
    .max(SITE_AUDIT_MAX_PAGES, `Page limit is capped at ${SITE_AUDIT_MAX_PAGES}`)
    .default(SITE_AUDIT_DEFAULT_LIMIT),
  crawlMode: z
    .enum(["links-and-sitemap", "links-only", "sitemap-first"])
    .default("links-and-sitemap"),
});

export type SiteAuditRequestInput = z.infer<typeof SiteAuditRequestSchema>;
