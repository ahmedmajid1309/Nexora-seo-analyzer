# Phase 16 Loading Experience Contract

## Contract

- Loading UI must not display fake percentages.
- Loading UI must not claim server stages are complete unless the app has real stage state.
- Loading UI must not delay report navigation after the API response returns.
- Loading UI must avoid exposing secrets, query strings, cookies, request headers, or form values.
- Loading UI must remain usable with reduced-motion preferences.

## Implemented

- Added `src/components/audit-progress/` as the shared scan experience.
- Replaced the old timer-driven quick result loading block in `src/app/result/page.tsx`.
- Added the shared scan experience to `src/app/site-result/page.tsx`.
- Added sanitized target display, elapsed seconds, stage timeline, counters, and activity feed.
- Added reduced-motion handling for the scan viewport.
- Preserved screen-reader labels for quick and site audit loading states.

## Explicitly Avoided

- No generated percent complete value.
- No fake progression through server stages.
- No artificial delay before opening results.
- No query-string display in the loading target summary.

## Focused Verification

- `pnpm.cmd exec vitest run src/components/audit-progress src/app/result/__tests__/result-page.test.tsx src/app/site-result/__tests__/site-result-page.test.tsx`: passed, 3 files and 26 tests before the final full-suite rerun.
