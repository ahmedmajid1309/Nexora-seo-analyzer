import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createSession, setSessionCookie } from "@/lib/auth/session";

export const runtime = "nodejs";

const Schema = z.object({ email: z.string().email().max(254) });

export async function POST(request: NextRequest): Promise<NextResponse> {
  const parsed = Schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json({ success: false, error: "Invalid sign-in request" }, { status: 400 });
  const session = await createSession(parsed.data.email);
  await setSessionCookie(session.token);
  return NextResponse.json({ success: true });
}
