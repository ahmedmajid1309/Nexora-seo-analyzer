import type { RuleDefinition, Provenance } from "../types";
import type { PageSnapshot } from "@/lib/extraction/schemas";
import { passed, warning } from "../helpers/result";
import { hasUnderscoreInPath } from "../helpers/urls";

const provenance: Provenance = {
  upstreamRuleId: "not applicable",
  upstreamSourcePath: "not applicable",
  upstreamCommitHash: "not applicable",
  disposition: "REWRITE",
};

export const underscorePathRule: RuleDefinition = {
  provenance,
  id: "URL-004",
  name: "URL path contains underscores",
  description:
    "Flags underscores in the URL path; hyphens are generally preferred for word separation in URLs.",
  category: "url",
  executionMode: "static",
  defaultSeverity: "low",
  defaultImpact:
    "Search engines treat hyphens as word separators but underscores are not, making URLs with underscores less readable and potentially less SEO-friendly.",
  defaultEffort: "low",
  scored: true,
  signalOwner: "url",
  ruleVersion: 1,
  evaluator: (snapshot: PageSnapshot) => {
    const url = snapshot.finalUrl;
    const hasUnderscore = hasUnderscoreInPath(url);

    if (!hasUnderscore) {
      return passed("URL-004", "URL path contains no underscores", false, "url", false, {
        severity: "low",
        impact: "URL uses hyphens instead of underscores for word separation.",
        effort: "low",
        source: "http-response",
        responsible: "developer",
      });
    }

    return warning("URL-004", "URL path contains underscores", true, "url", false, {
      severity: "low",
      impact:
        "Underscores in URLs are not treated as word separators by search engines; consider using hyphens.",
      effort: "low",
      source: "http-response",
      responsible: "developer",
      confidence: 80,
    });
  },
};
