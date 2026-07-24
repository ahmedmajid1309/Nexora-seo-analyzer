# Design and UX Direction

## Design Identity

### Colours

| Role                   | Value                   | Usage                                                            |
| ---------------------- | ----------------------- | ---------------------------------------------------------------- |
| Background (primary)   | Near-black `#0D0D0D`    | Page background, card backgrounds                                |
| Background (secondary) | Charcoal `#1A1A1A`      | Card backgrounds, interactive surfaces                           |
| Background (tertiary)  | Dark grey `#2A2A2A`     | Hover states, subtle borders                                     |
| Brand accent           | Warm gold `#F4CA57`     | Primary CTAs, score highlights, key metrics, interactive accents |
| Brand accent (hover)   | Brighter gold `#F8D97A` | Interactive states                                               |
| Brand accent (hover)   | Brighter gold `#F0C44A` | Interactive states                                               |
| Text (primary)         | White `#FFFFFF`         | Headings, primary text                                           |
| Text (secondary)       | Off-white `#CCCCCC`     | Body text, descriptions                                          |
| Text (tertiary)        | Grey `#888888`          | Metadata, secondary information                                  |
| Success                | Green `#22C55E`         | Passed checks                                                    |
| Warning                | Amber `#E99A35`         | Warning checks (distinct from brand gold)                        |
| Error                  | Red `#EF4444`           | Failed checks                                                    |
| Info                   | Blue `#3B82F6`          | Informational findings                                           |

### Typography

- **Headings**: Premium serif or tightly-kerned sans-serif (e.g., Inter tight, Playfair Display for display headings)
- **Body**: Clean, highly-readable sans-serif (e.g., Inter, Satoshi)
- **Code/monospace**: For URLs, selectors, and technical evidence
- **Scale**: Maintain a clear type scale (2-step heading + body + small)

### Tone

- Authoritative but not arrogant
- Helpful but not alarmist
- Technical but accessible
- Transparent about limitations

## Brand Elements

- **Nexora mark**: Clean, minimal wordmark or emblem
- **SEO Analyzer badge**: Subtle indicator on reports
- **Warm gold accent**: Used sparingly for maximum impact — never overwhelmed by glow effects

## Decorative Elements

- **CinematicBackground**: Route-aware decorative background system. Full intensity on homepage (3 blur orbs + dot grid overlay), restrained on result page (2 smaller orbs), null on legal/methodology pages. All layers use `pointer-events-none` and `aria-hidden="true"`.
- **Pill header**: Fixed-position rounded-full floating navigation bar with `backdrop-blur-xl`. Scroll-aware opacity transition via state-driven class toggle. Height `h-12`, max width `max-w-4xl`, entry offset `top-3` from viewport. Mobile menu uses rounded-2xl bottom sheet.
- **Category ticker**: Pure CSS horizontal marquee showcasing 14 SEO categories in a seamless loop (duplicated content). 60s per cycle on mobile, 40s on desktop (`md:` variant). Side fade gradients prevent hard edges. Respects `prefers-reduced-motion`.

## What to Avoid

| Element                                     | Reason                                 |
| ------------------------------------------- | -------------------------------------- |
| Purple/blue AI gradients                    | Generic, overused, distracting         |
| Excessive glow/drop-shadow                  | Cheapens the premium feel              |
| Fake loading progress bars                  | Damages trust                          |
| Random component libraries mixed together   | Inconsistent UX                        |
| Overwhelming walls of warnings              | Users ignore them                      |
| Cookie-cutter Bootstrap/Material appearance | Lacks distinction                      |
| Excessive animation                         | Accessibility concerns, slow on mobile |

## Page Structure

### Landing Page

1. **Hero**: Line-by-line entrance animation (opacity + blur + light-sweep CSS keyframe). Brand-gold badge with diamond icon: "SEO Analyzer by Nexora Creation". Dual-line headline with brand-gold accent on first word. Clean URL input field with gold accent button. Descriptive subtitle below form.
2. **Trust indicators**: Recent scans count, sample score badges
3. **Feature highlights**: 3-4 key features with icons
4. **Example report**: Interactive or static preview of a real report
5. **CTA**: "Try it now — no signup required"

