import { passed, warning, failed } from "../helpers/result";
import { isValidUrl } from "../helpers/urls";
import type { RuleDefinition } from "../types";

export const canonicalValidRule: RuleDefinition = {
  id: "META-008",
  name: "Canonical URL is valid absolute URL",
  description: "Checks that the canonical URL is a well-formed, absolute, resolvable URL",
  category: "metadata",
  executionMode: "static",
  defaultSeverity: "high",
  defaultImpact:
    "Invalid or malformed canonical URLs are ignored by search engines, defeating their purpose",
  defaultEffort: "low",
  scored: true,
  signalOwner: "metadata",
  ruleVersion: 1,
  provenance: {
    upstreamRuleId: "core-canonical-valid",
    upstreamSourcePath: "src/rules/core/canonical-valid.ts",
    upstreamCommitHash: "bbca017b56086a2959382d8260b97021736ca18f",
    disposition: "PORT_WITH_MODIFICATIONS",
    modifications:
      "Adapted for Nexora PageSnapshot-based evaluator; uses Nexora result helpers; uses isValidUrl helper",
  },
  evaluator: (snapshot) => {
    const canonical = snapshot.document.baseHref;

    if (canonical === null) {
      return warning(
        "META-008",
        'No <link rel="canonical"> tag found; cannot validate canonical URL',
        null,
        "metadata",
        true,
        {
          severity: "informational",
          effort: "low",
          impact: "Cannot validate canonical URL without a canonical tag",
          source: "html-parse",
          responsible: "seo",
        },
      );
    }

    const trimmed = canonical.trim();
    if (trimmed.length === 0) {
      return failed(
        "META-008",
        "Canonical link tag exists but has an empty href attribute",
        trimmed,
        "metadata",
        "valid absolute URL",
        {
          severity: "high",
          effort: "low",
          impact: "Empty canonical href is ignored by search engines",
          source: "html-parse",
          responsible: "developer",
          selector: 'link[rel="canonical"]',
          steps: [
            "Provide a valid absolute URL in the canonical href attribute",
            'Example: <link rel="canonical" href="https://example.com/page/">',
          ],
        },
      );
    }

    if (!isValidUrl(trimmed)) {
      return failed(
        "META-008",
        `Canonical URL is not a valid absolute URL: "${trimmed}"`,
        trimmed,
        "metadata",
        "valid absolute URL (e.g., https://example.com/page/)",
        {
          severity: "high",
          effort: "low",
          impact: "Invalid canonical URLs are ignored by search engines",
          source: "html-parse",
          responsible: "developer",
          confidence: 100,
          selector: 'link[rel="canonical"]',
          steps: [
            "Replace the invalid canonical URL with a properly formatted absolute URL",
            "Ensure the URL includes the protocol (https://) and full path",
          ],
          developerNotes:
            "Canonical URLs must be absolute (include protocol and hostname) to be valid",
        },
      );
    }

    return passed(
      "META-008",
      "Canonical URL is a valid absolute URL",
      trimmed,
      "metadata",
      "valid absolute URL",
      {
        source: "html-parse",
        selector: 'link[rel="canonical"]',
      },
    );
  },
};
