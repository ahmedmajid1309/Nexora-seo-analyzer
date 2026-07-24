import { describe, it, expect } from "vitest";
import { parseAndValidateHost } from "@/lib/network/parse-host";

describe("parseAndValidateHost", () => {
  it("accepts public hostname", () => {
    const result = parseAndValidateHost("example.com");
    expect(result.valid).toBe(true);
    expect(result.hostname).toBe("example.com");
  });

  it("accepts subdomain", () => {
    const result = parseAndValidateHost("www.example.com");
    expect(result.valid).toBe(true);
  });

  it("rejects localhost", () => {
    expect(parseAndValidateHost("localhost").valid).toBe(false);
  });

  it("rejects localhost with trailing dot", () => {
    expect(parseAndValidateHost("localhost.").valid).toBe(false);
  });

  it("rejects .local suffix", () => {
    expect(parseAndValidateHost("test.local").valid).toBe(false);
  });

  it("rejects .internal suffix", () => {
    expect(parseAndValidateHost("test.internal").valid).toBe(false);
  });

  it("rejects single-label non-local names", () => {
    expect(parseAndValidateHost("home").valid).toBe(false);
  });

  it("accepts hostname with metadata word in path context", () => {
    const result = parseAndValidateHost("metadata-checker.com");
    expect(result.valid).toBe(true);
  });

  it("rejects metadata.google.internal", () => {
    expect(parseAndValidateHost("metadata.google.internal").valid).toBe(false);
  });

  it("rejects empty hostname", () => {
    expect(parseAndValidateHost("").valid).toBe(false);
  });

  it("rejects hostname with invalid characters", () => {
    expect(parseAndValidateHost("exam ple.com").valid).toBe(false);
  });

  it("rejects oversized hostname label", () => {
    const long = "a".repeat(64) + ".com";
    expect(parseAndValidateHost(long).valid).toBe(false);
  });

  it("rejects hostname with leading dot", () => {
    expect(parseAndValidateHost(".example.com").valid).toBe(false);
  });

  it("rejects hostname with trailing hyphen", () => {
    expect(parseAndValidateHost("example-.com").valid).toBe(false);
  });

  it("rejects consecutive dots", () => {
    expect(parseAndValidateHost("example..com").valid).toBe(false);
  });
});
