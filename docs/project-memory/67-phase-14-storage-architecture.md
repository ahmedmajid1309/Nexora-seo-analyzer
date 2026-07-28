# Phase 14 Storage Architecture

Reports are stored only after deterministic audit completion. Storage is a post-audit side effect and cannot change scores or findings. Failed storage returns an honest `reportStorage` status while preserving the successful audit response.

The database layer lives under `src/lib/db`, and report persistence/authorization lives under `src/lib/reports`.
