# Session Handoff Protocol

## Purpose

Ensure every new OpenCode session begins with the full context needed to work correctly on the current phase, without repeating decisions or rediscovering architecture.

## Start of Session Checklist

Every new session must read these files in order:

1. **`00-permanent-project-goal.md`** — Re-establish the permanent mission and core values
2. **`17-phase-status.md`** — Identify the current phase and its status
3. **`15-decision-log.md`** — Review all decisions made so far
4. **`16-risk-register.md`** — Review open risks relevant to the current phase
5. **`14-phase-roadmap.md`** — Review the current phase entry criteria, deliverables, and exit criteria

Additionally, read files relevant to the specific phase:

| Phase | Additional Files to Read                                                                         |
| ----- | ------------------------------------------------------------------------------------------------ |
| 0     | All files (this phase establishes them)                                                          |
| 1     | 04-product-architecture.md (directory structure expectations)                                    |
| 2     | 09-security-contract.md (mandatory controls to implement)                                        |
| 3     | 05-audit-category-blueprint.md (extraction requirements)                                         |
| 4     | 03-upstream-adoption-policy.md, 06-rule-porting-policy.md, 02-license-and-provenance-register.md |
| 5     | 07-applicability-model.md, 08-scoring-and-confidence-model.md                                    |
| 6     | 04-product-architecture.md (API route design)                                                    |
| 7     | 12-api-provider-policy.md                                                                        |
| 8     | 10-result-contract.md, 11-design-and-ux-direction.md                                             |
| 9     | 05-audit-category-blueprint.md (cross-page requirements)                                         |
| 10    | 09-security-contract.md (Playwright isolation)                                                   |
| 11    | 12-api-provider-policy.md                                                                        |
| 12    | 09-security-contract.md (rate limiting)                                                          |
| 13    | 11-design-and-ux-direction.md                                                                    |
| 14    | 09-security-contract.md, 13-testing-strategy.md                                                  |

## End of Session Checklist

At the end of every session:

1. **Update `17-phase-status.md`** — Mark deliverables as CREATED, COMPLETED, or IN PROGRESS
2. **Update `15-decision-log.md`** — Add any new decisions made during the session
3. **Update `16-risk-register.md`** — Add any new risks identified; update status of mitigated risks
4. **Run tests** — Verify the current phase's exit criteria are met
5. **Update `19-phase-0-validation-report.md`** if in Phase 0

## Session Boundaries

- No session may begin work on a later phase while the current phase has failed tests
- No session may modify files outside the scope of the current phase without explicit approval
- No session may create application source code during Phase 0
- No session may add dependencies without updating the license register
- No session may start a phase without reading the handoff protocol (this file)

## Communication Template

When handing off, the session should record:

```
## Session Handoff: YYYY-MM-DD

### Phase: <number>

### Work completed
- <item>

### Decisions made
- <reference to decision log>

### Risks identified
- <reference to risk register>

### Tests status
- <pass/fail counts, any failures>

### Next session should
1. <read files>
2. <start with>
3. <verify>

### Blockers
- <any blockers>
```
