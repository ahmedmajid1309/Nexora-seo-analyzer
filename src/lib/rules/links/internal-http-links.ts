import { passed, failed, notApplicable } from "../helpers/result";
import { isHttps } from "../helpers/urls";
import type { RuleDefinition, Provenance } from "../types";
import type { PageSnapshot } from "@/lib/extraction/schemas";

const provenance: Provenance = {
  upstreamRuleId: "not applicable",
  upstreamSourcePath: "not applicable",
  upstreamCommitHash: "not applicable",
  disposition: "REWRITE",
};

export const internalHttpLinks: RuleDefinition = {
  id: "LINK-006",
  name: "Internal HTTP Links on HTTPS Page",
  description:
    "Checks for internal links using HTTP on an HTTPS page, which breaks mixed content security",
  category: "links",
  executionMode: "static",
  defaultSeverity: "high",
  defaultImpact: "Mixed content warnings and weaker security for users",
  defaultEffort: "medium",
  scored: true,
  provenance,
  signalOwner: "links",
  ruleVersion: 1,
  evaluator: (snapshot: PageSnapshot) => {
    const links = snapshot.links;
    if (links.length === 0) {
      return notApplicable("LINK-006", "No links found on page", "links", "No links to evaluate");
    }

    if (!isHttps(snapshot.finalUrl)) {
      return notApplicable(
        "LINK-006",
        "Page is not served over HTTPS",
        "links",
        "Not an HTTPS page",
      );
    }

    const httpInternal = links.filter((l) => l.classification === "http" && l.isSameOrigin);

    if (httpInternal.length > 0) {
      return failed(
        "LINK-006",
        `Found ${httpInternal.length} internal HTTP link(s) on HTTPS page`,
        httpInternal.length,
        "links",
        0,
        {
          severity: "high",
          samples: httpInternal.slice(0, 3).map((l) => l.rawHref),
        },
      );
    }

    return passed("LINK-006", "No internal HTTP links found on HTTPS page", 0, "links");
  },
};
