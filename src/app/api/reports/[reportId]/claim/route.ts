import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { claimReport } from "@/lib/reports";

export const runtime = "nodejs";

interface Params {
  params: Promise<{ reportId: string }>;
}

export async function POST(request: NextRequest, { params }: Params): Promise<NextResponse> {
  const user = await getSessionUser();
  if (!user)
    return NextResponse.json({ success: false, error: "Sign in required" }, { status: 401 });
  const body = (await request.json().catch(() => ({}))) as { ownerToken?: string };
  if (!body.ownerToken) return NextResponse.json({ success: false }, { status: 400 });
  const { reportId } = await params;
  const claimed = await claimReport(reportId, body.ownerToken, user.userId);
  return NextResponse.json({ success: claimed }, { status: claimed ? 200 : 403 });
}
