import { describe, it, expect } from "vitest";
import {
  NexoraError,
  isNexoraError,
  invalidUrlError,
  rateLimitedError,
  notFoundError,
  internalError,
  validationError,
} from "@/lib/errors";

describe("NexoraError", () => {
  it("creates error with code and user message", () => {
    const err = new NexoraError({
      code: "INTERNAL_ERROR",
      userMessage: "Something went wrong.",
    });
    expect(err.code).toBe("INTERNAL_ERROR");
    expect(err.userMessage).toBe("Something went wrong.");
    expect(err.httpStatus).toBe(500);
  });

  it("includes validation errors when provided", () => {
    const err = validationError("Invalid input", [{ path: "url", message: "Must be a valid URL" }]);
    expect(err.validationErrors).toHaveLength(1);
    expect(err.validationErrors![0].path).toBe("url");
  });

  it("includes request ID when provided", () => {
    const err = new NexoraError({
      code: "INTERNAL_ERROR",
      userMessage: "Error",
      requestId: "req-123",
    });
    expect(err.requestId).toBe("req-123");
  });

  it("serialises to safe public response without diagnostics", () => {
    const err = new NexoraError({
      code: "NOT_FOUND",
      userMessage: "Not found.",
      httpStatus: 404,
    });
    const response = err.toPublicResponse();
    expect(response).toEqual({
      success: false,
      error: {
        code: "NOT_FOUND",
        message: "Not found.",
      },
    });
    expect((response as Record<string, unknown>).stack).toBeUndefined();
    expect((response as Record<string, unknown>).diagnosticData).toBeUndefined();
  });

  it("stores diagnostic data separately from public response", () => {
    const err = new NexoraError({
      code: "INTERNAL_ERROR",
      userMessage: "Error",
      diagnosticData: { url: "https://example.com", attempt: 3 },
    });
    expect(err.getDiagnosticData()).toEqual({ url: "https://example.com", attempt: 3 });
    const response = err.toPublicResponse();
    const errorObj = response.error as Record<string, unknown>;
    expect(errorObj.url).toBeUndefined();
    expect(errorObj.attempt).toBeUndefined();
  });

  it("is detected by isNexoraError", () => {
    const err = new NexoraError({ code: "INTERNAL_ERROR", userMessage: "Error" });
    expect(isNexoraError(err)).toBe(true);
    expect(isNexoraError(new Error("regular"))).toBe(false);
    expect(isNexoraError("string")).toBe(false);
    expect(isNexoraError(null)).toBe(false);
  });
});

describe("Error factories", () => {
  it("invalidUrlError creates error with 400 status", () => {
    const err = invalidUrlError();
    expect(err.code).toBe("INVALID_URL");
    expect(err.httpStatus).toBe(400);
  });

  it("rateLimitedError creates error with 429 status", () => {
    const err = rateLimitedError();
    expect(err.code).toBe("RATE_LIMITED");
    expect(err.httpStatus).toBe(429);
  });

  it("notFoundError creates error with 404 status", () => {
    const err = notFoundError();
    expect(err.code).toBe("NOT_FOUND");
    expect(err.httpStatus).toBe(404);
  });

  it("internalError creates error with 500 status", () => {
    const err = internalError();
    expect(err.code).toBe("INTERNAL_ERROR");
    expect(err.httpStatus).toBe(500);
  });
});
