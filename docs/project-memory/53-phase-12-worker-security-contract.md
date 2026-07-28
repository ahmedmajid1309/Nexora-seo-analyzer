# Phase 12 Worker Security Contract

Implemented worker controls:

- HMAC-SHA256 signature over `timestamp.body` using `RENDER_WORKER_SECRET`.
- Missing, invalid, stale, or body-mismatched signatures are rejected.
- Request bodies are capped at 8 KB.
- Response snapshots are capped at 128 KB.
- Only HTTP and HTTPS schemes are allowed.
- Only standard ports 80 and 443 are allowed.
- URLs with credentials are rejected.
- Loopback, private, link-local, cloud metadata, documentation, reserved, multicast, and mixed public/private DNS answers are blocked.
- Initial navigation URL, redirect URLs, and subresource URLs are independently revalidated.
- WebSocket URLs are blocked.
- Service workers are blocked where Playwright supports it.
- Downloads and popups are cancelled/closed.
- Network request count and redirect count are capped.
- Browser context and browser close paths run in `finally` after success or failure.

Public worker responses never include full DOM, cookies, localStorage, sessionStorage, form values, request/response bodies, authorization headers, or worker secrets.

Known limitation: local private test sites remain blocked by design. Runtime verification of JavaScript-injected content must use a public HTTP/HTTPS target or controlled deployment that resolves only to public test addresses.
