# Phase 16 Security Audit

## Phase 15 Findings Rechecked

- Job polling and cancellation were accessible with only the opaque job ID.
- Job SSE events were accessible with only the opaque job ID.
- Audit worker payload validation did not run inside the worker process.
- Redis cache helper/test coverage was missing.

## Phase 16 Fixes

- Job creation now returns a separate `jta_` access token.
- Job payloads store hashed access tokens, not raw tokens.
- Polling, cancellation, and SSE now require the access token via bearer token, `x-job-access-token`, or `?token=`.
- Duplicate idempotent job creation attaches the newly issued token hash to the existing job so returned tokens are valid.
- SSE streams emit bounded events and no longer expose job progress to callers without capability access.
- Audit worker payloads are validated with `AuditJobPayloadSchema` before execution.
- Redis cache key/cache/single-flight helpers now have focused unit coverage.

## Focused Verification

- `pnpm.cmd exec vitest run src/lib/jobs src/lib/cache src/app/api/jobs services/audit-worker/src/runner.test.ts --environment node`: passed, 3 files and 6 tests.

## Residual Risk

- Capability tokens are returned to the browser and must be treated like short-lived bearer secrets by clients.
- Capability-token URLs must not be logged by downstream hosting/CDN layers.

## Verification Results

- Unauthorized job polling was blocked.
- Unauthorized SSE access was blocked before stream creation.
- Duplicate idempotent jobs no longer return unusable fresh tokens.
- Worker payload validation rejects malformed queue data before execution.
- Object artifact deletion was verified against local MinIO.
- Internal failures for render-worker, storage, and AI providers preserved deterministic audit behavior instead of fabricating scores.
