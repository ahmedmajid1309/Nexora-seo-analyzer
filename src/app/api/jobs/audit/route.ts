import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { enqueueAuditJob } from "@/lib/jobs/queue";

export const runtime = "nodejs";

const Schema = z.object({
  jobType: z.enum(["quick-audit", "site-audit"]),
  url: z.string().url(),
  pageLimit: z.number().int().positive().max(25).optional(),
  crawlMode: z.enum(["links-and-sitemap", "links-only", "sitemap-first"]).optional(),
  idempotencyKey: z.string().min(8).max(200).optional(),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  const parsed = Schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json({ success: false, error: "Invalid job request" }, { status: 400 });
  try {
    const job = await enqueueAuditJob(parsed.data);
    return NextResponse.json({ success: true, ...job }, { status: 202 });
  } catch {
    return NextResponse.json({ success: false, error: "Audit queue unavailable" }, { status: 503 });
  }
}
