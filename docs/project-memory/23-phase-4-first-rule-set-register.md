# Phase 4: First Rule Set Register

This register catalogs all 85 static SEO rules implemented in Phase 4, their provenance, and compliance status.

## Register

| Check ID    | Name                     | Category        | Severity      | Scored | Provenance       | Upstream Rule            | Tests |
| ----------- | ------------------------ | --------------- | ------------- | ------ | ---------------- | ------------------------ | ----- |
| META-001    | Title Present            | metadata        | critical      | true   | USE_AS_REFERENCE | title-present            | ✓     |
| META-002    | Title Length             | metadata        | low           | true   | USE_AS_REFERENCE | title-length             | ✓     |
| META-003    | Description Present      | metadata        | high          | true   | USE_AS_REFERENCE | description-present      | ✓     |
| META-004    | Description Length       | metadata        | low           | true   | USE_AS_REFERENCE | description-length       | ✓     |
| META-005    | Canonical Present        | metadata        | high          | true   | USE_AS_REFERENCE | canonical-present        | ✓     |
| META-006    | Canonical Valid          | metadata        | high          | true   | USE_AS_REFERENCE | canonical-valid          | ✓     |
| META-007    | Robots Meta              | metadata        | informational | true   | USE_AS_REFERENCE | robots-meta              | ✓     |
| META-008    | Favicon Present          | metadata        | informational | true   | USE_AS_REFERENCE | favicon-present          | ✓     |
| META-009    | Viewport + Charset       | metadata        | low           | true   | USE_AS_REFERENCE | viewport-charset         | ✓     |
| META-010    | Canonical Fragment       | metadata        | low           | false  | REWRITE          | n/a                      | ✓     |
| META-011    | Canonical Multiple       | metadata        | high          | false  | REWRITE          | n/a                      | ✓     |
| META-012    | Description Duplicate    | metadata        | low           | false  | REWRITE          | n/a                      | ✓     |
| META-013    | Title Duplicate          | metadata        | low           | false  | REWRITE          | n/a                      | ✓     |
| META-014    | Lang Attribute           | metadata        | low           | true   | REWRITE          | n/a                      | ✓     |
| HEAD-001    | H1 Present               | headings        | high          | true   | USE_AS_REFERENCE | h1-present               | ✓     |
| HEAD-002    | H1 Empty                 | headings        | medium        | false  | REWRITE          | n/a                      | ✓     |
| HEAD-003    | H1 Multiple              | headings        | low           | false  | REWRITE          | n/a                      | ✓     |
| HEAD-004    | Heading Hierarchy        | headings        | low           | false  | REWRITE          | n/a                      | ✓     |
| HEAD-005    | Heading Long             | headings        | informational | false  | REWRITE          | n/a                      | ✓     |
| HEAD-006    | Heading Meaningful       | headings        | informational | false  | REWRITE          | n/a                      | ✓     |
| HEAD-007    | Heading Repeated         | headings        | informational | false  | REWRITE          | n/a                      | ✓     |
| HEAD-008    | Heading Summary          | headings        | informational | false  | REWRITE          | n/a                      | ✓     |
| URL-001     | HTTPS Check              | url             | high          | true   | REWRITE          | n/a                      | ✓     |
| URL-002     | Uppercase Path           | url             | low           | true   | REWRITE          | n/a                      | ✓     |
| URL-003     | Underscore Path          | url             | low           | true   | REWRITE          | n/a                      | ✓     |
| URL-004     | Repeated Separators      | url             | low           | true   | REWRITE          | n/a                      | ✓     |
| URL-005     | URL Length               | url             | informational | true   | REWRITE          | n/a                      | ✓     |
| URL-006     | Tracking Parameters      | url             | informational | false  | REWRITE          | n/a                      | ✓     |
| URL-007     | Session Parameters       | url             | informational | false  | REWRITE          | n/a                      | ✓     |
| URL-008     | Fragment Canonical       | url             | low           | true   | REWRITE          | n/a                      | ✓     |
| URL-009     | Non-HTTP Canonical       | url             | high          | true   | REWRITE          | n/a                      | ✓     |
| URL-010     | Default Port             | url             | informational | false  | REWRITE          | n/a                      | ✓     |
| LINK-001    | Malformed Href           | links           | high          | true   | REWRITE          | n/a                      | ✓     |
| LINK-002    | Empty Href               | links           | low           | true   | REWRITE          | n/a                      | ✓     |
| LINK-003    | JavaScript URL           | links           | low           | true   | REWRITE          | n/a                      | ✓     |
| LINK-004    | Noopener Missing         | links           | low           | true   | REWRITE          | n/a                      | ✓     |
| LINK-005    | Generic Anchor Text      | links           | low           | true   | REWRITE          | n/a                      | ✓     |
| LINK-006    | Internal HTTP Links      | links           | low           | true   | REWRITE          | n/a                      | ✓     |
| LINK-007    | Excessive Links          | links           | informational | true   | REWRITE          | n/a                      | ✓     |
| LINK-008    | Link Accessible          | links           | low           | true   | REWRITE          | n/a                      | ✓     |
| IMAGE-001   | Image Dimensions         | images          | informational | false  | REWRITE          | n/a                      | ✓     |
| IMAGE-002   | Malformed URL            | images          | low           | false  | REWRITE          | n/a                      | ✓     |
| IMAGE-003   | Alt Missing              | images          | high          | true   | REWRITE          | n/a                      | ✓     |
| IMAGE-004   | Alt Empty                | images          | medium        | true   | REWRITE          | n/a                      | ✓     |
| IMAGE-005   | Alt Length               | images          | low           | true   | REWRITE          | n/a                      | ✓     |
| IMAGE-006   | Image No Src             | images          | medium        | false  | REWRITE          | n/a                      | ✓     |
| IMAGE-007   | Modern Format            | images          | informational | true   | REWRITE          | n/a                      | ✓     |
| IMAGE-008   | Lazy Loading             | images          | informational | true   | REWRITE          | n/a                      | ✓     |
| SCHEMA-001  | JSON-LD Present          | structured-data | high          | true   | USE_AS_REFERENCE | jsonld-present           | ✓     |
| SCHEMA-002  | JSON-LD Parse Success    | structured-data | high          | true   | USE_AS_REFERENCE | jsonld-parse-success     | ✓     |
| SCHEMA-003  | JSON-LD Context          | structured-data | medium        | true   | USE_AS_REFERENCE | jsonld-context           | ✓     |
| SCHEMA-004  | JSON-LD Type             | structured-data | medium        | true   | USE_AS_REFERENCE | jsonld-type              | ✓     |
| SCHEMA-005  | JSON-LD Types Discovered | structured-data | informational | false  | USE_AS_REFERENCE | jsonld-types-discovered  | ✓     |
| SCHEMA-006  | Microdata/RDFa Signal    | structured-data | informational | false  | USE_AS_REFERENCE | microdata-rdfa-signal    | ✓     |
| SOCIAL-001  | OG Title                 | social          | high          | true   | USE_AS_REFERENCE | og-title                 | ✓     |
| SOCIAL-002  | OG Description           | social          | medium        | true   | USE_AS_REFERENCE | og-description           | ✓     |
| SOCIAL-003  | OG Image                 | social          | high          | true   | USE_AS_REFERENCE | og-image                 | ✓     |
| SOCIAL-004  | OG URL                   | social          | informational | false  | USE_AS_REFERENCE | og-url                   | ✓     |
| SOCIAL-005  | Twitter Card             | social          | medium        | true   | USE_AS_REFERENCE | twitter-card             | ✓     |
| SOCIAL-006  | Social Title Consistency | social          | informational | false  | USE_AS_REFERENCE | social-title-consistency | ✓     |
| CONTENT-001 | Text Present             | content         | high          | true   | USE_AS_REFERENCE | text-present             | ✓     |
| CONTENT-002 | Text Amount              | content         | low           | true   | USE_AS_REFERENCE | text-amount              | ✓     |
| CONTENT-003 | Main Element             | content         | low           | true   | USE_AS_REFERENCE | main-element             | ✓     |
| CONTENT-004 | Semantic Landmarks       | content         | medium        | false  | USE_AS_REFERENCE | semantic-landmarks       | ✓     |
| CONTENT-005 | Paragraphs               | content         | informational | false  | USE_AS_REFERENCE | paragraphs               | ✓     |
| CONTENT-006 | Lists                    | content         | informational | false  | USE_AS_REFERENCE | lists                    | ✓     |
| CONTENT-007 | Question Headings        | content         | informational | false  | USE_AS_REFERENCE | question-headings        | ✓     |
| A11Y-001    | Document Language        | accessibility   | high          | true   | USE_AS_REFERENCE | document-language        | ✓     |
| A11Y-002    | Image Alt Present        | accessibility   | high          | true   | USE_AS_REFERENCE | image-alt-present        | ✓     |
| A11Y-003    | Form Labels              | accessibility   | high          | true   | USE_AS_REFERENCE | form-labels              | ✓     |
| A11Y-004    | Button Names             | accessibility   | medium        | true   | USE_AS_REFERENCE | button-names             | ✓     |
| A11Y-005    | Link Names               | accessibility   | medium        | true   | USE_AS_REFERENCE | link-names               | ✓     |
| A11Y-006    | Duplicate IDs            | accessibility   | medium        | true   | USE_AS_REFERENCE | duplicate-ids            | ✓     |
| A11Y-007    | Iframe Titles            | accessibility   | medium        | true   | USE_AS_REFERENCE | iframe-titles            | ✓     |
| A11Y-008    | Table Headers            | accessibility   | medium        | true   | USE_AS_REFERENCE | table-headers            | ✓     |
| A11Y-009    | Tabindex Values          | accessibility   | low           | true   | USE_AS_REFERENCE | tabindex-values          | ✓     |
| A11Y-010    | Zoom Restriction         | accessibility   | high          | true   | USE_AS_REFERENCE | zoom-restriction         | ✓     |
| A11Y-011    | Media Captions           | accessibility   | medium        | true   | USE_AS_REFERENCE | media-captions           | ✓     |
| A11Y-012    | Skip Links               | accessibility   | medium        | false  | USE_AS_REFERENCE | skip-links               | ✓     |
| A11Y-013    | Landmark Elements        | accessibility   | low           | false  | USE_AS_REFERENCE | landmark-elements        | ✓     |
| FORM-001    | Input Accessible Names   | forms           | high          | true   | USE_AS_REFERENCE | form-labels              | ✓     |
| FORM-002    | Duplicate Form IDs       | forms           | low           | false  | USE_AS_REFERENCE | duplicate-form-ids       | ✓     |
| FORM-003    | Autocomplete Off         | forms           | informational | false  | USE_AS_REFERENCE | autocomplete-off         | ✓     |
| FORM-004    | Insecure Form Action     | forms           | high          | false  | USE_AS_REFERENCE | insecure-form-action     | ✓     |
| FORM-005    | Password GET Method      | forms           | high          | false  | USE_AS_REFERENCE | password-get             | ✓     |
| FORM-006    | Explicit Form Labels     | forms           | medium        | false  | USE_AS_REFERENCE | form-labels-explicit     | ✓     |

## Provenance Summary

| Category        | Total  | REWRITE | USE_AS_REFERENCE |
| --------------- | ------ | ------- | ---------------- |
| metadata        | 14     | 5       | 9                |
| headings        | 8      | 7       | 1                |
| url             | 10     | 10      | 0                |
| links           | 8      | 8       | 0                |
| images          | 8      | 8       | 0                |
| structured-data | 6      | 1       | 5                |
| social          | 6      | 1       | 5                |
| content         | 7      | 1       | 6                |
| accessibility   | 13     | 2       | 11               |
| forms           | 5      | 1       | 5                |
| **Total**       | **85** | **44**  | **41**           |

## Verification

All 85 rules pass:

- TypeScript compilation: zero errors
- ESLint: zero errors, zero warnings
- Vitest: 781+ tests passing
- All rules have provenance records
- No duplicate rule IDs
- No fake upstream paths
- All dispositions are valid
