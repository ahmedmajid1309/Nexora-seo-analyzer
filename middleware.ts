import type { NextRequest } from "next/server";

const PRODUCTION_BLOCKED_PATHS = [
  "/site-audit",
  "/site-result",
  "/reports",
  "/sign-in",
  "/mock-result",
  "/design-lab",
  "/api/auth/dev-signin",
  "/api/auth/logout",
  "/api/reports",
  "/api/audit/site",
  "/api/jobs",
  "/api/internal",
];

function isBlockedPath(pathname: string): boolean {
  return PRODUCTION_BLOCKED_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

export function middleware(request: NextRequest) {
  if (process.env.NODE_ENV === "production" && isBlockedPath(request.nextUrl.pathname)) {
    return new Response("Not found", {
      status: 404,
      headers: { "content-type": "text/plain; charset=utf-8", "x-robots-tag": "noindex" },
    });
  }
}

export const config = {
  matcher: [
    "/site-audit/:path*",
    "/site-result/:path*",
    "/reports/:path*",
    "/sign-in/:path*",
    "/mock-result/:path*",
    "/design-lab/:path*",
    "/api/auth/dev-signin/:path*",
    "/api/auth/logout/:path*",
    "/api/reports/:path*",
    "/api/audit/site/:path*",
    "/api/jobs/:path*",
    "/api/internal/:path*",
  ],
};
