# Phase 7 — PageSpeed Insights Integration Specification

## Overview

Integrate Google PageSpeed Insights v5 API to provide real performance scores alongside the static Nexora analysis. Performance data is purely additive and informational — it does not affect the five existing score families (SEO Health, Accessibility, Security & Trust, AEO Readiness, GEO Readiness).

## Architecture

```
Audit Pipeline:
  safeFetch(url) ──> buildPageSnapshot() ──> runAll() ──> fetchPageSpeedBoth() ──> calculateScores()
                                                              │
                                                              ▼
                                                    PageSpeedOutput
                                                      { mobile, desktop, error? }
```

The PSI call is injected between static rule execution and scoring. If `PAGESPEED_API_KEY` is not set, or the call fails, the audit continues with `performanceStatus: "unavailable"`.

## API Contracts

### PSI v5 Request

```
GET https://www.googleapis.com/pagespeedonline/v5/runPagespeed
  ?url=<encoded URL>
  &strategy=mobile|desktop
  &category=performance,best-practices,seo
  &key=<API_KEY>
```

Two concurrent requests: one for `mobile`, one for `desktop` via `Promise.all`. Identical in-flight requests are deduplicated via a `Map<string, Promise<PageSpeedResult>>`.

### PSI v5 Response → Our Types

| PSI Field                                                            | Our Type                              | Notes                    |
| -------------------------------------------------------------------- | ------------------------------------- | ------------------------ |
| `lighthouseResult.categories.performance.score` (0-1)                | `labMetrics.performanceScore` (0-100) | Category score           |
| `lighthouseResult.audits.largest-contentful-paint.numericValue`      | `labMetrics.lcp.value`                | LCP in ms                |
| `lighthouseResult.audits.largest-contentful-paint.score`             | `labMetrics.lcp.score`                | 0-100                    |
| `lighthouseResult.audits.cumulative-layout-shift.numericValue`       | `labMetrics.cls.value`                | CLS score                |
| `lighthouseResult.audits.cumulative-layout-shift.score`              | `labMetrics.cls.score`                | 0-100                    |
| `lighthouseResult.audits.total-blocking-time.numericValue`           | `labMetrics.tbt.value`                | TBT in ms                |
| `lighthouseResult.audits.total-blocking-time.score`                  | `labMetrics.tbt.score`                | 0-100                    |
| `lighthouseResult.audits.speed-index.numericValue`                   | `labMetrics.si.value`                 | SI in ms                 |
| `lighthouseResult.audits.speed-index.score`                          | `labMetrics.si.score`                 | 0-100                    |
| `lighthouseResult.audits.first-contentful-paint.numericValue`        | `labMetrics.fcp.value`                | FCP in ms                |
| `lighthouseResult.audits.first-contentful-paint.score`               | `labMetrics.fcp.score`                | 0-100                    |
| `loadingExperience.metrics.LARGEST_CONTENTFUL_PAINT_MS.percentile`   | `fieldData.lcp.p75Ms`                 | Field LCP p75            |
| `loadingExperience.metrics.LARGEST_CONTENTFUL_PAINT_MS.category`     | `fieldData.lcp.category`              | FAST/AVERAGE/SLOW        |
| `loadingExperience.metrics.CUMULATIVE_LAYOUT_SHIFT_SCORE.percentile` | `fieldData.cls.p75`                   | Field CLS p75            |
| `loadingExperience.metrics.CUMULATIVE_LAYOUT_SHIFT_SCORE.category`   | `fieldData.cls.category`              | FAST/AVERAGE/SLOW        |
| `loadingExperience.metrics.INTERACTION_TO_NEXT_PAINT.percentile`     | `fieldData.inp.p75Ms`                 | Field INP p75            |
| `loadingExperience.metrics.INTERACTION_TO_NEXT_PAINT.category`       | `fieldData.inp.category`              | FAST/AVERAGE/SLOW        |
| `loadingExperience.metrics.FIRST_CONTENTFUL_PAINT_MS.percentile`     | `fieldData.fcp.p75Ms`                 | Field FCP p75            |
| `loadingExperience.metrics.FIRST_CONTENTFUL_PAINT_MS.category`       | `fieldData.fcp.category`              | FAST/AVERAGE/SLOW        |
| `loadingExperience.overall_category`                                 | `fieldData.overallCategory`           | FAST/AVERAGE/SLOW        |
| Audits with score < 0.99 and details                                 | `opportunities[]`                     | Top 20, sorted ascending |
| Audits with score >= 0.99 and no details                             | `diagnostics[]`                       | Top 10                   |

