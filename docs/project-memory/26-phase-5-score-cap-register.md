# Phase 5: Score Cap Register

## Critical Caps

| Cap ID                | Triggering Rule                | Condition                                                          | Target Family  | Max Score | Applies to noindex pages | Applies to private pages |
| --------------------- | ------------------------------ | ------------------------------------------------------------------ | -------------- | --------- | ------------------------ | ------------------------ |
| CAP-NOINDEX           | META-007 (Robots Meta)         | robots meta contains noindex AND page is not intentionally private | seo-health     | 40        | Yes (unintended)         | No (deliberate)          |
| CAP-NO-TITLE          | META-001 (Title Present)       | Title tag is missing                                               | seo-health     | 50        | Yes                      | Yes                      |
| CAP-NO-DESCRIPTION    | META-003 (Description Present) | Meta description is missing                                        | seo-health     | 80        | Yes                      | Yes                      |
| CAP-NO-HTTPS          | URL-001 (HTTPS Check)          | Page is served over HTTP                                           | security-trust | 30        | Yes                      | Yes                      |
| CAP-CANONICAL-INVALID | META-006 (Canonical Valid)     | Canonical URL is invalid or conflicting                            | seo-health     | 60        | Yes                      | Yes                      |

## Cap Application Rules

1. **Multiple caps in same family**: The minimum maxScore among applied caps takes effect.
2. **Not a score floor**: Caps only reduce the maximum possible score — they never increase it.
3. **No ranking caps**: Caps target structural/indexing issues, not ranking predictions.
4. **Deliberate noindex**: Pages with an explicit noindex directive AND no other blocking issues are not penalized beyond the 40-point SEO Health cap.

## Excluded Conditions

The following are NOT critical caps in Phase 5:

- 4xx/5xx status codes (handled upstream by the fetcher)
- Page unreachable (handled upstream)
- Non-HTML response (handled upstream)
- Missing hreflang (not a blocking condition)
- Missing JSON-LD (not a blocking condition)
- Slow page speed (deferred to Phase 7)
- Mobile responsiveness (not assessed in Phase 5)
- Duplicate content (deferred to Phase 11)
