import type { RuleDefinition, Provenance } from "../types";
import type { PageSnapshot } from "@/lib/extraction/schemas";
import { passed, warning, notApplicable } from "../helpers/result";
import { hasFragment } from "../helpers/urls";

const provenance: Provenance = {
  upstreamRuleId: "not applicable",
  upstreamSourcePath: "not applicable",
  upstreamCommitHash: "not applicable",
  disposition: "REWRITE",
};

export const fragmentCanonicalRule: RuleDefinition = {
  provenance,
  id: "URL-008",
  name: "Canonical URL fragment check",
  description: "Checks that the canonical URL does not contain a fragment (#)",
  category: "url",
  executionMode: "static",
  defaultSeverity: "low",
  defaultImpact: "Canonical URLs with fragments may not be interpreted correctly by search engines",
  defaultEffort: "low",
  scored: true,
  signalOwner: "url",
  ruleVersion: 1,
  evaluator: (snapshot: PageSnapshot) => {
    const canonical = snapshot.document.baseHref;
    if (!canonical) {
      return notApplicable(
        "URL-008",
        "No canonical URL defined",
        "url",
        "No canonical to evaluate",
      );
    }
    if (hasFragment(canonical)) {
      return warning(
        "URL-008",
        "Canonical URL contains a fragment",
        `#${canonical.split("#")[1]}`,
        "url",
        false,
        {
          severity: "low",
          source: "html-parse",
          selector: "link[rel=canonical]",
          responsible: "developer",
          steps: [
            "Remove the fragment (#) from the canonical URL",
            "Ensure the canonical points to the clean URL",
          ],
        },
      );
    }
    return passed("URL-008", "Canonical URL has no fragment", false, "url", false, {
      severity: "informational",
      source: "html-parse",
    });
  },
};
