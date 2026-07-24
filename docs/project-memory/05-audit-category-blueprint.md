# Audit Category Blueprint

## Category Overview

| #   | Category                    | Quick Page | Site Audit | Static | Rendered | Cross-Page | External API | Est. Rules |
| --- | --------------------------- | ---------- | ---------- | ------ | -------- | ---------- | ------------ | ---------- |
| 1   | Technical SEO               | Yes        | Yes        | Yes    | No       | Partial    | No           | 8-10       |
| 2   | Crawlability & Indexability | Yes        | Yes        | Yes    | No       | Yes        | No           | 8-12       |
| 3   | Metadata                    | Yes        | Yes        | Yes    | No       | Yes        | No           | 8-10       |
| 4   | On-Page SEO                 | Yes        | Yes        | Yes    | No       | No         | No           | 8-12       |
| 5   | Content Structure           | Yes        | Yes        | Yes    | No       | No         | No           | 6-8        |
| 6   | URLs                        | Yes        | Yes        | Yes    | No       | No         | No           | 8-10       |
| 7   | Internal Links              | Yes        | Yes        | Yes    | No       | Yes        | No           | 8-10       |
| 8   | External Links              | Yes        | No         | Yes    | No       | No         | Yes          | 4-6        |
| 9   | Images                      | Yes        | Yes        | Yes    | No       | No         | No           | 8-10       |
| 10  | Structured Data             | Yes        | Yes        | Yes    | No       | Yes        | No           | 8-12       |
| 11  | Performance                 | Yes        | Yes        | Yes    | Yes      | No         | No           | 8-12       |
| 12  | Accessibility               | Yes        | Yes        | Yes    | No       | No         | No           | 8-12       |
| 13  | Mobile                      | Yes        | Yes        | Yes    | No       | No         | No           | 4-6        |
| 14  | Security Headers            | Yes        | Yes        | Yes    | No       | No         | No           | 10-14      |
| 15  | Trust & Legal               | Yes        | Yes        | Yes    | No       | No         | No           | 6-8        |
| 16  | E-E-A-T                     | Yes        | Yes        | Yes    | No       | No         | No           | 8-12       |
| 17  | Social Metadata             | Yes        | Yes        | Yes    | No       | No         | No           | 6-8        |
| 18  | International SEO           | Yes        | Yes        | Yes    | No       | Yes        | No           | 6-10       |
| 19  | JavaScript SEO              | Yes        | Yes        | No     | Yes      | Yes        | No           | 6-10       |
| 20  | AEO Readiness               | Yes        | Yes        | Yes    | No       | No         | Future       | 3-6        |
| 21  | GEO Readiness               | Yes        | Yes        | Yes    | No       | No         | No           | 4-6        |
| 22  | AI Crawler & llms.txt       | Yes        | Yes        | Yes    | No       | No         | No           | 3-5        |
| 23  | Cross-Page & Site Arch      | No         | Yes        | Yes    | No       | Yes        | No           | 6-10       |

## Category Details

### 1. Technical SEO

- **Objective**: Verify core technical infrastructure (status codes, robots.txt, sitemap, SSL, redirects)
- **Quick page**: Status code, robots meta, canonical, redirect chain, SSL
- **Site audit**: Robots.txt syntax, sitemap coverage, www/non-www consistency
- **Static HTML**: Yes — HTTP response inspection
- **Rendered DOM**: No
- **Cross-page**: Partial — redirect consistency
- **External API**: No
- **Accuracy risks**: Soft 404 detection via content heuristics (can false-positive)

### 2. Crawlability & Indexability

- **Objective**: Assess whether search engines can discover and index the page
- **Quick page**: Robots meta, X-Robots-Tag, noindex, canonical, block directives
- **Site audit**: Sitemap coverage, noindex-in-sitemap conflicts, pagination, orphan pages
- **Static HTML**: Yes
- **Rendered DOM**: No
- **Cross-page**: Yes — sitemap vs indexed, pagination chains
- **External API**: No
- **Accuracy risks**: Orphan detection limited to crawled pages; cannot detect truly orphaned pages without full crawl

### 3. Metadata

- **Objective**: Evaluate title tags, meta descriptions, and their quality
- **Quick page**: Title presence, length, pixel width; description presence, length, pixel width
- **Site audit**: Title uniqueness, description uniqueness across pages
- **Static HTML**: Yes
- **Rendered DOM**: No
- **Cross-page**: Yes — uniqueness checks require multiple pages
- **External API**: No
- **Accuracy risks**: Pixel width estimation is advisory, not exact render

### 4. On-Page SEO

- **Objective**: Evaluate heading structure, content hierarchy, and basic on-page elements
- **Quick page**: H1 presence, H1 count, heading hierarchy, heading uniqueness, viewport, favicon
- **Site audit**: Same as quick page per page
- **Static HTML**: Yes
- **Rendered DOM**: No
- **Cross-page**: No
- **External API**: No
- **Accuracy risks**: HTML5 allows multiple H1s per sectioning element; warn instead of fail

