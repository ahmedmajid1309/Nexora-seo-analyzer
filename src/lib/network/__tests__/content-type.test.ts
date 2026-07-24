import { describe, it, expect } from "vitest";
import { classifyContentType, sniffIsHtml } from "@/lib/network/content-type";

describe("classifyContentType", () => {
  it("allows text/html", () => {
    expect(classifyContentType("text/html").isAllowed).toBe(true);
  });

  it("allows application/xhtml+xml", () => {
    expect(classifyContentType("application/xhtml+xml").isAllowed).toBe(true);
  });

  it("allows text/html with charset", () => {
    expect(classifyContentType("text/html; charset=utf-8").isAllowed).toBe(true);
  });

  it("rejects image/png", () => {
    expect(classifyContentType("image/png").isAllowed).toBe(false);
  });

  it("rejects application/pdf", () => {
    expect(classifyContentType("application/pdf").isAllowed).toBe(false);
  });

  it("rejects audio/mpeg", () => {
    expect(classifyContentType("audio/mpeg").isAllowed).toBe(false);
  });

  it("rejects video/mp4", () => {
    expect(classifyContentType("video/mp4").isAllowed).toBe(false);
  });

  it("rejects null content type", () => {
    expect(classifyContentType(null).isAllowed).toBe(false);
  });
});

describe("sniffIsHtml", () => {
  it("detects HTML by doctype", () => {
    expect(sniffIsHtml(Buffer.from("<!DOCTYPE html><html>"))).toBe(true);
  });

  it("detects HTML by opening html tag", () => {
    expect(sniffIsHtml(Buffer.from("<html><head><title>Test</title></head></html>"))).toBe(true);
  });

  it("returns false for binary content", () => {
    expect(sniffIsHtml(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))).toBe(false);
  });
});
