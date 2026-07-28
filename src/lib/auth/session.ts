import { cookies } from "next/headers";
import { env } from "@/config/env";
import { createSecretToken, hashSecret } from "@/lib/reports/tokens";
import { ensureDevUser } from "@/lib/reports";

const COOKIE = "nexora_session";
const sessions = new Map<string, { userId: string; email: string; expiresAt: number }>();

export async function createSession(email: string): Promise<{ token: string; userId: string }> {
  if (!env.AUTH_SECRET) throw new Error("AUTH_SECRET is not configured");
  const userId = await ensureDevUser(email.toLowerCase());
  const token = createSecretToken("sess");
  sessions.set(hashSecret(token), {
    userId,
    email: email.toLowerCase(),
    expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
  });
  return { token, userId };
}

export async function getSessionUser(): Promise<{ userId: string; email: string } | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  const session = sessions.get(hashSecret(token));
  if (!session || session.expiresAt <= Date.now()) return null;
  return { userId: session.userId, email: session.email };
}

export async function setSessionCookie(token: string): Promise<void> {
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 30 * 24 * 60 * 60,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (token) sessions.delete(hashSecret(token));
  store.delete(COOKIE);
}