### 5. Content Structure

- **Objective**: Evaluate text quality, quantity, and readability
- **Quick page**: Word count, reading level (Flesch-Kincaid), keyword density, text-to-HTML ratio
- **Site audit**: Same per page, plus template detection for repeated patterns
- **Static HTML**: Yes
- **Rendered DOM**: No
- **Cross-page**: No
- **External API**: No
- **Accuracy risks**: Reading level is advisory; keyword density is noisy; short content analysis is unreliable

### 6. URLs

- **Objective**: Evaluate URL structure, length, parameters, and formatting
- **Quick page**: URL length, parameters, uppercase, underscores, spaces, non-ASCII, repetitive segments, session IDs, tracking params
- **Site audit**: Same per page
- **Static HTML**: Yes
- **Rendered DOM**: No
- **Cross-page**: No
- **External API**: No
- **Accuracy risks**: Slug keyword check is heuristic

### 7. Internal Links

- **Objective**: Evaluate internal link health, distribution, and structure
- **Quick page**: Internal links present, link count, anchor text quality, broken fragments, dead-end detection, nofollow, HTTPS downgrade
- **Site audit**: All quick checks + orphan detection, depth analysis, redirect chains
- **Static HTML**: Yes
- **Rendered DOM**: No
- **Cross-page**: Yes — orphan detection, depth, redirect chains
- **External API**: No (broken link checking is internal network only)
- **Accuracy risks**: Dead-end detection requires checking all page links; onion links only checked when requested

### 8. External Links

- **Objective**: Evaluate external link quality, security, and count
- **Quick page**: External link count, nofollow usage, target="_blank" security, HTTPS downgrade
- **Site audit**: Same as quick page
- **Static HTML**: Yes
- **Rendered DOM**: No
- **Cross-page**: No
- **External API**: Yes — external link validation requires HEAD requests to external domains
- **Accuracy risks**: External link checking impacts audit time; external sites may block or rate-limit

### 9. Images

- **Objective**: Evaluate image quality, accessibility, and performance
- **Quick page**: Alt presence, alt quality, alt length, dimensions, lazy loading, modern formats, file size, broken images, figure captions, inline SVG, picture element
- **Site audit**: Same per page
- **Static HTML**: Yes
- **Rendered DOM**: No
- **Cross-page**: No
- **External API**: No
- **Accuracy risks**: File size is advisory (network-dependent); alt quality is heuristic

### 10. Structured Data

- **Objective**: Evaluate JSON-LD/microdata syntax, completeness, and correctness
- **Quick page**: JSON-LD presence, valid JSON, @type present, required fields, type-specific validation
- **Site audit**: All quick checks + schema consistency across pages
- **Static HTML**: Yes
- **Rendered DOM**: No
- **Cross-page**: Yes — type consistency
- **External API**: No
- **Accuracy risks**: Cannot validate against live Schema.org test suite; required fields are best-effort

### 11. Performance

- **Objective**: Evaluate page speed signals and optimisation opportunities
- **Quick page**: DOM size, page weight, text compression, Brotli, cache policy, minification, response time, HTTP/2, render-blocking resources, preconnect hints, font loading
- **Site audit**: Same per page
- **Static HTML**: Partial — most checks are static
- **Rendered DOM**: Yes — CWV (LCP, CLS, INP, TTFB, FCP) require Playwright
- **Cross-page**: No
- **External API**: Future — PageSpeed Insights for real-world data
- **Accuracy risks**: Lab-based CWV does not equal real-world CWV; clearly label as lab measurement

### 12. Accessibility

- **Objective**: Evaluate WCAG compliance via static HTML analysis
- **Quick page**: ARIA labels, heading order, landmarks, skip link, link text, form labels, touch targets, zoom disabled, table headers, video captions, focus visible, color contrast
- **Site audit**: Same per page
- **Static HTML**: Yes
- **Rendered DOM**: No
- **Cross-page**: No
- **External API**: No
- **Accuracy risks**: Color contrast analysis without visual rendering is heuristic; full WCAG audit requires axe-core or similar engine

### 13. Mobile

- **Objective**: Evaluate mobile-friendliness signals
- **Quick page**: Viewport meta, font size, horizontal scroll, interstitials, multiple viewports, touch targets
- **Site audit**: Same per page
- **Static HTML**: Yes
- **Rendered DOM**: No
- **Cross-page**: No
- **External API**: No
- **Accuracy risks**: Static detection of interstitials and horizontal scroll is limited; real device testing more accurate

### 14. Security Headers

- **Objective**: Evaluate HTTP security header presence and quality
- **Quick page**: HTTPS, HSTS, CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, mixed content, form HTTPS, leaked secrets, protocol-relative URLs, SSL expiry, TLS protocol
- **Site audit**: Same per page
- **Static HTML**: No — requires HTTP response inspection
- **Rendered DOM**: No
- **Cross-page**: No
- **External API**: No
- **Accuracy risks**: SSL expiry and TLS protocol require external certificate inspection; CSP analysis is advisory

