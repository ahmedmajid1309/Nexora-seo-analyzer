# Local Development

## Prerequisites

- Node.js 20+
- pnpm

## Setup

```bash
pnpm install
```

## Environment

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

The default `NEXT_PUBLIC_SITE_URL=http://localhost:3000` works for local development. No external API keys are required.

## Development

```bash
pnpm dev
```

## Testing

```bash
# Unit tests
pnpm test

# Unit tests (watch mode)
pnpm test:watch

# E2E tests (requires dev server)
pnpm test:e2e
```

## Quality Checks

```bash
pnpm lint      # ESLint
pnpm format    # Prettier check
pnpm typecheck # TypeScript
pnpm test      # Unit tests
pnpm build     # Production build
```

## Project Structure

```
src/
  app/            Next.js App Router pages
  components/
    ui/           Reusable UI components
    layout/       Layout components (header, footer)
    landing/      Landing page components
  config/         Environment validation
  contracts/      Shared domain contracts (Zod schemas)
  lib/
    errors/       Error architecture
    utils/        Utility functions
  styles/         Global styles
  test/           Test setup
docs/
  project-memory/ Phase documentation
e2e/              Playwright E2E tests
```

## Design Tokens

Custom colors defined in `src/styles/globals.css`:

- `bg-primary`: Near-black `#0D0D0D`
- `bg-secondary`: Charcoal `#1A1A1A`
- `bg-tertiary`: Dark grey `#2A2A2A`
- `brand`: Warm gold `#E5B13A`
- `brand-hover`: Brighter gold `#F0C44A`
- `text-primary`: White `#FFFFFF`
- `text-secondary`: Off-white `#CCCCCC`
- `text-tertiary`: Grey `#888888`
- `success`: Green `#22C55E`
- `warning`: Amber `#F59E0B`
- `critical`: Red `#EF4444`
- `info`: Blue `#3B82F6`

## Deployment

### Vercel

```bash
# Build and deploy
vercel build
vercel deploy --prod
```

Required environment variables:

- `NEXT_PUBLIC_SITE_URL` — Production URL (e.g., `https://nexora-seo-analyzer.vercel.app`)
- `NODE_ENV=production`
- `PAGESPEED_API_KEY` (optional — enables CrUX/field data)

### Docker

```bash
# Build
docker build -t nexora-seo-analyzer .

# Run
docker run -p 3000:3000 -e NODE_ENV=production nexora-seo-analyzer
```

## Production Verification

The first release (Phases 1-10) is verified ready. See `docs/project-memory/40-first-release-readiness-report.md`.

## What Is Not Implemented (Post-Launch)

The following features are excluded from the first release and will be built in later phases:

- AI summaries (Gemini/Groq) — Phase 13
- Playwright browser auditing — Phase 12
- Databases (PostgreSQL, Redis, S3/R2) — Phases 14-15
- User accounts and authentication — Phase 14
- Report persistence and sharing — Phase 14
