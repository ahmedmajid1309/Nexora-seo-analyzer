import type { PSIResponse, PSILighthouseResult } from "./schemas";
import type { PageSpeedResult, PageSpeedStrategy, PageSpeedOutput } from "./types";
import { extractLabMetrics } from "./metrics";
import { extractFieldData } from "./field-data";
import { extractOpportunities, extractDiagnostics } from "./opportunities";
import { getCachedPageSpeed, setCachedPageSpeed } from "./cache";
import { fetchPageSpeedRaw } from "./client";

const inFlightRequests = new Map<string, Promise<PageSpeedResult>>();

function parseSingleResult(raw: PSIResponse, strategy: PageSpeedStrategy): PageSpeedResult {
  const lhr = raw.lighthouseResult as PSILighthouseResult | undefined;

  const labMetrics = lhr
    ? extractLabMetrics(lhr)
    : {
        lcp: null,
        cls: null,
        tbt: null,
        si: null,
        fcp: null,
        performanceScore: null,
        lighthouseAccessibilityScore: null,
        lighthouseSeoScore: null,
        lighthouseBestPracticesScore: null,
      };

  const fieldData = extractFieldData(raw.loadingExperience);

  const opportunities = lhr ? extractOpportunities(lhr) : [];
  const diagnostics = lhr ? extractDiagnostics(lhr) : [];

  return {
    strategy,
    labMetrics,
    fieldData,
    opportunities,
    diagnostics,
  };
}

export interface FetchPageSpeedOptions {
  strategy?: PageSpeedStrategy;
  url: string;
  timeoutMs?: number;
}

export async function fetchPageSpeed(options: FetchPageSpeedOptions): Promise<PageSpeedResult> {
  const strategy = options.strategy ?? "mobile";
  const cacheKey = `${strategy}:${options.url}`;

  const cached = getCachedPageSpeed(strategy, options.url);
  if (cached) return cached;

  const inflight = inFlightRequests.get(cacheKey);
  if (inflight) return inflight;

  const promise = (async () => {
    const raw = await fetchPageSpeedRaw({
      strategy,
      url: options.url,
      timeoutMs: options.timeoutMs,
    });
    const result = parseSingleResult(raw, strategy);
    setCachedPageSpeed(strategy, options.url, result);
    return result;
  })();

  inFlightRequests.set(cacheKey, promise);
  try {
    return await promise;
  } finally {
    inFlightRequests.delete(cacheKey);
  }
}

export interface FetchPageSpeedBothOptions {
  url: string;
  timeoutMs?: number;
}

async function fetchOne(
  strategy: PageSpeedStrategy,
  url: string,
  timeoutMs: number,
): Promise<PageSpeedResult | null> {
  const cached = getCachedPageSpeed(strategy, url);
  if (cached) return cached;

  try {
    const raw = await fetchPageSpeedRaw({ strategy, url, timeoutMs });
    const result = parseSingleResult(raw, strategy);
    setCachedPageSpeed(strategy, url, result);
    return result;
  } catch {
    return null;
  }
}

export async function fetchPageSpeedBoth(
  options: FetchPageSpeedBothOptions,
): Promise<PageSpeedOutput> {
  const { url, timeoutMs = 15000 } = options;

  const [mobile, desktop] = await Promise.all([
    fetchOne("mobile", url, timeoutMs),
    fetchOne("desktop", url, timeoutMs),
  ]);

  return { mobile, desktop };
}
