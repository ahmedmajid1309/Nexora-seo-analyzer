import type { RuleDefinition, Provenance } from "../types";
import type { PageSnapshot } from "@/lib/extraction/schemas";
import { passed, failed } from "../helpers/result";
import { hasOgImage } from "../helpers/applicability";

const provenance: Provenance = {
  upstreamRuleId: "SOCIAL-003",
  upstreamSourcePath: "src/rules/social/og-image.ts",
  upstreamCommitHash: "bbca017b56086a2959382d8260b97021736ca18f",
  disposition: "PORT_AS_IS",
};

export const ogImageRule: RuleDefinition = {
  id: "SOCIAL-003",
  name: "Open Graph image is present",
  description:
    "Checks that the page defines an og:image meta tag for rich social sharing previews.",
  category: "social",
  executionMode: "static",
  defaultSeverity: "medium",
  defaultImpact:
    "Missing og:image prevents rich media previews when sharing on social platforms, reducing engagement.",
  defaultEffort: "low",
  scored: true,
  provenance,
  signalOwner: "social",
  ruleVersion: 1,
  evaluator: (snapshot: PageSnapshot) => {
    if (hasOgImage(snapshot)) {
      return passed("SOCIAL-003", "Open Graph image is present", true, "social", true, {
        severity: "low",
        impact: "Social platforms can display a rich image preview when the page is shared.",
        effort: "low",
        source: "html-parse",
        responsible: "content-editor",
      });
    }

    return failed("SOCIAL-003", "No Open Graph image found", false, "social", true, {
      severity: "medium",
      impact: "Without og:image, social shares appear as plain text links with no visual preview.",
      effort: "medium",
      source: "html-parse",
      responsible: "content-editor",
    });
  },
};
