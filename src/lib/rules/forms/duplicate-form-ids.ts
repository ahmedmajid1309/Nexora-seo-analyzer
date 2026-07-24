import type { RuleDefinition, Provenance } from "../types";
import type { PageSnapshot } from "@/lib/extraction/types";
import { passed, failed, notApplicable } from "../helpers/result";
import { hasForms } from "../helpers/evidence";

const provenance: Provenance = {
  upstreamRuleId: "FORM-005",
  upstreamSourcePath: "src/rules/forms/duplicate-form-ids.ts",
  upstreamCommitHash: "bbca017b56086a2959382d8260b97021736ca18f",
  disposition: "PORT_AS_IS",
};

export const duplicateFormIdsRule: RuleDefinition = {
  id: "FORM-005",
  name: "Duplicate form input IDs",
  description:
    "Checks for duplicate ID values across form input elements, which cause label association issues.",
  category: "forms",
  executionMode: "static",
  defaultSeverity: "high",
  defaultImpact:
    "Duplicate input IDs break label-element associations and aria-labelledby references for form controls.",
  defaultEffort: "low",
  scored: true,
  provenance,
  signalOwner: "forms",
  ruleVersion: 1,
  evaluator: (snapshot: PageSnapshot) => {
    if (!hasForms(snapshot)) {
      return notApplicable(
        "FORM-005",
        "No forms found on page",
        "forms",
        "No form elements present in document",
      );
    }

    const idCounts = new Map<string, number>();

    for (const form of snapshot.forms.forms) {
      for (const input of form.inputs) {
        if (input.id) {
          idCounts.set(input.id, (idCounts.get(input.id) ?? 0) + 1);
        }
      }
    }

    const duplicateIds = Array.from(idCounts.entries())
      .filter(([, count]) => count > 1)
      .map(([id]) => id);

    if (duplicateIds.length === 0) {
      return passed("FORM-005", "No duplicate form input IDs found", 0, "forms", 0, {
        severity: "low",
        impact: "All form input IDs are unique, ensuring correct label associations.",
        effort: "low",
        source: "html-parse",
        responsible: "developer",
      });
    }

    return failed(
      "FORM-005",
      `${duplicateIds.length} duplicate form input ID(s) found`,
      duplicateIds.length,
      "forms",
      0,
      {
        severity: "high",
        impact:
          "Duplicate input IDs break label-element associations and can cause form submission issues.",
        effort: "low",
        source: "html-parse",
        responsible: "developer",
        samples: duplicateIds.slice(0, 5),
      },
    );
  },
};
