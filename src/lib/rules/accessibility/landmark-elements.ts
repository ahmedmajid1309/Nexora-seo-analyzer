import type { RuleDefinition, Provenance } from "../types";
import type { PageSnapshot } from "@/lib/extraction/types";
import { passed, warning } from "../helpers/result";

const provenance: Provenance = {
  upstreamRuleId: "A11Y-013",
  upstreamSourcePath: "src/rules/accessibility/landmark-elements.ts",
  upstreamCommitHash: "bbca017b56086a2959382d8260b97021736ca18f",
  disposition: "PORT_AS_IS",
};

export const landmarkElementsRule: RuleDefinition = {
  id: "A11Y-013",
  name: "Landmark elements",
  description:
    "Checks for the presence of semantic landmark elements (<nav>, <main>, <header>, <footer>, <aside>) that improve screen reader navigation.",
  category: "accessibility",
  executionMode: "static",
  defaultSeverity: "low",
  defaultImpact:
    "Landmark elements help screen reader users navigate page structure and understand content regions.",
  defaultEffort: "low",
  scored: true,
  provenance,
  signalOwner: "accessibility",
  ruleVersion: 1,
  evaluator: (snapshot: PageSnapshot) => {
    const landmarks = snapshot.accessibility.landmarkElements;
    const coreLandmarks = ["nav", "main", "header", "footer"] as const;
    const missing = coreLandmarks.filter((l) => landmarks[l] === 0);

    if (missing.length === 0) {
      return passed(
        "A11Y-013",
        "All core landmark elements are present (nav, main, header, footer)",
        `nav=${landmarks.nav}, header=${landmarks.header}, footer=${landmarks.footer}, main=${landmarks.main}`,
        "accessibility",
        "all core landmarks present",
        {
          severity: "low",
          impact: "Screen reader users can navigate page structure efficiently.",
          effort: "low",
          source: "html-parse",
          responsible: "developer",
        },
      );
    }

    return warning(
      "A11Y-013",
      `Missing landmark element(s): ${missing.join(", ")}`,
      missing.join(", "),
      "accessibility",
      "all core landmarks present (nav, main, header, footer)",
      {
        severity: "low",
        impact: "Missing landmarks reduce navigation efficiency for assistive technology users.",
        effort: "low",
        source: "html-parse",
        responsible: "developer",
      },
    );
  },
};
