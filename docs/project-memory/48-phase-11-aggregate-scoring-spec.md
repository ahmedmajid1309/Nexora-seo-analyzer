# Phase 11 Aggregate Scoring Specification

## Principles

- Per-page scores are preserved.
- The site score does not silently average every page score.
- Failed or unavailable pages are not treated as score zero.
- Coverage and confidence are exposed separately.
- Cross-page findings affect the site score deterministically.
- AI does not affect scoring.

## Formula

```text
averageAuditedPageScore = average SEO Health score of successfully audited pages only
crossPageHealthScore = max(0, 100 - verified site-finding penalties)
coverageScore = auditedPages / selectedPages * 100
siteHealthScore = round(
  averageAuditedPageScore * 0.65 +
  crossPageHealthScore * 0.25 +
  coverageScore * 0.10
)
```

## Finding Penalties

Severity penalty base values:

- critical: 25
- high: 14
- medium: 8
- low: 3
- informational: 0

Penalty is multiplied by affected-page spread with a minimum spread of 0.4. Repeated template-level failures are capped by template treatment so one shared defect does not explode the aggregate penalty.

## Confidence

Confidence is based on crawl coverage and selected/discovered evidence volume. Failed pages lower coverage and confidence, not the audited-page average.

## Caps

`SITE-COVERAGE-LOW` is applied when fewer than half of selected pages complete. The cap explains reduced confidence; it does not convert failed pages to zero.
