# Risk Register

## R-001: SSRF Through URL Input

- **Severity**: CRITICAL
- **Category**: Security
- **Description**: An attacker supplies a URL pointing to internal infrastructure (metadata endpoints, private services, localhost). If the fetcher does not validate the resolved IP, internal resources are exposed.
- **Likelihood**: High
- **Impact**: Critical (AWS IAM key theft, internal service enumeration)
- **Mitigation**: Phase 2 implements full SSRF protection: URL validation, IP filtering, DNS rebinding protection, pinned connections, restricted ports, metadata endpoint blocking.
- **Residual risk**: Low after Phase 2 implementation
- **Status**: **MITIGATED** — Phase 2 completed and verified in Phase 10

## R-002: DNS Rebinding Bypass

- **Severity**: CRITICAL
- **Category**: Security
- **Description**: An attacker controls a domain that initially resolves to a public IP (passes validation), then after validation resolves to a private IP. The fetcher connects to the private IP without re-validation.
- **Likelihood**: Medium
- **Impact**: Critical
- **Mitigation**: DNS re-validation on redirect. Connection pinning to resolved IP. Mixed public/private IP rejection.
- **Residual risk**: Low with proper implementation
- **Status**: **MITIGATED** — Phase 2 completed and verified in Phase 10

## R-003: Decompression Bomb / Zip Bomb

- **Severity**: HIGH
- **Category**: Security
- **Description**: A server returns a small compressed response that decompresses to gigabytes of data, causing OOM on the worker.
- **Likelihood**: Medium
- **Impact**: High (worker OOM, denial of service)
- **Mitigation**: Decompressed size limit (5MB), compression ratio limit (100:1), streaming response processing.
- **Residual risk**: Low
- **Status**: **MITIGATED** — Phase 2 completed and verified in Phase 10

## R-004: Infinite Response Stream

- **Severity**: HIGH
- **Category**: Security
- **Description**: A server returns an open HTTP response with no Content-Length that streams data indefinitely, causing OOM or timeout on the worker.
- **Likelihood**: Medium
- **Impact**: High (worker timeout, resource exhaustion)
- **Mitigation**: Response body size limit (5MB), body read timeout (10s), deadline enforcement via AbortController.
- **Residual risk**: Low
- **Status**: **MITIGATED** — Phase 2 completed and verified in Phase 10

## R-005: Port Scan via URL

- **Severity**: HIGH
- **Category**: Security
- **Description**: An attacker supplies a URL with a non-standard port (e.g., `http://example.com:22`) to probe internal network services or use the scanner as a port-scanning proxy.
- **Likelihood**: High
- **Impact**: Medium (reputation damage, abuse)
- **Mitigation**: Restricted port blocklist. Reject URLs with restricted ports.
- **Residual risk**: Low
- **Status**: **MITIGATED** — Phase 2 completed and verified in Phase 10

## R-006: Rate Limit Bypass / Abuse

- **Severity**: HIGH
- **Category**: Operations
- **Description**: An attacker uses the public scanner to perform many audits in a short period, exhausting worker resources or targeting a third-party site for DoS.
- **Likelihood**: High
- **Impact**: High (cost overruns, service degradation, third-party complaints)
- **Mitigation**: Per-IP rate limiting (10 req/min unauthenticated). Per-domain rate limiting (5 concurrent). Concurrency limits on workers. Queue-based processing.
- **Residual risk**: Medium — sophisticated attackers may rotate IPs
- **Status**: **MITIGATED** — Phase 6/9/10 completed; basic rate limiting and concurrency enforced. Distributed rate limiting deferred to later phases.

## R-007: Upstream Rule False Positives

- **Severity**: MEDIUM
- **Category**: Accuracy
- **Description**: Ported upstream rules produce incorrect warnings or failures for legitimate page structures (e.g., multiple H1s flagged as error despite HTML5 validity).
- **Likelihood**: High
- **Impact**: Medium (user trust, tool credibility)
- **Mitigation**: Each rule goes through a 12-gate verification including false-positive review. Thresholds are reviewed and adjusted. Rules may be changed from fail to warn.
- **Residual risk**: Low after gate review
- **Status**: **MITIGATED** — Phase 4 completed and all 85 rules verified

## R-008: Missing Not-Applicable Handling

- **Severity**: MEDIUM
- **Category**: Accuracy
- **Description**: Rules fail on pages where they don't apply (e.g., missing FAQ schema on a non-FAQ page), reducing scores unfairly.
- **Likelihood**: High
- **Impact**: Medium (unfair scores, user confusion)
- **Mitigation**: Applicability model (Phase 5) defines N/A conditions for every rule. Page-type classifier determines applicability before scoring.
- **Residual risk**: Low after Phase 5 implementation
- **Status**: Mitigated by design — Phase 5 not yet implemented

## R-009: Upstream Scoring Model Inherited by Mistake

- **Severity**: MEDIUM
- **Category**: Architecture
- **Description**: A developer ports the upstream scoring model without critical caps or N/A handling because it's familiar.
- **Likelihood**: Low
- **Impact**: Medium (incorrect scoring, difficult to fix later)
- **Mitigation**: Decision log D-004 explicitly documents scoring model as REWRITE. Provenance register lists scoring as REWRITE. Phase 5 builds scoring from scratch.
- **Residual risk**: Low
- **Status**: Mitigated by documentation and phase planning

## R-010: Playwright Worker Resource Usage

