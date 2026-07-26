import { NextResponse } from "next/server";
import { getHealthStatus, trackHealthCheck } from "@/lib/monitoring";
import { getConcurrentCount } from "@/lib/audit/abuse-protection";
import { getRenderedDomReadiness } from "@/lib/rendered-dom";
import {
  getAiSummaryCacheSize,
  getAiSummaryCircuitState,
  getAiSummaryReadiness,
} from "@/lib/ai-summary";

export const runtime = "nodejs";

export async function GET(): Promise<NextResponse> {
  trackHealthCheck();
  const health = getHealthStatus();
  const renderedDom = getRenderedDomReadiness();
  const aiSummary = {
    ...getAiSummaryReadiness(),
    cacheSize: getAiSummaryCacheSize(),
    circuits: getAiSummaryCircuitState(),
  };

  return NextResponse.json(
    {
      status: health.status,
      version: health.version,
      uptimeSeconds: health.uptimeSeconds,
      environment: health.environment,
      timestamp: health.timestamp,
      concurrentAudits: getConcurrentCount(),
      renderedDom,
      aiSummary,
    },
    {
      status: 200,
      headers: { "Cache-Control": "no-store, must-revalidate" },
    },
  );
}
