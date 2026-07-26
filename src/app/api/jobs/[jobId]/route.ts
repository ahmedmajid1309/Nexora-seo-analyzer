import { NextResponse } from "next/server";
import { getAuditJobStatus } from "@/lib/jobs/queue";

export const runtime = "nodejs";

interface Params {
  params: Promise<{ jobId: string }>;
}

export async function GET(_: Request, { params }: Params): Promise<NextResponse> {
  const { jobId } = await params;
  const status = await getAuditJobStatus(jobId).catch(() => null);
  if (!status)
    return NextResponse.json({ success: false, error: "Job not found" }, { status: 404 });
  return NextResponse.json(
    { success: true, job: status },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(_: Request, { params }: Params): Promise<NextResponse> {
  const { jobId } = await params;
  const { cancelAuditJob } = await import("@/lib/jobs/queue");
  const cancelled = await cancelAuditJob(jobId).catch(() => false);
  return NextResponse.json({ success: cancelled }, { status: cancelled ? 200 : 404 });
}
