# Phase 16 Route Inventory

## Public Pages

- `/`
- `/site-audit`
- `/result`
- `/site-result`
- `/reports`
- `/reports/[reportId]`
- `/sign-in`
- `/methodology`
- `/privacy`
- `/terms`
- `/faq`
- `/contact`

## Internal And Demo Pages

- `/mock-result`
- `/design-lab/final`
- `/design-lab/final/loading`
- `/design-lab/final/result`

## API Routes

- `/api/audit`
- `/api/audit/site`
- `/api/jobs/audit`
- `/api/jobs/[jobId]`
- `/api/jobs/[jobId]/events`
- `/api/reports`
- `/api/reports/[reportId]`
- `/api/reports/[reportId]/share`
- `/api/reports/[reportId]/claim`
- `/api/auth/dev-signin`
- `/api/auth/logout`
- `/api/internal/score-preview`
- `/api/internal/rule-preview`
- `/api/internal/retention-cleanup`
- `/api/internal/fetch-preview`
- `/api/internal/extract-preview`
- `/api/health`

## Metadata Routes

- `/robots.txt`
- `/sitemap.xml`

## Phase 16 Changes

- Added `/faq` because the footer and release UX needed a first-class FAQ destination.
- Added `/contact` because support/contact was missing from the public route set.
- Added `src/app/sitemap.ts` because `robots.ts` advertised `/sitemap.xml` but no sitemap route existed.
- Kept internal/demo routes out of the sitemap.

## Sitemap Scope

- Included: `/`, `/site-audit`, `/methodology`, `/privacy`, `/terms`, `/faq`, `/contact`
- Excluded: result pages, report pages, auth pages, API routes, and design/mock routes
