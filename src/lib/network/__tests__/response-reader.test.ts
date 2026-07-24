import { describe, it, expect } from "vitest";
import { ResponseReadError } from "@/lib/network/response-reader";

describe("ResponseReadError", () => {
  it("creates error with message", () => {
    const err = new ResponseReadError("Test error");
    expect(err.message).toBe("Test error");
    expect(err.name).toBe("ResponseReadError");
  });
});
