# Decision Log

## D-001: Upstream Adoption Mode

- **Date**: 2026-07-23
- **Decision**: SELECTIVE_RULE_PORTING
- **Context**: The upstream repository (seo-skills/seo-audit-skill) is a mature CLI/Electron tool with 251 rules. Direct installation would import SSRF vulnerabilities, native addon dependencies, CLI/desktop code irrelevant to web SaaS, and a scoring model lacking critical caps.
- **Alternatives considered**:
  - DIRECT_PACKAGE: Rejected — imports SSRF vulnerabilities and native addons
  - FORK_AND_ADAPT: Rejected — inherits CLI/desktop architecture debt
- **Rationale**: The Cheerio-based extraction logic and individual rule implementations are well-structured and worth porting. The network layer, storage, scoring, and UI must be custom-built for the cloud platform.
- **Consequences**: Each ported rule requires a 12-gate verification process. No rule may be enabled merely because it exists upstream.

## D-002: Frontend Architecture

- **Date**: 2026-07-23
- **Decision**: Next.js (App Router) for frontend only, not full-stack
- **Context**: Heavy audit work (SSRF-hardened fetching, Cheerio parsing, Playwright rendering) is incompatible with Vercel serverless function limitations (timeout, memory, native addons, Playwright binaries).
- **Alternatives considered**:
  - Next.js full-stack with serverless functions: Rejected — timeout/memory limits
  - Separate frontend (React/Vite) + backend API: Rejected — more infrastructure overhead
- **Rationale**: Next.js provides excellent frontend DX, SEO capabilities, and simple API routes for lightweight gateway tasks (validation, job dispatch, result retrieval). Heavy processing happens in dedicated worker containers.
- **Consequences**: Two deployment targets: Vercel (frontend + API gateway) and container platform (workers).

## D-003: Database Choice

- **Date**: 2026-07-23
- **Decision**: PostgreSQL over SQLite/better-sqlite3
- **Context**: Upstream uses better-sqlite3 (native C++ addon with Node.js ABI compilation issues). Serverless and container deployments need a pure-JS database driver that supports concurrent access.
- **Alternatives considered**:
  - Upstream better-sqlite3: Rejected — native addon, no concurrent access
  - SQLite via better-sqlite3 in container: Rejected — still has compilation issues
  - MySQL: Viable but PostgreSQL chosen for JSON support and ecosystem
- **Rationale**: PostgreSQL supports JSON columns for flexible audit result storage, concurrent connections from multiple workers, and has mature pure-JS drivers (no native addon compilation).
- **Consequences**: Audit result schema designed around PostgreSQL JSON capabilities. ORM selection deferred to Phase 1.

## D-004: Scoring Model — Not Reused From Upstream

- **Date**: 2026-07-23
- **Decision**: Custom scoring model with severity weighting, critical caps, and not-applicable handling
- **Context**: Upstream scoring is a flat weighted average with no severity distinction, no critical caps, and no not-applicable handling. A page with `noindex` can score 90%+.
- **Alternatives considered**:
  - Adopt upstream scoring as-is: Rejected — no critical caps, no N/A handling
  - Fork and modify upstream scoring: Rejected — would need to maintain fork
- **Rationale**: The upstream scoring is insufficient for a premium product that must accurately communicate severity. Custom scoring enables transparent, explainable scores.
- **Consequences**: Scoring engine must be built from scratch in Phase 5. Provenance documented as REWRITE.

## D-005: AI Integration — Optional and Verifiable

- **Date**: 2026-07-23
- **Decision**: AI (Gemini/Groq) may only summarise verified findings. Never invent findings or modify scores.
- **Context**: Many SEO tools use AI to generate findings, which can lead to hallucinated issues and incorrect scores.
- **Alternatives considered**:
  - AI generates findings from scratch: Rejected — hallucination risk
  - AI modifies scores based on content analysis: Rejected — opacity, accountability
- **Rationale**: The deterministic engine must be the single source of truth for findings and scores. AI is an optional enhancement for summarisation only.
- **Consequences**: AI integration deferred to Phase 13 (post-launch). No AI dependency for core functionality.

