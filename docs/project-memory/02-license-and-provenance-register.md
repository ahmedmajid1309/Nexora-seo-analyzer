# License and Provenance Register

## Upstream Repository

| Field           | Value                                         |
| --------------- | --------------------------------------------- |
| Repository      | https://github.com/seo-skills/seo-audit-skill |
| Package         | @seomator/seo-audit                           |
| License         | MIT                                           |
| Copyright       | Copyright (c) 2024-present SEOmator           |
| Verified commit | bbca017b56086a2959382d8260b97021736ca18f      |
| Adoption method | SELECTIVE_RULE_PORTING                        |

## License Obligations

The MIT license permits use, modification, and integration into closed-source or commercial products provided the original copyright notice is preserved.

Nexora must include the following notice in its legal notices or license register:

```
This product contains code ported from SEOmator (https://github.com/seo-skills/seo-audit-skill),
Copyright (c) 2024-present SEOmator. Licensed under the MIT License.
```

## Third-Party Dependency License Tracking

All dependencies used by Nexora (both direct and transitive) must be tracked in a `docs/legal/THIRD_PARTY_LICENSES.md` file once dependencies are added.

## Disposition Definitions

| Disposition             | Meaning                                                                                                      |
| ----------------------- | ------------------------------------------------------------------------------------------------------------ |
| PORT_AS_IS              | Rule logic ported without meaningful change. Copyright notice required.                                      |
| PORT_WITH_MODIFICATIONS | Rule logic ported with changes to thresholds, evidence output, or applicability. Changes must be documented. |
| USE_AS_REFERENCE        | Upstream implementation studied but not directly ported. Nexora builds a custom implementation.              |
| REWRITE                 | Upstream approach is inappropriate. Full Nexora reimplementation.                                            |

## Phase 4 Rule Provenance Summary

| Category        | Total Rules | REWRITE | USE_AS_REFERENCE | PORT_AS_IS | PORT_WITH_MODIFICATIONS |
| --------------- | ----------- | ------- | ---------------- | ---------- | ----------------------- |
| metadata        | 14          | 5       | 9                | 0          | 0                       |
| headings        | 8           | 7       | 1                | 0          | 0                       |
| url             | 10          | 10      | 0                | 0          | 0                       |
| links           | 8           | 8       | 0                | 0          | 0                       |
| images          | 8           | 8       | 0                | 0          | 0                       |
| structured-data | 6           | 1       | 5                | 0          | 0                       |
| social          | 6           | 1       | 5                | 0          | 0                       |
| content         | 7           | 1       | 6                | 0          | 0                       |
| accessibility   | 13          | 2       | 11               | 0          | 0                       |
| forms           | 5           | 1       | 4                | 0          | 0                       |
| **Total**       | **85**      | **44**  | **41**           | **0**      | **0**                   |

### Provenance Record Template

Every Nexora rule module carries an inline `Provenance` object. The template for **REWRITE** (Nexora-original) rules:

```typescript
const provenance: Provenance = {
  upstreamRuleId: "not applicable",
  upstreamSourcePath: "not applicable",
  upstreamCommitHash: "not applicable",
  disposition: "REWRITE",
};
```

The template for **USE_AS_REFERENCE** rules:

```typescript
const provenance: Provenance = {
  upstreamRuleId: "<upstream-rule-id>",
  upstreamSourcePath: "<relative-source-path>",
  upstreamCommitHash: "bbca017b56086a2959382d8260b97021736ca18f",
  disposition: "USE_AS_REFERENCE",
};
```

## Automated Verification

Provenance compliance is verified by `src/lib/rules/__tests__/provenance.test.ts`. The test suite confirms:

- Every registered rule has a provenance record
- Every provenance check ID exists in the registry
- No duplicate provenance records exist
- No fake upstream paths are accepted
- REWRITE rules have not-applicable upstream fields
- Ported/adapted rules have valid upstream references
- All dispositions are valid values
