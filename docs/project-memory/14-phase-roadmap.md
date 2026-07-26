# Phase Roadmap

## Phase 0: Project Memory

**Status**: COMPLETE
**Objective**: Establish project documentation, upstream verification, and architectural blueprint.

| Entry Criteria                         | Deliverables                        | Exit Criteria                                                    |
| -------------------------------------- | ----------------------------------- | ---------------------------------------------------------------- |
| None (initial phase)                   | All project-memory files created    | All 20 files exist, validated by 19-phase-0-validation-report.md |
| Upstream verification report available | Upstream facts summary              | No disproven Gemini claims reused                                |
|                                        | Decision log, risk register created | Selective rule porting locked                                    |

**Excluded**: Application code, dependencies, Next.js setup, rule porting.

---

## Phase 1: Clean Application Foundation

**Objective**: Set up the Next.js application with proper configuration, linting, formatting, and type checking.

| Entry Criteria                 | Deliverables                         | Exit Criteria                        |
| ------------------------------ | ------------------------------------ | ------------------------------------ |
| Phase 0 complete and validated | Next.js app (TypeScript, App Router) | `npm run dev` starts without error   |
|                                | ESLint, Prettier configuration       | `npm run lint` passes                |
|                                | TypeScript strict mode               | `npm run typecheck` passes           |
|                                | Vitest configured and passing        | `npm run test` passes (trivial test) |
|                                | Initial CI configuration             | CI pipeline passes                   |
|                                | Project directory structure          | No build warnings                    |

**Excluded**: Audit engine, scoring, UI components, API routes.

---

## Phase 2: Secure Network Gateway

**Objective**: Build the SSRF-hardened HTTP client that the entire audit engine depends on.

| Entry Criteria   | Deliverables                               | Exit Criteria                                 |
| ---------------- | ------------------------------------------ | --------------------------------------------- |
| Phase 1 complete | SSRF-hardened HTTP client module           | All SSRF adversarial tests pass               |
|                  | URL validation and sanitisation            | Timeout and size limits enforced              |
|                  | DNS validation and rebinding protection    | Security contract controls verified           |
|                  | IP filtering (private, loopback, metadata) | No engine work without passing security tests |
|                  | Redirect validation                        |                                               |

**Excluded**: HTML parsing, rule execution, Playwright, distributed queues.

---

## Phase 3: Static Extraction Engine

**Objective**: Build the Cheerio-based static HTML extraction engine that provides data to rules.

| Entry Criteria   | Deliverables                                  | Exit Criteria                               |
| ---------------- | --------------------------------------------- | ------------------------------------------- |
| Phase 2 complete | Cheerio-based HTML parser                     | Extracts all expected fields from fixtures  |
|                  | HTTP response handler                         | Handles redirects, errors, timeouts         |
|                  | robots.txt fetcher and parser                 | robots.txt parsing matches known test cases |
|                  | Sitemap XML fetcher and parser                | Sitemap parsing matches known test cases    |
|                  | Link extraction (internal, external, invalid) | Extraction fixtures pass                    |
|                  | Image extraction                              |                                             |
|                  | Heading extraction                            |                                             |
|                  | Schema extraction (JSON-LD)                   |                                             |
|                  | Meta tag extraction                           |                                             |
|                  | Header extraction                             |                                             |
|                  | AuditContext builder                          |                                             |

**Excluded**: Rule execution, scoring, category classification.

---

## Phase 4: First Verified Rule Set

**Objective**: Port and verify the first batch of rules following the 12-gate process.

| Entry Criteria   | Deliverables                                                                              | Exit Criteria                                   |
| ---------------- | ----------------------------------------------------------------------------------------- | ----------------------------------------------- |
| Phase 3 complete | Rule registry implementation                                                              | All first-batch rules have passing tests        |
|                  | Check definition helpers (`passed`, `warning`, `failed`, `not-applicable`, `unavailable`) | Provenance records created for all ported rules |
|                  | Category definitions with weights                                                         | Each rule has passing/failing/N/A test fixtures |
|                  | First batch (~40 rules): Metadata, URLs, On-Page SEO, Security Headers                    |                                                 |

**Excluded**: Remaining categories, scoring engine, report UI.

---

## Phase 5: Applicability and Scoring

**Objective**: Build the applicability model and weighted scoring engine.

| Entry Criteria   | Deliverables                      | Exit Criteria                                 |
| ---------------- | --------------------------------- | --------------------------------------------- |
| Phase 4 complete | Page-type classifier              | Applicability model matches expected outcomes |
|                  | Applicability rules engine        | Critical caps work as designed                |
|                  | Scoring engine with critical caps | Template-level duplicate penalty works        |
|                  | Confidence calculator             | Scoring tests pass for all scenarios          |
|                  | Category-weighted overall score   |                                               |
|                  | AuditResult builder               |                                               |

