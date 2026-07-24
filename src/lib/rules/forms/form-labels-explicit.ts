import type { RuleDefinition, Provenance } from "../types";
import type { PageSnapshot } from "@/lib/extraction/types";
import { passed, failed, notApplicable } from "../helpers/result";
import { hasForms } from "../helpers/evidence";

const provenance: Provenance = {
  upstreamRuleId: "FORM-001",
  upstreamSourcePath: "src/rules/forms/form-labels-explicit.ts",
  upstreamCommitHash: "bbca017b56086a2959382d8260b97021736ca18f",
  disposition: "PORT_AS_IS",
};

export const formLabelsExplicitRule: RuleDefinition = {
  id: "FORM-001",
  name: "Explicit form input labels",
  description: "Checks that form controls have explicit or implicit label associations.",
  category: "forms",
  executionMode: "static",
  defaultSeverity: "high",
  defaultImpact:
    "Form controls without associated labels are inaccessible to screen reader users and have poor usability.",
  defaultEffort: "low",
  scored: true,
  provenance,
  signalOwner: "accessibility",
  ruleVersion: 1,
  evaluator: (snapshot: PageSnapshot) => {
    if (!hasForms(snapshot)) {
      return notApplicable(
        "FORM-001",
        "No forms found on page",
        "forms",
        "No form elements present in document",
      );
    }

    const unlabeledInputs: Array<{ type: string | null; id: string | null; name: string | null }> =
      [];

    for (const form of snapshot.forms.forms) {
      for (const input of form.inputs) {
        if (input.isHidden) continue;
        if (input.labelRelationship === "none") {
          unlabeledInputs.push({ type: input.type, id: input.id, name: input.name });
        }
      }
    }

    if (unlabeledInputs.length === 0) {
      return passed(
        "FORM-001",
        "All form controls have associated labels",
        "100%",
        "forms",
        "0 unlabeled inputs",
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
      "FORM-001",
      `${unlabeledInputs.length} form control(s) have no label association`,
      unlabeledInputs.length,
      "forms",
      0,
      {
        severity: "high",
        impact: "Unlabeled form controls cannot be announced by screen readers.",
        effort: "low",
        source: "html-parse",
        responsible: "developer",
        samples: unlabeledInputs
          .slice(0, 3)
          .map(
            (i) =>
              `<${i.type ?? "input"}${i.id ? ` id="${i.id}"` : ""}${i.name ? ` name="${i.name}"` : ""}>`,
          ),
      },
    );
  },
};
