# Testing Strategy

## Testing Principles

1. **Offline-first**: Tests must not depend on live internet access where possible. Use fixtures and mocks.
2. **Deterministic**: Tests must produce the same result every time. No flaky network-dependent tests.
3. **Comprehensive**: Every check must have passing, failing, and not-applicable test cases.
4. **Adversarial**: Include malformed HTML, security attack payloads, and edge cases.
5. **Provenance-tracked**: Tests reference the upstream source for ported rules.
6. **CI-enforced**: Tests must pass before merge.

## Test Categories

### Rule Unit Tests

Every ported check must have unit tests covering:

- **Passing case**: HTML that should produce `passed`
- **Warning case**: HTML that should produce `warning` (if applicable)
- **Failing case**: HTML that should produce `failed` (if applicable)
- **Not-applicable case**: HTML or context where the check should return `not-applicable`
- **Unavailable case**: Context where required data is missing
- **Edge cases**: Empty input, missing elements, malformed attributes

### HTML Fixtures

Create representative HTML fixtures for each check:

```
tests/fixtures/html/
├── core/
│   ├── title-present-pass.html
│   ├── title-present-fail-empty.html
│   ├── title-present-fail-missing.html
│   └── ...
├── images/
│   ├── alt-present-pass.html
│   ├── alt-present-fail.html
│   └── ...
└── ...
```

### Malformed HTML Fixtures

- Deeply nested HTML (stack overflow attempts)
- HTML with unclosed tags
- HTML with invalid characters
- HTML with extremely long attributes
- HTML with duplicate IDs
- HTML with script injection attempts

### Page-Type Fixtures

- Homepage fixture
- Article/blog post fixture
- Product page fixture
- Local business page fixture
- FAQ page fixture
- 404 page fixture
- Redirect page fixture
- Minimal page fixture (title only, no body content)

### Accessibility Fixtures

- Page with proper ARIA landmarks
- Page with missing ARIA labels
- Page with color contrast issues
- Page with keyboard trap
- Page with zoom disabled

### Schema Fixtures

- Valid JSON-LD (Article, Product, LocalBusiness, FAQ, BreadcrumbList, Organization, VideoObject, Review, WebSite)
- Invalid JSON-LD (malformed JSON, missing @type, missing required fields)
- Multiple JSON-LD blocks
- Embedded microdata
- Empty script tags

### URL Security Fixtures

- URLs with private IPs
- URLs with localhost
- URLs with metadata endpoints
- URLs with credentials
- URLs with restricted ports
- URLs with non-HTTP schemes
- URLs with DNS rebinding patterns

### SSRF Adversarial Tests

Before deployment, the following tests must pass:

1. `http://169.254.169.254/latest/meta-data/` → rejected
2. `http://10.0.0.1/` → rejected
3. `http://192.168.1.1/` → rejected
4. `http://localhost:3306/` → rejected
5. `http://[::1]:5432/` → rejected
6. `http://0.0.0.0/` → rejected
7. `file:///etc/passwd` → rejected
8. `ftp://attacker.com/` → rejected
9. `http://valid.com:22/` → rejected
10. `http://user:pass@valid.com/` → rejected

### Redirect Tests

- 301 redirect to valid URL → followed (up to limit)
- 301 redirect to private IP → rejected
- 301 redirect loop (A→B→C→A) → halted at limit
- Meta refresh redirect → detected
- JavaScript redirect → detected
- Redirect chain > 5 hops → halted

### DNS Tests

- Valid hostname resolves to public IP → allowed
- Valid hostname resolves to private IP → rejected
- Hostname resolves to mixed public/private IPs → rejected
- Unresolvable hostname → rejected
- Hostname with invalid characters → rejected

### Cross-Page Fixtures

- Multiple pages with duplicate titles
- Multiple pages with unique titles
- Orphan page (not linked from any other page)
- Page with broken internal links
- Paginated page series

### Scoring Tests

- All checks pass → score 100
- All checks fail → score 0
- Mixed pass/warn/fail → weighted average
- Mix of applicable and not-applicable → score reflects only applicable
- Critical cap scenario → score matches cap value
- Template-level duplicate penalty → capped per-page penalty

### Confidence Tests

- All data available → confidence 100
- Rendered DOM missing → reduced confidence in JS category
- robots.txt not fetchable → reduced crawlability confidence
- Page too short → reduced content confidence
- Multiple data gaps → confidence reflects cumulative reduction

### Provenance Tests

- Ported rule has provenance record matching the upstream rule ID
- Provenance record includes commit hash, source path, and disposition
- Modification notes exist for PORT_WITH_MODIFICATIONS rules

### API Tests

- URL validation rejects invalid inputs
- Rate limiting returns 429 when exceeded
- Invalid URL returns 400 with clear error message
- Non-HTTP scheme returns 400
- Private IP returns 400

### Playwright E2E Tests (Future Phase)

- Landing page loads and URL input is functional
- Audit completes and report displays
- Score section renders correctly
- Category accordion expands/collapses
- Filter toggles work
- Share button copies link
- Print button triggers print dialog
- Mobile responsive layout renders correctly
- Keyboard navigation works throughout

### CI Pipeline

- **Windows CI**: Verifies path handling and cross-platform compatibility
- **Linux CI**: Main development and deployment target
- **Tests run on every push and pull request**
- **Build must pass before test run**
- **Test failures block merge**

## Test File Organisation

```
tests/
├── unit/
│   ├── checks/
│   │   ├── core/
│   │   │   ├── title-present.test.ts
│   │   │   ├── title-length.test.ts
│   │   │   └── ...
│   │   ├── images/
│   │   └── ...
│   ├── scoring/
│   │   ├── category-score.test.ts
│   │   ├── overall-score.test.ts
│   │   ├── critical-caps.test.ts
│   │   └── confidence.test.ts
│   └── security/
│       ├── url-validation.test.ts
│       ├── ssrf.test.ts
│       ├── redirect-validation.test.ts
│       └── dns-validation.test.ts
├── fixtures/
│   ├── html/
│   ├── schemas/
│   └── urls/
└── e2e/                          # Future
    └── playwright/
        └── report-viewer.spec.ts
```

## Test Infrastructure

- **Framework**: vitest (consistent with upstream, performant)
- **HTML fixtures**: Static files loaded by tests
- **Network mocking**: msw (Mock Service Worker) for HTTP response mocking
- **Browser testing**: Playwright (future phase)
- **Coverage reporting**: v8/istanbul via vitest
