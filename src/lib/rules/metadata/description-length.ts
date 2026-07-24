import { passed, warning } from "../helpers/result";
import type { RuleDefinition } from "../types";

const RECOMMENDED_MIN = 120;
const RECOMMENDED_MAX = 160;

export const descriptionLengthRule: RuleDefinition = {
  id: "META-005",
  name: "Meta description length",
  description:
    "Checks that the meta description is between 120 and 160 characters (advisory heuristic)",
  category: "metadata",
  executionMode: "static",
  defaultSeverity: "low",
  defaultImpact:
    "Description length outside recommendations may truncate in SERPs or fail to entice clicks",
  defaultEffort: "low",
  scored: true,
  signalOwner: "metadata",
  ruleVersion: 1,
  provenance: {
    upstreamRuleId: "core-description-length",
    upstreamSourcePath: "src/rules/core/description-length.ts",
    upstreamCommitHash: "bbca017b56086a2959382d8260b97021736ca18f",
    disposition: "PORT_WITH_MODIFICATIONS",
    modifications:
      "Adapted for Nexora PageSnapshot-based evaluator; uses Nexora result helpers; uses warning not failed for heuristic",
  },
  evaluator: (snapshot) => {
    const description =
      snapshot.metadata.find((m) => m.name === "description")?.normalizedValue ?? null;

    if (description === null) {
      return warning(
        "META-005",
        'No <meta name="description"> tag found; cannot evaluate length',
        null,
        "metadata",
        true,
        {
          severity: "informational",
          effort: "low",
          impact: "Cannot evaluate description length without a description tag",
          source: "html-parse",
          responsible: "seo",
        },
      );
    }

    const trimmed = description.trim();
    if (trimmed.length === 0) {
      return warning(
        "META-005",
        "Meta description tag exists but is empty; cannot evaluate length",
        0,
        "metadata",
        true,
        {
          severity: "informational",
          effort: "low",
          impact: "Empty description cannot be evaluated for length recommendations",
          source: "html-parse",
          responsible: "seo",
          selector: 'meta[name="description"]',
        },
      );
    }

    const length = [...trimmed].length;

    if (length < RECOMMENDED_MIN) {
      return warning(
        "META-005",
        `Meta description is short (${length} chars). Recommended ${RECOMMENDED_MIN}-${RECOMMENDED_MAX} chars`,
        length,
        "metadata",
        `between ${RECOMMENDED_MIN} and ${RECOMMENDED_MAX} characters`,
        {
          severity: "low",
          effort: "low",
          impact: "Short descriptions may not provide enough context to entice clicks",
          source: "html-parse",
          responsible: "content-editor",
          confidence: 75,
          selector: 'meta[name="description"]',
          steps: [
            `Expand the description to at least ${RECOMMENDED_MIN} characters`,
            "Include a clear value proposition and relevant keywords",
          ],
          contentNotes:
            "Short descriptions waste valuable SERP real estate; aim for the full 160 chars",
        },
      );
    }

    if (length > RECOMMENDED_MAX) {
      return warning(
        "META-005",
        `Meta description is long (${length} chars). Recommended ${RECOMMENDED_MIN}-${RECOMMENDED_MAX} chars`,
        length,
        "metadata",
        `between ${RECOMMENDED_MIN} and ${RECOMMENDED_MAX} characters`,
        {
          severity: "low",
          effort: "low",
          impact: "Long descriptions may be truncated in search results, cutting off key messaging",
          source: "html-parse",
          responsible: "content-editor",
          confidence: 75,
          selector: 'meta[name="description"]',
          steps: [
            `Shorten the description to ${RECOMMENDED_MAX} characters or fewer`,
            "Front-load important keywords and the value proposition",
          ],
          contentNotes: "Descriptions over 160 chars get truncated; key info should appear early",
        },
      );
    }

    return passed(
      "META-005",
      `Meta description length is optimal (${length} chars)`,
      length,
      "metadata",
      true,
      {
        source: "html-parse",
        selector: 'meta[name="description"]',
      },
    );
  },
};
