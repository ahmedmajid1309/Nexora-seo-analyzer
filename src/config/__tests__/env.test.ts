import { describe, it, expect } from "vitest";
import { parseEnv } from "@/config/env";

describe("Environment schema", () => {
  it("defaults SITE_URL to localhost when not set", () => {
    const result = parseEnv({});
    expect(result.NEXT_PUBLIC_SITE_URL).toBe("http://localhost:3000");
  });

  it("accepts valid site URL", () => {
    const result = parseEnv({ NEXT_PUBLIC_SITE_URL: "https://example.com" });
    expect(result.NEXT_PUBLIC_SITE_URL).toBe("https://example.com");
  });

  it("rejects invalid site URL", () => {
    expect(() => parseEnv({ NEXT_PUBLIC_SITE_URL: "not-a-url" })).toThrow();
  });

  it("accepts optional API keys", () => {
    const result = parseEnv({
      NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
      PAGESPEED_API_KEY: "my-key",
    });
    expect(result.PAGESPEED_API_KEY).toBe("my-key");
  });

  it("allows empty optional API keys", () => {
    const result = parseEnv({
      NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
      PAGESPEED_API_KEY: "",
    });
    expect(result.PAGESPEED_API_KEY).toBe("");
  });
});
