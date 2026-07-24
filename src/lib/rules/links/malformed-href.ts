import { passed, failed, notApplicable } from "../helpers/result";
import type { RuleDefinition, Provenance } from "../types";
import type { PageSnapshot } from "@/lib/extraction/schemas";

const provenance: Provenance = {
  upstreamRuleId: "not applicable",
  upstreamSourcePath: "not applicable",
  upstreamCommitHash: "not applicable",
  disposition: "REWRITE",
};

export const malformedHref: RuleDefinition = {
  id: "LINK-001",
  name: "Malformed Href",
  description:
    "Checks for links with malformed href attributes that are not valid URLs, empty, or special protocols",
  category: "links",
  executionMode: "static",
  defaultSeverity: "high",
  defaultImpact: "Malformed links can confuse crawlers and degrade user experience",
  defaultEffort: "low",
  scored: true,
  provenance,
  signalOwner: "links",
  ruleVersion: 1,
  evaluator: (snapshot: PageSnapshot) => {
    const links = snapshot.links;
    if (links.length === 0) {
      return notApplicable("LINK-001", "No links found on page", "links", "No links to evaluate");
    }

    const malformed = links.filter((l) => l.classification === "malformed");

    if (malformed.length > 0) {
      return failed(
        "LINK-001",
        `Found ${malformed.length} link(s) with malformed href`,
        malformed.length,
        "links",
        0,
        {
          severity: "high",
          samples: malformed.slice(0, 3).map((l) => l.rawHref),
        },
      );
    }

    return passed("LINK-001", "All links have valid href attributes", 0, "links");
  },
};
