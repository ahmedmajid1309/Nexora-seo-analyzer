import type { RuleDefinition, Provenance } from "../types";
import type { PageSnapshot } from "@/lib/extraction/schemas";
import { passed, warning } from "../helpers/result";
import { getUrlLength } from "../helpers/urls";

const provenance: Provenance = {
  upstreamRuleId: "not applicable",
  upstreamSourcePath: "not applicable",
  upstreamCommitHash: "not applicable",
  disposition: "REWRITE",
};

export const urlLengthRule: RuleDefinition = {
  provenance,
  id: "URL-002",
  name: "URL length is reasonable",
  description:
    "Checks that the page URL does not exceed 2000 characters, which can cause issues with some user agents and proxies.",
  category: "url",
  executionMode: "static",
  defaultSeverity: "low",
  defaultImpact:
    "Very long URLs may be truncated in browsers, emails, and may cause issues with some web servers.",
  defaultEffort: "medium",
  scored: true,
  signalOwner: "url",
  ruleVersion: 1,
  evaluator: (snapshot: PageSnapshot) => {
    const url = snapshot.finalUrl;
    const length = getUrlLength(url);

    if (length <= 2000) {
      return passed("URL-002", `URL length is ${length} characters`, length, "url", "≤ 2000", {
        severity: "low",
        impact: "URL is within acceptable length limits.",
        effort: "low",
        source: "http-response",
        responsible: "developer",
      });
    }

    return warning(
      "URL-002",
      `URL length is ${length} characters, which exceeds 2000`,
      length,
      "url",
      "≤ 2000",
      {
        severity: "low",
        impact: "Excessively long URLs may be truncated or cause issues in some contexts.",
        effort: "medium",
        source: "http-response",
        responsible: "developer",
        confidence: 70,
      },
    );
  },
};
