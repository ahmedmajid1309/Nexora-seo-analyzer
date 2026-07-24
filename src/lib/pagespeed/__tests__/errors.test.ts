import { describe, it, expect } from "vitest";
import {
  PageSpeedQuotaError,
  PageSpeedAuthError,
  PageSpeedApiError,
  PageSpeedNetworkError,
  PageSpeedParseError,
  classifyPageSpeedError,
} from "../errors";

describe("PageSpeed error classes", () => {
  it("creates a quota error with code QUOTA_EXCEEDED and status 429", () => {
    const err = new PageSpeedQuotaError();
    expect(err.code).toBe("QUOTA_EXCEEDED");
    expect(err.statusCode).toBe(429);
    expect(err.message).toContain("quota");
  });

  it("creates an auth error with code AUTH_ERROR and status 403", () => {
    const err = new PageSpeedAuthError();
    expect(err.code).toBe("AUTH_ERROR");
    expect(err.statusCode).toBe(403);
  });

  it("creates an API error with custom message", () => {
    const err = new PageSpeedApiError("Custom error", 500);
    expect(err.code).toBe("API_ERROR");
    expect(err.statusCode).toBe(500);
    expect(err.message).toBe("Custom error");
  });

  it("creates a network error with code NETWORK_ERROR", () => {
    const err = new PageSpeedNetworkError();
    expect(err.code).toBe("NETWORK_ERROR");
    expect(err.statusCode).toBe(502);
  });

  it("creates a parse error with code PARSE_ERROR", () => {
    const err = new PageSpeedParseError();
    expect(err.code).toBe("PARSE_ERROR");
    expect(err.statusCode).toBeUndefined();
  });
});

describe("classifyPageSpeedError", () => {
  it("passes through PageSpeedError instances", () => {
    const err = new PageSpeedQuotaError();
    expect(classifyPageSpeedError(err)).toBe(err);
  });

  it("classifies quota messages", () => {
    const err = classifyPageSpeedError(new Error("API quota exceeded"));
    expect(err).toBeInstanceOf(PageSpeedQuotaError);
  });

  it("classifies auth messages", () => {
    const err = classifyPageSpeedError(new Error("API key not valid"));
    expect(err).toBeInstanceOf(PageSpeedAuthError);
  });

  it("classifies 403 errors", () => {
    const err = classifyPageSpeedError(new Error("403 Forbidden"));
    expect(err).toBeInstanceOf(PageSpeedAuthError);
  });

  it("classifies network errors", () => {
    const err = classifyPageSpeedError(new Error("fetch failed: ENOTFOUND"));
    expect(err).toBeInstanceOf(PageSpeedNetworkError);
  });

  it("falls back to generic API error", () => {
    const err = classifyPageSpeedError(new Error("Something else"));
    expect(err).toBeInstanceOf(PageSpeedApiError);
  });

  it("handles non-Error inputs", () => {
    const err = classifyPageSpeedError("string error");
    expect(err).toBeInstanceOf(PageSpeedApiError);
  });
});
