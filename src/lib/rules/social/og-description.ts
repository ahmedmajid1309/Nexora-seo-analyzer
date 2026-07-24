import type { RuleDefinition, Provenance } from "../types";
import type { PageSnapshot } from "@/lib/extraction/schemas";
import { passed, failed } from "../helpers/result";
import { getOgDescription } from "../helpers/text";

const provenance: Provenance = {
  upstreamRuleId: "SOCIAL-002",
  upstreamSourcePath: "src/rules/social/og-description.ts",
  upstreamCommitHash: "bbca017b56086a2959382d8260b97021736ca18f",
  disposition: "PORT_AS_IS",
};

export const ogDescriptionRule: RuleDefinition = {
  id: "SOCIAL-002",
  name: "Open Graph description is present",
  description:
    "Checks that the page defines an og:description meta tag for social sharing snippets.",
  category: "social",
  executionMode: "static",
  defaultSeverity: "medium",
  defaultImpact:
    "Missing og:description causes social platforms to guess or omit the description, reducing click-through rates.",
  defaultEffort: "low",
  scored: true,
  provenance,
  signalOwner: "social",
  ruleVersion: 1,
  evaluator: (snapshot: PageSnapshot) => {
    const ogDescription = getOgDescription(snapshot);

    if (ogDescription !== null && ogDescription.trim().length > 0) {
      return passed("SOCIAL-002", "Open Graph description is present", true, "social", true, {
        severity: "low",
        impact: "Social platforms will display the intended description when the page is shared.",
        effort: "low",
        source: "html-parse",
        responsible: "content-editor",
      });
    }

    return failed("SOCIAL-002", "No Open Graph description found", false, "social", true, {
      severity: "medium",
      impact: "Without og:description, social shares may show a generic or empty snippet.",
      effort: "low",
      source: "html-parse",
      responsible: "content-editor",
    });
  },
};
