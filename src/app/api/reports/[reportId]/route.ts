import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { deleteReport, readReport, ReportAccessSchema } from "@/lib/reports";

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

export async function GET(request: NextRequest, { params }: Params): Promise<NextResponse> {
  const { reportId } = await params;
  const report = await readReport(reportId, await access(request));
  if (!report)
    return NextResponse.json(
      { success: false, error: "Report not found or expired" },
      { status: 404, headers: { "X-Robots-Tag": "noindex" } },
    );
  return NextResponse.json(
    { success: true, ...report },
    { headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" } },
  );
}

export async function DELETE(request: NextRequest, { params }: Params): Promise<NextResponse> {
  const { reportId } = await params;
  const deleted = await deleteReport(reportId, await access(request));
  return NextResponse.json(
    { success: deleted },
    { status: deleted ? 200 : 403, headers: { "X-Robots-Tag": "noindex" } },
  );
}
