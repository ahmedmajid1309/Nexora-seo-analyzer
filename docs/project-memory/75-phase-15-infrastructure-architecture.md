# Phase 15 Infrastructure Architecture

## Components

- PostgreSQL remains the authoritative report store from Phase 14.
- Redis backs BullMQ audit jobs and queue health reporting.
- MinIO provides local S3-compatible object storage for optional JSON result artifacts.
- `services/audit-worker` processes queued quick and site audit jobs in a separate Node process.
- `services/render-worker` remains the isolated browser-rendering service and is included in Compose with a 1 GB memory limit.

## Public Contracts

- `POST /api/jobs/audit` enqueues `quick-audit` or `site-audit` jobs.
- `GET /api/jobs/[jobId]` returns job state, progress, retry count, and completed result.
- `POST /api/jobs/[jobId]` cancels/removes an existing job.
- `GET /api/jobs/[jobId]/events` streams server-sent progress events.

## Rollout

The queue is disabled by default with `AUDIT_QUEUE_ENABLED=false`. Existing synchronous endpoints remain the default product path until queue rollout is explicitly enabled.
