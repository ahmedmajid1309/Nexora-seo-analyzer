# Phase 13 Evidence Pack Contract

## Purpose

The evidence pack is the only data sent to AI providers. It is minimized, sanitized, and derived from verified audit output.

## Contents

- Audit type, request ID, final URL/origin, generated timestamp, schema version.
- Deterministic scores and confidence.
- Applied score caps by ID and reason.
- Failed and warning findings only, capped and sorted by risk.
- Finding IDs, summaries, states, severities, effort, responsible role, impact, remediation, affected URLs.
- Performance status/source/score where already available.
- Rendered DOM status and rendered finding IDs where already available.
- Site audit coverage, cross-page finding IDs, selected rendered pages, highest-risk/strongest/weakest page lists.

## Exclusions

- Raw HTML snapshots.
- Full rendered DOM snapshots.
- Provider credentials.
- User-controllable provider settings.
- Any unverified finding, score, or remediation.

## Grounding Rules

Provider output is accepted only if every priority and evidence reference cites known evidence IDs and known affected URLs. State, severity, effort, and responsible role may not be changed by the provider.
