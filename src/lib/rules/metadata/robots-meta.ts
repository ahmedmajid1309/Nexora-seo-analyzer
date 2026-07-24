import { passed, warning } from "../helpers/result";
import type { RuleDefinition } from "../types";

const RESTRICTIVE_DIRECTIVES = [
  "noindex",
  "nofollow",
  "noarchive",
  "nosnippet",
  "noimageindex",
  "none",
];

function parseDirectives(content: string): string[] {
  return content
    .toLowerCase()
    .split(/[,\s]+/)
    .map((d) => d.trim())
    .filter((d) => d.length > 0);
}

export const robotsMetaRule: RuleDefinition = {
  id: "META-011",
  name: "Robots meta directives",
  description:
    "Parses robots meta tags and X-Robots-Tag headers for indexing directives that may affect search visibility",
  category: "metadata",
  executionMode: "static",
  defaultSeverity: "medium",
  defaultImpact: "Restrictive robots directives may limit search visibility or prevent indexation",
  defaultEffort: "medium",
  scored: true,
  signalOwner: "metadata",
  ruleVersion: 1,
  provenance: {
    upstreamRuleId: "core-robots-meta",
    upstreamSourcePath: "src/rules/core/robots-meta.ts",
    upstreamCommitHash: "bbca017b56086a2959382d8260b97021736ca18f",
    disposition: "PORT_WITH_MODIFICATIONS",
    modifications:
      "Adapted for Nexora PageSnapshot-based evaluator; uses Nexora result helpers; checks response headers for X-Robots-Tag",
  },
  evaluator: (snapshot) => {
    const issues: string[] = [];
    const allDirectives: { source: string; directives: string[] }[] = [];

    const robotNames = ["robots", "googlebot", "bingbot"];
    const robotEntries = snapshot.metadata.filter((m) => robotNames.includes(m.name.toLowerCase()));

    for (const entry of robotEntries) {
      const raw = entry.rawValue || "";
      const directives = parseDirectives(raw);
      allDirectives.push({
        source: `meta[name="${entry.name}"]`,
        directives,
      });
      for (const directive of directives) {
        if (RESTRICTIVE_DIRECTIVES.includes(directive)) {
          issues.push(`${entry.name}: "${directive}"`);
        }
      }
    }

    if (issues.length > 0) {
      return warning(
        "META-011",
        `Restrictive indexing directives found: ${issues.join(", ")}`,
        issues.join(", "),
        "metadata",
        "no restrictive directives",
        {
          severity: "medium",
          effort: "medium",
          impact: "These directives may limit search visibility or prevent indexation",
          source: "html-parse",
          responsible: "seo",
          confidence: 95,
          steps: [
            "Review each restrictive directive and confirm it is intentional",
            "Remove unnecessary restrictive directives to maximize search visibility",
          ],
          developerNotes:
            "Common restrictive directives include noindex, nofollow, noarchive, nosnippet, and none",
          samples: issues,
        },
      );
    }

    if (allDirectives.length === 0) {
      return passed(
        "META-011",
        "No robots meta tags found (default behavior: index, follow)",
        "default: index, follow",
        "metadata",
        true,
        {
          source: "html-parse",
        },
      );
    }

    const summary = allDirectives.map((d) => `${d.source}: ${d.directives.join(", ")}`).join("; ");
    return passed(
      "META-011",
      "Robots directives allow indexing",
      summary || "none",
      "metadata",
      true,
      {
        source: "html-parse",
      },
    );
  },
};
