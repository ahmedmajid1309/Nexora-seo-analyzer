# Upstream Adoption Policy

## Adoption Mode: SELECTIVE_RULE_PORTING

Nexora will NOT:

- Install `@seomator/seo-audit` as a production dependency
- Fork or rebrand the upstream repository
- Copy the upstream repository in its entirety
- Inherit the upstream public fetcher
- Inherit the upstream storage architecture (better-sqlite3)
- Inherit the upstream scoring model blindly
- Inherit the upstream CLI, desktop, or report UI

Nexora WILL:

- Port individual rule implementations after verification
- Adapt Cheerio-based extraction logic
- Use upstream rule structure as reference for category organisation
- Track provenance for every ported rule
- Replace rigid thresholds with configurable, documented values
- Replace insufficient evidence output with structured findings

## Why Selective Porting

The upstream was designed as a local CLI/Electron desktop tool. Direct adoption would import:

- SSRF-vulnerable public fetcher with no IP restrictions
- Native better-sqlite3 addon incompatible with serverless/container deployment
- Desktop and CLI code irrelevant to a web SaaS product
- Scoring model with no critical caps or severity weighting
- No not-applicable state for irrelevant rules

## Porting Decision Matrix

For each upstream component, the disposition is:

| Component                                               | Disposition             | Rationale                                                    |
| ------------------------------------------------------- | ----------------------- | ------------------------------------------------------------ |
| Rule definitions (`defineRule`, `pass`, `warn`, `fail`) | USE_AS_REFERENCE        | Pattern is clean but Nexora needs different result structure |
| Rule registry (`registry.ts`)                           | USE_AS_REFERENCE        | Map-based registry is sound; adapt for Nexora check IDs      |
| Category definitions                                    | USE_AS_REFERENCE        | Structure is good; weights and descriptions will differ      |
| HTML parsing (Cheerio usage)                            | PORT_AS_IS              | Cheerio wrappers are standard and low-risk                   |
| Public HTTP fetcher                                     | REWRITE                 | SSRF protections required before any engine use              |
| Playwright fetcher                                      | PORT_WITH_MODIFICATIONS | Adapt for isolated container execution                       |
| Individual on-page rules                                | PORT_WITH_MODIFICATIONS | Port individually with improved thresholds and evidence      |
| Individual technical rules                              | PORT_WITH_MODIFICATIONS | Port individually with SSRF-safe network access              |
| Scoring engine                                          | REWRITE                 | Need critical caps, severity weighting, N/A handling         |
| Storage (better-sqlite3)                                | SKIP                    | Use PostgreSQL or equivalent cloud-native storage            |
| CLI                                                     | SKIP                    | Web-native product                                           |
| Electron app                                            | SKIP                    | Web-native product                                           |
| HTML reporter                                           | SKIP                    | Custom Nexora UI                                             |
| Console reporter                                        | SKIP                    | Not applicable to web                                        |
| LLM reporter                                            | USE_AS_REFERENCE        | XML structure useful for future AI summaries                 |
| Crawler queue                                           | USE_AS_REFERENCE        | In-memory approach insufficient for scale; use Redis-backed  |
| Category weight validation                              | PORT_AS_IS              | Sum-to-100 validation is a guard worth keeping               |
| robots.txt parsing                                      | PORT_AS_IS              | Standard approach                                            |
| Sitemap XML parsing                                     | PORT_AS_IS              | Standard approach                                            |

## Pre-Porting Verification Gate

Every upstream rule must pass these checks before entering the Nexora registry:

1. **Existence**: Confirm the rule is registered upstream and the source file exists
2. **Provenance**: Record exact upstream source path and commit hash
3. **Evidence audit**: Understand exactly what DOM elements, HTTP headers, or response properties the rule inspects
4. **Page-type mapping**: Identify which page types the rule applies to
5. **False-positive review**: Identify scenarios where the rule would produce incorrect results
6. **Applicability mapping**: Determine whether the rule passes, warns, fails, or is not applicable in various scenarios
7. **Scored determination**: Decide whether the rule contributes to scores or is informational-only
8. **Threshold review**: Replace rigid upstream thresholds with configurable or context-aware values
9. **Evidence output**: Define what evidence, observed values, and expected values the Nexora version must produce
10. **Fixture and test**: Add representative HTML fixtures and automated tests
11. **Network safety review**: Verify the ported rule performs no unsafe network access
12. **Approval**: Mark review_status as APPROVED before enabling in production

No rule may be enabled merely because it exists upstream.
