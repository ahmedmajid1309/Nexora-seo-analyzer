import type { RuleDefinition, Provenance } from "../types";
import type { PageSnapshot } from "@/lib/extraction/schemas";
import { passed, failed, notApplicable } from "../helpers/result";
import { getProtocol, isValidUrl } from "../helpers/urls";

const provenance: Provenance = {
  upstreamRuleId: "not applicable",
  upstreamSourcePath: "not applicable",
  upstreamCommitHash: "not applicable",
  disposition: "REWRITE",
};

export const nonHttpCanonicalRule: RuleDefinition = {
  provenance,
  id: "URL-009",
  name: "Non-HTTP canonical scheme",
  description: "Checks that the canonical URL uses http or https scheme",
  category: "url",
  executionMode: "static",
  defaultSeverity: "high",
  defaultImpact: "Canonical with non-HTTP scheme will be ignored by search engines",
  defaultEffort: "low",
  scored: true,
  signalOwner: "url",
  ruleVersion: 1,
  evaluator: (snapshot: PageSnapshot) => {
    const canonical = snapshot.document.baseHref;
    if (!canonical) {
      return notApplicable(
        "URL-009",
        "No canonical URL defined",
        "url",
        "No canonical to evaluate",
      );
    }
    if (!isValidUrl(canonical)) {
      return notApplicable(
        "URL-009",
        "Canonical URL is not valid",
        "url",
        "Cannot check scheme of invalid URL",
      );
    }
    const protocol = getProtocol(canonical);
    if (protocol !== "https:" && protocol !== "http:") {
      return failed(
        "URL-009",
        `Canonical uses non-HTTP scheme: ${protocol}`,
        protocol,
        "url",
        "https:",
        {
          severity: "high",
          source: "html-parse",
          selector: "link[rel=canonical]",
          responsible: "developer",
          steps: ["Change the canonical URL to use HTTPS or HTTP scheme"],
        },
      );
    }
    return passed("URL-009", "Canonical uses valid HTTP/HTTPS scheme", protocol, "url", "https:", {
      severity: "informational",
      source: "html-parse",
    });
  },
};
