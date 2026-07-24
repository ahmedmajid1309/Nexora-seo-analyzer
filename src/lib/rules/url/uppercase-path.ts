import type { RuleDefinition, Provenance } from "../types";
import type { PageSnapshot } from "@/lib/extraction/schemas";
import { passed, warning } from "../helpers/result";
import { hasUppercaseInPath } from "../helpers/urls";

const provenance: Provenance = {
  upstreamRuleId: "not applicable",
  upstreamSourcePath: "not applicable",
  upstreamCommitHash: "not applicable",
  disposition: "REWRITE",
};

export const uppercasePathRule: RuleDefinition = {
  provenance,
  id: "URL-003",
  name: "URL path contains uppercase characters",
  description:
    "Flags uppercase letters in the URL path, which can cause duplicate content issues on case-sensitive systems.",
  category: "url",
  executionMode: "static",
  defaultSeverity: "low",
  defaultImpact:
    "Uppercase characters in URLs can lead to duplicate content when servers treat paths case-sensitively.",
  defaultEffort: "low",
  scored: true,
  signalOwner: "url",
  ruleVersion: 1,
  evaluator: (snapshot: PageSnapshot) => {
    const url = snapshot.finalUrl;
    const hasUpper = hasUppercaseInPath(url);

    if (!hasUpper) {
      return passed("URL-003", "URL path contains no uppercase characters", false, "url", false, {
        severity: "low",
        impact: "URL path is lowercase, avoiding case-sensitivity issues.",
        effort: "low",
        source: "http-response",
        responsible: "developer",
      });
    }

    return warning("URL-003", "URL path contains uppercase characters", true, "url", false, {
      severity: "low",
      impact: "Uppercase characters in URLs may cause duplicate content on case-sensitive systems.",
      effort: "low",
      source: "http-response",
      responsible: "developer",
      confidence: 75,
    });
  },
};
