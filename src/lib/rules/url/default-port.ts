import type { RuleDefinition, Provenance } from "../types";
import type { PageSnapshot } from "@/lib/extraction/schemas";
import { passed, warning } from "../helpers/result";
import { hasDefaultPort } from "../helpers/urls";

const provenance: Provenance = {
  upstreamRuleId: "not applicable",
  upstreamSourcePath: "not applicable",
  upstreamCommitHash: "not applicable",
  disposition: "REWRITE",
};

export const defaultPortRule: RuleDefinition = {
  provenance,
  id: "URL-010",
  name: "Default port representation",
  description: "Checks if the URL includes the default port (e.g., :80 for HTTP, :443 for HTTPS)",
  category: "url",
  executionMode: "static",
  defaultSeverity: "informational",
  defaultImpact: "Default ports are unnecessary and waste URL characters",
  defaultEffort: "low",
  scored: false,
  signalOwner: "url",
  ruleVersion: 1,
  evaluator: (snapshot: PageSnapshot) => {
    if (hasDefaultPort(snapshot.finalUrl)) {
      return warning("URL-010", "URL contains default port number", true, "url", false, {
        severity: "informational",
        source: "http-response",
        responsible: "developer",
        steps: [
          "Remove the default port number from the URL (e.g., use https://example.com not https://example.com:443)",
        ],
      });
    }
    return passed("URL-010", "No default port in URL", false, "url", false, {
      severity: "informational",
      source: "http-response",
    });
  },
};
