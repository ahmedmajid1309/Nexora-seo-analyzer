import type { RuleDefinition, Provenance } from "../types";
import type { PageSnapshot } from "@/lib/extraction/types";
import { passed, failed, notApplicable } from "../helpers/result";
import { hasIframes } from "../helpers/evidence";

const provenance: Provenance = {
  upstreamRuleId: "A11Y-007",
  upstreamSourcePath: "src/rules/accessibility/iframe-titles.ts",
  upstreamCommitHash: "bbca017b56086a2959382d8260b97021736ca18f",
  disposition: "PORT_AS_IS",
};

export const iframeTitlesRule: RuleDefinition = {
  id: "A11Y-007",
  name: "Iframe title attributes",
  description: "Checks that all iframes have descriptive title attributes for accessibility.",
  category: "accessibility",
  executionMode: "static",
  defaultSeverity: "high",
  defaultImpact:
    "Iframes without titles are not identifiable by screen reader users navigating by frames.",
  defaultEffort: "low",
  scored: true,
  provenance,
  signalOwner: "accessibility",
  ruleVersion: 1,
  evaluator: (snapshot: PageSnapshot) => {
    if (!hasIframes(snapshot)) {
      return notApplicable(
        "A11Y-007",
        "No iframes found on page",
        "accessibility",
        "No iframe elements present in document",
      );
    }

    const iframeData = snapshot.accessibility.iframeTitles;

    if (iframeData.withoutTitle === 0) {
      return passed(
        "A11Y-007",
        "All iframes have title attributes",
        `${iframeData.withTitle}/${iframeData.total}`,
        "accessibility",
        "0 iframes missing titles",
        {
          severity: "low",
          impact: "All iframes are identifiable by assistive technology.",
          effort: "low",
          source: "html-parse",
          responsible: "developer",
        },
      );
    }

    return failed(
      "A11Y-007",
      `${iframeData.withoutTitle} iframe(s) are missing title attributes`,
      `${iframeData.withoutTitle}/${iframeData.total}`,
      "accessibility",
      "0 iframes missing titles",
      {
        severity: "high",
        impact: "Iframes without titles are not announced properly by screen readers.",
        effort: "low",
        source: "html-parse",
        responsible: "developer",
      },
    );
  },
};
