import { createHmac, timingSafeEqual } from "node:crypto";
import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

export const MAX_CLOCK_SKEW_MS = 5 * 60 * 1000;
export const ALLOWED_PORTS = new Set(["", "80", "443"]);
const BLOCKED_HOSTNAMES = new Set(["localhost", "localhost.localdomain"]);

export interface ResolvedAddress {
  address: string;
}

export type Resolver = (hostname: string) => Promise<ResolvedAddress[]>;

export const defaultResolver: Resolver = async (hostname) =>
  lookup(hostname, { all: true, verbatim: true });

function isBlockedIpv4(ip: string): boolean {
  const parts = ip.split(".").map((part) => Number(part));
  if (
    parts.length !== 4 ||
    parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)
  ) {
    return true;
  }
  const [a, b, c] = parts;
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    a === 100 ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 192 && b === 0 && c === 0) ||
    (a === 192 && b === 0 && c === 2) ||
    (a === 198 && b === 18) ||
    (a === 198 && b === 19) ||
    (a === 198 && b === 51 && c === 100) ||
    (a === 203 && b === 0 && c === 113) ||
    a >= 224
  );
}

function isBlockedIpv6(ip: string): boolean {
  const normalized = ip.toLowerCase();
  return (
    normalized === "::" ||
    normalized === "::1" ||
    normalized.startsWith("fc") ||
    normalized.startsWith("fd") ||
    normalized.startsWith("fe80:") ||
    normalized.startsWith("2001:db8") ||
    normalized.startsWith("ff")
  );
}

export function isBlockedIp(ip: string): boolean {
  const version = isIP(ip);
  if (version === 4) return isBlockedIpv4(ip);
  if (version === 6) return isBlockedIpv6(ip);
  return true;
}

export const isPrivateIp = isBlockedIp;

export async function assertPublicHttpUrl(
  rawUrl: string,
  resolver: Resolver = defaultResolver,
): Promise<void> {
  const parsed = new URL(rawUrl);
  const hostname = parsed.hostname.replace(/^\[|\]$/g, "");
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("Only HTTP and HTTPS URLs are allowed");
  }
  if (!ALLOWED_PORTS.has(parsed.port)) throw new Error("Unsupported port");
  if (parsed.username || parsed.password) throw new Error("URLs with credentials are not allowed");
  if (BLOCKED_HOSTNAMES.has(hostname.toLowerCase())) throw new Error("Blocked hostname");
  if (isIP(hostname) && isBlockedIp(hostname)) throw new Error("Blocked IP address");

  const addresses = isIP(hostname) ? [{ address: hostname }] : await resolver(hostname);
  if (addresses.length === 0 || addresses.some((address) => isBlockedIp(address.address))) {
    throw new Error("URL resolves to a blocked address");
  }
}

export function signPayload(body: string, timestamp: string, secret: string): string {
  return createHmac("sha256", secret).update(`${timestamp}.${body}`).digest("hex");
}

export function verifySignature(input: {
  body: string;
  timestamp: string | undefined;
  signature: string | undefined;
  secret: string;
  nowMs?: number;
}): boolean {
  if (!input.timestamp || !input.signature) return false;
  const timestampMs = Number(input.timestamp);
  if (!Number.isFinite(timestampMs)) return false;
  if (Math.abs((input.nowMs ?? Date.now()) - timestampMs) > MAX_CLOCK_SKEW_MS) return false;

  const expected = signPayload(input.body, input.timestamp, input.secret);
  const expectedBuffer = Buffer.from(expected, "hex");
  const actualBuffer = Buffer.from(input.signature, "hex");
  if (expectedBuffer.length !== actualBuffer.length) return false;
  return timingSafeEqual(expectedBuffer, actualBuffer);
}
