import { createHmac, timingSafeEqual } from "node:crypto";

const MAX_CLOCK_SKEW_MS = 5 * 60 * 1000;

export function signRenderWorkerPayload(input: {
  body: string;
  timestamp: string;
  secret: string;
}): string {
  return createHmac("sha256", input.secret)
    .update(`${input.timestamp}.${input.body}`)
    .digest("hex");
}

export function verifyRenderWorkerSignature(input: {
  body: string;
  timestamp: string | null | undefined;
  signature: string | null | undefined;
  secret: string;
  nowMs?: number;
}): boolean {
  if (!input.timestamp || !input.signature) return false;
  const timestampMs = Number(input.timestamp);
  if (!Number.isFinite(timestampMs)) return false;
  if (Math.abs((input.nowMs ?? Date.now()) - timestampMs) > MAX_CLOCK_SKEW_MS) return false;

  const expected = signRenderWorkerPayload({
    body: input.body,
    timestamp: input.timestamp,
    secret: input.secret,
  });
  const actualBuffer = Buffer.from(input.signature, "hex");
  const expectedBuffer = Buffer.from(expected, "hex");
  if (actualBuffer.length !== expectedBuffer.length) return false;
  return timingSafeEqual(actualBuffer, expectedBuffer);
}
