# Phase 10: Failure and Recovery Matrix

## Public API Error Responses

| HTTP Status | Error Code           | Condition                               | Message                                                                    | Retry Guidance                                            | Logging Level | Monitoring Counter    |
| ----------- | -------------------- | --------------------------------------- | -------------------------------------------------------------------------- | --------------------------------------------------------- | ------------- | --------------------- |
| 400         | `INVALID_REQUEST`    | Request body is not valid JSON          | "Invalid JSON body"                                                        | Fix request body                                          | `info`        | —                     |
| 400         | `VALIDATION_ERROR`   | URL or keyword fails Zod validation     | Zod issue message (e.g., "Invalid URL")                                    | Fix input                                                 | `info`        | —                     |
| 429         | `RATE_LIMITED`       | Per-IP rate limit exceeded (10 req/min) | "Too many requests. Please wait before trying again."                      | Wait for `Retry-After` header (seconds)                   | `warn`        | `trackRateLimitHit()` |
| 429         | `HOST_COOLDOWN`      | Same host audited within 30s            | "This website was recently audited. Please wait before scanning it again." | Wait for `Retry-After` header (seconds)                   | `info`        | —                     |
| 502         | `FETCH_FAILED`       | URL unreachable or network error        | "Failed to fetch the URL. The page may be unreachable."                    | Verify URL is accessible, retry                           | `error`       | `trackAuditError()`   |
| 503         | `CAPACITY_EXHAUSTED` | All 3 concurrent slots occupied         | "The audit system is at capacity. Please try again shortly."               | Retry after short delay (exponential backoff recommended) | `warn`        | —                     |
| 504         | `TIMEOUT`            | Audit exceeded 30s execution deadline   | "The audit timed out. The page may be too slow or too large."              | Retry with simpler page, or retry later                   | `error`       | `trackAuditError()`   |

## NexoraError Mapping (from `safeFetch` / network layer)

| NexoraError Class       | HTTP Status | Error Code         | Trigger                                                | Recovery                       |
| ----------------------- | ----------- | ------------------ | ------------------------------------------------------ | ------------------------------ |
| InvalidUrlError         | 400         | `VALIDATION_ERROR` | URL parse failure, non-http scheme, credentials in URL | Fix URL format                 |
| PrivateIpError          | 400         | `VALIDATION_ERROR` | Resolved IP is private/loopback/metadata               | Use a public URL               |
| RestrictedPortError     | 400         | `VALIDATION_ERROR` | URL uses a blocked port (e.g., :22, :3306)             | Use standard ports (80/443)    |
| DnsResolutionError      | 502         | `FETCH_FAILED`     | Hostname does not resolve                              | Verify domain exists           |
| DnsRebindingError       | 400         | `VALIDATION_ERROR` | Mixed public/private DNS response                      | Suspicious domain detected     |
| RedirectValidationError | 502         | `FETCH_FAILED`     | Redirect target fails validation                       | Check redirect chain           |
| RedirectLimitError      | 502         | `FETCH_FAILED`     | More than 5 redirect hops                              | Simplify redirect chain        |
| ResponseTooLargeError   | 502         | `FETCH_FAILED`     | Response body exceeds 5MB                              | Page too large for analysis    |
| DecompressionError      | 502         | `FETCH_FAILED`     | Compression ratio exceeds 100:1 excessive              | Suspicious content detected    |
| ContentTypeError        | 502         | `FETCH_FAILED`     | Response is not HTML/XHTML/plaintext                   | Only HTML pages can be audited |
| TimeoutError            | 504         | `TIMEOUT`          | Request deadline exceeded (30s)                        | Page too slow, retry later     |
| NetworkError            | 502         | `FETCH_FAILED`     | TCP/TLS connection failure                             | Temporary issue, retry         |

## Internal Error Handling

| Scenario                      | Handling                                                                                                  | Recovery                                                   |
| ----------------------------- | --------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| Rule execution error          | `runResult.errorCount` tracked, partial stage set to `"rule-execution"`, non-failing rules still reported | User sees partial results; error logged via `captureError` |
| PageSpeed API failure         | Caught silently, `performanceStatus` set to `"unavailable"`                                               | System continues without PSI data                          |
| Concurrent slot leak          | `finally` block guarantees `releaseConcurrentSlot()`                                                      | Slot always released even on exception                     |
| AbortController timeout       | `clearTimeout` in both success and error paths                                                            | No dangling timers                                         |
| JSON parse failure in request | Caught before Zod validation, returns 400                                                                 | Explicit error path                                        |

## Monitoring & Alerting

| Condition                | Detection                     | Recommended Action                                    |
| ------------------------ | ----------------------------- | ----------------------------------------------------- |
| Elevated rate-limit hits | `trackRateLimitHit()` counter | Investigate potential abuse or legitimate user volume |
| Elevated audit errors    | `trackAuditError()` counter   | Check network layer, upstream availability            |
| Concurrency saturation   | Concurrent count reaches 3    | Scale up or increase concurrency limit                |
| Health endpoint 5xx      | External monitoring           | Immediate investigation required                      |

## Recovery Procedures

| Issue                                   | Recovery Steps                                                                 |
| --------------------------------------- | ------------------------------------------------------------------------------ |
| Rate limit exhaustion (legitimate user) | No recovery needed — resets after 60s window                                   |
| Host cooldown                           | No recovery needed — resets after 30s                                          |
| Capacity exhaustion                     | Autoscale or reduce concurrent limit; retry after slot release                 |
| Network fetch failures                  | Retry with exponential backoff (up to 3 attempts recommended)                  |
| Process crash / OOM                     | Container orchestrator restarts; in-memory rate-limit counters reset           |
| Deployment rollback                     | Use `vercel rollback` for Vercel; redeploy previous container image for Docker |
