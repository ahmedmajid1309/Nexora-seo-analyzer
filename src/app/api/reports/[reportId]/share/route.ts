import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { createShareLink, revokeShare, ReportAccessSchema } from "@/lib/reports";

export const runtime = "nodejs";

interface Params {
  params: Promise<{ reportId: string }>;
}

async function access(request: NextRequest) {
  const url = new URL(request.url);
  const parsed = ReportAccessSchema.parse({
    ownerToken: url.searchParams.get("ownerToken") ?? undefined,
    shareToken: url.searchParams.get("shareToken") ?? undefined,
  });
  const user = await getSessionUser();
  return { userId: user?.userId, anonymousToken: parsed.ownerToken, shareToken: parsed.shareToken };
}

export async function POST(request: NextRequest, { params }: Params): Promise<NextResponse> {
  const { reportId } = await params;
  const result = await createShareLink(reportId, await access(request));
  if (!result) return NextResponse.json({ success: false }, { status: 403 });
  return NextResponse.json(
    { success: true, shareToken: result.token },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function DELETE(request: NextRequest, { params }: Params): Promise<NextResponse> {
  const { reportId } = await params;
  const body = (await request.json().catch(() => ({}))) as { shareToken?: string };
  if (!body.shareToken) return NextResponse.json({ success: false }, { status: 400 });
  const revoked = await revokeShare(reportId, body.shareToken, await access(request));
  return NextResponse.json({ success: revoked }, { status: revoked ? 200 : 403 });
}
