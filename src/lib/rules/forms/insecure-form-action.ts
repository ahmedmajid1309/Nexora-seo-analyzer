import type { RuleDefinition, Provenance } from "../types";
import type { PageSnapshot } from "@/lib/extraction/types";
import { passed, failed, notApplicable } from "../helpers/result";
import { hasForms } from "../helpers/evidence";

const provenance: Provenance = {
  upstreamRuleId: "FORM-003",
  upstreamSourcePath: "src/rules/forms/insecure-form-action.ts",
  upstreamCommitHash: "bbca017b56086a2959382d8260b97021736ca18f",
  disposition: "PORT_AS_IS",
};

export const insecureFormActionRule: RuleDefinition = {
  id: "FORM-003",
  name: "Insecure form action",
  description: "Checks if forms on HTTPS pages submit to HTTP URLs, which compromises security.",
  category: "forms",
  executionMode: "static",
  defaultSeverity: "critical",
  defaultImpact:
    "Forms submitting from HTTPS to HTTP expose data to man-in-the-middle attacks and bypass encryption.",
  defaultEffort: "low",
  scored: true,
  provenance,
  signalOwner: "forms",
  ruleVersion: 1,
  evaluator: (snapshot: PageSnapshot) => {
    if (!hasForms(snapshot)) {
      return notApplicable(
        "FORM-003",
        "No forms found on page",
        "forms",
        "No form elements present in document",
      );
    }

    const isPageHttps = snapshot.finalUrl?.startsWith("https://") ?? false;
    if (!isPageHttps) {
      return notApplicable(
        "FORM-003",
        "Page is not served over HTTPS",
        "forms",
        "Mixed content check only applies to HTTPS pages",
      );
    }

    const insecureForms: Array<{ action: string | null; elementOrder: number }> = [];

    for (const form of snapshot.forms.forms) {
      const action = form.action ?? "";
      if (action.startsWith("http:")) {
        insecureForms.push({ action: form.action, elementOrder: form.elementOrder });
      }
    }

    if (insecureForms.length === 0) {
      return passed(
        "FORM-003",
        "All form actions use HTTPS",
        "secure",
        "forms",
        "no HTTP form actions",
        {
          severity: "low",
          impact: "Form data is submitted securely.",
          effort: "low",
          source: "html-parse",
          responsible: "developer",
        },
      );
    }

    return failed(
      "FORM-003",
      `${insecureForms.length} form(s) submit to insecure HTTP URLs`,
      insecureForms.length,
      "forms",
      0,
      {
        severity: "critical",
        impact:
          "Forms submitting over HTTP from an HTTPS page expose data to interception and tampering.",
        effort: "low",
        source: "html-parse",
        responsible: "developer",
        samples: insecureForms.slice(0, 3).map((f) => `action="${f.action}"`),
      },
    );
  },
};
