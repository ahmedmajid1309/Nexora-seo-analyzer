import type { RuleDefinition, Provenance } from "../types";
import type { PageSnapshot } from "@/lib/extraction/types";
import { passed, failed } from "../helpers/result";

const provenance: Provenance = {
  upstreamRuleId: "A11Y-001",
  upstreamSourcePath: "src/rules/accessibility/document-language.ts",
  upstreamCommitHash: "bbca017b56086a2959382d8260b97021736ca18f",
  disposition: "PORT_AS_IS",
};

export const documentLanguageRule: RuleDefinition = {
  id: "A11Y-001",
  name: "Document language attribute",
  description:
    "Checks that the document has a valid lang attribute declared on the <html> element.",
  category: "accessibility",
  executionMode: "static",
  defaultSeverity: "high",
  defaultImpact:
    "A lang attribute is required for screen readers to correctly pronounce page content and for browser translation features.",
  defaultEffort: "low",
  scored: true,
  provenance,
  signalOwner: "accessibility",
  ruleVersion: 1,
  evaluator: (snapshot: PageSnapshot) => {
    const lang = snapshot.document.lang;

    if (lang && lang.trim().length > 0) {
      return passed(
        "A11Y-001",
        "Document has a lang attribute",
        lang,
        "accessibility",
        "a valid language code",
        {
          severity: "low",
          impact: "Screen readers and browsers can correctly interpret the page language.",
          effort: "low",
          source: "html-parse",
          responsible: "developer",
        },
      );
    }

    return failed(
      "A11Y-001",
      "Document is missing a lang attribute",
      null,
      "accessibility",
      "a valid language code",
      {
        severity: "high",
        impact:
          "Without a lang attribute, screen readers may mispronounce content and translation tools may not work correctly.",
        effort: "low",
        source: "html-parse",
        responsible: "developer",
      },
    );
  },
};
