# Phase 7 Precheck Report — PageSpeed Insights Integration

## Verification

| Check                                   | Result                                                     |
| --------------------------------------- | ---------------------------------------------------------- |
| Lockfile                                | `pnpm-lock.yaml` only (178701 bytes)                       |
| PSI SDK installed?                      | No. No Google client library                               |
| `.env.example` has `PAGESPEED_API_KEY=` | Yes (line 5)                                               |
| Performance score hardcoded             | Yes (`engine.ts:221` — `performanceStatus: "unavailable"`) |
| Baseline tests                          | 830 passed                                                 |
| Lint                                    | 0 errors, 0 warnings                                       |
| Typecheck                               | Passes                                                     |
| Build                                   | Passes                                                     |
| E2E                                     | Passes (not affected)                                      |

## Files to Create

- `src/lib/pagespeed/types.ts` — TypeScript types for PSI response
- `src/lib/pagespeed/schemas.ts` — Zod schemas for PSI API response validation
- `src/lib/pagespeed/client.ts` — HTTP client calling PSI v5 API
- `src/lib/pagespeed/parser.ts` — Parse raw API response into typed structures
- `src/lib/pagespeed/metrics.ts` — Extract lab metrics (LCP, CLS, TBT, SI, FCP)
- `src/lib/pagespeed/field-data.ts` — Extract CrUX field data (INP, LCP, CLS, FCP)
- `src/lib/pagespeed/opportunities.ts` — Extract opportunities and diagnostics
- `src/lib/pagespeed/cache.ts` — In-memory cache (5min TTL, 50 entries)
- `src/lib/pagespeed/errors.ts` — Typed error classes
- `src/lib/pagespeed/index.ts` — Public API barrel

## Files to Modify

- `src/lib/rules/scoring/types.ts` — Widen `performanceStatus` to `"unavailable" | "available"`; add `performanceScore`
- `src/lib/rules/scoring/engine.ts` — Accept `PageSpeedOutput`; compute score
- `src/app/api/audit/route.ts` — Call PSI when API key is configured; pass to engine
- `src/app/result/page.tsx` — Performance score card with mobile/desktop tabs, lab/field data, opportunities
- `src/app/privacy/page.tsx` — Add PSI disclosure paragraph
- `src/lib/audit/types.ts` — Add PageSpeed response types

## Constraints

- Must not install large Google client library — direct typed server-side HTTP to PSI v5
- Must not expose API key to browser, logs, or responses
- PageSpeed must be OPTIONAL — static audit must succeed when PSI is disabled/fails
- Do not overwrite Nexora static scores with Lighthouse category scores
- Do not derive INP from TBT; INP only from genuine CrUX field data
- Performance score family is a single score card, not a full score family
