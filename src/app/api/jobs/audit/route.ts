import { NextRequest, NextResponse } from "next/server";
import { enqueueAuditJob } from "@/lib/jobs/queue";
import { AuditJobRequestSchema } from "@/lib/jobs/schemas";

export const runtime = "nodejs";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const parsed = AuditJobRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json({ success: false, error: "Invalid job request" }, { status: 400 });
  try {
    const job = await enqueueAuditJob(parsed.data);
    return NextResponse.json({ success: true, ...job }, { status: 202 });
  } catch {
    return NextResponse.json({ success: false, error: "Audit queue unavailable" }, { status: 503 });
  }
}
