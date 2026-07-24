import type { RuleDefinition, Provenance } from "../types";
import type { PageSnapshot } from "@/lib/extraction/types";
import { passed, warning } from "../helpers/result";

const provenance: Provenance = {
  upstreamRuleId: "A11Y-009",
  upstreamSourcePath: "src/rules/accessibility/tabindex-values.ts",
  upstreamCommitHash: "bbca017b56086a2959382d8260b97021736ca18f",
  disposition: "PORT_AS_IS",
};

export const tabindexValuesRule: RuleDefinition = {
  id: "A11Y-009",
  name: "Tabindex values",
  description:
    "Checks for positive tabindex values which are considered bad practice as they disrupt natural tab order.",
  category: "accessibility",
  executionMode: "static",
  defaultSeverity: "medium",
  defaultImpact:
    "Positive tabindex values create an unnatural focus order that can confuse keyboard and screen reader users.",
  defaultEffort: "low",
  scored: true,
  provenance,
  signalOwner: "accessibility",
  ruleVersion: 1,
  evaluator: (snapshot: PageSnapshot) => {
    const tabindexValues = snapshot.accessibility.tabindexValues;
    const positiveValues = tabindexValues.filter((t) => t.value > 0);

    if (positiveValues.length === 0) {
      return passed("A11Y-009", "No positive tabindex values found", 0, "accessibility", 0, {
        severity: "low",
        impact: "Natural tab order is preserved.",
        effort: "low",
        source: "html-parse",
        responsible: "developer",
      });
    }

    return warning(
      "A11Y-009",
      `${positiveValues.length} element(s) have positive tabindex values`,
      positiveValues.length,
      "accessibility",
      0,
      {
        severity: "medium",
        impact:
          "Positive tabindex values override natural focus order and can cause navigation confusion.",
        effort: "low",
        source: "html-parse",
        responsible: "developer",
        samples: positiveValues.slice(0, 3).map((t) => `tabindex=${t.value}`),
      },
    );
  },
};
