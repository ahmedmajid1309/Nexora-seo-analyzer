import type { RuleDefinition, Provenance } from "../types";
import type { PageSnapshot } from "@/lib/extraction/types";
import { passed, failed } from "../helpers/result";

const provenance: Provenance = {
  upstreamRuleId: "A11Y-006",
  upstreamSourcePath: "src/rules/accessibility/duplicate-ids.ts",
  upstreamCommitHash: "bbca017b56086a2959382d8260b97021736ca18f",
  disposition: "PORT_AS_IS",
};

export const duplicateIdsRule: RuleDefinition = {
  id: "A11Y-006",
  name: "Duplicate ID values",
  description:
    "Checks for duplicate ID attribute values across the document, which violate HTML spec and cause accessibility issues.",
  category: "accessibility",
  executionMode: "static",
  defaultSeverity: "high",
  defaultImpact:
    "Duplicate IDs break label-element associations, aria-labelledby references, and DOM query selectors.",
  defaultEffort: "low",
  scored: true,
  provenance,
  signalOwner: "accessibility",
  ruleVersion: 1,
  evaluator: (snapshot: PageSnapshot) => {
    const duplicateIds = snapshot.accessibility.duplicateIds;

    if (duplicateIds.length === 0) {
      return passed("A11Y-006", "No duplicate ID values found", 0, "accessibility", 0, {
        severity: "low",
        impact: "All ID values are unique across the document.",
        effort: "low",
        source: "html-parse",
        responsible: "developer",
      });
    }

    return failed(
      "A11Y-006",
      `${duplicateIds.length} duplicate ID value(s) found`,
      duplicateIds.length,
      "accessibility",
      0,
      {
        severity: "high",
        impact:
          "Duplicate IDs can cause assistive technology to reference the wrong element and violate HTML validation.",
        effort: "low",
        source: "html-parse",
        responsible: "developer",
        samples: duplicateIds.slice(0, 5),
      },
    );
  },
};
