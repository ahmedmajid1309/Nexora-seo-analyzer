import { describe, it, expect } from "vitest";
import { normalizeUrl } from "@/lib/network/normalize-url";
import { checkUrlPolicy, checkSingleAddress } from "@/lib/network/network-policy";

describe("checkUrlPolicy", () => {
  it("allows public hostname", () => {
    const norm = normalizeUrl("https://example.com");
    expect(checkUrlPolicy(norm).allowed).toBe(true);
  });

  it("blocks localhost", () => {
    const norm = normalizeUrl("https://localhost");
    expect(checkUrlPolicy(norm).allowed).toBe(false);
  });

  it("rejects restricted port", () => {
    const norm = normalizeUrl("https://example.com:22");
    expect(checkUrlPolicy(norm).allowed).toBe(false);
  });

  it("allows port 443", () => {
    const norm = normalizeUrl("https://example.com:443");
    expect(checkUrlPolicy(norm).allowed).toBe(true);
  });
});

describe("checkSingleAddress", () => {
  it("allows public address", () => {
    expect(checkSingleAddress("8.8.8.8").allowed).toBe(true);
  });

  it("blocks private address", () => {
    expect(checkSingleAddress("10.0.0.1").allowed).toBe(false);
  });

  it("blocks metadata address", () => {
    expect(checkSingleAddress("169.254.169.254").allowed).toBe(false);
  });

  it("blocks loopback", () => {
    expect(checkSingleAddress("127.0.0.1").allowed).toBe(false);
  });
});