### 15. Trust & Legal

- **Objective**: Evaluate trust signals and legal compliance
- **Quick page**: Cookie consent, privacy policy link, terms of service, contact page, physical address
- **Site audit**: Same per page (consistency across pages)
- **Static HTML**: Yes
- **Rendered DOM**: No
- **Cross-page**: No
- **External API**: No
- **Accuracy risks**: Cookie consent detection is heuristic; cannot detect JavaScript-triggered banners

### 16. E-E-A-T

- **Objective**: Evaluate Experience, Expertise, Authority, Trust signals
- **Quick page**: About page, author byline, author expertise, content dates, citations, contact page, privacy policy, terms, disclaimers, trust signals, YMYL detection
- **Site audit**: Same per page
- **Static HTML**: Yes
- **Rendered DOM**: No
- **Cross-page**: No
- **External API**: No
- **Accuracy risks**: E-E-A-T is a Google quality concept, not a binary check; these rules are signal detectors, not E-E-A-T certifiers

### 17. Social Metadata

- **Objective**: Evaluate Open Graph and Twitter Card metadata
- **Quick page**: og:title, og:description, og:image, og:image:size, og:url, twitter:card, og:url vs canonical match
- **Site audit**: Same per page
- **Static HTML**: Yes
- **Rendered DOM**: No
- **Cross-page**: No
- **External API**: No
- **Accuracy risks**: Image dimension detection requires fetching the image; currently checks og:image:size meta tag

### 18. International SEO

- **Objective**: Evaluate hreflang, lang attributes, and multi-region configuration
- **Quick page**: HTML lang attribute, hreflang presence
- **Site audit**: Hreflang return links, conflicts, broken targets, redirect targets, noindex conflicts, multiple methods
- **Static HTML**: Yes
- **Rendered DOM**: No
- **Cross-page**: Yes — hreflang reciprocity
- **External API**: No
- **Accuracy risks**: Full hreflang validation requires fetching linked pages; limited to syntax checks in quick mode

### 19. JavaScript SEO

- **Objective**: Evaluate JS-rendered content quality and raw-vs-rendered consistency
- **Quick page**: SSR detection, JS dependency analysis
- **Site audit**: Raw vs rendered comparison, title/description/h1/canonical/noindex mismatch detection
- **Static HTML**: Partial — SSR detection is static
- **Rendered DOM**: Yes — mismatch detection requires rendered DOM
- **Cross-page**: No
- **External API**: No
- **Accuracy risks**: Rendered DOM requires Playwright worker; quick mode skips most JS checks

### 20. AEO Readiness

- **Objective**: Evaluate answer engine optimisation signals
- **Quick page**: Content clarity, question-answering structure, entity signals, FAQ structure
- **Site audit**: Same per page
- **Static HTML**: Yes
- **Rendered DOM**: No
- **Cross-page**: No
- **External API**: Future — possible LLM-based content assessment
- **Accuracy risks**: AEO is an emerging field; rules are exploratory and advisory

### 21. GEO Readiness

- **Objective**: Evaluate generative engine optimisation signals
- **Quick page**: Semantic HTML, content structure, heading hierarchy, schema drift
- **Site audit**: Same per page
- **Static HTML**: Yes
- **Rendered DOM**: No
- **Cross-page**: No
- **External API**: No
- **Accuracy risks**: GEO is an emerging field; rules are advisory, not ranking predictors

### 22. AI Crawler & llms.txt

- **Objective**: Evaluate AI crawler access and llms.txt support
- **Quick page**: AI bot access (robots.txt), llms.txt reference
- **Site audit**: Same
- **Static HTML**: Yes
- **Rendered DOM**: No
- **Cross-page**: No
- **External API**: No
- **Accuracy risks**: llms.txt is an emerging standard; absence is not a defect

### 23. Cross-Page & Site Architecture

- **Objective**: Evaluate site-wide patterns only visible during multi-page crawl
- **Quick page**: No
- **Site audit**: Duplicate content, orphan pages, template detection, sitemap coverage, link distribution, canonical consistency
- **Static HTML**: Yes
- **Rendered DOM**: No
- **Cross-page**: Yes — by definition
- **External API**: No
- **Accuracy risks**: Limited to crawled pages; missing pages may produce false orphans

## Not Every Upstream Rule Will Be Ported

Upstream has 251 rules. Nexora's initial planned set is approximately 150-180 rules across these categories. Rules may be skipped because:

- They depend on CLI-specific features (e.g., local file references)
- They are redundant with other rules after improved evidence output
- They require external databases not available (e.g., domain registration data)
- They are too noisy for their value
- They duplicate capabilities better handled by the audit framework
