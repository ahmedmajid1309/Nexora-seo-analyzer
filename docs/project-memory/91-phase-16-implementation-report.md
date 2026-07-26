# Phase 16 Implementation Report

## Implemented

- Added capability-token protection to audit job polling, cancellation, and SSE routes.
- Added job request and payload schemas.
- Added worker-side audit payload validation.
- Added Redis audit cache primitives and focused tests.
- Added bounded SSE heartbeat/event-id behavior.
- Replaced fake quick-audit loading progression with an honest scan experience.
- Added the same scan experience to site-audit loading.
- Added explicit partial, failed, and cancelled scan state rendering.
- Added FAQ, contact, and sitemap routes.
- Updated footer navigation for FAQ/contact.
- Switched Playwright readiness from port-only to homepage URL readiness on `127.0.0.1`.
- Allowed `127.0.0.1` as a Next dev origin for the managed E2E server.
- Made optional object artifact upload best-effort so storage outages do not fail authoritative report persistence.
- Added Phase 16 project-memory audit documents.

## Verification Completed

- `pnpm.cmd run format`: passed.
- `pnpm.cmd run lint`: passed.
- `pnpm.cmd run typecheck`: passed.
- `pnpm.cmd run test`: passed, 81 files and 1017 tests.
- `pnpm.cmd run test:db`: passed, 1 file and 4 tests when run alone.
- `pnpm.cmd run test:audit-worker`: passed, 1 file and 2 tests.
- `pnpm.cmd run test:render-worker`: passed, 2 files and 18 tests.
- `pnpm.cmd exec tsc -p services/render-worker/tsconfig.json`: passed.
- `pnpm.cmd exec tsc -p services/audit-worker/tsconfig.json`: passed.
- `pnpm.cmd exec vitest run src/lib/jobs src/lib/cache src/app/api/jobs services/audit-worker/src/runner.test.ts --environment node`: passed, 3 files and 6 tests.
- Temporary visual/responsive Playwright spec: passed, 5 tests.
- `docker compose config`: passed.
- `docker compose build audit-worker`: passed.
- `docker compose build render-worker`: passed.
- `docker compose up -d postgres redis minio render-worker audit-worker`: passed.
- `docker compose ps`: PostgreSQL, Redis, MinIO, render-worker, and audit-worker healthy.
- `pnpm.cmd run build`: passed, 33 generated routes.
- `pnpm.cmd run test:e2e`: passed twice consecutively after readiness fix, 10/10 each run.

## Notes

- No Phase 16 commit has been created yet.
- Production `main` remains unchanged.
