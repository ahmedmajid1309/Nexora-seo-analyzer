import { passed, failed } from "../helpers/result";
import type { RuleDefinition, Provenance } from "../types";

const provenance: Provenance = {
  upstreamRuleId: "not applicable",
  upstreamSourcePath: "not applicable",
  upstreamCommitHash: "not applicable",
  disposition: "REWRITE",
};

export const descriptionDuplicateRule: RuleDefinition = {
  id: "META-006",
  provenance,
  name: "Multiple meta description tags",
  description: 'Checks that only one <meta name="description"> tag exists in the document',
  category: "metadata",
  executionMode: "static",
  defaultSeverity: "high",
  defaultImpact: "Multiple meta description tags confuse search engines and dilute messaging",
  defaultEffort: "low",
  scored: true,
  signalOwner: "metadata",
  ruleVersion: 1,
  evaluator: (snapshot) => {
    const descriptionEntries = snapshot.metadata.filter((m) => m.name === "description");
    const count = descriptionEntries.length;

    if (count === 0) {
      return failed(
        "META-006",
        'No <meta name="description"> tag found in the document',
        0,
        "metadata",
        1,
        {
          severity: "high",
          effort: "low",
          impact: "Missing meta description reduces click-through rates from search results",
          source: "html-parse",
          responsible: "seo",
          steps: [
            'Add exactly one <meta name="description"> tag to the document head',
            "Write a compelling description between 120-160 characters",
          ],
        },
      );
    }

    if (count > 1) {
      return failed(
        "META-006",
        `Found ${count} meta description tags; only one is allowed`,
        count,
        "metadata",
        1,
        {
          severity: "high",
          effort: "low",
          impact:
            "Multiple description tags send conflicting signals; search engines may ignore all of them",
          source: "html-parse",
          responsible: "developer",
          steps: [
            'Remove all but one <meta name="description"> tag from the document head',
            "Keep the most compelling and well-crafted description",
          ],
          developerNotes:
            "Search engines typically only read the first description tag they encounter",
        },
      );
    }

    return passed("META-006", "Single meta description tag found", 1, "metadata", 1, {
      source: "html-parse",
    });
  },
};
