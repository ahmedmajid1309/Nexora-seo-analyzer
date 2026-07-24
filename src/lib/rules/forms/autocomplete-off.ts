import type { RuleDefinition, Provenance } from "../types";
import type { PageSnapshot } from "@/lib/extraction/types";
import { passed, warning, notApplicable } from "../helpers/result";
import { hasForms } from "../helpers/evidence";

const provenance: Provenance = {
  upstreamRuleId: "FORM-004",
  upstreamSourcePath: "src/rules/forms/autocomplete-off.ts",
  upstreamCommitHash: "bbca017b56086a2959382d8260b97021736ca18f",
  disposition: "PORT_AS_IS",
};

export const autocompleteOffRule: RuleDefinition = {
  id: "FORM-004",
  name: "Autocomplete off on identity fields",
  description:
    "Checks for autocomplete=off on password and identity fields, which can interfere with password managers (informational).",
  category: "forms",
  executionMode: "static",
  defaultSeverity: "low",
  defaultImpact:
    "Disabling autocomplete on identity fields can frustrate users and prevent password managers from working correctly.",
  defaultEffort: "low",
  scored: true,
  provenance,
  signalOwner: "forms",
  ruleVersion: 1,
  evaluator: (snapshot: PageSnapshot) => {
    if (!hasForms(snapshot)) {
      return notApplicable(
        "FORM-004",
        "No forms found on page",
        "forms",
        "No form elements present in document",
      );
    }

    const autocompleteOffFields: Array<{
      type: string | null;
      name: string | null;
      id: string | null;
    }> = [];

    for (const form of snapshot.forms.forms) {
      const formAutocomplete = form.autocomplete?.toLowerCase();
      for (const input of form.inputs) {
        if (input.isHidden) continue;
        if (
          input.isPassword ||
          input.type === "email" ||
          input.type === "text" ||
          input.name?.toLowerCase().includes("user") ||
          input.name?.toLowerCase().includes("login")
        ) {
          if (formAutocomplete === "off") {
            autocompleteOffFields.push({ type: input.type, name: input.name, id: input.id });
          }
        }
      }
    }

    if (autocompleteOffFields.length === 0) {
      return passed(
        "FORM-004",
        "No identity or password fields have autocomplete disabled",
        "0 fields affected",
        "forms",
        "0 autocomplete=off on identity fields",
        {
          severity: "low",
          impact: "Password managers and autofill can function normally.",
          effort: "low",
          source: "html-parse",
          responsible: "developer",
        },
      );
    }

    return warning(
      "FORM-004",
      `${autocompleteOffFields.length} identity/password field(s) have autocomplete disabled`,
      autocompleteOffFields.length,
      "forms",
      0,
      {
        severity: "low",
        impact:
          "Disabling autocomplete on identity fields can interfere with password managers and frustrate users.",
        effort: "low",
        source: "html-parse",
        responsible: "developer",
        samples: autocompleteOffFields
          .slice(0, 3)
          .map(
            (f) =>
              `<${f.type ?? "input"}${f.name ? ` name="${f.name}"` : ""}${f.id ? ` id="${f.id}"` : ""}>`,
          ),
      },
    );
  },
};
