import { passed, failed } from "../helpers/result";
import { hasFragment } from "../helpers/urls";
import type { RuleDefinition, Provenance } from "../types";

const provenance: Provenance = {
  upstreamRuleId: "not applicable",
  upstreamSourcePath: "not applicable",
  upstreamCommitHash: "not applicable",
  disposition: "REWRITE",
};

export const canonicalFragmentRule: RuleDefinition = {
  id: "META-009",
  provenance,
  name: "Canonical URL without fragment",
  description: "Checks that the canonical URL does not contain a fragment identifier (#)",
  category: "metadata",
  executionMode: "static",
  defaultSeverity: "high",
  defaultImpact:
    "Fragment identifiers in canonical URLs may be ignored by search engines or cause indexing issues",
  defaultEffort: "low",
  scored: true,
  signalOwner: "metadata",
  ruleVersion: 1,
  evaluator: (snapshot) => {
    const canonical = snapshot.document.baseHref;

    if (canonical === null) {
      return failed(
        "META-009",
        'No <link rel="canonical"> tag found; check META-007 first',
        null,
        "metadata",
        "canonical URL without fragment",
        {
          severity: "informational",
          effort: "low",
          impact: "Cannot check canonical fragment without a canonical tag",
          source: "html-parse",
          responsible: "seo",
        },
      );
    }

    const trimmed = canonical.trim();
    if (trimmed.length === 0) {
      return failed(
        "META-009",
        "Canonical link tag exists but has an empty href attribute",
        trimmed,
        "metadata",
        "canonical URL without fragment",
        {
          severity: "high",
          effort: "low",
          impact: "Empty canonical href cannot be checked for fragments",
          source: "html-parse",
          responsible: "developer",
          selector: 'link[rel="canonical"]',
        },
      );
    }

    if (hasFragment(trimmed)) {
      return failed(
        "META-009",
        `Canonical URL contains a fragment identifier: "${trimmed}"`,
        trimmed,
        "metadata",
        "canonical URL without #fragment",
        {
          severity: "high",
          effort: "low",
          impact: "Fragment identifiers in canonical URLs may be stripped by search engines",
          source: "html-parse",
          responsible: "developer",
          confidence: 95,
          selector: 'link[rel="canonical"]',
          steps: [
            "Remove the fragment identifier from the canonical URL",
            "Use the URL without the #fragment suffix",
          ],
          developerNotes:
            "Fragment identifiers refer to a section within a page; search engines typically ignore them",
        },
      );
    }

    return passed(
      "META-009",
      "Canonical URL does not contain a fragment identifier",
      trimmed,
      "metadata",
      "canonical URL without #fragment",
      {
        source: "html-parse",
        selector: 'link[rel="canonical"]',
      },
    );
  },
};
