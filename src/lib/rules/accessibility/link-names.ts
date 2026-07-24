import type { RuleDefinition, Provenance } from "../types";
import type { PageSnapshot } from "@/lib/extraction/types";
import { passed, failed } from "../helpers/result";

const provenance: Provenance = {
  upstreamRuleId: "A11Y-005",
  upstreamSourcePath: "src/rules/accessibility/link-names.ts",
  upstreamCommitHash: "bbca017b56086a2959382d8260b97021736ca18f",
  disposition: "PORT_AS_IS",
};

export const linkNamesRule: RuleDefinition = {
  id: "A11Y-005",
  name: "Link accessible names",
  description: "Checks that all links have accessible names via text content or aria-label.",
  category: "accessibility",
  executionMode: "static",
  defaultSeverity: "high",
  defaultImpact:
    "Links without accessible names are unusable for screen reader users navigating by links.",
  defaultEffort: "low",
  scored: true,
  provenance,
  signalOwner: "accessibility",
  ruleVersion: 1,
  evaluator: (snapshot: PageSnapshot) => {
    const linkData = snapshot.accessibility.linkAccessibleNames;

    if (linkData.withoutName === 0) {
      return passed(
        "A11Y-005",
        "All links have accessible names",
        `${linkData.withName}/${linkData.total}`,
        "accessibility",
        "0 links missing names",
        {
          severity: "low",
          impact: "All links are properly labeled for screen reader users.",
          effort: "low",
          source: "html-parse",
          responsible: "content-editor",
        },
      );
    }

    return failed(
      "A11Y-005",
      `${linkData.withoutName} link(s) are missing accessible names`,
      `${linkData.withoutName}/${linkData.total}`,
      "accessibility",
      "0 links missing names",
      {
        severity: "high",
        impact: "Links without accessible names cannot be announced by screen readers.",
        effort: "low",
        source: "html-parse",
        responsible: "content-editor",
      },
    );
  },
};
