# Nexora SEO Analyzer

A premium, free, public SEO audit tool built by [Nexora Creation](https://nexora.de).

Enter a website URL and receive a detailed, evidence-based report with actionable recommendations. No signup required.

## Getting Started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Scripts

| Command          | Description                    |
| ---------------- | ------------------------------ |
| `pnpm dev`       | Start development server       |
| `pnpm build`     | Build for production           |
| `pnpm lint`      | Run ESLint                     |
| `pnpm format`    | Check formatting with Prettier |
| `pnpm typecheck` | Run TypeScript type checking   |
| `pnpm test`      | Run unit tests                 |
| `pnpm test:e2e`  | Run Playwright E2E tests       |

## Architecture

This project follows the architecture defined in `docs/project-memory/`. Phase 1 establishes the clean application foundation — no audit engine, network fetcher, or external API integrations are implemented yet.

## License

See `docs/project-memory/02-license-and-provenance-register.md`.
