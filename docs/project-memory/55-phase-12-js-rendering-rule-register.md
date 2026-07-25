# Phase 12 JavaScript Rendering Rule Register

All Phase 12 JS rendering checks are diagnostic and non-scoring.

| ID     | Check                                                | Threshold / Trigger                                         | Severity      |
| ------ | ---------------------------------------------------- | ----------------------------------------------------------- | ------------- |
| JS-001 | Title appears only after JavaScript rendering        | static title missing and rendered title present             | medium        |
| JS-002 | Rendered title differs materially from static title  | word-set difference ratio >= 0.35                           | medium        |
| JS-003 | Meta description appears or changes after rendering  | normalized static and rendered descriptions differ          | medium        |
| JS-004 | Canonical appears or changes after rendering         | normalized static and rendered canonicals differ            | high          |
| JS-005 | Meta robots or indexability changes after rendering  | normalized robots directives differ                         | high          |
| JS-006 | Primary H1 appears, disappears or materially changes | normalized primary H1 material difference ratio >= 0.35     | medium        |
| JS-007 | Substantial rendered-content difference              | static vs rendered meaningful text delta >= 30%             | medium        |
| JS-008 | Substantial internal-link count difference           | static vs rendered internal-link delta >= 50%               | medium        |
| JS-009 | Structured data is injected only after rendering     | static JSON-LD count is 0 and rendered count > 0            | low           |
| JS-010 | Rendered page is blank or nearly blank               | rendered meaningful text length < 80                        | high          |
| JS-011 | Significant browser console errors                   | console error count >= 3                                    | low           |
| JS-012 | Important resources fail during rendering            | failed resource count >= 3                                  | low           |
| JS-013 | Client-side redirect changes final URL               | normalized static final URL differs from rendered final URL | medium        |
| JS-014 | Rendered DOM analysis unavailable                    | worker disabled, unavailable, errored, or circuit-open      | informational |

Every finding includes state, severity, summary, evidence, impact, remediation, responsible role, effort, confidence, applicability, and static/rendered evidence values.
