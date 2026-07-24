# Rule Porting Policy

## Porting Gate Process

Every upstream rule must pass a 12-gate verification process before it may be enabled in the Nexora registry.

### Gate 1: Existence Confirmation

- Confirm the rule exists in the upstream registry
- Confirm the rule's source file exists on disk
- Record the exact upstream commit hash

### Gate 2: Provenance Recording

- Record upstream rule ID
- Record upstream source path (e.g., `src/rules/core/title-present.ts`)
- Record upstream commit hash
- Assign Nexora check ID
- Create provenance record in ported module directory

### Gate 3: Evidence Audit

- Read the rule's `run()` function
- Identify every property of `AuditContext` the rule uses
- Identify every DOM selector, header name, or response property inspected
- Document the full evidence chain

### Gate 4: Page-Type Mapping

- Determine which page types the rule applies to:
  - Any HTML page
  - Homepage only
  - Article/content pages only
  - Product pages only
  - Local business pages only
  - Non-homepage pages only
  - Multi-language pages only
  - Pages with specific schema types

### Gate 5: False-Positive Review

- Identify scenarios where the rule would produce an incorrect result
- Document known false-positive patterns from upstream issues or community reports
- Add adversarial test fixtures for each identified pattern

### Gate 6: Applicability Mapping

- Define when the rule returns `passed`, `warning`, `failed`, `not-applicable`, or `unavailable`
- Document the conditions for each state
- Define default applicability when conditions cannot be determined

### Gate 7: Scored Determination

- Decide whether the rule contributes to the score
- If scored, assign severity (critical, high, medium, low, informational)
- Informational rules do not affect scores but appear in reports
- Document rationale for scored vs. informational classification

### Gate 8: Threshold Review

- Review upstream thresholds (character counts, pixel widths, time limits, ratios)
- Replace rigid thresholds with configurable values where appropriate
- Document threshold sources and rationale
- Ensure thresholds are clearly communicated in evidence output

### Gate 9: Evidence Output Definition

- Define the Nexora check's evidence output structure:
  - `observedValue`: what was actually found
  - `expectedValue`: what was expected
  - `selector`: CSS selector or XPath to the relevant element (if applicable)
  - `samples`: up to 3 example values (for aggregate checks)
  - `remediation`: ordered steps to fix

### Gate 10: Fixture and Test Creation

- Create representative HTML fixtures that exercise the rule
- Create edge-case fixtures (empty, malformed, adversarial)
- Create pass/warn/fail/not-applicable test cases
- Tests must not depend on live internet access

### Gate 11: Network Safety Review

- Verify the ported rule performs no unsafe network access
- The rule should only operate on data already present in the audit context
- If the rule requires network access, it must go through the SSRF-hardened fetcher
- Document any external URL patterns the rule accesses

### Gate 12: Approval

- Review all previous gates
- Confirm tests pass
- Mark `review_status: APPROVED` in provenance record
- Only APPROVED rules may be enabled in production

## Porting Dispositions

When an upstream rule passes the gates, assign one of:

| Disposition             | Meaning                                                                                  |
| ----------------------- | ---------------------------------------------------------------------------------------- |
| PORT_AS_IS              | Exact port with same thresholds and logic (rare — mostly for simple presence checks)     |
| PORT_WITH_MODIFICATIONS | Port with changed thresholds, evidence output, or applicability. Document modifications. |
| USE_AS_REFERENCE        | Implement a different approach informed by the upstream design                           |
| REWRITE                 | Upstream approach unsuitable; build from scratch                                         |
| SKIP                    | Rule not ported. Document why.                                                           |
| FUTURE                  | Rule deferred. Document preconditions.                                                   |

## Rule Naming Convention

```
nexora-<category>-<descriptive-name>
```

Examples:

- `nexora-core-title-present`
- `nexora-images-alt-present`
- `nexora-security-hsts`

This naming prevents confusion with upstream rule IDs and makes the source category immediately clear.

## Evidence Output Standard

Every Nexora check must produce evidence output that includes:

```typescript
interface CheckEvidence {
  observedValue: string | number | boolean | null;
  expectedValue: string | number | boolean | null;
  selector?: string; // CSS selector targeting relevant element
  samples?: string[]; // Up to 3 examples for aggregate findings
  remediation: string[]; // Ordered, actionable steps
  developerNotes?: string; // Technical implementation notes
  contentNotes?: string; // Content/writing guidance
  responsible?: "developer" | "content" | "both";
}
```

## Threshold Configuration

Thresholds must be defined in a central configuration object, not hard-coded in rule implementations. The configuration must include:

- The threshold value
- The unit (characters, pixels, milliseconds, bytes, ratio)
- The source of the threshold (Google documentation, WCAG standard, industry best practice, advisory)
- A human-readable explanation

## Prohibited Practices

- No rule may perform direct `fetch()` calls outside the SSRF-hardened HTTP client
- No rule may access `process.env` or other platform APIs directly
- No rule may depend on better-sqlite3 or other native addons
- No rule may import from the upstream @seomator/seo-audit package
- No rule may fabricate or hallucinate findings
- No rule may predict rankings or guaranteed search visibility
- No rule may claim guaranteed AI visibility
