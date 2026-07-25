import { z } from "zod";

export const envSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_APP_VERSION: z.string().default("0.1.0"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PAGESPEED_API_KEY: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
  GROQ_API_KEY: z.string().optional(),
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
