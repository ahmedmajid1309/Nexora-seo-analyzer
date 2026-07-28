# Phase 13 Provider Fallback Spec

## Provider Order

Default order is `gemini,groq` through `AI_SUMMARY_PROVIDER_ORDER`.

## Disabled Mode

`AI_SUMMARY_ENABLED=false` by default. Disabled mode returns a deterministic evidence-bounded summary and does not call Gemini or Groq.

## Fallback Cases

- Missing provider key.
- Circuit open.
- Timeout.
- Non-2xx provider response.
- Empty provider response.
- Invalid JSON.
- Failed schema validation.
- Failed grounding against evidence.

## Operational Guards

- `AI_SUMMARY_TIMEOUT_MS` bounds provider latency.
- `AI_SUMMARY_MAX_INPUT_CHARS` bounds evidence size.
- `AI_SUMMARY_MAX_OUTPUT_TOKENS` bounds provider output.
- `AI_SUMMARY_CACHE_TTL_MS` enables short in-memory response reuse.
- `AI_SUMMARY_CACHE_MAX_ENTRIES` bounds in-memory cache entries.
- `AI_SUMMARY_PROVIDER_MAX_ATTEMPTS` bounds provider attempts; default is one attempt per provider.
- Circuit breaker opens after repeated provider failures.