## D-006: Security-First Development Order

- **Date**: 2026-07-23
- **Decision**: SSRF-hardened network gateway (Phase 2) must be completed before any rule engine work (Phase 4+)
- **Context**: The upstream public fetcher has no SSRF protections. Building the audit engine on an unsafe network layer would be architecturally unsound.
- **Alternatives considered**:
  - Build rule engine first, add security layer later: Rejected — security cannot be retrofitted safely
  - Use upstream fetcher temporarily: Rejected — production users would be at risk
- **Rationale**: Security is a non-negotiable foundation. All network access must go through the hardened client.
- **Consequences**: Phase 2 (security gateway) gates all subsequent phases. No audit engine test against real URLs before Phase 2 completes.

## D-007: Maximum Crawl Pages — 25

- **Date**: 2026-07-23
- **Decision**: Initial site audit limit is 25 pages
- **Context**: Unlimited crawling would overwhelm worker resources and create a DoS vector. A conservative limit allows controlled resource allocation while still providing meaningful site-level analysis.
- **Alternatives considered**:
  - 10 pages: Too few for meaningful cross-page analysis
  - 50 pages: Too many for initial resource planning
  - 100 pages: Requires significantly more worker resources
- **Rationale**: 25 pages provides enough data for duplicate detection, orphan signals, and template analysis while being manageable within container resource limits.
- **Consequences**: Limit is configurable. Future phases may increase with appropriate resource scaling.

## D-008: Result Storage — PostgreSQL + Object Storage

- **Date**: 2026-07-23
- **Decision**: Audit results stored in PostgreSQL; raw HTML snapshots in S3/R2
- **Context**: Audit results are structured JSON with nested findings. Raw HTML snapshots enable evidence replay and debugging without re-fetching.
- **Alternatives considered**:
  - Store everything in PostgreSQL: Raw HTML blobs increase database size significantly
  - Store everything in S3: Querying structured results requires additional indexing
- **Rationale**: Hybrid approach combines queryability of PostgreSQL with cost-effective blob storage of S3/R2.
- **Consequences**: Two storage systems to maintain. S3/R2 may be deferred to later phase if storage footprint is manageable.

## D-009: No Mandatory Signup

- **Date**: 2026-07-23
- **Decision**: Quick page audit must be available without any form of mandatory signup
- **Context**: The product goal is to be more useful than common free SEO checkers. Mandatory signup is a common friction point that reduces tool utility.
- **Alternatives considered**:
  - Signup for all audits: Reduces tool utility and shareability
  - Signup for site audits only: Acceptable compromise
- **Rationale**: Quick page audit is the primary entry point. Requiring signup before showing results contradicts the goal of being genuinely useful.
- **Consequences**: Rate limiting is the primary abuse-prevention mechanism. Site audit may require optional signup in future phases.

## D-013: Definition of Done — Phase 10 Verification Completes First Release

- **Date**: 2026-07-23
- **Decision**: Phase 10 (Production Verification) is the final gate for the first release. After Phase 10 is marked COMPLETE, the first release (Phases 1-10) is considered ready for public launch.
- **Context**: The phase roadmap defines Phases 1-10 as the first release scope. Phases 11-15 are post-launch features. Phase 10 is explicitly "Production Verification — verify the entire system is production-ready before public launch."
- **Alternatives considered**:
  - Continue through Phases 11-15 before launch: Rejected — would delay first release for non-essential features
  - Treat Phase 10 as optional: Rejected — production verification is critical for quality
- **Rationale**: The roadmap already defines Phase 10 as the final pre-launch gate. The first release is Phases 1-10 complete. Post-launch phases (11-15) are enhancements.
- **Consequences**: Phase 10 completion triggers release process. Post-launch phases will be planned separately.

## D-014: Public Response Bounds — Implicit Caps with Truncation Flag

