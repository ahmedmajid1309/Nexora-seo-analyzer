# Security Contract

## Mandatory Controls

The public Nexora scanner must implement ALL of the following controls before any audit engine runs against user-supplied URLs. No SEO work may begin before the network security phase passes all adversarial tests.

### 1. Strict URL Normalization

- Parse the user-supplied URL using the WHATWG URL standard
- Reject URLs with non-printable or control characters
- Reject URLs with credentials (`user:password@host`)
- Reject URLs with fragments (hash/`#`)
- Normalise to lowercase scheme and hostname
- Reject internationalised domain names that fail IDNA conversion

### 2. HTTP/HTTPS Only

- Scheme must be `http` or `https`
- Reject `file:`, `ftp:`, `data:`, `javascript:`, `vbscript:`, `blob:`, `chrome:`, `about:`, and all other schemes

### 3. Credentials Rejected

- URL must not contain `userinfo` (`username:password@`)
- If present, reject the URL immediately — do not strip and proceed

### 4. Restricted Ports

- Maintain a blocklist of restricted ports
- Default blocklist: 21 (FTP), 22 (SSH), 23 (Telnet), 25 (SMTP), 53 (DNS), 110 (POP3), 135 (RPC), 137-139 (NetBIOS), 143 (IMAP), 389 (LDAP), 445 (SMB), 873 (RSYNC), 1433 (MSSQL), 1521 (Oracle), 2049 (NFS), 3306 (MySQL), 3389 (RDP), 5432 (PostgreSQL), 6379 (Redis), 8080 (proxy), 8443 (proxy)
- Any URL targeting a restricted port must be rejected

### 5. Localhost Blocking

- Reject hostnames: `localhost`, `127.0.0.1`, `::1`, `0.0.0.0`
- Reject hostnames ending in `.local`, `.internal`, `.localhost`

### 6. Private IPv4 Blocking

- Resolve the hostname to all IPv4 addresses
- Reject if ANY resolved address falls within:
  - `10.0.0.0/8`
  - `172.16.0.0/12`
  - `192.168.0.0/16`
  - `127.0.0.0/8` (loopback)
  - `169.254.0.0/16` (link-local)
  - `0.0.0.0/8`

### 7. Private IPv6 Blocking

- Resolve the hostname to all IPv6 addresses
- Reject if ANY resolved address falls within:
  - `::1/128` (loopback)
  - `fc00::/7` (unique local)
  - `fe80::/10` (link-local)
  - `::ffff:0:0/96` (IPv4-mapped, check embedded IPv4 against private ranges)

### 8. Metadata Destination Blocking

- Reject hostnames that resolve to cloud metadata IPs:
  - `169.254.169.254` (AWS/GCP/Azure metadata)
  - `fd00:ec2::/64` (AWS IMDSv2)
  - `100.100.100.200` (Alibaba metadata)
- Reject hostnames that contain known metadata keywords: `metadata`, `instance-data`, `169.254.169.254`

### 9. DNS Validation

- Verify the hostname resolves to at least one IP address before connecting
- Reject hostnames with no DNS resolution
- Reject hostnames that resolve to multiple address families where one family contains private IPs

### 10. Mixed Public/Private DNS Rejection

- If DNS resolution returns both public and private IPs for the same hostname (DNS rebinding attack), reject
- This is a critical control against time-of-check/time-of-use rebinding attacks

### 11. DNS Rebinding Protection

- Resolve DNS before connection and pin the connection to the resolved IP
- Re-resolve DNS on redirect and validate new IP against all restrictions
- Use a custom HTTP agent that connects to the resolved IP directly rather than relying on hostname-based connection

### 12. Validated-IP Connection Pinning

- After DNS resolution and validation, create a TCP connection to the validated IP address
- Set the HTTP Host header to the original user-supplied hostname (for virtual hosting)
- Do NOT allow the TCP connection to be redirected to a different IP without re-validation

### 13. Redirect Revalidation

- On receiving a redirect (3xx), extract the new URL
- Run the full validation pipeline on the new URL (scheme, host, port, IP resolution, private IP checks)
- Do NOT follow redirects that fail validation
- Limit the number of redirect hops (maximum: 5)

### 14. Streaming Response Limits

