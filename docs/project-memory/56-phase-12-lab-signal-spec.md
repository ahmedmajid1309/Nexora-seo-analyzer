# Phase 12 Lab Signal Spec

Rendered DOM lab observations are source-labeled as `Rendered browser lab observation` and remain separate from PageSpeed and CrUX.

Signals:

- navigation TTFB
- first contentful paint
- observed largest contentful paint
- observed cumulative layout shift
- long-task count
- total long-task duration
- DOMContentLoaded timing
- load timing
- resource count
- transferred-byte estimate where available

Rules:

- Unavailable values remain `null`.
- Missing values are not converted to zero.
- The worker does not claim field data.
- The worker does not claim INP.
- These lab observations do not affect SEO Health scoring.
