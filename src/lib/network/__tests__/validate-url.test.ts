import { describe, it, expect } from "vitest";
import { normalizeUrl } from "@/lib/network/normalize-url";
import { validateUrl } from "@/lib/network/validate-url";

describe("validateUrl", () => {
  it("passes for valid https URL", () => {
    const norm = normalizeUrl("https://example.com");
    expect(validateUrl(norm).valid).toBe(true);
  });

  it("passes for valid http URL", () => {
    const norm = normalizeUrl("http://example.com");
    expect(validateUrl(norm).valid).toBe(true);
  });

  it("rejects URL with fragment via normalizeUrl", () => {
    const norm = normalizeUrl("https://example.com#test");
    expect(norm.hash).toBe("");
  });

  it("rejects empty hostname", () => {
    expect(() => normalizeUrl("https://")).toThrow();
  });
});
