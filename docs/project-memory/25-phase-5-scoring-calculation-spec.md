# Phase 5: Scoring Calculation Specification

## Version

**Calculation Version**: 1.0.0

## Score Families

| Family         | Name               | Scope                                   |
| -------------- | ------------------ | --------------------------------------- |
| seo-health     | SEO Health         | Overall SEO health assessment           |
| accessibility  | Accessibility      | WCAG/accessibility compliance           |
| security-trust | Security and Trust | HTTPS, safe forms, secure links         |
| aeo-readiness  | AEO Readiness      | Answer-engine readiness (informational) |
| geo-readiness  | GEO Readiness      | Generative AI readiness (informational) |

## Category Weights

Each score-family weight map totals exactly 100%.

### SEO Health

| Category        | Weight |
| --------------- | ------ |
| metadata        | 20     |
| headings        | 10     |
| url             | 10     |
| links           | 10     |
| images          | 8      |
| structured-data | 8      |
| social          | 8      |
| content         | 10     |
| accessibility   | 8      |
| forms           | 8      |

### Accessibility

| Category      | Weight |
| ------------- | ------ |
| accessibility | 40     |
| forms         | 20     |
| images        | 20     |
| content       | 20     |

### Security and Trust

| Category | Weight |
| -------- | ------ |
| url      | 30     |
| links    | 25     |
| forms    | 25     |
| metadata | 20     |

### AEO Readiness

| Category        | Weight |
| --------------- | ------ |
| content         | 35     |
| headings        | 25     |
| structured-data | 25     |
| social          | 15     |

### GEO Readiness

| Category        | Weight |
| --------------- | ------ |
| content         | 30     |
| social          | 25     |
| structured-data | 25     |
| metadata        | 20     |

## State Contribution

| State          | Multiplier | Score Impact        | Confidence Impact                     |
| -------------- | ---------- | ------------------- | ------------------------------------- |
| passed         | 1.0        | Full weight earned  | Included in numerator and denominator |
| warning        | 0.5        | Half weight earned  | Included in numerator and denominator |
| failed         | 0.0        | No weight earned    | Included in numerator and denominator |
| not-applicable | excluded   | Excluded entirely   | Excluded from both                    |
| unavailable    | excluded   | Excluded from score | In denominator only                   |

## Formulas

### Category Score

```
categoryRawScore = earnedWeight / maxWeight × 100
categoryCappedScore = min(categoryRawScore, maxCap)
```

Where:

- `earnedWeight` = sum of (categoryWeight × stateMultiplier) for each scored rule
- `maxWeight` = sum of categoryWeight for scored rules in category (excluding not-applicable)
- `maxCap` = minimum of all applicable critical caps for the score family

### Score Family Score

```
familyRawScore = sum(categoryEarnedWeights) / sum(categoryMaxWeights) × 100
familyCappedScore = min(familyRawScore, familyMaxCap)
```

### Overall Score

```
overallRawScore = average of all family raw scores
overallCappedScore = average of all family capped scores
```

### Confidence

```
categoryConfidence = evaluatedCount / expectedCount × 100
familyConfidence = average of active category confidences
overallConfidence = average of all family confidences
```

Where:

- `evaluatedCount` = passed + warning + failed (scored rules only)
- `expectedCount` = applicable + unavailable (scored rules only)
- not-applicable rules excluded from both numerator and denominator
- informational rules do not affect confidence

## Critical Caps

| Cap ID                | Trigger                             | Target Family  | Max Score | Rationale                        |
| --------------------- | ----------------------------------- | -------------- | --------- | -------------------------------- |
| CAP-NOINDEX           | META-007 failed + isIndexable=false | seo-health     | 40        | Page opted out of indexing       |
| CAP-NO-TITLE          | META-001 failed                     | seo-health     | 50        | Missing critical SERP element    |
| CAP-NO-DESCRIPTION    | META-003 failed                     | seo-health     | 80        | Missing SERP description control |
| CAP-NO-HTTPS          | URL-001 failed                      | security-trust | 30        | Security signal absent           |
| CAP-CANONICAL-INVALID | META-006 failed                     | seo-health     | 60        | Conflicting canonical URL        |

## Applicability Contexts

| Context                   | Detection                               | Conservative Default              |
| ------------------------- | --------------------------------------- | --------------------------------- |
| hasForms                  | formCount > 0                           | false                             |
| hasTables                 | tableCount > 0                          | false                             |
| hasIframes                | iframeTitles.total > 0                  | false                             |
| hasMedia                  | mediaCaptions.total > 0                 | false                             |
| hasJsonLd                 | structuredData.length > 0               | false                             |
| hasHreflang               | lang non-null + link hreflang present   | false                             |
| hasTargetKeyword          | user-supplied keyword                   | false (until keyword input added) |
| isIndexable               | robots meta does not contain noindex    | true                              |
| hasRelevantSocialMetadata | openGraph or twitter entries > 0        | false                             |
| hasRelevantImageElements  | images > 0 or imageAltPresent.total > 0 | false                             |

## Worked Examples

### All-passed page (85 rules, all passed)

- Each rule: earnedWeight = categoryWeight × 1.0
- maxWeight = earnedWeight for each category
- Category raw score: 100
- Family raw scores: 100
- Overall: 100
- Confidence: 100

### All-failed page (85 rules, all failed)

- Each rule: earnedWeight = categoryWeight × 0.0 = 0
- Category raw score: 0 (maxWeight > 0)
- Family raw scores: 0
- Overall: 0
- Confidence: 100

### Half-warning page

- Category (metadata, 14 rules): 7 passed + 7 warning
- earnedWeight = 7 × weight × 1.0 + 7 × weight × 0.5 = 10.5 × weight
- maxWeight = 14 × weight
- Category raw score: 75.0
- Confidence: 100

## Performance

Performance score is explicitly unavailable until Phase 7 (PageSpeed Integration).

## Implementation Files

- `src/lib/rules/scoring/types.ts` — Type definitions
- `src/lib/rules/scoring/applicability.ts` — Applicability context evaluator
- `src/lib/rules/scoring/weights.ts` — Category weight maps and score families
- `src/lib/rules/scoring/cap-registry.ts` — Critical cap definitions and evaluation
- `src/lib/rules/scoring/engine.ts` — Score calculation engine
- `src/lib/rules/scoring/index.ts` — Barrel exports
- `src/app/api/internal/score-preview/route.ts` — Score preview endpoint