- **Date**: 2026-07-23
- **Decision**: Public API responses cap `findings` at 200 items and `extractionWarnings` at 20 items using `.slice()`, with a `findingsTruncated` boolean flag to indicate truncation.
- **Context**: Large audit results with hundreds of findings could produce oversized API responses, impacting bandwidth, parsing time, and user experience.
- **Alternatives considered**:
  - Pagination: Adds complexity to API and UI for first release
  - Removal of cap: Oversized responses impact performance
  - Hard rejection: Returning an error for large results is user-hostile
- **Rationale**: Slice-based truncation is simple, predictable, and backwards-compatible. The `findingsTruncated` flag gives consumers explicit awareness of truncation. The cap of 200 (with 85 rules registered) provides headroom for future rule additions.
- **Consequences**: Findings beyond 200 are silently dropped. Pagination may be added in a future phase if needed.

## D-008: Cheerio Static Mode for Phase 3 Extraction

- **Date**: 2026-07-23
- **Decision**: Use Cheerio 1.2.0 in deterministic static mode (no JSDOM, no browser automation) for Phase 3 HTML extraction
- **Context**: Phase 3 requires a deterministic, SSRF-safe HTML extraction layer. The extraction engine must convert raw HTML from Phase 2's FetchResult into a typed PageSnapshot without executing JavaScript or making network requests.
- **Alternatives considered**:
  - JSDOM with browser automation: Rejected — adds SSRF surface, slower, unnecessary for static extraction
  - Playwright headless: Rejected — Phase 12 will handle dynamic content separately
  - Custom SAX parser: Rejected — Cheerio provides battle-tested CSS selector API
- **Rationale**: Cheerio 1.2.0 is a pure-JSON parser with no native dependencies, no JS execution, no network access. It is the safest and most appropriate tool for deterministic static HTML extraction. CSS selector API enables clean, declarative extractors.
- **Consequences**: Dynamic content (client-rendered SPAs, lazy-loaded content) will not be extracted until Phase 12. All extraction is deterministic and repeatable.

## D-009: Extraction Warning Typed Enum

- **Date**: 2026-07-23
- **Decision**: All extraction warnings use a Zod-enforced string enum, with a corresponding TypeScript union type kept in sync manually
- **Context**: Extraction warnings must be machine-readable and type-safe. Both Zod schema and TypeScript types need to match.
- **Alternatives considered**:
  - z.infer for generated union type: Rejected — Zod v4 z.enum produces readonly tuples; manual union type is simpler and avoids import cycle
  - Numeric error codes: Rejected — string codes are self-documenting
- **Rationale**: Duplicating the enum in a TypeScript union type is a small maintenance cost that avoids circular imports and keeps the types portable.
- **Consequences**: Adding a new warning code requires updates in both `types.ts` and `schemas.ts`. Both files note this requirement.

## D-015: Phase 11 Site Audit Remains In-Process and Bounded

- **Date**: 2026-07-25
- **Decision**: Implement limited full-site audit synchronously inside the existing Next.js application with strict caps.
- **Context**: Phase 11 needs useful cross-page analysis without introducing Phase 15 infrastructure.
- **Alternatives considered**:
  - Redis/BullMQ job queue: Rejected for Phase 11 because it belongs to Phase 15.
  - Unlimited crawler: Rejected because it violates the public safety contract.
- **Rationale**: A 25-page, same-origin, deadline-bound coordinator provides meaningful site-level evidence while preserving first-release simplicity.
- **Consequences**: Large websites receive partial, coverage-labeled reports rather than exhaustive crawls.

## D-016: Site Score Separates Page Quality, Cross-Page Health, and Coverage

- **Date**: 2026-07-25
- **Decision**: Site health uses 65% audited-page SEO average, 25% cross-page health, and 10% crawl coverage.
- **Context**: A naive average of every selected page would hide site architecture defects and unfairly treat failed pages as zero.
- **Alternatives considered**:
  - Flat average of all page scores: Rejected because unavailable pages must not auto-fail.
  - Cross-page findings only: Rejected because page-level SEO quality remains important.
- **Rationale**: The formula is deterministic, transparent, and preserves per-page scores while separately reporting coverage and confidence.
- **Consequences**: Site audit scores are not directly comparable to quick page audit scores.
