import { passed, failed, notApplicable } from "../helpers/result";
import type { RuleDefinition, Provenance } from "../types";
import type { PageSnapshot } from "@/lib/extraction/schemas";

const provenance: Provenance = {
  upstreamRuleId: "not applicable",
  upstreamSourcePath: "not applicable",
  upstreamCommitHash: "not applicable",
  disposition: "REWRITE",
};

export const emptyHref: RuleDefinition = {
  id: "LINK-002",
  name: "Empty Href",
  description: "Checks for links with empty href values or plain # references",
  category: "links",
  executionMode: "static",
  defaultSeverity: "high",
  defaultImpact: "Empty links provide no navigation value and waste crawl budget",
  defaultEffort: "low",
  scored: true,
  provenance,
  signalOwner: "links",
  ruleVersion: 1,
  evaluator: (snapshot: PageSnapshot) => {
    const links = snapshot.links;
    if (links.length === 0) {
      return notApplicable("LINK-002", "No links found on page", "links", "No links to evaluate");
    }

    const empty = links.filter((l) => l.classification === "empty");

    if (empty.length > 0) {
      return failed(
        "LINK-002",
        `Found ${empty.length} link(s) with empty href`,
        empty.length,
        "links",
        0,
        {
          severity: "high",
          samples: empty.slice(0, 3).map((l) => l.rawHref),
        },
      );
    }

    return passed("LINK-002", "No links with empty href found", 0, "links");
  },
};
