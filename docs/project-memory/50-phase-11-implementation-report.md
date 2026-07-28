# Phase 11 Implementation Report — Limited Full-Site Audit

## Summary

Phase 11 adds a controlled full-site audit flow while preserving the existing single-page audit. The feature introduces `POST /api/audit/site`, `/site-audit`, and `/site-result`, bounded crawling up to 25 pages, cross-page findings, aggregate scoring, and a progress contract.

## Files Created

| File                                      | Purpose                                                           |
| ----------------------------------------- | ----------------------------------------------------------------- |
| `src/lib/audit/quick-audit.ts`            | Shared single-page audit helper used by both audit modes          |
| `src/lib/site-audit/types.ts`             | Site audit contracts and limits                                   |
| `src/lib/site-audit/schemas.ts`           | Public request schema                                             |
| `src/lib/site-audit/url-utils.ts`         | URL normalization, eligibility, skip rules                        |
| `src/lib/site-audit/robots.ts`            | Minimal robots parser and block checker                           |
| `src/lib/site-audit/sitemap.ts`           | Sitemap `<loc>` parser                                            |
| `src/lib/site-audit/cross-page.ts`        | Site-level finding engine                                         |
| `src/lib/site-audit/aggregate-scoring.ts` | Transparent aggregate scoring model                               |
| `src/lib/site-audit/coordinator.ts`       | Bounded in-process crawl coordinator                              |
| `src/lib/site-audit/index.ts`             | Public barrel                                                     |
| `src/app/api/audit/site/route.ts`         | Site audit API route                                              |
| `src/app/site-audit/page.tsx`             | Full-site audit launcher                                          |
| `src/app/site-result/page.tsx`            | Full-site report UI                                               |
| Phase 11 tests                            | URL discovery, coordinator, cross-page, aggregate, API, report UI |

## Files Modified

| File                                      | Change                                                                           |
| ----------------------------------------- | -------------------------------------------------------------------------------- |
| `src/app/api/audit/route.ts`              | Reused `runQuickAudit` without changing public single-page behavior              |
| `src/lib/network/content-type.ts`         | Added explicit internal content-type allowance helper                            |
| `src/lib/network/safe-fetch.ts`           | Added internal `additionalAllowedContentTypes` option for sitemap/robots fetches |
| `src/components/layout/SiteHeader.tsx`    | Added Site Audit navigation link                                                 |
| `e2e/smoke.spec.ts`                       | Added smoke coverage for new site-audit routes                                   |
| `docs/project-memory/14-phase-roadmap.md` | Phase 11 status update                                                           |
| `docs/project-memory/15-decision-log.md`  | Added Phase 11 decisions                                                         |
| `docs/project-memory/16-risk-register.md` | Added/updated Phase 11 residual risks                                            |
| `docs/project-memory/17-phase-status.md`  | Phase 11 detail update                                                           |

## Crawl Limits

- Maximum selected pages: 25.
- Default page limit: 10.
- Default concurrency: 3.
- Total coordinator deadline: 45 seconds.
- Sitemap fetches: up to 3 sitemap URLs.
- Redirects, body size, DNS validation, and response limits: inherited from `safeFetch`.

## Security Controls

Every crawled page, robots URL, and sitemap URL uses `safeFetch`. Same-origin selection, robots blocking, destructive URL avoidance, unsupported download skipping, and off-origin redirect blocking are enforced in the coordinator.

## Cross-Page Checks

Implemented duplicate titles, missing titles, duplicate descriptions, missing descriptions, duplicate H1s, canonical conflicts, outside-crawl canonical targets, redirect chains, broken internal links where evidenced, orphan candidates, excessive depth, URL variants, repeated template failures, and indexability inconsistencies.

## Aggregate Scoring

Site health uses 65% audited-page SEO average, 25% cross-page health, and 10% coverage. Failed pages lower coverage and confidence but are not treated as zero page scores.

## Progress Contract

Progress events include state, discovered count, selected count, completed count, failed count, sanitized current pathname, and elapsed time. No fake percentages are used.

## Verification

| Gate       | Result                        |
| ---------- | ----------------------------- |
| Format     | PASS                          |
| Lint       | PASS, 0 errors and 0 warnings |
| Typecheck  | PASS                          |
| Unit tests | PASS, 71 files and 986 tests  |
| Build      | PASS, 23 app routes           |
| E2E        | PASS, 10/10 tests             |

Phase 11 exit criteria are complete.
