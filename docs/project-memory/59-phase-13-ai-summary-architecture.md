# Phase 13 AI Summary Architecture

## Architecture

AI summaries are a post-audit side channel. The deterministic audit finishes first, public response data is built, and only then does `src/lib/ai-summary` build a minimized evidence pack and generate an optional executive summary.

## Runtime Flow

1. Build deterministic quick or site audit result.
2. Build sanitized evidence pack from verified public audit data.
3. Return deterministic fallback immediately when AI is disabled or provider calls cannot be used.
4. When enabled, call providers in configured order: Gemini, then Groq fallback.
5. Parse strict JSON and ground every priority/reference against known evidence IDs and affected URLs.
6. Discard provider output wholesale if validation or grounding fails.

## Modules

- `types.ts`: public summary and evidence contracts.
- `evidence-pack.ts`: quick/site evidence pack builders.
- `deterministic-summary.ts`: local fallback summary.
- `prompt.ts`: evidence-bounded prompt envelope.
- `gemini-client.ts` and `groq-client.ts`: server-only provider clients.
- `schemas.ts`: strict provider JSON parsing and grounding.
- `orchestrator.ts`: cache, provider order, fallback, progress events.
- `cache.ts` and `circuit-breaker.ts`: bounded in-memory operational guards.
- `sanitization.ts`: untrusted text and URL cleanup.

## Scoring Boundary

The summary module reads scores and findings after calculation. It does not receive rule internals that would allow recalculation and it never mutates `findings`, `scoreFamilies`, `aggregate`, confidence, severities, or remediation.
