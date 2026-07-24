import type { RuleDefinition, Provenance } from "../types";
import type { PageSnapshot } from "@/lib/extraction/schemas";
import { passed, warning } from "../helpers/result";
import { hasTrackingParams } from "../helpers/urls";

const provenance: Provenance = {
  upstreamRuleId: "not applicable",
  upstreamSourcePath: "not applicable",
  upstreamCommitHash: "not applicable",
  disposition: "REWRITE",
};

export const trackingParamsRule: RuleDefinition = {
  provenance,
  id: "URL-006",
  name: "Tracking parameters present",
  description: "Checks for common tracking/UTM parameters in the URL (informational)",
  category: "url",
  executionMode: "static",
  defaultSeverity: "informational",
  defaultImpact:
    "Tracking parameters are useful for campaign analysis but may create duplicate URL variations",
  defaultEffort: "low",
  scored: false,
  signalOwner: "url",
  ruleVersion: 1,
  evaluator: (snapshot: PageSnapshot) => {
    if (hasTrackingParams(snapshot.finalUrl)) {
      return warning("URL-006", "URL contains tracking parameters", true, "url", false, {
        severity: "informational",
        source: "http-response",
        responsible: "seo",
      });
    }
    return passed("URL-006", "No tracking parameters detected", false, "url", false, {
      severity: "informational",
      source: "http-response",
    });
  },
};
