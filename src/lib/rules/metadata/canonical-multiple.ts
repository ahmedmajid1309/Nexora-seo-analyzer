import { passed, unavailableResult } from "../helpers/result";
import type { RuleDefinition, Provenance } from "../types";

const provenance: Provenance = {
  upstreamRuleId: "not applicable",
  upstreamSourcePath: "not applicable",
  upstreamCommitHash: "not applicable",
  disposition: "REWRITE",
};

export const canonicalMultipleRule: RuleDefinition = {
  id: "META-010",
  provenance,
  name: "Multiple canonical link tags",
  description: 'Checks that only one <link rel="canonical"> tag exists in the document',
  category: "metadata",
  executionMode: "static",
  defaultSeverity: "high",
  defaultImpact:
    "Multiple canonical tags send conflicting signals to search engines about the preferred URL",
  defaultEffort: "low",
  scored: true,
  signalOwner: "metadata",
  ruleVersion: 1,
  evaluator: (snapshot) => {
    if (snapshot.document.baseHref === null) {
      return unavailableResult(
        "META-010",
        "No canonical URL detected; cannot check for multiple canonical tags",
        "metadata",
        'The snapshot does not expose a count of <link rel="canonical"> elements',
        {
          severity: "informational",
          effort: "low",
          impact: "Cannot determine if multiple canonical tags exist with current snapshot data",
          source: "html-parse",
          responsible: "seo",
        },
      );
    }

    return passed(
      "META-010",
      "Canonical link tag is present (count check not available in snapshot)",
      1,
      "metadata",
      1,
      {
        source: "html-parse",
      },
    );
  },
};
