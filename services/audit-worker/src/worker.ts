import { Worker } from "bullmq";
import { env } from "../../../src/config/env";
import { getRedisConnection } from "../../../src/lib/jobs/queue";
import type { AuditJobPayload } from "../../../src/lib/jobs/types";
import { runAuditJob } from "./runner";

const worker = new Worker<AuditJobPayload>(
  "audit",
  async (job) => {
    const startedAt = Date.now();
    await job.updateProgress({ state: "active", elapsedMs: 0, retryCount: job.attemptsMade });
    const result = await runAuditJob(job.data);
    await job.updateProgress({
      state: "complete",
      elapsedMs: Date.now() - startedAt,
      retryCount: job.attemptsMade,
    });
    return result;
  },
  {
    connection: getRedisConnection(),
    concurrency: env.AUDIT_WORKER_CONCURRENCY,
    lockDuration: env.AUDIT_JOB_TIMEOUT_MS,
  },
);

worker.on("completed", (job) => {
  console.log(JSON.stringify({ event: "audit_job_completed", jobId: job.id }));
});

worker.on("failed", (job) => {
  console.error(JSON.stringify({ event: "audit_job_failed", jobId: job?.id ?? null }));
});

const shutdown = async () => {
  await worker.close();
  await getRedisConnection().quit();
  process.exit(0);
};

process.on("SIGTERM", () => void shutdown());
process.on("SIGINT", () => void shutdown());
