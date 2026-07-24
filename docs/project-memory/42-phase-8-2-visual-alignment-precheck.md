# Phase 8.2: Visual Brand Alignment & Cinematic UI — Precheck

## Phase 8.1 Status

Phase 8.1 (frontend correction) is marked COMPLETE. The existing report (41-phase-8-1-frontend-correction-report.md) documents the corrections applied. All 935 tests passed at Phase 8.1 completion.

## Baseline Verification

| Check                       | Status   |
| --------------------------- | -------- |
| All unit tests pass         | 937/937  |
| Lint (0 errors, 0 warnings) | VERIFIED |
| Typecheck passes            | VERIFIED |
| Build passes                | VERIFIED |
| E2E tests pass              | VERIFIED |

## Inspected Visual Defects

Pre-existing visual issues identified before Phase 8.2 work:

| Defect                                | Status  |
| ------------------------------------- | ------- |
| No page-level decorative background   | MISSING |
| Traditional full-width sticky header  | PRESENT |
| Hero headline lacks brand gold accent | MISSING |
| No entrance animation sequence        | MISSING |
| No category showcase                  | MISSING |
| Section headings lack brand touches   | MISSING |
| Result page lacks brand environment   | BARE    |

## Logo Availability

- **Logo file**: `public/brand/nexora-creation-logo.svg`
- **Format**: SVG vector, scales cleanly at all sizes
- **Usage before Phase 8.2**: Present in SiteHeader (desktop + mobile `Link` + `Image`) and SiteFooter (`Image` + "SEO Analyzer" text)
- **No `.png` fallback exists** — the SVG renders correctly in all modern browsers
- **No broken image references** found via inspection

## Animation Dependency Review

| Animation              | Implementation                                     | Motion Library |
| ---------------------- | -------------------------------------------------- | -------------- |
| Entrance blur/fade     | `motion.span` with `opacity/blur`                  | `motion/react` |
| Light sweep            | CSS `@keyframes light-sweep`                       | Pure CSS       |
| Category marquee       | CSS `@keyframes marquee`                           | Pure CSS       |
| Header scroll opacity  | State-driven class toggle                          | None (React)   |
| Scroll-trigger reveals | `Reveal` component (IntersectionObserver + motion) | `motion/react` |

## Expected Files to Change

| File                                                            | Change Type |
| --------------------------------------------------------------- | ----------- |
| `src/components/layout/CinematicBackground.tsx`                 | CREATE      |
| `src/components/landing/CategoryTicker.tsx`                     | CREATE      |
| `src/components/layout/SiteHeader.tsx`                          | REWRITE     |
| `src/styles/globals.css`                                        | UPDATE      |
| `src/app/layout.tsx`                                            | UPDATE      |
| `src/app/page.tsx`                                              | UPDATE      |
| `src/app/result/page.tsx`                                       | UPDATE      |
| `src/app/__tests__/homepage.test.tsx`                           | UPDATE      |
| `src/components/landing/__tests__/category-ticker.test.tsx`     | CREATE      |
| `src/components/layout/__tests__/cinematic-background.test.tsx` | CREATE      |
| `src/components/layout/__tests__/site-header.test.tsx`          | CREATE      |
| `docs/project-memory/11-design-and-ux-direction.md`             | UPDATE      |
| `docs/project-memory/17-phase-status.md`                        | UPDATE      |
| `docs/project-memory/42-phase-8-2-visual-alignment-precheck.md` | CREATE      |
| `docs/project-memory/43-nexora-visual-language-register.md`     | CREATE      |
| `docs/project-memory/44-phase-8-2-implementation-report.md`     | CREATE      |

## Pre-implementation Risks

1. **Global cinematic background may overwhelm legal pages** — mitigated via route-aware intensity variants
2. **CSS-only marquee may cause horizontal overflow** — mitigated via `overflow-hidden` on parent
3. **`prefers-reduced-motion` may not stop `motion/react` JS animations** — mitigated by motion library's built-in reduced-motion support which skips JS-driven entrance animations
4. **No real browser available for screenshots** — visual evidence will be documented as manual observations
