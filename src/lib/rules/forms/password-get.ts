import type { RuleDefinition, Provenance } from "../types";
import type { PageSnapshot } from "@/lib/extraction/types";
import { passed, failed, notApplicable } from "../helpers/result";
import { hasForms } from "../helpers/evidence";

const provenance: Provenance = {
  upstreamRuleId: "FORM-002",
  upstreamSourcePath: "src/rules/forms/password-get.ts",
  upstreamCommitHash: "bbca017b56086a2959382d8260b97021736ca18f",
  disposition: "PORT_AS_IS",
};

export const passwordGetRule: RuleDefinition = {
  id: "FORM-002",
  name: "Password fields with GET method",
  description:
    "Checks for password fields inside forms that use the GET method, which exposes passwords in the URL.",
  category: "forms",
  executionMode: "static",
  defaultSeverity: "critical",
  defaultImpact:
    "Password values submitted via GET are exposed in the URL, browser history, and server logs.",
  defaultEffort: "low",
  scored: true,
  provenance,
  signalOwner: "forms",
  ruleVersion: 1,
  evaluator: (snapshot: PageSnapshot) => {
    if (!hasForms(snapshot)) {
      return notApplicable(
        "FORM-002",
        "No forms found on page",
        "forms",
        "No form elements present in document",
      );
    }

    const offendingForms: Array<{ action: string | null; elementOrder: number }> = [];

    for (const form of snapshot.forms.forms) {
      const method = form.method?.toLowerCase() ?? "";
      if (method === "get") {
        const hasPassword = form.inputs.some((i) => i.isPassword);
        if (hasPassword) {
          offendingForms.push({ action: form.action, elementOrder: form.elementOrder });
        }
      }
    }

    if (offendingForms.length === 0) {
      return passed(
        "FORM-002",
        "No password fields use GET method",
        "secure",
        "forms",
        "no password-in-GET forms",
        {
          severity: "low",
          impact: "Password data is not exposed in URLs.",
          effort: "low",
          source: "html-parse",
          responsible: "developer",
        },
      );
    }

    return failed(
      "FORM-002",
      `${offendingForms.length} form(s) contain password fields with GET method`,
      offendingForms.length,
      "forms",
      0,
      {
        severity: "critical",
        impact:
          "Passwords submitted via GET are visible in the URL, browser history, and server access logs.",
        effort: "low",
        source: "html-parse",
        responsible: "developer",
        samples: offendingForms.slice(0, 3).map((f) => `form[action="${f.action ?? ""}"]`),
      },
    );
  },
};
