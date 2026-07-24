import { passed, warning } from "../helpers/result";
import type { RuleDefinition } from "../types";

const RECOMMENDED_MIN = 30;
const RECOMMENDED_MAX = 60;

export const titleLengthRule: RuleDefinition = {
  id: "META-002",
  name: "Title tag length",
  description:
    "Checks that the <title> element text is between 30 and 60 characters (advisory heuristic)",
  category: "metadata",
  executionMode: "static",
  defaultSeverity: "low",
  defaultImpact:
    "Title length outside recommendations may truncate in SERPs or miss keyword opportunities",
  defaultEffort: "low",
  scored: true,
  signalOwner: "metadata",
  ruleVersion: 1,
  provenance: {
    upstreamRuleId: "core-title-length",
    upstreamSourcePath: "src/rules/core/title-length.ts",
    upstreamCommitHash: "bbca017b56086a2959382d8260b97021736ca18f",
    disposition: "PORT_WITH_MODIFICATIONS",
    modifications:
      "Adapted for Nexora PageSnapshot-based evaluator; uses Nexora result helpers; uses warning not failed for heuristic",
  },
  evaluator: (snapshot) => {
    const title = snapshot.document.title;

    if (title === null) {
      return warning(
        "META-002",
        "No <title> element found; cannot evaluate length",
        null,
        "metadata",
        true,
        {
          severity: "informational",
          effort: "low",
          impact: "Cannot evaluate title length without a title element",
          source: "html-parse",
          responsible: "seo",
        },
      );
    }

    const trimmed = title.trim();
    if (trimmed.length === 0) {
      return warning(
        "META-002",
        "<title> element is empty; cannot evaluate length",
        0,
        "metadata",
        true,
        {
          severity: "informational",
          effort: "low",
          impact: "Empty title cannot be evaluated for length recommendations",
          source: "html-parse",
          responsible: "seo",
          selector: "title",
        },
      );
    }

    const length = [...trimmed].length;

    if (length < RECOMMENDED_MIN) {
      return warning(
        "META-002",
        `Title is short (${length} chars). Recommended ${RECOMMENDED_MIN}-${RECOMMENDED_MAX} chars`,
        length,
        "metadata",
        `between ${RECOMMENDED_MIN} and ${RECOMMENDED_MAX} characters`,
        {
          severity: "low",
          effort: "low",
          impact: "Short titles may not fully describe the page content in search results",
          source: "html-parse",
          responsible: "content-editor",
          confidence: 80,
          selector: "title",
          steps: [
            `Expand the title to at least ${RECOMMENDED_MIN} characters while maintaining relevance`,
            "Include primary keywords near the beginning of the title",
          ],
          developerNotes: "Title length is advisory; very short titles can still be descriptive",
        },
      );
    }

    if (length > RECOMMENDED_MAX) {
      return warning(
        "META-002",
        `Title is long (${length} chars). Recommended ${RECOMMENDED_MIN}-${RECOMMENDED_MAX} chars`,
        length,
        "metadata",
        `between ${RECOMMENDED_MIN} and ${RECOMMENDED_MAX} characters`,
        {
          severity: "low",
          effort: "low",
          impact: "Long titles may be truncated in search engine result pages",
          source: "html-parse",
          responsible: "content-editor",
          confidence: 80,
          selector: "title",
          steps: [
            `Shorten the title to ${RECOMMENDED_MAX} characters or fewer to avoid SERP truncation`,
            "Move less critical keywords or brand name to the end of the title",
          ],
          developerNotes:
            "Title length is advisory; truncation varies by search engine and viewport",
        },
      );
    }

    return passed(
      "META-002",
      `Title length is optimal (${length} chars)`,
      length,
      "metadata",
      true,
      {
        source: "html-parse",
        selector: "title",
      },
    );
  },
};