### Audit Progress Screen

1. **URL display**: The URL being audited
2. **Real progress**: Category-by-category completion indicators
3. **Stage labels**: "Fetching page", "Parsing HTML", "Running checks", "Calculating scores"
4. **Estimated time**: "Usually takes 5-10 seconds"

### Report Page

#### Header

- Sticky top navigation bar (not pill-shaped) on result page, pill-shaped floating header on all other pages
- Nexora logo + "SEO Analyzer" badge
- Audited URL with favicon
- Share report button
- Print report button

#### Score Section

- **Score circle**: Large circular score indicator with color (green > 80, amber > 50, red <= 50)
- **Score breakdown**: Category scores as a horizontal bar chart or compact grid
- **Confidence indicator**: Small label below score

#### Executive Summary

- 2-3 sentence generated summary
- Count of critical/high/medium/low findings
- "What to fix first" — top 3 critical issues

#### Critical Issues Section

- Expanded cards showing critical severity findings
- Each card: Finding name, evidence, remediation steps
- Color-coded severity badges

#### Quick Wins Section

- Findings with low effort and medium-to-high impact
- Encouraging tone: "These are easy to fix"

#### Detailed Categories Section

- Accordion or tabbed interface
- Each category shows: score bar, pass/warn/fail counts
- Expand to see individual findings
- Filter by status (All, Failures, Warnings, Passed, Informational)

#### Additional Features

- **SERP Preview**: Rendered preview of how the page appears in search results
- **Social Preview**: Rendered preview of social share card
- **Mobile/Desktop comparison**: Side-by-side or toggle (future phase)

#### Action Plan

- Ordered checklist of all remediation steps
- Grouped by effort
- Print-friendly version
- Download as PDF (future)

#### Footer

- "Powered by Nexora Creation"
- Link to full SEO services
- Report generation timestamp
- License attribution (SEOmator provenance)

### Site Audit Report (Additional Elements)

- **Site overview**: Pages crawled, depth, total findings
- **Issue grouping**: "This issue affects 15/25 pages"
- **Duplicate detection**: Table of duplicate titles/descriptions
- **Orphan pages**: List of pages with no internal links
- **Sitemap coverage**: Visualisation of sitemap coverage
- **Link distribution**: Visualisation of internal link counts

## Accessibility Requirements

- Minimum colour contrast ratios (WCAG AA) for all text
- Visible keyboard focus indicators (gold outline)
- All interactive elements must be keyboard-accessible
- Screen reader-friendly report structure (headings, landmarks)
- Reduced-motion media query support
- Focus management for dynamic content (report loads)
- Skip-to-content link
- ARIA labels on all interactive elements
- Semantic HTML throughout
- Touch targets minimum 44x44px

## Micro-interactions

- **URL input**: Subtle validation feedback (validating, invalid URL error)
- **Audit start**: Button transitions to progress state
- **Progress**: Smooth, honest progress — no fake loading
- **Score reveal**: Animated counter or scale-fill effect on initial display
- **Card expand**: Smooth height transition
- **Filter toggles**: Immediate visual update
- **Share**: Copy-to-clipboard with brief confirmation toast

Deliberate, not excessive. Every micro-interaction must serve a purpose.

## Responsive Behaviour

- **Desktop**: Full multi-column layout with sidebars
- **Tablet**: Two-column layout, condensed category grid
- **Mobile**: Single column, expandable sections, bottom-sheet filters, score circle displayed prominently at top
- All interactive elements must work on touch devices

## Print-Friendly Report

- Remove interactive elements
- Show all expanded findings
- Include full remediation steps
- Include license and attribution
- Use black text on white background for readability
- Include QR code or short link to live report (if applicable)

## Nexora CTA

Call-to-action must be:

- Non-blocking (report is fully visible without interacting)
- Context-aware (services relevant to the findings)
- Subtle (not aggressive sales copy)
- Placed after the user has seen their results
- Never required to view findings or remediation

Example: "Need help implementing these fixes? Nexora Creation provides hands-on SEO technical services."