**Excluded**: Report UI, AI features, Playwright worker.

---

## Phase 6: Quick Page Audit

**Objective**: Wire the full audit pipeline for single-page audits and expose it via the API. Results are returned directly (no external storage required).

| Entry Criteria   | Deliverables                                                   | Exit Criteria                                     |
| ---------------- | -------------------------------------------------------------- | ------------------------------------------------- |
| Phase 5 complete | API route for quick page audit                                 | `POST /api/audit/quick` returns valid AuditResult |
|                  | Direct synchronous audit execution within request timeout      | URL validation rejects invalid inputs             |
|                  | Result returned in API response (no external storage required) | End-to-end audit completes against test fixture   |
|                  | In-memory rate limiting                                        |                                                   |

**Excluded**: Site audit, premium UI, PostgreSQL, job queues, Playwright.

---

## Phase 7: PageSpeed Integration

**Objective**: Integrate PageSpeed Insights API for real-world CWV data with graceful fallback when unavailable.

| Entry Criteria   | Deliverables                                       | Exit Criteria                                  |
| ---------------- | -------------------------------------------------- | ---------------------------------------------- |
| Phase 6 complete | PSI API client with key management                 | PSI data integrated into audit result          |
|                  | Lab vs field data labeling                         | Fallback to no-CWV result when PSI unavailable |
|                  | Graceful fallback (no CWV data if API unavailable) | Product fully functional without PSI           |
|                  | Transparent evidence output                        |                                                |

**Excluded**: Report UI, AI features.

---

## Phase 8: Premium Report UI

**Objective**: Build the premium, accessible, responsive report viewer.

| Entry Criteria                      | Deliverables                                          | Exit Criteria                                       |
| ----------------------------------- | ----------------------------------------------------- | --------------------------------------------------- |
| Phase 6 complete (Phase 7 optional) | Report page with score section                        | Report renders correctly on desktop, tablet, mobile |
|                                     | Executive summary                                     | Keyboard navigation works throughout                |
|                                     | Category accordion with filters                       | Screen reader testing passes                        |
|                                     | Critical issues and quick wins sections               | Print-friendly report layout                        |
|                                     | SERP preview                                          | Micro-interactions feel polished                    |
|                                     | Social preview                                        |                                                     |
|                                     | Action plan                                           |                                                     |
|                                     | Share and print functionality                         |                                                     |
|                                     | Landing page                                          |                                                     |
|                                     | Progress/loading experience                           |                                                     |
|                                     | Report privacy: user reports are `noindex` by default |                                                     |

**Excluded**: Site audit UI, AI features, user accounts.

---

## Phase 9: Rate Limiting and Deployment Hardening

**Objective**: Production-harden the application with basic rate limiting and deployment configuration.

| Entry Criteria                                           | Deliverables                                                | Exit Criteria                    |
| -------------------------------------------------------- | ----------------------------------------------------------- | -------------------------------- |
| Phase 6 complete (Phase 8 optional for internal testing) | In-memory per-IP rate limiting (10 req/min unauthenticated) | Rate limits enforced correctly   |
|                                                          | Deployment configuration for container/Vercel               | Application deploys successfully |
|                                                          | Basic monitoring and error tracking                         | Health endpoint responds         |
|                                                          | Privacy-safe logging                                        |                                  |

**Excluded**: Redis-based rate limiting, distributed caching, user accounts.

---

## Phase 10: Production Verification

**Objective**: Verify the entire system is production-ready before public launch.

| Entry Criteria      | Deliverables                       | Exit Criteria                           |
| ------------------- | ---------------------------------- | --------------------------------------- |
| Phases 1-9 complete | Penetration testing report         | All security tests pass                 |
|                     | Load testing results               | Rate limiting works under load          |
|                     | Accessibility audit                | WCAG AA compliance verified             |
|                     | Cross-browser testing report       | All supported browsers render correctly |
|                     | Performance budget verification    | Page load <2s on 3G                     |
|                     | Legal review of license register   | License register complete               |
|                     | Monitoring and alerting configured |                                         |

**Excluded**: Post-launch features.

---

## Phase 11: Limited Full-Site Audit (Post-Launch)

**Objective**: Implement controlled multi-page crawling and cross-page analysis. Not required for first release.
**Status**: COMPLETE

