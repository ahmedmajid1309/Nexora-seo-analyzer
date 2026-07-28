import { Readable } from "node:stream";
import { describe, expect, it } from "vitest";
import { MAX_NETWORK_REQUESTS, MAX_REDIRECTS } from "./render.js";
import { MAX_BODY_BYTES, MAX_RESPONSE_BYTES, readBody } from "./server.js";
import {
  assertPublicHttpUrl,
  isBlockedIp,
  signPayload,
  verifySignature,
  type Resolver,
} from "./security.js";

const publicResolver: Resolver = async () => [{ address: "93.184.216.34" }];
const mixedResolver: Resolver = async () => [{ address: "93.184.216.34" }, { address: "10.0.0.5" }];

describe("render worker request signatures", () => {
  it("rejects missing signatures", () => {
    expect(
      verifySignature({
        body: "{}",
        timestamp: "1800000000000",
        signature: undefined,
        secret: "s",
        nowMs: 1800000000000,
      }),
    ).toBe(false);
  });

  it("rejects invalid signatures", () => {
    expect(
      verifySignature({
        body: "{}",
        timestamp: "1800000000000",
        signature: "00",
        secret: "s",
        nowMs: 1800000000000,
      }),
    ).toBe(false);
  });

  it("rejects stale timestamps", () => {
    const body = "{}";
    const timestamp = "1800000000000";
    const signature = signPayload(body, timestamp, "s");

    expect(verifySignature({ body, timestamp, signature, secret: "s", nowMs: 1800000600001 })).toBe(
      false,
    );
  });

  it("rejects bodies altered after signing", () => {
    const timestamp = "1800000000000";
    const signature = signPayload('{"a":1}', timestamp, "s");

    expect(
      verifySignature({ body: '{"a":2}', timestamp, signature, secret: "s", nowMs: 1800000000000 }),
    ).toBe(false);
  });

  it("accepts valid signed payloads", () => {
    const body = JSON.stringify({ url: "https://example.com" });
    const timestamp = "1800000000000";
    const signature = signPayload(body, timestamp, "secret");

    expect(
      verifySignature({ body, timestamp, signature, secret: "secret", nowMs: Number(timestamp) }),
    ).toBe(true);
  });
});

describe("render worker URL policy", () => {
  it("allows public HTTP and HTTPS on standard ports", async () => {
    await expect(
      assertPublicHttpUrl("https://example.com/path", publicResolver),
    ).resolves.toBeUndefined();
    await expect(
      assertPublicHttpUrl("http://example.com/path", publicResolver),
    ).resolves.toBeUndefined();
  });

  it("rejects unsupported URL schemes", async () => {
    await expect(assertPublicHttpUrl("file:///etc/passwd", publicResolver)).rejects.toThrow("HTTP");
  });

  it("rejects credentials in URL", async () => {
    await expect(
      assertPublicHttpUrl("https://user:pass@example.com", publicResolver),
    ).rejects.toThrow("credentials");
  });

  it("rejects unsupported ports", async () => {
    await expect(assertPublicHttpUrl("https://example.com:4443", publicResolver)).rejects.toThrow(
      "port",
    );
  });

  it("rejects loopback, private, link-local, metadata, documentation, reserved and multicast IPs", async () => {
    for (const url of [
      "http://127.0.0.1",
      "http://[::1]",
      "http://10.0.0.1",
      "http://[fd00::1]",
      "http://169.254.1.1",
      "http://169.254.169.254",
      "http://192.0.2.1",
      "http://203.0.113.1",
      "http://224.0.0.1",
      "http://[2001:db8::1]",
    ]) {
      await expect(assertPublicHttpUrl(url, publicResolver)).rejects.toThrow();
    }
  });

  it("rejects mixed public/private DNS answers", async () => {
    await expect(assertPublicHttpUrl("https://example.com", mixedResolver)).rejects.toThrow(
      "blocked address",
    );
  });

  it("rejects redirect and private subresource destinations when each request URL is revalidated", async () => {
    await expect(
      assertPublicHttpUrl("http://127.0.0.1/redirect-target", publicResolver),
    ).rejects.toThrow();
    await expect(
      assertPublicHttpUrl("http://10.0.0.2/private-subresource.js", publicResolver),
    ).rejects.toThrow();
  });

  it("classifies representative blocked IPs", () => {
    expect(isBlockedIp("127.0.0.1")).toBe(true);
    expect(isBlockedIp("10.1.2.3")).toBe(true);
    expect(isBlockedIp("192.168.1.1")).toBe(true);
    expect(isBlockedIp("8.8.8.8")).toBe(false);
  });
});

describe("render worker request and browser safety caps", () => {
  it("rejects oversized request bodies", async () => {
    const stream = Readable.from(["x".repeat(MAX_BODY_BYTES + 1)]);
    await expect(readBody(stream as never)).rejects.toThrow("Request body too large");
  });

  it("defines bounded response, request, and redirect limits", () => {
    expect(MAX_RESPONSE_BYTES).toBeLessThanOrEqual(128_000);
    expect(MAX_NETWORK_REQUESTS).toBeLessThanOrEqual(150);
    expect(MAX_REDIRECTS).toBeLessThanOrEqual(8);
  });

  it("blocks WebSocket URLs through the URL policy", async () => {
    await expect(assertPublicHttpUrl("wss://example.com/socket", publicResolver)).rejects.toThrow(
      "HTTP",
    );
  });

  it("documents browser controls covered by renderPage", () => {
    expect(MAX_NETWORK_REQUESTS).toBe(150);
    expect(MAX_REDIRECTS).toBe(8);
  });
});
