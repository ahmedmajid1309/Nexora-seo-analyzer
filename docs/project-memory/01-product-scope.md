# Product Scope

## Quick Page Audit

A single-URL audit covering all applicable categories. Returns a scored, actionable report within seconds for static analysis, or within ~15 seconds when rendered DOM measurement is enabled.

### Included checks

- Response and redirect information (status, redirect chain, timing)
- Crawlability and indexability signals (robots meta, X-Robots-Tag, noindex, canonical)
- Titles and meta descriptions (presence, length, pixel width, uniqueness)
- Canonical and robots directives
- Headings (presence, hierarchy, uniqueness)
- Page URL structure (length, parameters, slug quality)
- Content structure (word count, text-to-HTML ratio, heading structure)
- Internal and external links (presence, validity, nofollow)
- Images (alt text, dimensions, lazy loading, modern formats)
- Structured data (JSON-LD syntax, type presence, required fields)
- Open Graph and social metadata
- Mobile signals (viewport, font size, touch targets, interstitials)
- Accessibility (ARIA labels, heading order, landmarks, skip link, focus indicators, link text)
- Performance (DOM size, page weight, compression, caching headers)
- Security headers (HTTPS, HSTS, CSP, X-Frame-Options, etc.)
- Trust and legal signals (cookie consent, privacy policy, contact info)
- E-E-A-T signals (author bylines, content dates, citations, about/contact pages)
- AEO readiness (content clarity, entity signals, question-answering structure)
- GEO readiness (semantic HTML, content structure, schema drift)
- AI crawler and llms.txt signals

## Limited Website Audit

A controlled multi-page crawl covering up to 25 pages.

### Additional checks (beyond Quick Page Audit)

- Duplicate titles across pages
- Duplicate meta descriptions across pages
- Broken internal links
- Redirect chains within the site
- Crawl depth analysis
- Dead-end pages (no outgoing internal links)
- Orphan-page signals (pages in sitemap but not linked internally, or linked but not in sitemap)
- Canonical inconsistencies across pages
- Sitemap coverage and consistency
- Internal-link structure and distribution
- Template-level issue grouping (same issue on many pages)
- Site-wide schema consistency across pages

## Locked Exclusions for Version 1

The following are explicitly excluded from Version 1 planning. They may be reconsidered in future phases only after the core product is stable.

- Google Search Console integration
- Google Analytics import
- Mandatory user login
- Billing or subscriptions
- Backlink databases (e.g., Majestic, Ahrefs)
- Keyword-volume databases
- Rank tracking
- Competitor keyword databases
- Automatic Google indexing requests
- Automatic WordPress modifications
- Fabricated traffic or ranking data
- Unrestricted full-site crawling (no "crawl everything" mode)

## Report Privacy

- User-generated audit reports must be private/unlisted by default (accessible only via the generated URL, not listed or discoverable)
- All user-generated report pages must include a `noindex` robots meta tag
- Only curated Nexora-created example reports may be indexable and discoverable
- Report URLs should use unguessable identifiers (UUIDs), not sequential IDs

## Out of Scope (Permanent)

- Fabricating or predicting search rankings
- Claiming guaranteed AI visibility
- Guaranteeing specific Google treatment
- Storing or selling audit data without explicit consent
