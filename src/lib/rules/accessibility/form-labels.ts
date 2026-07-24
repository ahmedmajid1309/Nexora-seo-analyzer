import type { RuleDefinition, Provenance } from "../types";
import type { PageSnapshot } from "@/lib/extraction/types";
import { passed, failed } from "../helpers/result";

const provenance: Provenance = {
  upstreamRuleId: "A11Y-003",
  upstreamSourcePath: "src/rules/accessibility/form-labels.ts",
  upstreamCommitHash: "bbca017b56086a2959382d8260b97021736ca18f",
  disposition: "PORT_AS_IS",
};

export const formLabelsRule: RuleDefinition = {
  id: "A11Y-003",
  name: "Form input labels",
  description: "Checks that form inputs have associated label elements.",
  category: "accessibility",
  executionMode: "static",
  defaultSeverity: "high",
  defaultImpact:
    "Form controls without labels are inaccessible to screen reader users and reduce form usability for everyone.",
  defaultEffort: "low",
  scored: true,
  provenance,
  signalOwner: "accessibility",
  ruleVersion: 1,
  evaluator: (snapshot: PageSnapshot) => {
    const labelData = snapshot.accessibility.formLabelRelationships;

    if (labelData.withoutLabel === 0) {
      return passed(
        "A11Y-003",
        "All form inputs have associated labels",
        `${labelData.withLabel}/${labelData.total}`,
        "accessibility",
        "0 inputs missing labels",
        {
          severity: "low",
          impact: "All form controls are properly labeled for accessibility.",
          effort: "low",
          source: "html-parse",
          responsible: "developer",
        },
      );
    }

    return failed(
      "A11Y-003",
      `${labelData.withoutLabel} form input(s) are missing labels`,
      `${labelData.withoutLabel}/${labelData.total}`,
      "accessibility",
      "0 inputs missing labels",
      {
        severity: "high",
        impact: "Unlabeled form controls cannot be announced by screen readers.",
        effort: "low",
        source: "html-parse",
        responsible: "developer",
      },
    );
  },
};
