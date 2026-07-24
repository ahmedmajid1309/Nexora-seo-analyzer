import { NextResponse } from "next/server";
import { getHealthStatus, trackHealthCheck } from "@/lib/monitoring";
import { getConcurrentCount } from "@/lib/audit/abuse-protection";

export const runtime = "nodejs";

export async function GET(): Promise<NextResponse> {
  trackHealthCheck();
  const health = getHealthStatus();

  return NextResponse.json(
    {
      status: health.status,
      version: health.version,
      uptimeSeconds: health.uptimeSeconds,
      environment: health.environment,
      timestamp: health.timestamp,
      concurrentAudits: getConcurrentCount(),
    },
    {
      status: 200,
      headers: { "Cache-Control": "no-store, must-revalidate" },
    },
  );
}
