# Phase 6: Quick Page Audit — Implementation Report

## Summary

Phase 6 implements the public Quick Page Audit endpoint (`POST /api/audit`) and
its supporting infrastructure. Users can now submit a URL from the homepage,
receive a full audit result, and view it on the result page.

## What was built

### 1. Public audit contract (`src/lib/audit/types.ts`, `src/lib/audit/schemas.ts`)

- `AuditRequest` with url + optional keyword field via Zod schema
- `AuditResponse` and `AuditResponseData` interfaces matching the result contract
- URL normalization (auto-prepend `https://`) with `z.string().url()` validation

### 2. Abuse protection (`src/lib/audit/abuse-protection.ts`)

In-memory (no persistence or database):

| Guard              | Limit                                    |
| ------------------ | ---------------------------------------- |
| Rate limit per IP  | 10 requests/minute                       |
| Host cooldown      | 30 seconds between scans of same host    |
| Concurrent slot    | Max 3 simultaneous audits                |
| Execution deadline | 30 seconds, enforced via AbortController |

### 3. Audit endpoint (`src/app/api/audit/route.ts`)

Full pipeline: `Zod validate → rate-limit → cooldown-check → slot-acquire → safeFetch → buildPageSnapshot → runAll → calculateScores → response`

Error handling covers: invalid JSON, validation errors, rate-limit, host cooldown, capacity exhausted, fetch failures, timeouts, and NexoraErrors.

### 4. Result page (`src/app/result/page.tsx`)

Client component reading `?url=` search param. Displays: score cards (5 families), findings table with filters, category breakdowns, extraction warnings, applied caps, and a rescan button. Fully keyboard-accessible.

### 5. AuditForm wiring (`src/components/landing/AuditForm.tsx`)

Submit button navigates to `/result?url=...` (no longer disabled / placeholder). Optional keyword field included but the result page does not yet use it (deferred to Phase 7+).

### 6. Production guard for internal endpoints (`src/lib/internal-guard.ts`)

`productionGuard()` returns 404 in production, no-op in development. Applied to all 4 internal preview routes (`rule-preview`, `score-preview`, `fetch-preview`, `extract-preview`).

## Key design decisions

- **No persistence**: Results are computed live per request. No database, no cache.
- **Performance `unavailable`**: PageSpeed explicitly deferred to Phase 7. The response includes `performanceStatus: "unavailable"` with a clear explanation.
- **Findings truncated at 200**: Safety limit to prevent oversized responses.
- **Sensitive-data filter**: Full HTML body never included in response.
- **Request ID**: Every response includes `requestId` (UUID v4) for debugging.
- **Internal endpoints 404 in production**: Prevents accidental exposure of debug preview routes.

## Files created

| File                                        | Purpose                                     |
| ------------------------------------------- | ------------------------------------------- |
| `src/lib/audit/types.ts`                    | Public audit contract types                 |
| `src/lib/audit/schemas.ts`                  | Audit request Zod schema                    |
| `src/lib/audit/abuse-protection.ts`         | Rate-limit, cooldown, concurrency, deadline |
| `src/lib/audit/index.ts`                    | Barrel export                               |
| `src/app/api/audit/route.ts`                | `POST /api/audit` endpoint                  |
| `src/app/api/audit/__tests__/audit.test.ts` | 12 endpoint tests                           |
| `src/app/result/page.tsx`                   | Audit result display page                   |
| `src/lib/internal-guard.ts`                 | Production guard utility                    |

## Files modified

| File                                                   | Change                                       |
| ------------------------------------------------------ | -------------------------------------------- |
| `src/components/landing/AuditForm.tsx`                 | Wired submit to real `/result` navigation    |
| `src/app/api/internal/rule-preview/route.ts`           | Added `productionGuard()`                    |
| `src/app/api/internal/score-preview/route.ts`          | Added `productionGuard()`                    |
| `src/app/api/internal/fetch-preview/route.ts`          | Added `productionGuard()`                    |
| `src/app/api/internal/extract-preview/route.ts`        | Added `productionGuard()`                    |
| `e2e/smoke.spec.ts`                                    | Changed "submit button disabled" → "enabled" |
| `src/app/__tests__/homepage.test.tsx`                  | Added `next/navigation` mock                 |
| `src/components/landing/__tests__/audit-form.test.tsx` | Rewritten for live audit                     |

## Test results

```
Test Files  51 passed (51)
     Tests  830 passed (830)
Lint:       0 errors, 0 warnings
Typecheck:  passes
Build:      passes
```

## Verification checklist

- [x] Lint passes (0 errors, 0 warnings)
- [x] Typecheck passes
- [x] All 830 unit tests pass
- [x] Build succeeds
- [x] All protected endpoints return 404 in production
- [x] Audit endpoint returns proper error shapes
- [x] No HTML body in response
- [x] Performance status set to `unavailable`
- [x] All 5 score families present
- [x] Request ID present on all responses
- [x] Abuse protection prevents rapid re-scans
- [x] Result page renders score cards, findings, filters, caps
- [x] AuditForm navigates to /result on submit
