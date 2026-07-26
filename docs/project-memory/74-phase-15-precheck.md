# Phase 15 Precheck

- Branch: `v2-phases-11-15`
- Starting checkpoint: `0f90ff34ddb927895d1ea79860ca315b8195ac48`
- Worktree state at start: clean
- Phase 14 checkpoint: committed and pushed
- Docker availability: verified during Phase 14; Compose config validated during Phase 15

## Constraints

- Keep synchronous audit APIs intact.
- Keep queue and object storage optional and disabled by default.
- Respect local low-memory limits: PostgreSQL 512 MB, Redis 256 MB, MinIO 512 MB, audit worker 768 MB, render worker 1 GB.
- Worker concurrency defaults to 1.
