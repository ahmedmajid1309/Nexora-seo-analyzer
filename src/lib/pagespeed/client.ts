import { env } from "@/config/env";
import { PSIResponseSchema, type PSIResponse } from "./schemas";
import {
  PageSpeedError,
  PageSpeedAuthError,
  PageSpeedQuotaError,
  PageSpeedApiError,
  PageSpeedParseError,
  classifyPageSpeedError,
} from "./errors";
import type { PageSpeedStrategy } from "./types";

const PSI_BASE_URL = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";

export interface PageSpeedClientOptions {
  strategy: PageSpeedStrategy;
  url: string;
  timeoutMs?: number;
}

function buildPsiUrl(options: PageSpeedClientOptions): string {
  const { strategy, url } = options;
  const apiKey = env.PAGESPEED_API_KEY;

  if (!apiKey) {
    throw new PageSpeedAuthError("PAGESPEED_API_KEY is not configured");
  }

  const params = new URLSearchParams({
    url,
    strategy,
    key: apiKey,
    category: ["performance", "accessibility", "best-practices", "seo"].join(","),
  });

  return `${PSI_BASE_URL}?${params.toString()}`;
}

export async function fetchPageSpeedRaw(options: PageSpeedClientOptions): Promise<PSIResponse> {
  const { timeoutMs = 15000 } = options;

  const psiUrl = buildPsiUrl(options);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(psiUrl, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });

    clearTimeout(timeout);

    if (response.status === 403) {
      throw new PageSpeedAuthError();
    }
    if (response.status === 429) {
      throw new PageSpeedQuotaError();
    }
    if (!response.ok) {
      throw new PageSpeedApiError(
        `PageSpeed API returned status ${response.status}`,
        response.status,
      );
    }

    let json: unknown;
    try {
      json = await response.json();
    } catch {
      throw new PageSpeedParseError("Response was not valid JSON");
    }

    const parsed = PSIResponseSchema.safeParse(json);
    if (!parsed.success) {
      throw new PageSpeedParseError("Response did not match expected schema");
    }

    return parsed.data;
  } catch (err: unknown) {
    clearTimeout(timeout);
    if (err instanceof PageSpeedError) throw err;
    if (err instanceof Error && err.name === "AbortError") {
      throw new PageSpeedApiError("PageSpeed API request timed out", 504);
    }
    throw classifyPageSpeedError(err);
  }
}
