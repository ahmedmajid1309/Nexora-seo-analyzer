import type { RuleDefinition, Provenance } from "../types";
import type { PageSnapshot } from "@/lib/extraction/schemas";
import { passed, warning } from "../helpers/result";
import { hasRepeatedSeparators } from "../helpers/urls";

const provenance: Provenance = {
  upstreamRuleId: "not applicable",
  upstreamSourcePath: "not applicable",
  upstreamCommitHash: "not applicable",
  disposition: "REWRITE",
};

export const repeatedSeparatorsRule: RuleDefinition = {
  provenance,
  id: "URL-005",
  name: "Repeated path separators",
  description: "Checks for consecutive forward slashes (//) in the URL path",
  category: "url",
  executionMode: "static",
  defaultSeverity: "low",
  defaultImpact: "Repeated slashes may cause unexpected URL normalization and duplicate content",
  defaultEffort: "low",
  scored: true,
  signalOwner: "url",
  ruleVersion: 1,
  evaluator: (snapshot: PageSnapshot) => {
    if (hasRepeatedSeparators(snapshot.finalUrl)) {
      return warning("URL-005", "URL path contains repeated slashes", true, "url", false, {
        severity: "low",
        source: "http-response",
        responsible: "developer",
      });
    }
    return passed("URL-005", "No repeated path separators", false, "url", false, {
      severity: "informational",
      source: "http-response",
    });
  },
};
