import { Queue, type JobsOptions } from "bullmq";
import IORedis from "ioredis";
import { env } from "@/config/env";
import type { AuditJobPayload } from "./types";
import { createOpaqueId, hashSecret } from "@/lib/reports/tokens";

let connection: IORedis | null = null;
let queue: Queue<AuditJobPayload> | null = null;

export function isQueueConfigured(): boolean {
  return Boolean(env.REDIS_URL);
}

export function getRedisConnection(): IORedis {
  if (!env.REDIS_URL) throw new Error("REDIS_URL is not configured");
  connection ??= new IORedis(env.REDIS_URL, { maxRetriesPerRequest: null });
  return connection;
}

export function getAuditQueue(): Queue<AuditJobPayload> {
  queue ??= new Queue<AuditJobPayload>("audit", { connection: getRedisConnection() });
  return queue;
}

export async function enqueueAuditJob(
  payload: Omit<AuditJobPayload, "requestId">,
): Promise<{ jobId: string; cacheHit: boolean }> {
  if (!env.AUDIT_QUEUE_ENABLED || !isQueueConfigured())
    throw new Error("Audit queue is not configured");
  const requestId = createOpaqueId("job");
  const jobId = payload.idempotencyKey
    ? `job_${hashSecret(payload.idempotencyKey).slice(0, 32)}`
    : requestId;
  const options: JobsOptions = {
    jobId,
    attempts: 3,
    backoff: { type: "exponential", delay: 2_000 },
    removeOnComplete: { age: 3600, count: 1000 },
    removeOnFail: { age: 86_400, count: 1000 },
  };
  const existing = await getAuditQueue().getJob(jobId);
  if (existing && (await existing.getState()) === "completed") return { jobId, cacheHit: true };
  await getAuditQueue().add(payload.jobType, { ...payload, requestId }, options);
  return { jobId, cacheHit: false };
}

export async function getAuditJobStatus(jobId: string) {
  const job = await getAuditQueue().getJob(jobId);
  if (!job) return null;
  return {
    jobId,
    state: await job.getState(),
    progress: job.progress,
    result: job.returnvalue,
    failedReason: job.failedReason ? "Job failed" : null,
    attemptsMade: job.attemptsMade,
  };
}

export async function cancelAuditJob(jobId: string): Promise<boolean> {
  const job = await getAuditQueue().getJob(jobId);
  if (!job) return false;
  await job.remove();
  return true;
}

export async function getQueueHealth() {
  if (!isQueueConfigured()) return { configured: false, healthy: false };
  try {
    await getRedisConnection().ping();
    const counts = await getAuditQueue().getJobCounts(
      "waiting",
      "active",
      "completed",
      "failed",
      "delayed",
    );
    return { configured: true, healthy: true, counts };
  } catch {
    return { configured: true, healthy: false };
  }
}
