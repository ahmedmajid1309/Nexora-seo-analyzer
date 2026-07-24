# Scoring and Confidence Model

## Design Principles

1. **Transparency**: Every score must be explainable. The user must see exactly which checks contributed and by how much.

2. **No critical cap bypass**: Critical failures (e.g., noindex prevents indexing) must cap the relevant score appropriately.

3. **Not-applicable neutrality**: N/A checks must not punish irrelevant pages.

4. **Unavailable transparency**: Unavailable checks reduce confidence but not the reported score.

5. **Weighted, not flat**: Categories and individual checks have weights reflecting their relative importance.

## Score Levels

### SEO Health Score (0-100)

The primary score visible to users. Represents overall SEO health based on verified findings.

#### Category Weights

| Category                    | Weight | Rationale                                                         |
| --------------------------- | ------ | ----------------------------------------------------------------- |
| Technical SEO               | 10%    | Foundational — if the site can't be crawled, nothing else matters |
| Crawlability & Indexability | 8%     | Critical for search discovery                                     |
| Metadata                    | 8%     | Direct SERP impact                                                |
| On-Page SEO                 | 6%     | Heading and content structure                                     |
| Security Headers            | 6%     | User trust and HTTPS requirements                                 |
| Performance                 | 7%     | User experience and ranking factor                                |
| Content Structure           | 5%     | Content quality assessment                                        |
| Internal Links              | 5%     | Site architecture                                                 |
| External Links              | 3%     | Less impact than internal links                                   |
| Images                      | 4%     | Accessibility and performance                                     |
| Structured Data             | 5%     | Rich result eligibility                                           |
| URLs                        | 3%     | URL hygiene                                                       |
| Accessibility               | 4%     | Inclusivity and legal compliance                                  |
| Mobile                      | 3%     | Mobile-first indexing                                             |
| Trust & Legal               | 3%     | User trust signals                                                |
| E-E-A-T                     | 3%     | Quality signals                                                   |
| Social Metadata             | 3%     | Social sharing appearance                                         |
| International SEO           | 2%     | Relevant only for multilingual sites                              |
| JavaScript SEO              | 3%     | JS rendering quality                                              |
| AEO Readiness               | 2%     | Emerging field — informational                                    |
| GEO Readiness               | 2%     | Emerging field — informational                                    |
| AI Crawler & llms.txt       | 1%     | Emerging standard — informational                                 |
| Cross-Page & Site Arch      | 4%     | Only in site audit mode                                           |

Category weights sum to 100% in each audit mode (10+8+8+6+6+7+5+5+3+4+5+3+4+3+3+3+3+2+3+2+2+1+4 = 100).

### AEO Readiness Score (0-100)

Separate score assessing how well the page is structured for answer engine consumption. Informational — not a ranking predictor.

### GEO Readiness Score (0-100)

Separate score assessing how well the page is structured for generative AI consumption. Informational — not a ranking predictor.

## Scoring Formula

### Per-Check Score

```
checkScore = weight * statusMultiplier
```

Where:

- `statusMultiplier` = 1.0 for passed, 0.5 for warning, 0.0 for failed
- `weight` = the check's weight within its category (0-100)

### Category Score

```
categoryScore = sum(checkScores) / sum(applicableWeights) * 100
```

- `checkScores` = weighted scores for all applicable checks
- `applicableWeights` = weights of checks that returned passed, warning, or failed
- Checks that returned not-applicable or unavailable are excluded from both numerator and denominator

### Overall Score

```
overallScore = sum(categoryScores * categoryWeights) / 100
```

- `categoryScores` = scores from 0-100 for each active category
- `categoryWeights` = the category's weight in the current audit mode

## Critical Score Caps

Certain failures are so fundamental that they must cap the related category score regardless of other passing checks.

| Condition                      | Cap                             | Rationale                                          |
| ------------------------------ | ------------------------------- | -------------------------------------------------- |
| Page returns 4xx/5xx           | Category score capped at 0      | No page to audit                                   |
| Page has noindex + nofollow    | Crawlability score capped at 20 | Page opted out of indexing                         |
| Page has noindex               | Crawlability score capped at 40 | Page blocked from index                            |
| HTTPS not available            | Security score capped at 30     | Without HTTPS, many headers cannot be set securely |
| robots.txt blocks all crawlers | Crawlability score capped at 0  | Site cannot be crawled                             |
| Page has no title tag          | Metadata score capped at 50     | Missing critical SERP element                      |
| Page has no meta description   | Metadata score cannot exceed 80 | Missing SERP description control                   |

Capped scores apply at the category level. The overall score calculation uses the capped category score.

## Confidence Score

A separate 0-100 score representing how complete and reliable the audit result is.

### Confidence Reducers

| Condition                                                    | Reduction                                              |
| ------------------------------------------------------------ | ------------------------------------------------------ |
| Rendered DOM not captured                                    | -15 points from JavaScript SEO confidence              |
| External API unavailable (e.g., external link check timeout) | -5 points                                              |
| robots.txt not fetchable                                     | -5 points from Crawlability confidence                 |
| Sitemap not fetchable                                        | -5 points                                              |
| Page too short for content analysis                          | -5 points from Content Structure confidence            |
| Cross-page checks skipped (single page audit)                | Not applicable — confidence is separate per audit mode |

### Formula

```
confidence = 100 - sum(reductions) with minimum 0
```

Confidence is reported alongside the SEO Health Score and clearly labeled as "Audit confidence: X% — based on available data."

## Duplicate Penalty Prevention

When the same issue appears on multiple pages (e.g., all pages missing meta descriptions), each page reports the issue individually. However, the site-wide score must not be disproportionately penalised by a single template-level defect.

**Rule**: If >50% of crawled pages share the same failed check with identical evidence, the check is classed as a "template-level issue" and the per-page penalty is capped at 2× a single-page penalty in the aggregate score.

## Scored vs. Informational Checks

| Check Type     | Affects Score | Appears in Report                          |
| -------------- | ------------- | ------------------------------------------ |
| Scored         | Yes           | Yes                                        |
| Informational  | No            | Yes (clearly labeled)                      |
| Not-applicable | No            | Shown only when grouped filters are active |
| Unavailable    | No            | Yes (with confidence indicator)            |

## Score Interpretation

| Score Range | Label      | Meaning                                                          |
| ----------- | ---------- | ---------------------------------------------------------------- |
| 90-100      | Excellent  | Few to no issues detected. Minor recommendations only.           |
| 70-89       | Good       | Some issues found. Addressing warnings will improve performance. |
| 50-69       | Needs Work | Notable issues detected. Priority fixes recommended.             |
| 30-49       | Poor       | Significant issues found. Major improvements needed.             |
| 0-29        | Critical   | Fundamental issues preventing proper SEO.                        |

## What Scores Are Not

- Scores are NOT predictions of search ranking position
- Scores are NOT predictions of AI visibility
- Scores are NOT guarantees of Google treatment
- Scores are NOT comparable across different audit types (quick vs. site audit)
- A 100 score does NOT mean the page is perfect — only that no issues were detected by the available checks
