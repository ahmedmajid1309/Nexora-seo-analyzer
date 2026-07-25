# Phase 11 Crawl Architecture Specification

## Scope

Phase 11 adds a limited in-process website audit for one public origin. It crawls up to 25 selected pages and returns a synchronous API response. It does not introduce queues, Redis, storage, Playwright, or production deployment.

## Public API

`POST /api/audit/site`

Request:

```json
{
  "url": "https://example.com",
  "pageLimit": 10,
  "crawlMode": "links-and-sitemap"
}
```

Limits:

- `pageLimit`: integer 1-25, default 10.
- `crawlMode`: `links-and-sitemap`, `links-only`, or `sitemap-first`.
- No `allowPrivate` or unlimited crawl input exists.

## Discovery Order

1. Starting URL.
2. `robots.txt` sitemap directives, or `/sitemap.xml` fallback when enabled.
3. Same-origin HTML links from successfully audited pages.

## URL Eligibility

URLs are normalized by removing fragments, lowercasing hostnames, stripping tracking parameters, sorting remaining query parameters, and removing non-root trailing slashes. The crawler excludes unsupported schemes, external origins, downloads, destructive-looking paths, robots-blocked paths, and duplicate canonical targets.

## Coordinator

- In-process queue with deterministic FIFO ordering.
- Default concurrency is 3, bounded to 5 internally.
- Total deadline is 45 seconds.
- Per-host cooldown of 100ms between page fetch starts.
- One controlled retry for non-timeout page failures.
- One page failure creates a partial report rather than failing the whole audit.

## Audit Reuse

Per-page work calls the shared `runQuickAudit` helper, which reuses `safeFetch`, static extraction, rule execution, scoring, and preview extraction. PageSpeed is requested only for the starting URL.

## Progress Contract

The response includes ordered progress events with real counts and elapsed time. States are `validating-domain`, `fetching-entry-page`, `discovering-sitemap`, `discovering-links`, `crawling-pages`, `running-page-checks`, `running-cross-page-checks`, `calculating-site-score`, `preparing-report`, `complete`, `partial`, and `failed`. No fake percentages are produced.
