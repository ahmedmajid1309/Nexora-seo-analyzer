# Applicability Model

## Result States

Every Nexora check returns exactly one of these states:

| State              | Meaning                                                                                                                         | Score Impact                               | Confidence Impact     |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ | --------------------- |
| **passed**         | The check found no issues. The page meets the expected criteria.                                                                | Full score contribution                    | No reduction          |
| **warning**        | The check found a potential issue that does not necessarily indicate a defect. Advisory.                                        | Partial score contribution (50% of passed) | No reduction          |
| **failed**         | The check found a confirmed issue that should be addressed.                                                                     | Zero score contribution                    | No reduction          |
| **not-applicable** | The check does not apply to this page or audit type. The rule was not relevant.                                                 | Excluded from score calculation            | No reduction          |
| **unavailable**    | The check could not be completed because required data is missing (e.g., rendered DOM not requested, external API unavailable). | Excluded from score calculation            | May reduce confidence |

## Applicability Principles

1. **Not-applicable must never reduce score.** A page without FAQ content should not be penalised for missing FAQ schema. A single-language site should not be penalised for missing hreflang.

2. **Unavailable must never auto-fail.** If rendered DOM was not captured, JS rendering checks must return `unavailable` rather than `failed`. The confidence score should reflect the reduced certainty, but the SEO score should not be penalised.

3. **Applicability is determined before the check runs**, based on page type signals, audit mode, and available data sources.

4. **Scored checks contribute to the category score** based on their state and weight. Informational checks are displayed but do not affect scores.

## Applicability Rules by Scenario

### Keyword Checks

- **Applicable when**: User supplied a target keyword
- **Not applicable when**: No keyword provided
- **Example**: Keyword in title, keyword in H1, keyword in URL slug

### FAQ Schema Checks

- **Applicable when**: Page contains FAQ content (visible Q&A structure)
- **Not applicable when**: No FAQ content detected
- **Example**: FAQ schema presence, FAQ schema validity

### Article Schema Checks

- **Applicable when**: Page appears to be an article or blog post (has byline, date, long-form content)
- **Not applicable when**: Non-article pages (homepage, product page, category page)
- **Example**: Article schema required fields

### Product Schema Checks

- **Applicable when**: Page appears to be a product page (has price, add-to-cart, product images)
- **Not applicable when**: Non-product pages
- **Example**: Product schema presence, product availability

### Hreflang Checks

- **Applicable when**: Page has hreflang tags, or site uses multiple languages
- **Not applicable when**: Single-language site with no hreflang signals
- **Example**: Hreflang return links, hreflang conflicts

### Author/E-E-A-T Checks

- **Applicable when**: Page appears to be authored content (article, blog, news)
- **Not applicable when**: Homepage, product page, category page, landing page
- **Example**: Author byline presence, author expertise signals

### LocalBusiness Schema Checks

- **Applicable when**: Page represents a local business (has address, phone, NAP signals)
- **Not applicable when**: Non-business pages, digital-only businesses
- **Example**: LocalBusiness schema validation

### Full-Site Checks

- **Applicable when**: Audit mode is "limited website audit" with >= 2 pages crawled
- **Not applicable when**: Quick page audit (single page)
- **Example**: Duplicate titles, orphan pages, sitemap coverage

### Rendered DOM Checks

- **Applicable when**: Rendered DOM was captured (Playwright worker dispatched)
- **Unavailable when**: Rendered DOM was not requested or worker unavailable
- **Example**: Title mismatch (raw vs rendered), JS-rendered content analysis

### External Link Checks

- **Applicable when**: External links found on page
- **Not applicable when**: No external links on page
- **Example**: External link validity (HEAD request)

## Applicability Determination Strategy

Page type is determined by a lightweight pre-classification step that inspects available evidence:

```yaml
page_type_signals:
  is_homepage:
    - path is '/' or empty
  is_article:
    - has author byline markup
    - has publication date
    - word count > 300
    - has structured data of type Article
  is_product:
    - has structured data of type Product
    - has price markup
    - has add-to-cart button or link
  is_local_business:
    - has structured data of type LocalBusiness
    - has physical address in HTML
    - has NAP (name, address, phone) consistency signals
  is_multilingual:
    - has hreflang link tags
    - has alternate language link tags
    - html lang differs from detected content language
  has_faq:
    - visible FAQ schema
    - Q&A structure in HTML (common patterns)
```

Page type classification informs which applicability rules are active. It is heuristic and must be clearly communicated to the user as advisory.

## Category-Level Applicability

Some categories may be entirely not-applicable for certain audit modes:

| Category                       | Quick Page     | Site Audit  | Notes                                 |
| ------------------------------ | -------------- | ----------- | ------------------------------------- |
| Cross-Page & Site Architecture | NOT_APPLICABLE | ACTIVE      | Requires multiple pages               |
| JavaScript SEO (rendered)      | UNAVAILABLE    | UNAVAILABLE | Until Playwright worker enabled       |
| Internal Links (site)          | PARTIAL        | ACTIVE      | Orphan detection needs multiple pages |
