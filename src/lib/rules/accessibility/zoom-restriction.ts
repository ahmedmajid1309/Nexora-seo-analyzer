import type { RuleDefinition, Provenance } from "../types";
import type { PageSnapshot } from "@/lib/extraction/types";
import { passed, failed } from "../helpers/result";

const provenance: Provenance = {
  upstreamRuleId: "A11Y-010",
  upstreamSourcePath: "src/rules/accessibility/zoom-restriction.ts",
  upstreamCommitHash: "bbca017b56086a2959382d8260b97021736ca18f",
  disposition: "PORT_AS_IS",
};

export const zoomRestrictionRule: RuleDefinition = {
  id: "A11Y-010",
  name: "Viewport zoom restriction",
  description:
    "Checks if the viewport meta tag restricts zooming (user-scalable=no or maximum-scale), which violates WCAG 1.4.4.",
  category: "accessibility",
  executionMode: "static",
  defaultSeverity: "high",
  defaultImpact:
    "Restricting zoom prevents users with low vision from reading page content and violates WCAG 1.4.4 Resize Text.",
  defaultEffort: "low",
  scored: true,
  provenance,
  signalOwner: "accessibility",
  ruleVersion: 1,
  evaluator: (snapshot: PageSnapshot) => {
    if (!snapshot.accessibility.viewportZoomRestricted) {
      return passed("A11Y-010", "Viewport zoom is not restricted", false, "accessibility", false, {
        severity: "low",
        impact: "Users can zoom to read content comfortably.",
        effort: "low",
        source: "html-parse",
        responsible: "developer",
      });
    }

    return failed(
      "A11Y-010",
      "Viewport zoom is restricted (user-scalable=no or maximum-scale)",
      true,
      "accessibility",
      false,
      {
        severity: "high",
        impact:
          "Restricted zoom violates WCAG 1.4.4 and prevents users with low vision from accessing content.",
        effort: "low",
        source: "html-parse",
        responsible: "developer",
      },
    );
  },
};
