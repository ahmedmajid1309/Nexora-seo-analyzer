# Phase 11 Security Verification Matrix

| Control                        | Phase 11 Status | Evidence                                                                                |
| ------------------------------ | --------------- | --------------------------------------------------------------------------------------- |
| SSRF protection                | PRESERVED       | All page, robots, and sitemap requests call `safeFetch`                                 |
| DNS validation                 | PRESERVED       | `safeFetch` resolver path remains unchanged                                             |
| Mixed public/private rejection | PRESERVED       | Existing network policy remains in gateway                                              |
| Private/reserved IP blocking   | PRESERVED       | No `allowPrivate` public input exists                                                   |
| Pinned-IP connection           | PRESERVED       | `safeFetch` still uses validated address connection pinning                             |
| Host and TLS SNI               | PRESERVED       | Existing `fetchUrl`/response-reader behavior reused                                     |
| Redirect revalidation          | PRESERVED       | Redirects still flow through `safeFetch` redirect policy                                |
| Response-size limits           | PRESERVED       | Page fetches use existing response reader bounds                                        |
| Content type limits            | PRESERVED       | Pages remain HTML/XHTML; sitemap fetch allows XML only through explicit internal option |
| Deadlines                      | ADDED           | Site coordinator deadline 45s plus per-request safe fetch deadlines                     |
| Concurrency                    | ADDED           | Site coordinator default concurrency 3, bounded internally                              |
| Rate limiting                  | PRESERVED       | `POST /api/audit/site` uses existing per-IP, host cooldown, and concurrent-slot guards  |
| Same-origin crawl              | ADDED           | URL selection excludes external origins; off-origin redirects are blocked from auditing |
| Destructive URL avoidance      | ADDED           | Logout/cart/checkout/delete-style URLs are skipped                                      |
| Unsupported downloads          | ADDED           | Common binary/document/media extensions are skipped before page audit                   |
| Partial failure handling       | ADDED           | Failed page does not destroy full site report                                           |

Phase 11 does not introduce browser fetching, axios, Redis, external queues, or any public private-network override.
