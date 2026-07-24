import type { RuleDefinition, Provenance } from "../types";
import type { PageSnapshot } from "@/lib/extraction/schemas";
import { passed, warning, notApplicable } from "../helpers/result";
import {
  getOgTitle,
  getTwitterTitle,
  getOgDescription,
  getTwitterDescription,
  getTitleText,
  getDescriptionText,
  isEmptyOrWhitespace,
} from "../helpers/text";

const provenance: Provenance = {
  upstreamRuleId: "SOCIAL-006",
  upstreamSourcePath: "src/rules/social/social-title-consistency.ts",
  upstreamCommitHash: "bbca017b56086a2959382d8260b97021736ca18f",
  disposition: "PORT_AS_IS",
};

export const socialTitleConsistencyRule: RuleDefinition = {
  id: "SOCIAL-006",
  name: "Social tags are consistent with standard metadata",
  description:
    "Compares Open Graph and Twitter Card title/description values with the page's standard <title> and meta description for consistency.",
  category: "social",
  executionMode: "static",
  defaultSeverity: "informational",
  defaultImpact:
    "Inconsistent social and metadata titles/descriptions can confuse users and reduce click-through rates.",
  defaultEffort: "low",
  scored: false,
  provenance,
  signalOwner: "social",
  ruleVersion: 1,
  evaluator: (snapshot: PageSnapshot) => {
    const pageTitle = getTitleText(snapshot);
    const pageDesc = getDescriptionText(snapshot);
    const ogTitle = getOgTitle(snapshot);
    const ogDesc = getOgDescription(snapshot);
    const twTitle = getTwitterTitle(snapshot);
    const twDesc = getTwitterDescription(snapshot);

    const issues: string[] = [];

    if (!isEmptyOrWhitespace(pageTitle)) {
      if (!isEmptyOrWhitespace(ogTitle) && ogTitle !== pageTitle) {
        issues.push("og:title differs from <title>");
      }
      if (!isEmptyOrWhitespace(twTitle) && twTitle !== pageTitle) {
        issues.push("twitter:title differs from <title>");
      }
    }

    if (!isEmptyOrWhitespace(pageDesc)) {
      if (!isEmptyOrWhitespace(ogDesc) && ogDesc !== pageDesc) {
        issues.push("og:description differs from meta description");
      }
      if (!isEmptyOrWhitespace(twDesc) && twDesc !== pageDesc) {
        issues.push("twitter:description differs from meta description");
      }
    }

    if (issues.length === 0) {
      if (
        isEmptyOrWhitespace(ogTitle) &&
        isEmptyOrWhitespace(ogDesc) &&
        isEmptyOrWhitespace(twTitle) &&
        isEmptyOrWhitespace(twDesc)
      ) {
        return notApplicable(
          "SOCIAL-006",
          "No social tags defined to compare",
          "social",
          "Page has no Open Graph or Twitter Card tags.",
        );
      }

      return passed(
        "SOCIAL-006",
        "Social tags are consistent with standard metadata",
        "consistent",
        "social",
        "consistent",
        {
          severity: "informational",
          impact: "Social titles and descriptions align with the page's standard metadata.",
          effort: "low",
          source: "html-parse",
          responsible: "content-editor",
        },
      );
    }

    return warning("SOCIAL-006", issues.join("; "), issues.length, "social", 0, {
      severity: "informational",
      impact: "Inconsistencies between social tags and standard metadata may confuse users.",
      effort: "low",
      source: "html-parse",
      responsible: "content-editor",
    });
  },
};
