import type { AiSummaryProvider } from "./types";

export interface AiSummaryProviderInput {
  prompt: string;
  timeoutMs: number;
  maxOutputTokens: number;
}

export interface AiSummaryProviderResponse {
  provider: Exclude<AiSummaryProvider, "deterministic">;
  model: string;
  rawText: string;
}

export async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs: number,
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}
