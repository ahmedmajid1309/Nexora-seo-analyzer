import { beforeEach, describe, expect, it, vi } from "vitest";

const jobs = new Map<string, FakeJob>();

class FakeJob {
  public progress: unknown = { state: "queued" };
  public returnvalue: unknown = null;
  public failedReason = "";
  public attemptsMade = 0;

  constructor(
    public id: string,
    public data: unknown,
    private state = "waiting",
  ) {}

  async getState() {
    return this.state;
  }

  async remove() {
    jobs.delete(this.id);
  }

  async updateData(data: unknown) {
    this.data = data;
  }
}

class FakeQueue {
  async getJob(jobId: string) {
    return jobs.get(jobId) ?? null;
  }

  async add(_: string, data: unknown, options: { jobId?: string }) {
    const id = options.jobId ?? `job_${jobs.size}`;
    const job = new FakeJob(id, data);
    jobs.set(id, job);
    return job;
  }

  async getJobCounts() {
    return { waiting: jobs.size, active: 0, completed: 0, failed: 0, delayed: 0 };
  }
}

vi.mock("bullmq", () => ({ Queue: FakeQueue }));
vi.mock("ioredis", () => ({
  default: class {
    async ping() {
      return "PONG";
    }
  },
}));

describe("audit job queue capability access", () => {
  beforeEach(() => {
    jobs.clear();
    vi.resetModules();
    process.env.REDIS_URL = "redis://localhost:6379";
    process.env.AUDIT_QUEUE_ENABLED = "true";
  });

  it("returns opaque job IDs and a separate access token", async () => {
    const { enqueueAuditJob } = await import("../queue");
    const result = await enqueueAuditJob({ jobType: "quick-audit", url: "https://example.com" });

    expect(result.jobId).toMatch(/^job_/);
    expect(result.accessToken).toMatch(/^jta_/);
    expect(result.jobId).not.toContain(result.accessToken);
  });

  it("requires the access token for polling and cancellation", async () => {
    const { enqueueAuditJob, getAuditJobStatus, cancelAuditJob } = await import("../queue");
    const result = await enqueueAuditJob({ jobType: "quick-audit", url: "https://example.com" });

    await expect(getAuditJobStatus(result.jobId, "wrong-token")).resolves.toBeNull();
    await expect(getAuditJobStatus(result.jobId, result.accessToken)).resolves.toMatchObject({
      jobId: result.jobId,
      state: "waiting",
    });
    await expect(cancelAuditJob(result.jobId, "wrong-token")).resolves.toBe(false);
    await expect(cancelAuditJob(result.jobId, result.accessToken)).resolves.toBe(true);
  });

  it("keeps duplicate idempotent job access tokens valid", async () => {
    const { enqueueAuditJob, getAuditJobStatus } = await import("../queue");
    const first = await enqueueAuditJob({
      jobType: "quick-audit",
      url: "https://example.com",
      idempotencyKey: "same-request-key",
    });
    const second = await enqueueAuditJob({
      jobType: "quick-audit",
      url: "https://example.com",
      idempotencyKey: "same-request-key",
    });

    expect(second.jobId).toBe(first.jobId);
    await expect(getAuditJobStatus(first.jobId, first.accessToken)).resolves.toMatchObject({
      jobId: first.jobId,
    });
    await expect(getAuditJobStatus(second.jobId, second.accessToken)).resolves.toMatchObject({
      jobId: second.jobId,
    });
  });
});
