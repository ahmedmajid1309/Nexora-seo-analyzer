# Phase 12 Render Worker Architecture

Phase 12 adds an optional isolated rendered-DOM worker under `services/render-worker/`.

- The Next.js app never launches Playwright inside public API routes.
- `GET /health` returns only non-secret status, timestamp, uptime, and render counters.
- `POST /render` requires HMAC headers and returns a bounded rendered snapshot.
- The app calls the worker through `src/lib/rendered-dom/client.ts` only when `RENDER_WORKER_ENABLED=true` and URL/secret are configured.
- Worker failures are converted to diagnostic `renderedDom.status="unavailable"` results and do not fail the static audit.
- Site audits request rendered analysis for at most 3 early representative audited pages.
- Rendered findings do not affect SEO Health scoring.

The app-side circuit breaker starts closed, opens after 3 consecutive worker failures, transitions to half-open after cooldown, allows one probe, closes on probe success, and reopens on probe failure.
