# Nexora Visual Language Register

## Approved Colors (from `globals.css`)

| Token                    | Value                   | Usage                                   |
| ------------------------ | ----------------------- | --------------------------------------- |
| `--color-bg-primary`     | `#0D0D0D`               | Page background, card backgrounds       |
| `--color-bg-card`        | `#141414`               | Standard card surfaces                  |
| `--color-bg-elevated`    | `#191919`               | Elevated card surfaces                  |
| `--color-bg-hover`       | `#202020`               | Hover/active/interactive surfaces       |
| `--color-bg-secondary`   | `#1A1A1A`               | Secondary surfaces                      |
| `--color-bg-tertiary`    | `#2A2A2A`               | Hover states, subtle borders            |
| `--color-brand`          | `#F4CA57`               | Exclusive brand gold — CTAs, highlights |
| `--color-brand-hover`    | `#F8D97A`               | Brand interaction state                 |
| `--color-brand-muted`    | `rgba(244,202,87,0.12)` | Subtle brand backgrounds                |
| `--color-text-primary`   | `#FFFFFF`               | Headings, primary text                  |
| `--color-text-secondary` | `#CCCCCC`               | Body text, descriptions                 |
| `--color-text-tertiary`  | `#888888`               | Metadata, secondary information         |
| `--color-success`        | `#22C55E`               | Passed checks                           |
| `--color-warning`        | `#E99A35`               | Warning states (distinct from gold)     |
| `--color-critical`       | `#EF4444`               | Failed checks                           |
| `--color-info`           | `#3B82F6`               | Informational findings                  |

## Typography

| Role      | Font Family   | CSS Variable     |
| --------- | ------------- | ---------------- |
| Display   | Space Grotesk | `--font-display` |
| Body      | Manrope       | `--font-body`    |
| Monospace | Geist Mono    | `--font-mono`    |

All fonts loaded server-side via `next/font/google` with `display: swap`.

## Surface Hierarchy

| Level    | Background                               | Border                   | Usage                    |
| -------- | ---------------------------------------- | ------------------------ | ------------------------ |
| Ground   | `#0D0D0D`                                | —                        | Page background          |
| Card     | `#141414`                                | `#27272A` (zinc-800)     | Standard cards           |
| Elevated | `#191919`                                | `#27272A`                | Modal headers, nav bars  |
| Hover    | `#202020`                                | —                        | Interactive hover states |
| Pill     | `rgba(13,13,13,0.6-0.8)` + backdrop-blur | `rgba(255,255,255,0.08)` | Floating header          |

## Logo Rules

- **Asset**: `public/brand/nexora-creation-logo.svg` (SVG vector)
- **Alt text**: Always `"Nexora Creation"`
- **Link target**: Always `/`
- **Dimensions**: `h-5 w-auto` (header), `h-6 w-auto` (footer), via Next.js `Image` with `object-fit: contain`
- **Secondary label**: `"SEO Analyzer"` appears next to logo with a vertical divider, always present and preserved
- **No `.png` fallback** — SVG is the sole logo format
- **No text-only brand block** remains — logo is always rendered via `next/image`

## Header Treatment

| Aspect        | Specification                                                |
| ------------- | ------------------------------------------------------------ |
| Position      | `fixed`, centered horizontally (`flex justify-center`)       |
| Shape         | Rounded-full pill (`rounded-full`)                           |
| Width         | `max-w-4xl w-full`                                           |
| Height        | `h-12`                                                       |
| Background    | `bg-bg-primary/60` → `/80` on scroll + `backdrop-blur`       |
| Border        | `border border-zinc-800/40` → `border-zinc-700/60` on scroll |
| Shadow        | `shadow-lg shadow-black/20` on scroll                        |
| Entry offset  | `top-3` from viewport                                        |
| Scroll detent | 60px threshold                                               |
| Mobile menu   | Rounded-2xl sheet below pill, backdrop-blur                  |
| Nav links     | Inline pills with `hover:bg-white/5`                         |
| CTA           | `bg-brand` filled pill, `rounded-full`                       |

## Cinematic Background Layers

### Homepage (full intensity)

