import { passed, warning, notApplicable } from "../helpers/result";
import type { RuleDefinition, Provenance } from "../types";
import type { PageSnapshot } from "@/lib/extraction/schemas";

const provenance: Provenance = {
  upstreamRuleId: "not applicable",
  upstreamSourcePath: "not applicable",
  upstreamCommitHash: "not applicable",
  disposition: "REWRITE",
};

const EXCESSIVE_THRESHOLD = 150;

export const excessiveLinks: RuleDefinition = {
  id: "LINK-007",
  name: "Excessive Number of Links",
  description: "Flags pages with an excessive number of links which can dilute page authority",
  category: "links",
  executionMode: "static",
  defaultSeverity: "medium",
  defaultImpact: "Too many links can dilute PageRank and confuse users",
  defaultEffort: "medium",
  scored: true,
  provenance,
  signalOwner: "links",
  ruleVersion: 1,
  evaluator: (snapshot: PageSnapshot) => {
    const total = snapshot.links.length;
    if (total === 0) {
      return notApplicable("LINK-007", "No links found on page", "links", "No links to evaluate");
    }

    if (total > EXCESSIVE_THRESHOLD) {
      return warning(
        "LINK-007",
        `Page contains ${total} links (exceeds ${EXCESSIVE_THRESHOLD} advisory threshold)`,
        total,
        "links",
        EXCESSIVE_THRESHOLD,
        {
          severity: "medium",
        },
      );
    }

    return passed(
      "LINK-007",
      `Page contains ${total} links within acceptable range`,
      total,
      "links",
      EXCESSIVE_THRESHOLD,
    );
  },
};
