import { z } from "zod";

export const envSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_APP_VERSION: z.string().default("0.1.0"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PAGESPEED_API_KEY: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().default("gemini-1.5-flash"),
  GEMINI_BASE_URL: z.string().url().optional(),
  GROQ_API_KEY: z.string().optional(),
  GROQ_MODEL: z.string().default("llama-3.1-8b-instant"),
  GROQ_BASE_URL: z.string().url().optional(),
  AI_SUMMARY_ENABLED: z
    .enum(["true", "false"])
    .default("false")
    .transform((value) => value === "true"),
  AI_SUMMARY_PROVIDER_ORDER: z.string().default("gemini,groq"),
  AI_SUMMARY_TIMEOUT_MS: z.coerce.number().int().positive().max(30_000).default(12_000),
  AI_SUMMARY_MAX_INPUT_CHARS: z.coerce.number().int().positive().max(60_000).default(24_000),
  AI_SUMMARY_MAX_OUTPUT_TOKENS: z.coerce.number().int().positive().max(4_000).default(1_200),
  AI_SUMMARY_CACHE_TTL_MS: z.coerce.number().int().positive().max(3_600_000).default(900_000),
  AI_SUMMARY_CACHE_MAX_ENTRIES: z.coerce.number().int().positive().max(1_000).default(100),
  AI_SUMMARY_PROVIDER_MAX_ATTEMPTS: z.coerce.number().int().positive().max(3).default(1),
  DATABASE_URL: z.string().url().optional(),
  AUTH_SECRET: z.string().min(32).optional(),
  AUTH_TRUST_HOST: z
    .enum(["true", "false"])
    .default("false")
    .transform((value) => value === "true"),
  REPORT_STORAGE_ENABLED: z
    .enum(["true", "false"])
    .default("false")
    .transform((value) => value === "true"),
  REPORT_ANONYMOUS_RETENTION_DAYS: z.coerce.number().int().positive().max(365).default(7),
  REPORT_AUTHENTICATED_RETENTION_DAYS: z.coerce.number().int().positive().max(3650).default(90),
  REPORT_DELETION_GRACE_DAYS: z.coerce.number().int().positive().max(365).default(7),
  INTERNAL_CLEANUP_SECRET: z.string().min(32).optional(),
  RENDER_WORKER_URL: z.string().url().optional(),
  RENDER_WORKER_SECRET: z.string().optional(),
  RENDER_WORKER_TIMEOUT_MS: z.coerce.number().int().positive().max(30_000).default(8_000),
  RENDER_WORKER_ENABLED: z
    .enum(["true", "false"])
    .default("false")
    .transform((value) => value === "true"),
});

export type Env = z.infer<typeof envSchema>;

export function parseEnv(input: Record<string, string | undefined>): Env {
  const parsed = envSchema.safeParse(input);
  if (!parsed.success) {
    console.error("Invalid environment variables:", parsed.error.flatten().fieldErrors);
    throw new Error("Invalid environment variables");
  }
  return parsed.data;
}

export const env = parseEnv(process.env);
