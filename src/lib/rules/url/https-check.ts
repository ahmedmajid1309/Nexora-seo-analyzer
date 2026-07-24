import type { RuleDefinition, Provenance } from "../types";
import type { PageSnapshot } from "@/lib/extraction/schemas";
import { passed, failed } from "../helpers/result";
import { isHttps } from "../helpers/urls";

const provenance: Provenance = {
  upstreamRuleId: "not applicable",
  upstreamSourcePath: "not applicable",
  upstreamCommitHash: "not applicable",
  disposition: "REWRITE",
};

export const httpsCheckRule: RuleDefinition = {
  provenance,
  id: "URL-001",
  name: "Page uses HTTPS",
  description: "Checks that the final page URL uses the HTTPS protocol for secure communication",
  category: "url",
  executionMode: "static",
  defaultSeverity: "high",
  defaultImpact:
    "HTTPS is required for data integrity, user trust, and is a confirmed ranking signal",
  defaultEffort: "medium",
  scored: true,
  signalOwner: "url",
  ruleVersion: 1,
  evaluator: (snapshot: PageSnapshot) => {
    const url = snapshot.finalUrl;
    if (isHttps(url)) {
      return passed("URL-001", "Page is served over HTTPS", true, "url", true, {
        severity: "low",
        impact: "Connection is secure",
        effort: "low",
        source: "http-response",
        responsible: "developer",
      });
    }
    return failed("URL-001", "Page is not served over HTTPS", false, "url", true, {
      severity: "high",
      source: "http-response",
      responsible: "developer",
      steps: [
        "Install an SSL/TLS certificate from a trusted certificate authority",
        "Configure your web server to redirect HTTP to HTTPS",
        "Update all internal links to use HTTPS URLs",
      ],
    });
  },
};
