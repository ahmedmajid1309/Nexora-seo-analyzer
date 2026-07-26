# Phase 13 Prompt Injection Security

## Threat

Audited pages may contain text attempting to override model instructions, reveal prompts, change scores, invent passed findings, or exfiltrate secrets.

## Controls

- Page-derived strings are sanitized before evidence packing.
- Prompt explicitly labels all evidence as untrusted data.
- Provider output must be strict JSON.
- Provider output is grounded against deterministic evidence IDs and affected URLs.
- Provider output containing ranking guarantees is rejected.
- Provider output cannot change deterministic scores, states, severities, confidence, or remediation.
- Public users cannot select provider endpoints, prompts, models, or generation parameters.
- Provider secrets are server-only and never use `NEXT_PUBLIC_`.

## Failure Mode

Any provider validation failure falls back to the deterministic local summary. The audit itself remains successful when the deterministic audit completed.