| Layer | Position               | Style                                              |
| ----- | ---------------------- | -------------------------------------------------- |
| Orb 1 | `-left-32 -top-32`     | `h-[500px] w-[500px] bg-brand/5 blur-[120px]`      |
| Orb 2 | `-right-32 bottom-1/3` | `h-[400px] w-[400px] bg-brand/3 blur-[100px]`      |
| Orb 3 | `left-1/3 top-1/4`     | `h-[600px] w-[600px] bg-white/[0.02] blur-[150px]` |
| Grid  | Full inset             | `opacity-[0.015]` 60px dot grid                    |

### Result page (restrained intensity)

| Layer | Position               | Style                                        |
| ----- | ---------------------- | -------------------------------------------- |
| Orb 1 | `-left-32 -top-32`     | `h-[300px] w-[300px] bg-brand/5 blur-[80px]` |
| Orb 2 | `-right-32 bottom-1/3` | `h-[300px] w-[300px] bg-brand/3 blur-[80px]` |

### Legal/methodology pages (minimal)

Returns `null` — no decorative layers.

### Implementation

- Route detection via `usePathname()` in `CinematicBackground.tsx`
- `pointer-events-none` on all layers
- `aria-hidden="true"` on wrapper

## Animation Names and Durations

| Name               | Type   | Duration                    | Trigger   | Affected Elements               |
| ------------------ | ------ | --------------------------- | --------- | ------------------------------- |
| `marquee`          | CSS    | 60s (mobile), 40s (desktop) | Auto      | Category ticker                 |
| `light-sweep`      | CSS    | 2.5s                        | Page load | Hero headline spans             |
| Entrance blur/fade | motion | 0.5-0.6s                    | Page load | Hero headline, badge, form, CTA |

## Ticker Behavior

| Property        | Value                                               |
| --------------- | --------------------------------------------------- |
| Animation       | `marquee`: translate from 0 to -50%                 |
| Mobile speed    | 60s per cycle                                       |
| Desktop speed   | 40s per cycle (768px+)                              |
| Reduced motion  | `animation: none` (CSS + Tailwind `motion-reduce:`) |
| Screen reader   | Wrapper `aria-hidden="true"` + `.sr-only` `<ul>`    |
| Side fade       | `bg-gradient-to-r/l from-bg-primary to-transparent` |
| Overflow        | Parent `overflow-hidden`                            |
| Duplicate count | 2x (28 visible items, 14 unique)                    |

## Homepage vs Result-page Intensity

| Aspect                | Homepage             | Result Page                          | Legal/Methodology |
| --------------------- | -------------------- | ------------------------------------ | ----------------- |
| Background orbs       | Full (3 orbs + grid) | Restrained (2 smaller orbs, no grid) | None              |
| Light-sweep animation | Yes                  | No                                   | No                |
| Category ticker       | Yes                  | No                                   | No                |
| Entrance blur/fade    | Yes                  | No (spinner only)                    | No                |
| Header style          | Pill                 | Sticky nav bar                       | Pill              |

## Mobile Reductions

- Marquee speed: 60s (vs 40s desktop) — slower for readability
- Pill header height: `h-12` compact on all sizes
- Mobile nav: rounded-2xl sheet, full-width within viewport
- All animations respect `prefers-reduced-motion`
- No horizontal overflow on any tested breakpoint (320px–2560px)

## Reduced-Motion Behavior (`prefers-reduced-motion: reduce`)

| Element            | Behavior                               |
| ------------------ | -------------------------------------- |
| Header pill        | Static background, no transition       |
| Marquee            | Stopped (`animation: none`)            |
| Light-sweep        | Stopped (`animation-duration: 0.01ms`) |
| Entrance blur/fade | `motion/react` skips all JS animations |
| Decorative orbs    | Static (CSS only, no motion)           |
| Section reveals    | `motion/react` skips all reveals       |
| Content visibility | All content immediately visible        |
| Category list      | Static fallback via `.sr-only` `<ul>`  |
| Scroll behavior    | `scroll-behavior: auto`                |

## Prohibited Visual Patterns

| Pattern                               | Reason                         |
| ------------------------------------- | ------------------------------ |
| Purple/blue AI gradients              | Generic, overused, distracting |
| Excessive glow/drop-shadow            | Cheapens the premium feel      |
| Moving particles or floating elements | Accessibility concern          |
| Strong glowing orbs behind text       | Reduces readability            |
| Auto-playing animations               | User control violation         |
| Layout shift on load                  | Poor UX, CLS impact            |
| Text-only brand block                 | Lost brand identity            |
| Fake progress indicators              | Damages trust                  |
| Cookie-cutter Bootstrap/Material      | Lacks distinction              |
