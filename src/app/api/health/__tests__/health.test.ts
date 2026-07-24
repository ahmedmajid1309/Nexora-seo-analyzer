import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "../route";

vi.mock("@/lib/monitoring", () => ({
  getHealthStatus: vi.fn().mockReturnValue({
    status: "ok",
    version: "0.1.0",
    uptimeSeconds: 120,
    environment: "test",
    timestamp: "2026-01-01T00:00:00.000Z",
  }),
  trackHealthCheck: vi.fn(),
}));

vi.mock("@/lib/audit/abuse-protection", () => ({
  getConcurrentCount: vi.fn().mockReturnValue(0),
}));

describe("GET /api/health", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 200 status", async () => {
    const res = await GET();
    expect(res.status).toBe(200);
  });

  it("has Cache-Control no-store header", async () => {
    const res = await GET();
    expect(res.headers.get("Cache-Control")).toContain("no-store");
  });

  it("returns JSON with status field", async () => {
    const res = await GET();
    const json = await res.json();
    expect(json).toHaveProperty("status", "ok");
  });

  it("includes version string", async () => {
    const res = await GET();
    const json = await res.json();
    expect(json).toHaveProperty("version");
    expect(typeof json.version).toBe("string");
  });

  it("includes uptime in seconds", async () => {
    const res = await GET();
    const json = await res.json();
    expect(json).toHaveProperty("uptimeSeconds");
    expect(typeof json.uptimeSeconds).toBe("number");
  });

  it("includes environment", async () => {
    const res = await GET();
    const json = await res.json();
    expect(json).toHaveProperty("environment");
  });

  it("includes timestamp", async () => {
    const res = await GET();
    const json = await res.json();
    expect(json).toHaveProperty("timestamp");
  });

  it("includes concurrentAudits", async () => {
    const res = await GET();
    const json = await res.json();
    expect(json).toHaveProperty("concurrentAudits");
    expect(typeof json.concurrentAudits).toBe("number");
  });

  it("does not expose API keys or environment variable values", async () => {
    const res = await GET();
    const json = await res.json();
    const text = JSON.stringify(json);
    expect(text).not.toContain("api_key");
    expect(text).not.toContain("secret");
    expect(text).not.toContain("password");
    expect(text).not.toContain("token");
  });

  it("does not expose internal counters or audited URLs", async () => {
    const res = await GET();
    const json = await res.json();
    expect(json).not.toHaveProperty("counters");
    expect(json).not.toHaveProperty("auditedUrls");
  });
});