| Entry Criteria    | Deliverables                                            | Exit Criteria                                      |
| ----------------- | ------------------------------------------------------- | -------------------------------------------------- |
| Phase 10 complete | Site audit API route                                    | Crawl respects 25-page max                         |
|                   | Crawl queue with concurrency limits                     | Cross-page rules produce correct aggregate results |
|                   | Cross-page rule engine (duplicates, orphans, redirects) | Site audit report UI renders correctly             |
|                   | Template-level issue detection                          |                                                    |
|                   | Aggregate scoring                                       |                                                    |

**Excluded**: Unlimited crawling, Playwright.

**Completion artifacts**: See `45-phase-11-precheck.md`, `46-phase-11-crawl-architecture-spec.md`, `47-phase-11-cross-page-rule-register.md`, `48-phase-11-aggregate-scoring-spec.md`, `49-phase-11-security-verification-matrix.md`, and `50-phase-11-implementation-report.md`.

---

## Phase 12: Rendered DOM Worker (Post-Launch)

**Objective**: Build the isolated Playwright worker for CWV measurement and JS rendering analysis. Not required for first release.
**Status**: COMPLETE

| Entry Criteria    | Deliverables                          | Exit Criteria                                         |
| ----------------- | ------------------------------------- | ----------------------------------------------------- |
| Phase 11 complete | Isolated Playwright container/service | Rendered-browser lab observations are source-labeled  |
|                   | PerformanceObserver lab observations  | JS rendering checks detect raw-vs-rendered mismatches |
|                   | Rendered DOM capture                  | Worker timeout and error handling works               |
|                   | JS rendering rule category            |                                                       |
|                   | Integration with audit pipeline       |                                                       |

**Excluded**: AI features, real-user CWV (handled by Phase 7 PSI).

**Completion artifacts**: See `51-phase-12-precheck.md` through `57-phase-12-implementation-report.md`.

---

## Phase 13: Optional Gemini/Groq Summaries (Post-Launch)

**Objective**: Integrate optional AI-powered executive summaries. Not required for first release.
**Status**: COMPLETE

| Entry Criteria   | Deliverables                      | Exit Criteria                                |
| ---------------- | --------------------------------- | -------------------------------------------- |
| Phase 8 complete | Gemini client with key management | AI summary only references verified findings |
|                  | Groq fallback client              | Scores unchanged by AI processing            |
|                  | Summary generation prompt         | Summary includes AI-generated disclaimer     |
|                  | Evidence-traceable output         | Product fully functional without AI          |
|                  | Fallback to deterministic summary |                                              |

**Excluded**: AI-generated findings, AI score modification.

**Completion artifacts**: See `58-phase-13-precheck.md` through `65-phase-13-implementation-report.md`.

---

## Phase 14: Report History and User Accounts (Post-Launch)

**Objective**: Add persistent report storage, history, and optional user accounts. Not required for first release.
**Status**: COMPLETE

| Entry Criteria    | Deliverables                                               | Exit Criteria                       |
| ----------------- | ---------------------------------------------------------- | ----------------------------------- |
| Phase 10 complete | Persistent audit result storage (PostgreSQL or equivalent) | Report history accessible by URL    |
|                   | Optional user accounts (no mandatory signup)               | Users can view past reports         |
|                   | Shareable report URLs with unguessable identifiers         | Reports remain `noindex` by default |
|                   | Long-term report retention with expiry                     |                                     |

**Excluded**: Billing, subscriptions, advanced analytics.

**Completion artifacts**: See `66-phase-14-precheck.md` through `73-phase-14-implementation-report.md`.

---

## Phase 15: Advanced Infrastructure (Post-Launch)

**Objective**: Add distributed job queues, Redis caching, S3/R2 storage, and multi-worker scaling. Not required for first release.
**Status**: COMPLETE

| Entry Criteria    | Deliverables                                     | Exit Criteria                    |
| ----------------- | ------------------------------------------------ | -------------------------------- |
| Phase 10 complete | Redis-backed job queue (BullMQ or equivalent)    | Queue processes audits reliably  |
|                   | S3/R2 raw HTML snapshot storage                  | Snapshots stored and retrievable |
|                   | PostgreSQL for concurrent multi-worker access    | Workers scale horizontally       |
|                   | Cache-aside pattern with Redis for frequent URLs | Cache hits return in <50ms       |

**Excluded**: Features from earlier post-launch phases.

**Completion artifacts**: See `74-phase-15-precheck.md`, `75-phase-15-infrastructure-architecture.md`, `76-phase-15-operations-contract.md`, and `77-phase-15-implementation-report.md`.
