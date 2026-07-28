# Phase 13 Summary Output Contract

## Public Field

Quick and site responses may include optional `executiveSummary`.

## Summary Fields

- `status`: available, deterministic, disabled, unavailable, timed-out, or failed.
- `source`: gemini, groq, or deterministic.
- `model`: provider model or null.
- `generatedAt` and `disclaimer`.
- `headline`, `executiveSummary`, and `businessImpact`.
- `topPriorities` and `quickWins` with ranks, evidence IDs, affected URLs, state, severity, effort, and responsible role.
- `strengths`, `risks`, and `recommendedSequence`.
- `evidenceReferences` and `warnings`.
- `providerAttempt` with fallback metadata.

## Site Progress

Site responses may include `aiSummaryProgress` events for evidence preparation, provider request/validation, fallback, and completion.

## Invariants

Scores, findings, finding states, state counts, severities, effort, responsible roles, confidence, remediation, rendered DOM diagnostics, and site aggregate data remain unchanged by summary generation.
