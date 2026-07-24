import type { RuleDefinition, Provenance } from "../types";
import type { PageSnapshot } from "@/lib/extraction/types";
import { passed, failed } from "../helpers/result";

const provenance: Provenance = {
  upstreamRuleId: "A11Y-004",
  upstreamSourcePath: "src/rules/accessibility/button-names.ts",
  upstreamCommitHash: "bbca017b56086a2959382d8260b97021736ca18f",
  disposition: "PORT_AS_IS",
};

export const buttonNamesRule: RuleDefinition = {
  id: "A11Y-004",
  name: "Button accessible names",
  description: "Checks that all buttons have accessible names via text content or aria-label.",
  category: "accessibility",
  executionMode: "static",
  defaultSeverity: "high",
  defaultImpact:
    "Buttons without accessible names are unusable for screen reader users and fail WCAG 4.1.2.",
  defaultEffort: "low",
  scored: true,
  provenance,
  signalOwner: "accessibility",
  ruleVersion: 1,
  evaluator: (snapshot: PageSnapshot) => {
    const buttonData = snapshot.accessibility.buttonTextSignals;

    if (buttonData.withoutText === 0) {
      return passed(
        "A11Y-004",
        "All buttons have accessible names",
        `${buttonData.withText}/${buttonData.total}`,
        "accessibility",
        "0 buttons missing names",
        {
          severity: "low",
          impact: "All buttons are properly labeled for accessibility.",
          effort: "low",
          source: "html-parse",
          responsible: "developer",
        },
      );
    }

    return failed(
      "A11Y-004",
      `${buttonData.withoutText} button(s) are missing accessible names`,
      `${buttonData.withoutText}/${buttonData.total}`,
      "accessibility",
      "0 buttons missing names",
      {
        severity: "high",
        impact: "Buttons without accessible names cannot be understood by assistive technology.",
        effort: "low",
        source: "html-parse",
        responsible: "developer",
      },
    );
  },
};
