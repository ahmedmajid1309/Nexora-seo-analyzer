# Phase 15 Operations Contract

## Local Stack

Use `docker compose up -d postgres redis minio render-worker audit-worker` for the optional distributed stack. Memory limits are declared in `docker-compose.yml` and worker concurrency is set to `1` for local safety.

## Environment

- `REDIS_URL` is required for queued jobs.
- `AUDIT_QUEUE_ENABLED=true` enables job submission.
- `AUDIT_WORKER_CONCURRENCY` controls BullMQ worker concurrency and defaults to `1`.
- `OBJECT_STORAGE_ENABLED=true` enables S3-compatible artifact writes.
- `S3_*` values configure MinIO, S3, or R2-compatible storage.

## Health

`GET /api/health` includes database, queue, and object-storage readiness without exposing secrets, URLs under audit, tokens, or provider credentials.

## Failure Mode

If Redis is unavailable, job submission returns `503`. If object storage is disabled or unavailable, synchronous audits are unaffected and the worker still persists reports through PostgreSQL when report storage is enabled.
