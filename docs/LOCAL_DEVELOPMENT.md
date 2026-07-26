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

Rendered DOM analysis is optional and disabled by default. To test it locally, run the render worker separately and set:

```bash
RENDER_WORKER_ENABLED=true
RENDER_WORKER_URL=http://localhost:3001
RENDER_WORKER_SECRET=replace-with-local-secret
RENDER_WORKER_TIMEOUT_MS=8000
```

AI executive summaries are optional and disabled by default. With no provider keys, audits still return a deterministic evidence-bounded summary when the summary path is requested.

```bash
AI_SUMMARY_ENABLED=false
AI_SUMMARY_PROVIDER_ORDER=gemini,groq
AI_SUMMARY_TIMEOUT_MS=12000
AI_SUMMARY_MAX_INPUT_CHARS=24000
AI_SUMMARY_MAX_OUTPUT_TOKENS=1200
AI_SUMMARY_CACHE_TTL_MS=900000
AI_SUMMARY_CACHE_MAX_ENTRIES=100
AI_SUMMARY_PROVIDER_MAX_ATTEMPTS=1
```

To test provider calls locally, set `AI_SUMMARY_ENABLED=true` and configure server-only credentials such as `GEMINI_API_KEY` or `GROQ_API_KEY`. Do not use `NEXT_PUBLIC_` for AI provider secrets. Users cannot choose provider endpoints, models, prompts, or generation parameters from public requests.

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

# Render worker unit tests
pnpm test:render-worker
```

## Render Worker

The Phase 12 rendered-DOM worker is isolated under `services/render-worker/`. It exposes `GET /health` and signed `POST /render`; the Next.js app never launches Playwright inside a public API route.

```bash
cd services/render-worker
npm install
npm run build
RENDER_WORKER_SECRET=replace-with-local-secret npm start
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
- `AI_SUMMARY_ENABLED=false` by default; set to `true` only when a configured AI provider may receive minimized audit evidence packs
- `GEMINI_API_KEY` / `GROQ_API_KEY` (optional, server-only)
- `RENDER_WORKER_ENABLED=false` by default; set to `true` only when an isolated worker is deployed
- `RENDER_WORKER_URL` and `RENDER_WORKER_SECRET` for the optional Phase 12 render worker

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

- Playwright browser auditing — Phase 12
- Databases (PostgreSQL, Redis, S3/R2) — Phases 14-15
- User accounts and authentication — Phase 14
- Report persistence and sharing — Phase 14
