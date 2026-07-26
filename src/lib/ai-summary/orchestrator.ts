import { env } from "@/config/env";
import { hashEvidence, getCachedSummary, setCachedSummaryWithLimit } from "./cache";
import {
  isAiSummaryCircuitOpen,
  recordAiSummaryProviderFailure,
  recordAiSummaryProviderSuccess,
} from "./circuit-breaker";
import { buildDeterministicSummary } from "./deterministic-summary";
import { requestGeminiSummary } from "./gemini-client";
import { requestGroqSummary } from "./groq-client";
import { buildSummaryPrompt } from "./prompt";
import { groundProviderSummary, parseProviderJson } from "./schemas";
import type {
  AiExecutiveSummary,
  AiSummaryProgressEvent,
  AiSummaryProvider,
  AiSummaryResult,
  SummaryEvidencePack,
} from "./types";

function progress(
  input: Omit<AiSummaryProgressEvent, "elapsedMs">,
  startedAt: number,
): AiSummaryProgressEvent {
  return { ...input, elapsedMs: Math.round(performance.now() - startedAt) };
}

function configuredProviders(): ("gemini" | "groq")[] {
  return env.AI_SUMMARY_PROVIDER_ORDER.split(",")
    .map((provider) => provider.trim().toLowerCase())
    .filter(
      (provider): provider is "gemini" | "groq" => provider === "gemini" || provider === "groq",
    );
}

async function requestProvider(provider: "gemini" | "groq", promptText: string) {
  const input = {
    prompt: promptText,
    timeoutMs: env.AI_SUMMARY_TIMEOUT_MS,
    maxOutputTokens: env.AI_SUMMARY_MAX_OUTPUT_TOKENS,
  };
  return provider === "gemini" ? requestGeminiSummary(input) : requestGroqSummary(input);
}

export async function generateAiExecutiveSummary(
  evidence: SummaryEvidencePack,
): Promise<AiSummaryResult> {
  const startedAt = performance.now();
  const events: AiSummaryProgressEvent[] = [];
  events.push(
    progress(
      {
        state: "preparing-summary-evidence",
        provider: null,
        fallbackUsed: false,
        evidenceFindingCount: evidence.findings.length,
        finalSummarySource: null,
      },
      startedAt,
    ),
  );
  const evidenceJson = JSON.stringify(evidence);
  const cacheKey = hashEvidence(evidenceJson);
  const cached = getCachedSummary<AiExecutiveSummary>(cacheKey);
  if (cached) return { summary: cached, progress: events };

  const deterministic = (
    status: AiExecutiveSummary["status"],
    failureReason?: string | null,
    fallbackUsed = false,
  ) => {
    events.push(
      progress(
        {
          state: "generating-deterministic-summary",
          provider: null,
          fallbackUsed,
          evidenceFindingCount: evidence.findings.length,
          finalSummarySource: "deterministic",
        },
        startedAt,
      ),
    );
    const summary = buildDeterministicSummary({ evidence, status, failureReason, fallbackUsed });
    setCachedSummaryWithLimit(
      cacheKey,
      summary,
      env.AI_SUMMARY_CACHE_TTL_MS,
      env.AI_SUMMARY_CACHE_MAX_ENTRIES,
    );
    return { summary, progress: events };
  };

  if (!env.AI_SUMMARY_ENABLED) return deterministic("disabled");
  if (evidenceJson.length > env.AI_SUMMARY_MAX_INPUT_CHARS) {
    return deterministic("unavailable", "Evidence pack exceeded configured input size", true);
  }

  const promptText = buildSummaryPrompt(evidence);
  let firstProvider: AiSummaryProvider | null = null;
  let lastFailure: string | null = null;
  for (const provider of configuredProviders()) {
    if (!firstProvider) firstProvider = provider;
    if (isAiSummaryCircuitOpen(provider)) {
      lastFailure = `${provider} circuit is open`;
      continue;
    }
    for (let attempt = 1; attempt <= env.AI_SUMMARY_PROVIDER_MAX_ATTEMPTS; attempt += 1) {
      try {
        events.push(
          progress(
            {
              state:
                provider === "gemini" ? "requesting-gemini-summary" : "requesting-groq-summary",
              provider,
              fallbackUsed: provider !== firstProvider || attempt > 1,
              evidenceFindingCount: evidence.findings.length,
              finalSummarySource: null,
            },
            startedAt,
          ),
        );
        const response = await requestProvider(provider, promptText);
        events.push(
          progress(
            {
              state:
                provider === "gemini" ? "validating-gemini-summary" : "validating-groq-summary",
              provider,
              fallbackUsed: provider !== firstProvider || attempt > 1,
              evidenceFindingCount: evidence.findings.length,
              finalSummarySource: null,
            },
            startedAt,
          ),
        );
        const parsed = parseProviderJson(response.rawText);
        const summary = groundProviderSummary({
          parsed,
          evidence,
          source: provider,
          model: response.model,
          fallbackUsed: provider !== firstProvider || attempt > 1,
        });
        summary.providerAttempt.primary =
          firstProvider === "gemini" || firstProvider === "groq" ? firstProvider : null;
        recordAiSummaryProviderSuccess(provider);
        events.push(
          progress(
            {
              state: "summary-complete",
              provider,
              fallbackUsed: provider !== firstProvider || attempt > 1,
              evidenceFindingCount: evidence.findings.length,
              finalSummarySource: provider,
            },
            startedAt,
          ),
        );
        setCachedSummaryWithLimit(
          cacheKey,
          summary,
          env.AI_SUMMARY_CACHE_TTL_MS,
          env.AI_SUMMARY_CACHE_MAX_ENTRIES,
        );
        return { summary, progress: events };
      } catch (err) {
        lastFailure = err instanceof Error ? err.message : `${provider} summary failed`;
        recordAiSummaryProviderFailure(provider);
        events.push(
          progress(
            {
              state: "summary-fallback",
              provider,
              fallbackUsed: true,
              evidenceFindingCount: evidence.findings.length,
              finalSummarySource: null,
            },
            startedAt,
          ),
        );
      }
    }
  }

  const result = deterministic(
    "failed",
    lastFailure ?? "No configured AI summary provider succeeded",
    true,
  );
  result.summary.providerAttempt.primary =
    firstProvider === "gemini" || firstProvider === "groq" ? firstProvider : null;
  return result;
}
