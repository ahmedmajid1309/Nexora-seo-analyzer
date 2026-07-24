import { passed, failed, notApplicable } from "../helpers/result";
import type { RuleDefinition, Provenance } from "../types";
import type { PageSnapshot } from "@/lib/extraction/schemas";

const provenance: Provenance = {
  upstreamRuleId: "not applicable",
  upstreamSourcePath: "not applicable",
  upstreamCommitHash: "not applicable",
  disposition: "REWRITE",
};

export const javascriptUrl: RuleDefinition = {
  id: "LINK-003",
  name: "JavaScript Protocol Links",
  description: "Checks for links using javascript: protocol which are inaccessible to crawlers",
  category: "links",
  executionMode: "static",
  defaultSeverity: "high",
  defaultImpact: "JavaScript links are not crawlable by search engines and break accessibility",
  defaultEffort: "low",
  scored: true,
  provenance,
  signalOwner: "links",
  ruleVersion: 1,
  evaluator: (snapshot: PageSnapshot) => {
    const links = snapshot.links;
    if (links.length === 0) {
      return notApplicable("LINK-003", "No links found on page", "links", "No links to evaluate");
    }

    const jsLinks = links.filter((l) => l.classification === "javascript");

    if (jsLinks.length > 0) {
      return failed(
        "LINK-003",
        `Found ${jsLinks.length} link(s) using javascript: protocol`,
        jsLinks.length,
        "links",
        0,
        {
          severity: "high",
          samples: jsLinks.slice(0, 3).map((l) => l.rawHref),
        },
      );
    }

    return passed("LINK-003", "No javascript: protocol links found", 0, "links");
  },
};
