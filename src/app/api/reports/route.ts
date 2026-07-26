import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { listReportsForUser, saveAuditReport, SaveReportRequestSchema } from "@/lib/reports";

export const runtime = "nodejs";

export async function GET(): Promise<NextResponse> {
  const user = await getSessionUser();
  if (!user)
    return NextResponse.json(
      { success: false, error: "Sign in to view report history" },
      { status: 401 },
    );
  return NextResponse.json(
    { success: true, reports: await listReportsForUser(user.userId) },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const parsed = SaveReportRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json({ success: false, error: "Invalid report payload" }, { status: 400 });
  const user = await getSessionUser();
  const result = await saveAuditReport({
    reportType: parsed.data.reportType,
    data: parsed.data.data as never,
    userId: user?.userId,
    idempotencyKey: parsed.data.idempotencyKey ?? request.headers.get("idempotency-key"),
  });
  return NextResponse.json(
    { success: result.stored, storage: result },
    { status: result.stored ? 200 : 202 },
  );
}
