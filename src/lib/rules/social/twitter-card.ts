import type { RuleDefinition, Provenance } from "../types";
import type { PageSnapshot } from "@/lib/extraction/schemas";
import { passed, failed } from "../helpers/result";
import { hasTwitterCard } from "../helpers/evidence";

const provenance: Provenance = {
  upstreamRuleId: "SOCIAL-005",
  upstreamSourcePath: "src/rules/social/twitter-card.ts",
  upstreamCommitHash: "bbca017b56086a2959382d8260b97021736ca18f",
  disposition: "PORT_AS_IS",
};

export const twitterCardRule: RuleDefinition = {
  id: "SOCIAL-005",
  name: "Twitter Card is present",
  description: "Checks that the page defines a twitter:card meta tag for Twitter card rendering.",
  category: "social",
  executionMode: "static",
  defaultSeverity: "low",
  defaultImpact:
    "Missing twitter:card causes Twitter to show a plain link share instead of a rich card with preview.",
  defaultEffort: "low",
  scored: true,
  provenance,
  signalOwner: "social",
  ruleVersion: 1,
  evaluator: (snapshot: PageSnapshot) => {
    if (hasTwitterCard(snapshot)) {
      return passed("SOCIAL-005", "Twitter Card is present", true, "social", true, {
        severity: "low",
        impact: "Twitter will render a rich card when the page is shared.",
        effort: "low",
        source: "html-parse",
        responsible: "content-editor",
      });
    }

    return failed("SOCIAL-005", "No Twitter Card found", false, "social", true, {
      severity: "medium",
      impact: "Without twitter:card, shared links appear as plain text on Twitter.",
      effort: "low",
      source: "html-parse",
      responsible: "content-editor",
    });
  },
};
