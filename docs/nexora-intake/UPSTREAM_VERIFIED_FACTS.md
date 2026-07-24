# Upstream Verified Facts

**Source:** Local OpenCode verification of `seo-skills/seo-audit-skill`
**Commit:** `bbca017b56086a2959382d8260b97021736ca18f`
**Verification Report:** `GEMINI_AUDIT_VERIFICATION.md` (upstream repository)

---

## Verified Facts (authoritative for Phase 0)

| Fact                           | Value                                                                                                                             |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| Repository                     | https://github.com/seo-skills/seo-audit-skill                                                                                     |
| Package name                   | @seomator/seo-audit                                                                                                               |
| License                        | MIT, Copyright (c) 2024-present SEOmator                                                                                          |
| Actual registered rules        | 251 across 20 categories                                                                                                          |
| Gemini claim of 34 rules       | INCORRECT (off by 217)                                                                                                            |
| Repository type                | Single-package, not a packages-based monorepo                                                                                     |
| Source structure               | `src/` with subdirectories: `crawler/`, `storage/`, `rules/` (20 categories), `reporters/`, `categories/`, `commands/`, `config/` |
| Desktop wrapper                | Separate `electron/` directory at root                                                                                            |
| E-E-A-T rules                  | Present (14 rules in `src/rules/eeat/`)                                                                                           |
| GEO rules                      | Present (5 rules in `src/rules/geo/`)                                                                                             |
| llms.txt analysis              | Present (`src/rules/geo/llms-txt.ts`)                                                                                             |
| Build status                   | Passes                                                                                                                            |
| Test baseline                  | 389 of 393 pass (4 failures = Windows path separators)                                                                            |
| Public fetcher SSRF protection | Absent — no IP restrictions, no DNS pinning                                                                                       |
| Scoring formula                | Weighted average (pass=100, warn=50, fail=0), not simple count-based                                                              |
| No critical caps               | Confirmed — scoring has no severity caps                                                                                          |
| No not-applicable handling     | Confirmed — absent schema returns fail, not N/A                                                                                   |
| Adoption mode                  | SELECTIVE_RULE_PORTING                                                                                                            |

## Disproven Gemini Claims (do not reuse)

- Rule count of 34 (actual: 251)
- packages-based monorepo structure (actual: single-package)
- `packages/api/`, `packages/auditor/`, `packages/cli/`, `packages/electron-app/`, `packages/shared/` (all non-existent)
- `src/db/` (non-existent — actual: `src/storage/`)
- `src/fetchers/` (non-existent — actual: `src/crawler/fetcher.ts`)
- `src/parsers/` (non-existent)
- E-E-A-T claims absent (present)
- AEO/GEO claims absent (present)
- llms.txt claims absent (present)
- Scoring formula as simple `(passes + warns*0.5)/total` (actual: weighted average)
- Next.js dependency (not a dependency)
- 100KB image threshold (actual: 200KB)
- Title hardcoded at 60 chars (actual: range 30-60, plus pixel-width rule)
- H1 multiple as strict fail (actual: warning)

## Technology Stack (upstream)

- TypeScript (ES2022, ESM)
- Cheerio for HTML parsing
- Playwright for rendered DOM and CWV
- better-sqlite3 for local storage (native C++ addon)
- Commander for CLI
- tsup for building
- vitest for testing
- Electron (devDependency only)
- React (devDependency only — Electron renderer)

## Files Created During Verification

- `docs/nexora-intake/scripts/verify-rule-inventory.mjs` — programmatic rule count
- `GEMINI_AUDIT_VERIFICATION.md` — full claim-by-claim audit
