import { passed, failed } from "../helpers/result";
import type { RuleDefinition, Provenance } from "../types";

const provenance: Provenance = {
  upstreamRuleId: "not applicable",
  upstreamSourcePath: "not applicable",
  upstreamCommitHash: "not applicable",
  disposition: "REWRITE",
};

export const titleDuplicateRule: RuleDefinition = {
  id: "META-003",
  provenance,
  name: "Multiple title elements",
  description: "Checks that only one <title> element exists in the document",
  category: "metadata",
  executionMode: "static",
  defaultSeverity: "high",
  defaultImpact:
    "Multiple title elements confuse search engines about which title to use for indexing",
  defaultEffort: "low",
  scored: true,
  signalOwner: "metadata",
  ruleVersion: 1,
  evaluator: (snapshot) => {
    const count = snapshot.document.titleElementCount;

    if (count === 0) {
      return failed("META-003", "No <title> element found in the document", 0, "metadata", 1, {
        severity: "critical",
        effort: "low",
        impact: "Missing title tag severely impacts search rankings and social sharing",
        source: "html-parse",
        responsible: "seo",
        steps: [
          "Add a single <title> element to the document <head>",
          "Remove any duplicate title elements if present",
        ],
      });
    }

    if (count > 1) {
      return failed(
        "META-003",
        `Found ${count} <title> elements; only one is allowed`,
        count,
        "metadata",
        1,
        {
          severity: "high",
          effort: "low",
          impact: "Multiple title elements send conflicting signals about the page topic",
          source: "html-parse",
          responsible: "developer",
          steps: [
            "Remove all but one <title> element from the document head",
            "Keep the most descriptive and keyword-rich title",
          ],
          developerNotes:
            "Search engines may ignore all titles when multiple are present, or pick inconsistently",
        },
      );
    }

    return passed("META-003", "Single <title> element found", count, "metadata", 1, {
      source: "html-parse",
    });
  },
};