- Enforce a maximum response body size (proposed: 5 MB)
- Enforce a maximum response body read timeout (proposed: 10 seconds for body after headers received)
- Cancel the request if either limit is exceeded
- Stream the response body; do not buffer the entire response before processing

### 15. Decompression Protection

- Limit decompressed response size to 5 MB (to protect against zip bombs)
- Reject responses with excessive compression ratios (>100:1)

### 16. Content-Type Restrictions

- Only parse responses with a `Content-Type` of `text/html`, `application/xhtml+xml`, or `text/plain` (for robots.txt)
- If Content-Type is missing or unexpected, do not parse as HTML
- Reject non-text responses (binary files, archives, executables)

### 17. Deadlines and Cancellation

- Enforce a total request deadline (proposed: 30 seconds for static fetch)
- Enforce a connection timeout (proposed: 10 seconds)
- Enforce a TLS handshake timeout (proposed: 5 seconds)
- Use AbortController or equivalent to enforce all deadlines
- Cancel remaining work when the deadline is reached

### 18. Robots and Sitemap URL Validation

- URLs found in robots.txt Sitemap directives must pass the same validation as user-supplied URLs
- URLs found in sitemap XML must pass the same validation

### 19. External-Link Request Limits

- When checking external link validity (HEAD requests), enforce:
  - Maximum 10 external links checked per page audit
  - 5-second timeout per external link
  - No external link checking for redirect URLs that fail validation
- External link failures must not block the audit result

### 20. Isolated Playwright Execution

- Playwright worker must run in an isolated container with:
  - No access to internal network services
  - No access to host file system beyond temporary directories
  - `--no-sandbox` (safe inside container)
  - `--disable-setuid-sandbox`
  - `--disable-dev-shm-usage`
  - No persistent browser profile
  - Clear browser context after each audit
  - Maximum page timeout: 30 seconds

### 21. Browser Network Restrictions

- Route Playwright traffic through the SSRF-hardened HTTP client or a forward proxy that applies the same security filters
- Use Playwright's `route` API to block requests to private IPs, metadata endpoints, and restricted ports

### 22. Rate Limiting

- Enforce per-IP rate limits (proposed: 10 requests per minute for unauthenticated users)
- Enforce per-domain rate limits (proposed: 5 concurrent audits per domain)
- Rate limits must be enforced at the API gateway level, not just the worker level

### 23. Concurrency Limits

- Maximum concurrent static audits per worker: proportional to available resources (proposed: 10 per CPU core)
- Maximum concurrent rendered DOM audits: 1 per worker (Playwright is resource-intensive)
- Queue audits beyond concurrency limits; do not block the API

### 24. Privacy-Safe Logs

- Do not log the full user-supplied URL
- Log only the hostname and a truncated path
- Do not log HTTP response bodies
- Do not log user IP addresses beyond rate-limiting counters
- Retain audit metadata only as long as needed for debugging (proposed: 30 days)

## Security Testing Requirements

Before the first audit engine test runs against a real URL, the following adversarial tests must pass:

1. SSRF to `http://169.254.169.254/latest/meta-data/`
2. SSRF to `http://10.0.0.1/`
3. SSRF to `http://192.168.1.1/`
4. SSRF to `http://localhost:3306/`
5. SSRF via DNS rebinding (domain resolves to public IP initially, then private IP)
6. SSRF via redirect (`http://attacker.com` redirects to `http://169.254.169.254/`)
7. SSRF via IPv6 (`http://[fc00::1]/`)
8. Port scan via URL (`http://example.com:22/`)
9. Credential smuggling (`http://user:pass@example.com/`)
10. Scheme bypass (`file:///etc/passwd`, `ftp://attacker.com/`)
11. Zip bomb decompression
12. Infinite response stream
13. Redirect loop (endless 301 chain)
14. Oversized response (>5 MB)
15. Mixed public/private DNS response

## Non-Compliance

Any security control that is not yet implemented must be documented in the risk register with:

- The planned implementation phase
- The mitigation in place until implementation (e.g., "feature disabled, Playwright worker not deployed yet")
- The conditions under which the risk becomes critical

The system must not be deployed to production until all controls marked "MANDATORY" are implemented and tested.
