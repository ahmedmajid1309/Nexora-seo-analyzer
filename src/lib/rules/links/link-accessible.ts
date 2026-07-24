import { passed, failed, notApplicable } from "../helpers/result";
import type { RuleDefinition, Provenance } from "../types";
import type { PageSnapshot } from "@/lib/extraction/schemas";

const provenance: Provenance = {
  upstreamRuleId: "not applicable",
  upstreamSourcePath: "not applicable",
  upstreamCommitHash: "not applicable",
  disposition: "REWRITE",
};

export const linkAccessible: RuleDefinition = {
  id: "LINK-008",
  name: "Links Without Accessible Name",
  description: "Checks for links that have no accessible name (empty text and no aria-label/title)",
  category: "links",
  executionMode: "static",
  defaultSeverity: "high",
  defaultImpact: "Links without accessible names are unusable by screen readers",
  defaultEffort: "low",
  scored: true,
  provenance,
  signalOwner: "accessibility",
  ruleVersion: 1,
  evaluator: (snapshot: PageSnapshot) => {
    const { total, withoutName } = snapshot.accessibility.linkAccessibleNames;

    if (total === 0) {
      return notApplicable("LINK-008", "No links found on page", "links", "No links to evaluate");
    }

    if (withoutName > 0) {
      return failed(
        "LINK-008",
        `Found ${withoutName} link(s) without accessible name out of ${total}`,
        withoutName,
        "links",
        0,
        {
          severity: "high",
        },
      );
    }

    return passed("LINK-008", "All links have accessible names", withoutName, "links", 0);
  },
};
