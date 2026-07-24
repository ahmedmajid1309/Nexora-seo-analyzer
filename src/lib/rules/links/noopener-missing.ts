import { passed, failed, notApplicable } from "../helpers/result";
import type { RuleDefinition, Provenance } from "../types";
import type { PageSnapshot } from "@/lib/extraction/schemas";

const provenance: Provenance = {
  upstreamRuleId: "not applicable",
  upstreamSourcePath: "not applicable",
  upstreamCommitHash: "not applicable",
  disposition: "REWRITE",
};

export const noopenerMissing: RuleDefinition = {
  id: "LINK-004",
  name: "Missing Noopener on External Links",
  description:
    "Checks that links with target=_blank include rel=noopener or rel=noreferrer for security",
  category: "links",
  executionMode: "static",
  defaultSeverity: "high",
  defaultImpact: "Missing noopener creates a security vulnerability (tabnabbing)",
  defaultEffort: "low",
  scored: true,
  provenance,
  signalOwner: "links",
  ruleVersion: 1,
  evaluator: (snapshot: PageSnapshot) => {
    const links = snapshot.links;
    if (links.length === 0) {
      return notApplicable("LINK-004", "No links found on page", "links", "No links to evaluate");
    }

    const blankTarget = links.filter((l) => l.target === "_blank");
    if (blankTarget.length === 0) {
      return notApplicable(
        "LINK-004",
        "No target=_blank links found",
        "links",
        "No links with target=_blank",
      );
    }

    const missing = blankTarget.filter((l) => {
      const relLower = l.relTokens.map((r) => r.toLowerCase());
      return !relLower.includes("noopener") && !relLower.includes("noreferrer");
    });

    if (missing.length > 0) {
      return failed(
        "LINK-004",
        `Found ${missing.length} target=_blank link(s) missing rel=noopener`,
        missing.length,
        "links",
        0,
        {
          severity: "high",
          samples: missing.slice(0, 3).map((l) => l.rawHref),
        },
      );
    }

    return passed(
      "LINK-004",
      "All target=_blank links include rel=noopener or rel=noreferrer",
      0,
      "links",
    );
  },
};
