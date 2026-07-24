import { passed, failed } from "../helpers/result";
import type { RuleDefinition } from "../types";

export const canonicalPresentRule: RuleDefinition = {
  id: "META-007",
  name: "Canonical URL present",
  description:
    'Checks that a <link rel="canonical"> tag is present in the document with a non-empty href',
  category: "metadata",
  executionMode: "static",
  defaultSeverity: "low",
  defaultImpact:
    "Missing canonical URLs may lead to duplicate content issues and diluted link equity",
  defaultEffort: "low",
  scored: true,
  signalOwner: "metadata",
  ruleVersion: 1,
  provenance: {
    upstreamRuleId: "core-canonical-present",
    upstreamSourcePath: "src/rules/core/canonical-present.ts",
    upstreamCommitHash: "bbca017b56086a2959382d8260b97021736ca18f",
    disposition: "PORT_WITH_MODIFICATIONS",
    modifications:
      "Adapted for Nexora PageSnapshot-based evaluator; uses Nexora result helpers; improved evidence output",
  },
  evaluator: (snapshot) => {
    const canonical = snapshot.document.baseHref;

    if (canonical === null) {
      return failed(
        "META-007",
        'No <link rel="canonical"> tag found in the document',
        false,
        "metadata",
        true,
        {
          severity: "low",
          effort: "low",
          impact:
            "Without a canonical URL, search engines must determine the canonical URL independently",
          source: "html-parse",
          responsible: "seo",
          steps: [
            'Add a <link rel="canonical"> tag to the document head',
            "Set the href to the preferred URL for this page",
            "Use self-referencing canonicals by default to prevent duplicate content issues",
          ],
          developerNotes:
            "Canonical tags help consolidate link signals and prevent duplicate content indexing",
        },
      );
    }

    const trimmed = canonical.trim();
    if (trimmed.length === 0) {
      return failed(
        "META-007",
        "Canonical link tag exists but has an empty href attribute",
        canonical,
        "metadata",
        "non-empty URL",
        {
          severity: "low",
          effort: "low",
          impact: "An empty canonical href provides no useful signal to search engines",
          source: "html-parse",
          responsible: "developer",
          selector: 'link[rel="canonical"]',
          steps: [
            "Add a valid URL to the href attribute of the canonical link tag",
            "Prefer absolute URLs over relative URLs for canonical references",
          ],
        },
      );
    }

    return passed(
      "META-007",
      `Canonical link tag is present with href`,
      trimmed,
      "metadata",
      true,
      {
        source: "html-parse",
        selector: 'link[rel="canonical"]',
      },
    );
  },
};
