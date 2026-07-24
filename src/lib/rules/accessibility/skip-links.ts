import type { RuleDefinition, Provenance } from "../types";
import type { PageSnapshot } from "@/lib/extraction/types";
import { passed, warning } from "../helpers/result";

const provenance: Provenance = {
  upstreamRuleId: "A11Y-012",
  upstreamSourcePath: "src/rules/accessibility/skip-links.ts",
  upstreamCommitHash: "bbca017b56086a2959382d8260b97021736ca18f",
  disposition: "PORT_AS_IS",
};

export const skipLinksRule: RuleDefinition = {
  id: "A11Y-012",
  name: "Skip link candidates",
  description:
    "Checks for the presence of skip navigation links that allow keyboard users to bypass repetitive content.",
  category: "accessibility",
  executionMode: "static",
  defaultSeverity: "low",
  defaultImpact:
    "Skip links allow keyboard and screen reader users to bypass repeated navigation blocks and reach main content faster.",
  defaultEffort: "low",
  scored: true,
  provenance,
  signalOwner: "accessibility",
  ruleVersion: 1,
  evaluator: (snapshot: PageSnapshot) => {
    const candidates = snapshot.accessibility.skipLinkCandidates;

    if (candidates.length > 0) {
      return passed(
        "A11Y-012",
        `${candidates.length} skip link candidate(s) found`,
        candidates.length,
        "accessibility",
        "> 0 skip link candidates",
        {
          severity: "low",
          impact: "Skip links improve keyboard navigation efficiency.",
          effort: "low",
          source: "html-parse",
          responsible: "developer",
        },
      );
    }

    return warning(
      "A11Y-012",
      "No skip link candidates detected",
      0,
      "accessibility",
      "> 0 skip link candidates",
      {
        severity: "low",
        impact:
          "Without skip links, keyboard users must tab through all navigation to reach main content.",
        effort: "low",
        source: "html-parse",
        responsible: "developer",
      },
    );
  },
};
