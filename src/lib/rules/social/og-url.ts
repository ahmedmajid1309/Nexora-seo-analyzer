import type { RuleDefinition, Provenance } from "../types";
import type { PageSnapshot } from "@/lib/extraction/schemas";
import { passed, warning, notApplicable } from "../helpers/result";
import { hasCanonical } from "../helpers/evidence";

const provenance: Provenance = {
  upstreamRuleId: "SOCIAL-004",
  upstreamSourcePath: "src/rules/social/og-url.ts",
  upstreamCommitHash: "bbca017b56086a2959382d8260b97021736ca18f",
  disposition: "PORT_AS_IS",
};

export const ogUrlRule: RuleDefinition = {
  id: "SOCIAL-004",
  name: "Open Graph URL is present and consistent with canonical",
  description:
    "Checks that the page defines an og:url meta tag and optionally verifies consistency with the canonical URL.",
  category: "social",
  executionMode: "static",
  defaultSeverity: "informational",
  defaultImpact:
    "Consistent og:url and canonical URLs help prevent duplicate content signals across social and search.",
  defaultEffort: "low",
  scored: false,
  provenance,
  signalOwner: "social",
  ruleVersion: 1,
  evaluator: (snapshot: PageSnapshot) => {
    const ogEntry = snapshot.social.openGraph.find((og) => og.property === "og:url");
    const ogUrl = ogEntry?.content ?? null;

    if (ogUrl === null) {
      return notApplicable(
        "SOCIAL-004",
        "No Open Graph URL defined",
        "social",
        "Page does not define og:url.",
      );
    }

    if (!hasCanonical(snapshot)) {
      return passed(
        "SOCIAL-004",
        "Open Graph URL is present; no canonical URL to compare",
        ogUrl,
        "social",
        "og:url present",
        {
          severity: "informational",
          impact: "og:url is defined but no canonical URL exists for consistency verification.",
          effort: "low",
          source: "html-parse",
          responsible: "developer",
        },
      );
    }

    const canonical = snapshot.document.baseHref;

    if (ogUrl === canonical) {
      return passed(
        "SOCIAL-004",
        "Open Graph URL matches canonical URL",
        ogUrl,
        "social",
        canonical,
        {
          severity: "informational",
          impact: "og:url is consistent with the canonical URL, avoiding mixed signals.",
          effort: "low",
          source: "html-parse",
          responsible: "developer",
        },
      );
    }

    return warning(
      "SOCIAL-004",
      "Open Graph URL differs from canonical URL",
      ogUrl,
      "social",
      canonical,
      {
        severity: "informational",
        impact:
          "Mismatched og:url and canonical may cause inconsistent indexing and sharing behavior.",
        effort: "medium",
        source: "html-parse",
        responsible: "developer",
      },
    );
  },
};
