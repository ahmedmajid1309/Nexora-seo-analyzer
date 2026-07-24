import type { RuleDefinition, Provenance } from "../types";
import type { PageSnapshot } from "@/lib/extraction/schemas";
import { passed, warning } from "../helpers/result";
import { hasOgTitle } from "../helpers/evidence";

const provenance: Provenance = {
  upstreamRuleId: "SOCIAL-001",
  upstreamSourcePath: "src/rules/social/og-title.ts",
  upstreamCommitHash: "bbca017b56086a2959382d8260b97021736ca18f",
  disposition: "PORT_AS_IS",
};

export const ogTitleRule: RuleDefinition = {
  id: "SOCIAL-001",
  name: "Open Graph title is present",
  description:
    "Checks that the page defines an og:title meta tag for controlling how the page appears in social shares.",
  category: "social",
  executionMode: "static",
  defaultSeverity: "low",
  defaultImpact:
    "Missing og:title causes social platforms to guess the title, which may be inaccurate or unappealing.",
  defaultEffort: "low",
  scored: true,
  provenance,
  signalOwner: "social",
  ruleVersion: 1,
  evaluator: (snapshot: PageSnapshot) => {
    if (hasOgTitle(snapshot)) {
      return passed("SOCIAL-001", "Open Graph title is present", true, "social", true, {
        severity: "low",
        impact: "Social platforms will display the intended title when the page is shared.",
        effort: "low",
        source: "html-parse",
        responsible: "content-editor",
      });
    }

    return warning("SOCIAL-001", "No Open Graph title found", false, "social", true, {
      severity: "medium",
      impact: "Social platforms may use the page <title> or fall back to the URL when sharing.",
      effort: "low",
      source: "html-parse",
      responsible: "content-editor",
    });
  },
};
