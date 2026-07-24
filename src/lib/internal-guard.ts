import { NextResponse } from "next/server";

export function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

export function productionGuard(): NextResponse | null {
  if (isProduction()) {
    return NextResponse.json(
      { success: false, error: { code: "NOT_FOUND", message: "Not found" } },
      { status: 404 },
    );
  }
  return null;
}
