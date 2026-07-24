import { passed, failed } from "../helpers/result";
import type { RuleDefinition } from "../types";

export const descriptionPresentRule: RuleDefinition = {
  id: "META-004",
  name: "Meta description present",
  description:
    'Checks that a <meta name="description"> tag is present in the document with non-empty content',
  category: "metadata",
  executionMode: "static",
  defaultSeverity: "high",
  defaultImpact: "Missing meta descriptions reduce click-through rates from search results",
  defaultEffort: "low",
  scored: true,
  signalOwner: "metadata",
  ruleVersion: 1,
  provenance: {
    upstreamRuleId: "core-description-present",
    upstreamSourcePath: "src/rules/core/description-present.ts",
    upstreamCommitHash: "bbca017b56086a2959382d8260b97021736ca18f",
    disposition: "PORT_WITH_MODIFICATIONS",
    modifications:
      "Adapted for Nexora PageSnapshot-based evaluator; uses Nexora result helpers; improved evidence output",
  },
  evaluator: (snapshot) => {
    const description =
      snapshot.metadata.find((m) => m.name === "description")?.normalizedValue ?? null;

    if (description === null) {
      return failed(
        "META-004",
        'No <meta name="description"> tag found in the document',
        false,
        "metadata",
        true,
        {
          severity: "high",
          effort: "low",
          impact: "Search engines may auto-generate descriptions or display none, reducing CTR",
          source: "html-parse",
          responsible: "seo",
          steps: [
            'Add a <meta name="description"> tag to the document head',
            "Write a compelling description between 120-160 characters that summarizes the page",
            "Include target keywords naturally in the description",
          ],
          contentNotes: "A well-written meta description can significantly improve organic CTR",
        },
      );
    }

    const trimmed = description.trim();
    if (trimmed.length === 0) {
      return failed(
        "META-004",
        "Meta description tag exists but has no content",
        description,
        "metadata",
        "non-empty text",
        {
          severity: "high",
          effort: "low",
          impact: "Empty meta description provides no value in search results",
          source: "html-parse",
          responsible: "seo",
          selector: 'meta[name="description"]',
          steps: [
            "Add descriptive text content to the existing meta description tag",
            "Target 120-160 characters for optimal display in SERPs",
          ],
        },
      );
    }

    return passed(
      "META-004",
      "Meta description tag is present with content",
      trimmed,
      "metadata",
      true,
      {
        source: "html-parse",
        selector: 'meta[name="description"]',
      },
    );
  },
};
