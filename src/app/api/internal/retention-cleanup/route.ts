import { NextRequest, NextResponse } from "next/server";
import { env } from "@/config/env";
import { cleanupExpiredReports } from "@/lib/reports";

export const runtime = "nodejs";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const expected = env.INTERNAL_CLEANUP_SECRET;
  if (!expected || request.headers.get("x-internal-cleanup-secret") !== expected) {
    return NextResponse.json({ success: false }, { status: 401 });
  }
  return NextResponse.json({ success: true, result: await cleanupExpiredReports() });
}
