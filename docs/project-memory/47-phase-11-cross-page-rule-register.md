# Phase 11 Cross-Page Rule Register

| ID           | Check                                        | Evidence Source                         | State Policy                                                 |
| ------------ | -------------------------------------------- | --------------------------------------- | ------------------------------------------------------------ |
| `SITE-000`   | Cross-page not applicable                    | Audited page count                      | `not-applicable` when fewer than 2 pages audited             |
| `SITE-001-*` | Duplicate page titles                        | Per-page title values                   | `failed` when title text repeats                             |
| `SITE-002`   | Missing page titles across pages             | Per-page title values                   | `failed` when one or more audited pages have no title        |
| `SITE-003-*` | Duplicate meta descriptions                  | Per-page meta description values        | `warning` when description text repeats                      |
| `SITE-004`   | Missing meta descriptions                    | Per-page meta description values        | `warning` when one or more audited pages have no description |
| `SITE-005-*` | Duplicate H1 patterns                        | First H1 per audited page               | `warning` when primary H1 repeats                            |
| `SITE-006-*` | Multiple pages share one canonical target    | Canonical URL values                    | `warning` when multiple pages canonicalize to one URL        |
| `SITE-007`   | Canonical targets outside crawl set          | Canonical URL plus audited URL set      | `warning`, reduced confidence                                |
| `SITE-008`   | Redirect chains                              | `safeFetch` redirect chain              | `warning` when redirects occur                               |
| `SITE-009`   | Broken internal links with response evidence | Per-page internal link failure evidence | `failed` when crawler has response evidence                  |
| `SITE-010`   | Orphan candidates                            | Discovered URL set vs audited pages     | `warning`, labeled candidate with reduced confidence         |
| `SITE-011`   | Excessive internal-link depth                | Crawl depth                             | `warning` when depth > 3                                     |
| `SITE-012-*` | Inconsistent URL variants                    | Protocol/www/path evidence              | `warning` when variants are evidenced                        |
| `SITE-013-*` | Repeated template-level failure              | Rule failures repeated on >50% pages    | `failed`                                                     |
| `SITE-014`   | Indexability inconsistencies                 | Per-page rule results                   | `warning` when indexability differs across pages             |
| `SITE-099`   | No verified site-wide issues detected        | Absence of cross-page issues            | `passed` informational                                       |

All findings include affected URLs, evidence, impact, remediation, role, effort, confidence, and applicability. No issue is emitted without observed crawl evidence.
