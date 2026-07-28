import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/jobs/queue", () => ({
  enqueueAuditJob: vi.fn().mockResolvedValue({
    jobId: "job_test",
    accessToken: "jta_test",
    cacheHit: false,
  }),
  getAuditJobStatus: vi.fn().mockResolvedValue({
    jobId: "job_test",
    state: "completed",
    progress: { state: "complete" },
    result: { ok: true },
    failedReason: null,
    attemptsMade: 1,
  }),
  cancelAuditJob: vi.fn().mockResolvedValue(true),
}));

describe("audit job API", () => {
  it("creates jobs with an access token", async () => {
    const { POST } = await import("../audit/route");
    const response = await POST(
      new Request("http://localhost/api/jobs/audit", {
        method: "POST",
        body: JSON.stringify({ jobType: "quick-audit", url: "https://example.com" }),
      }) as never,
    );
    const json = await response.json();

    expect(response.status).toBe(202);
    expect(json).toMatchObject({ success: true, jobId: "job_test", accessToken: "jta_test" });
  });

  it("streams terminal SSE events with heartbeat-compatible event ids", async () => {
    const route = await import("../[jobId]/events/route");
    const response = await route.GET(
      new Request("http://localhost/api/jobs/job_test/events?token=jta_test"),
      {
        params: Promise.resolve({ jobId: "job_test" }),
      },
    );
    const text = await response.text();

    expect(response.headers.get("Content-Type")).toContain("text/event-stream");
    expect(text).toContain("id: 1");
    expect(text).toContain("event: progress");
    expect(text).toContain('"completed"');
  });
});