## Performance Score Policy

The overall performance score uses a **mobile-primary** policy — never an average:

1. **Mobile available** (regardless of desktop): Score is the mobile Lighthouse performance score. Source is `pagespeed-mobile`.
2. **Mobile unavailable, desktop available**: Score is the desktop Lighthouse performance score as a fallback. Source is `pagespeed-desktop-fallback`.
3. **Both unavailable**: `performanceScore: null`, status `unavailable`, source `null`.

### Source tracking

A `performanceSource` field accompanies every score:

| Source                       | Meaning                                   | Confidence Impact |
| ---------------------------- | ----------------------------------------- | ----------------- |
| `pagespeed-mobile`           | Score derived from mobile Lighthouse data | Normal            |
| `pagespeed-desktop-fallback` | Fallback because mobile was unavailable   | Explanation only  |
| `null`                       | No PageSpeed data available               | N/A               |

The static score families are never affected by PageSpeed availability or score.

### Lighthouse diagnostics (external only)

Lighthouse category scores for `accessibility`, `seo`, and `best-practices` are extracted into `labMetrics.lighthouseAccessibilityScore`, `lighthouseSeoScore`, and `lighthouseBestPracticesScore`. These are displayed as external diagnostic reference values only — they **never** overwrite Nexora's static rule-based scores or create duplicate scoring penalties.

## Error Handling

| Error           | Code                 | Response                     |
| --------------- | -------------------- | ---------------------------- |
| API key missing | AUTH_ERROR           | Skip PSI, status=unavailable |
| API key invalid | AUTH_ERROR (403)     | Skip PSI, status=unavailable |
| Quota exceeded  | QUOTA_EXCEEDED (429) | Skip PSI, status=unavailable |
| Network failure | NETWORK_ERROR (502)  | Skip PSI, status=unavailable |
| Parse failure   | PARSE_ERROR          | Skip PSI, status=unavailable |
| Timeout         | API_ERROR (504)      | Skip PSI, status=unavailable |

All errors are swallowed — the static audit always succeeds.

### One-strategy failure

If one strategy fails, the other is still returned. A failed strategy is `null` in the output — no partial result is cached.

### Failed responses

Failed responses (HTTP errors, timeouts, parse failures) are **never** cached as successful results. The cache only stores successfully parsed `PageSpeedResult` objects.

## Caching

- In-memory Map with 5-minute TTL
- Max 50 entries (LRU eviction)
- Separate entries per `strategy:url` pair
- Cache is per-process and cleared on server restart
- API keys never enter cache keys (only `strategy:url` pairs)
- Failed responses are never cached

## Frontend Display

The Performance card replaces the previous "—" placeholder with:

- Score (color-coded: green >= 80, amber >= 50, red < 50)
- Source badge ("Mobile Primary" or "Desktop Fallback")
- Mobile/Desktop tab toggle
- Lab Data metrics table (LCP, CLS, TBT, SI, FCP with score)
- Field Data (CrUX) table with overall category badge — CrUX absence treated as normal (no fallback, no error)
- Opportunities list (sorted by impact, top 10)

When PSI is unavailable, the card shows "—" with the explanation message.

The score display always shows the primary score (mobile or fallback). The non-primary strategy's data is available under its respective tab. The displayed score does not change when switching tabs.
