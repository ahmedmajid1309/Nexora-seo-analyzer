import { passed, warning, notApplicable } from "../helpers/result";
import type { RuleDefinition, Provenance } from "../types";
import type { PageSnapshot } from "@/lib/extraction/schemas";

const provenance: Provenance = {
  upstreamRuleId: "not applicable",
  upstreamSourcePath: "not applicable",
  upstreamCommitHash: "not applicable",
  disposition: "REWRITE",
};

const GENERIC_PHRASES = [
  "click here",
  "read more",
  "learn more",
  "here",
  "this",
  "more",
  "link",
  "go",
  "details",
  "info",
  "this page",
  "this article",
  "this site",
  "view",
];

export const genericAnchorText: RuleDefinition = {
  id: "LINK-005",
  name: "Generic Anchor Text",
  description: "Flags links using generic or non-descriptive anchor text that hurts SEO",
  category: "links",
  executionMode: "static",
  defaultSeverity: "medium",
  defaultImpact: "Generic anchor text provides poor contextual signals to search engines",
  defaultEffort: "low",
  scored: true,
  provenance,
  signalOwner: "links",
  ruleVersion: 1,
  evaluator: (snapshot: PageSnapshot) => {
    const links = snapshot.links;
    if (links.length === 0) {
      return notApplicable("LINK-005", "No links found on page", "links", "No links to evaluate");
    }

    const generic = links.filter((l) => {
      const text = l.anchorText.trim().toLowerCase();
      return GENERIC_PHRASES.some((phrase) => text === phrase || text.startsWith(phrase + " "));
    });

    if (generic.length > 0) {
      return warning(
        "LINK-005",
        `Found ${generic.length} link(s) with generic anchor text`,
        generic.length,
        "links",
        0,
        {
          severity: "medium",
          samples: generic.slice(0, 3).map((l) => `"${l.anchorText}" -> ${l.rawHref}`),
        },
      );
    }

    return passed("LINK-005", "All links use descriptive anchor text", 0, "links");
  },
};
