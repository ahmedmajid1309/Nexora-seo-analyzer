# Phase 13 Privacy And Provider Disclosure

## Default Privacy State

AI summaries are disabled by default. Deterministic summaries work without external AI providers.

## Provider Data

When enabled, Gemini or Groq receives only the minimized evidence pack. Raw HTML and rendered DOM snapshots are not sent for summary generation.

## Secret Handling

Provider keys are server-only environment variables. No provider key is exposed through public request bodies, public responses, or `NEXT_PUBLIC_` variables.

## User Disclosure

The privacy page discloses optional AI provider use and states that AI summaries do not alter deterministic scores or findings.
