import type { RuleDefinition, Provenance } from "../types";
import type { PageSnapshot } from "@/lib/extraction/schemas";
import { passed, warning } from "../helpers/result";
import { hasSessionParams } from "../helpers/urls";

const provenance: Provenance = {
  upstreamRuleId: "not applicable",
  upstreamSourcePath: "not applicable",
  upstreamCommitHash: "not applicable",
  disposition: "REWRITE",
};

export const sessionParamsRule: RuleDefinition = {
  provenance,
  id: "URL-007",
  name: "Session parameters present",
  description: "Checks for session-like parameters (sid, session, phpsessid) in the URL",
  category: "url",
  executionMode: "static",
  defaultSeverity: "low",
  defaultImpact: "Session IDs in URLs can cause duplicate content and security concerns",
  defaultEffort: "medium",
  scored: true,
  signalOwner: "url",
  ruleVersion: 1,
  evaluator: (snapshot: PageSnapshot) => {
    if (hasSessionParams(snapshot.finalUrl)) {
      return warning("URL-007", "URL contains session-like parameters", true, "url", false, {
        severity: "low",
        source: "http-response",
        responsible: "developer",
        steps: ["Move session tracking to cookies instead of URL parameters"],
      });
    }
    return passed("URL-007", "No session parameters detected", false, "url", false, {
      severity: "informational",
      source: "http-response",
    });
  },
};
