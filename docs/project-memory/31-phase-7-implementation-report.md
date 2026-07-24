# Phase 7 Implementation Report — PageSpeed Insights Integration

## Summary

Phase 7 integrates Google PageSpeed Insights v5 API performance data into the Nexora SEO Analyzer audit pipeline. Performance scores, lab metrics (LCP, CLS, TBT, SI, FCP), field data from CrUX (LCP, CLS, INP, FCP), and optimization opportunities are fetched server-side and displayed alongside the five existing static Nexora score families. The integration is fully optional — when no API key is configured, the audit continues with `performanceStatus: "unavailable"`.

## What Was Created

### PageSpeed Provider Layer (`src/lib/pagespeed/`)

| File               | Purpose                                                                                                                                                                                                                                                        |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `types.ts`         | TypeScript types: `PageSpeedResult`, `PageSpeedOutput`, `PageSpeedLabMetrics` (includes Lighthouse category scores), `PageSpeedFieldData`, `PageSpeedOpportunity`, `PerformanceSource`, etc. No `jsonRaw` field — raw PSI JSON is never returned or persisted. |
| `schemas.ts`       | Zod schemas for validating PSI v5 API response (`PSIResponseSchema`)                                                                                                                                                                                           |
| `client.ts`        | HTTP client that builds the PSI URL with API key and strategy, fetches, validates, and parses                                                                                                                                                                  |
| `parser.ts`        | `fetchPageSpeed()` (single strategy with in-flight deduplication) and `fetchPageSpeedBoth()` (concurrent mobile + desktop via `Promise.all`)                                                                                                                   |
| `metrics.ts`       | `extractLabMetrics()` — extracts LCP, CLS, TBT, SI, FCP from Lighthouse result                                                                                                                                                                                 |
| `field-data.ts`    | `extractFieldData()` — extracts CrUX field data (LCP, CLS, INP, FCP with p75 and category)                                                                                                                                                                     |
| `opportunities.ts` | `extractOpportunities()` and `extractDiagnostics()` — extracts top 20 opportunities and top 10 diagnostics                                                                                                                                                     |
| `cache.ts`         | In-memory cache (5min TTL, 50 entries max, per `strategy:url`)                                                                                                                                                                                                 |
| `errors.ts`        | Typed error classes: `PageSpeedError`, `PageSpeedQuotaError`, `PageSpeedAuthError`, etc.                                                                                                                                                                       |
| `index.ts`         | Public API barrel                                                                                                                                                                                                                                              |

### Tests (`src/lib/pagespeed/__tests__/`)

- `metrics.test.ts` — 5 tests for lab metric extraction edge cases
- `field-data.test.ts` — 5 tests for CrUX field data extraction
- `opportunities.test.ts` — 9 tests for opportunities and diagnostics extraction
- `errors.test.ts` — 10 tests for error classes and classification
- `cache.test.ts` — 5 tests for in-memory caching
- `schemas.test.ts` — 5 tests for PSI response schema validation

### Total: 39 new tests (44 new tests counting engine integration)

## What Was Modified

| File                                          | Change                                                                                                                                                                                                                                                        |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/lib/rules/scoring/types.ts`              | Add `PerformanceSource` type (`"pagespeed-mobile" \| "pagespeed-desktop-fallback" \| null`); add `performanceSource` to `ScoreBreakdown` and `ScorePreviewData`                                                                                               |
| `src/lib/rules/scoring/engine.ts`             | Add `computePageSpeedScore()` function; accept `pagespeed?: PageSpeedOutput` in `ScoringInput`; compute performance score using mobile-primary policy (not average); desktop used only as fallback; source is tracked                                         |
| `src/app/api/audit/route.ts`                  | Import `env` and `PageSpeedOutput`; call `fetchPageSpeedBoth()` when `PAGESPEED_API_KEY` is configured; pass result to scoring engine; include performance data in response                                                                                   |
| `src/lib/audit/types.ts`                      | Add `PageSpeedLabMetricsOutput` (includes Lighthouse category scores), `PageSpeedFieldDataOutput`, `PageSpeedOpportunityOutput`, `PageSpeedSideData`; add `performanceSource` and Lighthouse diagnostics to `AuditResponseData`                               |
| `src/app/result/page.tsx`                     | Replace static `ScoreCard` for Performance with `PerformanceSection` component featuring source badge ("Mobile Primary" / "Desktop Fallback"), mobile/desktop tab toggle, lab metrics table, field data table with CrUX category badges, and opportunity list |
| `src/app/privacy/page.tsx`                    | Add "Third-party services" section disclosing PSI data sharing; update "Current status" to describe server-side fetching                                                                                                                                      |
| `src/app/api/internal/score-preview/route.ts` | Add `performanceScore` and dynamic `performanceStatus` to preview response                                                                                                                                                                                    |

## Verification Results

| Check                           | Result                                                                                               |
| ------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Test count                      | 57 files, **878 tests passed** (830 baseline + 48 new; 4 added for mobile-primary policy correction) |
| Lint                            | 0 errors, 0 warnings                                                                                 |
| Typecheck                       | Passes                                                                                               |
| Build (`next build`)            | Passes                                                                                               |
| E2E tests                       | Unchanged, pass                                                                                      |
| No PSI SDK dependency           | Confirmed — only built-in `fetch` used                                                               |
| API key not in browser response | Confirmed — server-side only                                                                         |
| Static audit without API key    | Confirmed — returns `performanceStatus: "unavailable"`                                               |

## Key Design Decisions

1. **No library dependency**: Direct `fetch` to PSI v5 — avoids heavy Google client SDK
2. **Concurrent PSI calls**: Mobile and desktop requests execute concurrently via `Promise.all` with in-flight deduplication
3. **Mobile-primary scoring**: Score is the mobile Lighthouse performance score. Desktop is a documented fallback only — never averaged.
4. **Source tracking**: Every performance score has a `performanceSource` field (`"pagespeed-mobile"` / `"pagespeed-desktop-fallback"` / `null`)
5. **INP from CrUX only**: INP (Interaction to Next Paint) is derived from genuine field data, never from TBT
6. **No overwrite**: Nexora static scores remain independent — Lighthouse accessibility/SEO/best-practices scores are external diagnostics only
7. **No raw JSON exposure**: Raw PageSpeed API response is never returned to the client or persisted
8. **Failed responses never cached**: Only successfully parsed results enter the cache
9. **Optional feature**: The entire PSI layer is gated on `PAGESPEED_API_KEY` being set in environment
