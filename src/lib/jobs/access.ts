import { NextRequest } from "next/server";

export function readJobAccessToken(request: Request | NextRequest): string | null {
  const auth = request.headers.get("authorization");
  if (auth?.toLowerCase().startsWith("bearer ")) return auth.slice(7).trim() || null;
  const header = request.headers.get("x-job-access-token");
  if (header) return header;
  try {
    return new URL(request.url).searchParams.get("token");
  } catch {
    return null;
  }
}
