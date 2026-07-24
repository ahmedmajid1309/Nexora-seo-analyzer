import { passed, failed } from "../helpers/result";
import type { RuleDefinition } from "../types";

export const faviconPresentRule: RuleDefinition = {
  id: "META-013",
  name: "Favicon present",
  description: "Checks that a favicon (icon link tag) is declared in the document",
  category: "metadata",
  executionMode: "static",
  defaultSeverity: "low",
  defaultImpact: "Missing favicon reduces brand recognition in browser tabs and bookmarks",
  defaultEffort: "low",
  scored: true,
  signalOwner: "metadata",
  ruleVersion: 1,
  provenance: {
    upstreamRuleId: "core-favicon-present",
    upstreamSourcePath: "src/rules/core/favicon-present.ts",
    upstreamCommitHash: "bbca017b56086a2959382d8260b97021736ca18f",
    disposition: "PORT_WITH_MODIFICATIONS",
    modifications:
      "Adapted for Nexora PageSnapshot-based evaluator; checks resources for icon declarations",
  },
  evaluator: (snapshot) => {
    const iconResources = (snapshot.resources || []).filter(
      (r) =>
        (r.rawUrl !== null && (r.rawUrl.includes("favicon") || r.rawUrl.endsWith(".ico"))) ||
        (r.resolvedUrl !== null &&
          (r.resolvedUrl.includes("favicon") || r.resolvedUrl.endsWith(".ico"))),
    );

    if (iconResources.length === 0) {
      return failed(
        "META-013",
        "No favicon icon declaration found in the document",
        false,
        "metadata",
        true,
        {
          severity: "low",
          effort: "low",
          impact:
            "Without a favicon, the page lacks a visual identity in browser tabs and bookmarks",
          source: "html-parse",
          responsible: "designer",
          steps: [
            'Add a <link rel="icon"> tag to the document head pointing to your favicon file',
            'Example: <link rel="icon" type="image/x-icon" href="/favicon.ico">',
            'Consider providing multiple sizes using rel="apple-touch-icon" for mobile devices',
          ],
          developerNotes:
            "Favicon files should be small (typically 16x16 or 32x32) and placed at the root of the site",
        },
      );
    }

    const faviconUrl =
      iconResources.find((r) => r.resolvedUrl)?.resolvedUrl ||
      iconResources.find((r) => r.rawUrl)?.rawUrl ||
      null;

    return passed("META-013", "Favicon icon declaration is present", faviconUrl, "metadata", true, {
      source: "html-parse",
    });
  },
};