- **Severity**: MEDIUM
- **Category**: Operations
- **Description**: Playwright browser binaries (~300MB+) and per-audit memory usage cause slow cold starts and high resource consumption on container platform.
- **Likelihood**: High
- **Impact**: Medium (cost, latency)
- **Mitigation**: Dedicated worker pool for rendered DOM. Browser binary caching. Warm container pool. Separate queue from static audits. Deferred to Phase 12.
- **Residual risk**: Medium — cost depends on usage volume
- **Status**: **DEFERRED** — Phase 12 (post-launch). First release uses static analysis only.

## R-011: Third-Party API Provider Discontinuation

- **Severity**: LOW
- **Category**: Operations
- **Description**: PageSpeed Insights, Gemini, or Groq changes pricing, deprecates APIs, or discontinues service.
- **Likelihood**: Low
- **Impact**: Medium (feature loss, cost increase)
- **Mitigation**: No provider is required for core functionality. Every feature requiring a provider has a fallback (lab CWV, deterministic summaries). Provider abstraction layer.
- **Residual risk**: Low
- **Status**: Mitigated by architecture

## R-012: License Non-Compliance (Accidental)

- **Severity**: LOW
- **Category**: Legal
- **Description**: Ported code is used without proper attribution, or dependencies introduce incompatible licenses.
- **Likelihood**: Low
- **Impact**: Medium (legal risk)
- **Mitigation**: Provenance register tracks every ported module. License register tracks all dependencies. Attribution notice included in product. Legal counsel review before launch.
- **Residual risk**: Low
- **Status**: Mitigated by documentation

## R-013: Cross-Platform Path Handling

- **Severity**: LOW
- **Category**: Operations
- **Description**: File path handling differs between Windows (backslash) and Linux (forward slash), causing test failures or runtime issues.
- **Likelihood**: Medium
- **Impact**: Low (CI failures, developer friction)
- **Mitigation**: Use `path.join()` and `path.resolve()` consistently. Use platform-independent path handling. Run CI on both Windows and Linux.
- **Residual risk**: Low — upstream had same issue (4 test failures on Windows)
- **Status**: Not yet mitigated — CI configuration deferred to Phase 1

## R-014: In-Memory State Loss on Restart

- **Severity**: LOW
- **Category**: Operations
- **Description**: Rate-limit counters, host cooldown state, and monitoring metrics are held in-memory and reset on server restart. This allows brief bursts of traffic immediately after restart and loses operational metrics.
- **Likelihood**: Medium (restarts occur during deploys, scaling events)
- **Impact**: Low (rate limits briefly reset, metrics gap)
- **Mitigation**: Deployment strategy minimises restart frequency. Health endpoint includes uptime to detect restarts. Persistent rate limiting deferred to Phase 15.
- **Residual risk**: Low
- **Status**: Accepted for first release

## R-015: Public Site Crawl Resource Exhaustion

- **Severity**: HIGH
- **Category**: Security / Operations
- **Description**: A public full-site audit could be abused to crawl too many pages or exhaust worker resources.
- **Likelihood**: Medium
- **Impact**: High
- **Mitigation**: Phase 11 caps selected pages at 25, uses same-origin crawling, default concurrency 3, total deadline 45s, per-host cooldown, existing IP rate limits, existing host cooldown, and existing concurrent slot limits.
- **Residual risk**: Medium until distributed rate limiting and queue isolation arrive in Phase 15.
- **Status**: MITIGATED FOR PHASE 11 SCOPE

## R-016: Site Audit False Orphan Classification

- **Severity**: MEDIUM
- **Category**: Accuracy
- **Description**: A 25-page crawl can miss legitimate internal links and incorrectly imply a page is orphaned.
- **Likelihood**: Medium
- **Impact**: Medium
- **Mitigation**: Orphan results are labeled as candidates unless evidence is sufficient. Confidence is reduced for candidate findings.
- **Residual risk**: Low
- **Status**: MITIGATED BY LABELING AND CONFIDENCE

## Risk Summary

| ID    | Severity | Status                                              | Mitigation Phase |
| ----- | -------- | --------------------------------------------------- | ---------------- |
| R-001 | CRITICAL | MITIGATED — Phase 2 completed                       | Phase 2          |
| R-002 | CRITICAL | MITIGATED — Phase 2 completed                       | Phase 2          |
| R-003 | HIGH     | MITIGATED — Phase 2 completed                       | Phase 2          |
| R-004 | HIGH     | MITIGATED — Phase 2 completed                       | Phase 2          |
| R-005 | HIGH     | MITIGATED — Phase 2 completed                       | Phase 2          |
| R-006 | HIGH     | MITIGATED — Phase 6/9/10 completed                  | Phase 6          |
| R-007 | MEDIUM   | MITIGATED — Phase 4 completed                       | Phase 4          |
| R-008 | MEDIUM   | MITIGATED — Phase 5 completed                       | Phase 5          |
| R-009 | MEDIUM   | Mitigated by documentation                          | N/A              |
| R-010 | MEDIUM   | DEFERRED — Phase 12 (post-launch)                   | Phase 12         |
| R-011 | LOW      | Mitigated by architecture                           | N/A              |
| R-012 | LOW      | Mitigated by documentation                          | N/A              |
| R-013 | LOW      | Mitigated — platform-independent path handling used | Phase 1          |
| R-014 | LOW      | Accepted for first release                          | Phase 15         |
| R-015 | HIGH     | MITIGATED FOR PHASE 11 SCOPE                        | Phase 11         |
| R-016 | MEDIUM   | MITIGATED BY LABELING AND CONFIDENCE                | Phase 11         |
