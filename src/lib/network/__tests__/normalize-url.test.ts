import { describe, it, expect } from "vitest";
import { normalizeUrl } from "@/lib/network/normalize-url";

describe("normalizeUrl", () => {
  it("accepts valid https URL", () => {
    const result = normalizeUrl("https://example.com");
    expect(result.href).toBe("https://example.com/");
    expect(result.hostname).toBe("example.com");
  });

  it("prepends https for plain domain", () => {
    const result = normalizeUrl("example.com");
    expect(result.protocol).toBe("https:");
    expect(result.hostname).toBe("example.com");
  });

  it("strips surrounding whitespace", () => {
    const result = normalizeUrl("  https://example.com  ");
    expect(result.hostname).toBe("example.com");
  });

  it("strips fragments", () => {
    const result = normalizeUrl("https://example.com/page#section");
    expect(result.hash).toBe("");
  });

  it("removes default HTTP port 80", () => {
    const result = normalizeUrl("http://example.com:80");
    expect(result.port).toBe("");
  });

  it("removes default HTTPS port 443", () => {
    const result = normalizeUrl("https://example.com:443");
    expect(result.port).toBe("");
  });

  it("preserves non-default port", () => {
    const result = normalizeUrl("https://example.com:8080");
    expect(result.port).toBe("8080");
  });

  it("rejects credentials", () => {
    expect(() => normalizeUrl("https://user:pass@example.com")).toThrow("credentials");
  });

  it("lowercases hostname", () => {
    const result = normalizeUrl("HTTPS://EXAMPLE.COM");
    expect(result.hostname).toBe("example.com");
  });

  it("rejects file scheme", () => {
    expect(() => normalizeUrl("file:///etc/passwd")).toThrow();
  });

  it("rejects ftp scheme", () => {
    expect(() => normalizeUrl("ftp://example.com")).toThrow();
  });

  it("rejects data URIs", () => {
    expect(() => normalizeUrl("data:text/html,hello")).toThrow();
  });

  it("rejects javascript scheme", () => {
    expect(() => normalizeUrl("javascript:alert(1)")).toThrow();
  });

  it("rejects blob scheme", () => {
    expect(() => normalizeUrl("blob:null")).toThrow();
  });

  it("rejects control characters", () => {
    expect(() => normalizeUrl("https://example.com/\n")).toThrow();
    expect(() => normalizeUrl("https://example.com/\r")).toThrow();
    expect(() => normalizeUrl("https://example.com/\t")).toThrow();
    expect(() => normalizeUrl("https://example.com/\0")).toThrow();
  });

  it("preserves path case", () => {
    const result = normalizeUrl("https://example.com/Path/With/Case");
    expect(result.pathname).toBe("/Path/With/Case");
  });

  it("preserves query string", () => {
    const result = normalizeUrl("https://example.com/?a=1&b=2");
    expect(result.search).toBe("?a=1&b=2");
  });

  it("handles trailing dot hostname", () => {
    const result = normalizeUrl("https://example.com.");
    expect(result.hostname).toBe("example.com");
  });

  it("rejects excessively long URLs", () => {
    const long = "https://example.com/" + "a".repeat(2500);
    expect(() => normalizeUrl(long)).toThrow();
  });

  it("handles IDN hostname", () => {
    const result = normalizeUrl("https://münchen.de");
    expect(result.hostname).toMatch(/^xn--/);
  });

  it("accepts http scheme", () => {
    const result = normalizeUrl("http://example.com");
    expect(result.protocol).toBe("http:");
  });

  it("rejects percent-encoded hostname", () => {
    expect(() => normalizeUrl("https://example%2Ecom")).toThrow();
  });
});
