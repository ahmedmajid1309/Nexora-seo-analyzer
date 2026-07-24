import { passed, failed } from "../helpers/result";
import type { RuleDefinition } from "../types";

export const titlePresentRule: RuleDefinition = {
  id: "META-001",
  name: "Title tag present",
  description:
    "Checks that a <title> element is present in the document head and contains non-empty text",
  category: "metadata",
  executionMode: "static",
  defaultSeverity: "critical",
  defaultImpact: "Missing title tags severely impact search rankings and social sharing",
  defaultEffort: "low",
  scored: true,
  signalOwner: "metadata",
  ruleVersion: 1,
  provenance: {
    upstreamRuleId: "core-title-present",
    upstreamSourcePath: "src/rules/core/title-present.ts",
    upstreamCommitHash: "bbca017b56086a2959382d8260b97021736ca18f",
    disposition: "PORT_WITH_MODIFICATIONS",
    modifications:
      "Adapted for Nexora PageSnapshot-based evaluator; uses Nexora result helpers; improved evidence output",
  },
  evaluator: (snapshot) => {
    const title = snapshot.document.title;

    if (title === null) {
      return failed(
        "META-001",
        "No <title> element found in the document",
        false,
        "metadata",
        true,
        {
          severity: "critical",
          effort: "low",
          impact: "Missing title tag harms search rankings and social sharing",
          source: "html-parse",
          responsible: "seo",
          steps: [
            "Add a <title> element to the document <head>",
            "Ensure the title is descriptive and includes target keywords",
            "Keep the title between 30-60 characters for optimal display",
          ],
          developerNotes:
            "The <title> element must be placed inside <head> and contain non-whitespace text content",
        },
      );
    }

    const trimmed = title.trim();
    if (trimmed.length === 0) {
      return failed(
        "META-001",
        "<title> element exists but is empty",
        title,
        "metadata",
        "non-empty text",
        {
          severity: "high",
          effort: "low",
          impact: "Empty title tag confuses search engines and provides no context",
          source: "html-parse",
          responsible: "seo",
          selector: "title",
          steps: ["Add descriptive text content to the <title> element in the document head"],
          developerNotes: "Even whitespace-only title content is considered empty",
        },
      );
    }

    return passed(
      "META-001",
      "<title> element is present with non-empty text",
      title,
      "metadata",
      true,
      {
        source: "html-parse",
        selector: "title",
      },
    );
  },
};
