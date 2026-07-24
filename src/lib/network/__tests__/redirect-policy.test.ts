import { describe, it, expect } from "vitest";
import { checkRedirect } from "@/lib/network/redirect-policy";
import type { RedirectStep } from "@/lib/network/types";

describe("checkRedirect", () => {
  it("allows HTTP to HTTPS redirect", () => {
    const steps: RedirectStep[] = [{ url: "http://example.com", statusCode: 301 }];
    const result = checkRedirect("https://example.com/page", 301, steps);
    expect(result.shouldFollow).toBe(true);
    expect(result.isLoop).toBe(false);
  });

  it("rejects missing Location", () => {
    const result = checkRedirect(null, 301, []);
    expect(result.shouldFollow).toBe(false);
  });

  it("rejects credentials in redirect", () => {
    const result = checkRedirect("https://user:pass@example.com", 301, []);
    expect(result.shouldFollow).toBe(false);
  });

  it("detects exact loop", () => {
    const steps: RedirectStep[] = [{ url: "https://example.com/a", statusCode: 301 }];
    const result = checkRedirect("https://example.com/a", 301, steps);
    expect(result.isLoop).toBe(true);
  });

  it("does not treat case-different paths as loop", () => {
    const steps: RedirectStep[] = [{ url: "https://example.com/Example", statusCode: 301 }];
    const result = checkRedirect("https://example.com/example", 301, steps);
    expect(result.isLoop).toBe(false);
    expect(result.shouldFollow).toBe(true);
  });

  it("treats hostname case differences as equivalent", () => {
    const steps: RedirectStep[] = [{ url: "https://EXAMPLE.COM/path", statusCode: 301 }];
    const result = checkRedirect("https://example.com/path", 301, steps);
    expect(result.isLoop).toBe(true);
  });

  it("treats default-port differences as equivalent", () => {
    const steps: RedirectStep[] = [{ url: "https://example.com:443/path", statusCode: 301 }];
    const result = checkRedirect("https://example.com/path", 301, steps);
    expect(result.isLoop).toBe(true);
  });

  it("treats fragment-only differences as equivalent", () => {
    const steps: RedirectStep[] = [{ url: "https://example.com/path#frag", statusCode: 301 }];
    const result = checkRedirect("https://example.com/path#other", 301, steps);
    expect(result.isLoop).toBe(true);
  });

  it("treats trailing-dot hostname as equivalent", () => {
    const steps: RedirectStep[] = [{ url: "https://example.com./path", statusCode: 301 }];
    const result = checkRedirect("https://example.com/path", 301, steps);
    expect(result.isLoop).toBe(true);
  });

  it("detects A -> B -> A loop", () => {
    const steps: RedirectStep[] = [
      { url: "https://example.com/a", statusCode: 301 },
      { url: "https://example.com/b", statusCode: 301 },
    ];
    const result = checkRedirect("https://example.com/a", 301, steps);
    expect(result.isLoop).toBe(true);
  });

  it("enforces maximum 3 redirects", () => {
    const steps: RedirectStep[] = [
      { url: "https://example.com/1", statusCode: 301 },
      { url: "https://example.com/2", statusCode: 301 },
      { url: "https://example.com/3", statusCode: 301 },
    ];
    const result = checkRedirect("https://example.com/4", 301, steps);
    expect(result.shouldFollow).toBe(false);
    expect(result.error).toContain("limit");
  });

  it("allows relative redirect", () => {
    const steps: RedirectStep[] = [{ url: "https://example.com/a", statusCode: 301 }];
    const result = checkRedirect("/b", 302, steps);
    expect(result.shouldFollow).toBe(true);
  });

  it("rejects non-redirect status code", () => {
    const result = checkRedirect("https://example.com", 200, []);
    expect(result.shouldFollow).toBe(false);
  });

  it("rejects invalid Location URL", () => {
    const result = checkRedirect("", 301, []);
    expect(result.shouldFollow).toBe(false);
  });
});
