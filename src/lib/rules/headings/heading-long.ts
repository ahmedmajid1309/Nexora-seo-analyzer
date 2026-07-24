import type { RuleDefinition, Provenance } from "../types";
import type { PageSnapshot } from "@/lib/extraction/types";
import { passed, warning } from "../helpers/result";

const provenance: Provenance = {
  upstreamRuleId: "not applicable",
  upstreamSourcePath: "not applicable",
  upstreamCommitHash: "not applicable",
  disposition: "REWRITE",
};

export const headingLongRule: RuleDefinition = {
  id: "HEAD-005",
  provenance,
  name: "Excessively long heading text",
  description:
    "Flags headings with text exceeding 100 characters, which may be overly verbose and harder to scan.",
  category: "headings",
  executionMode: "static",
  defaultSeverity: "low",
  defaultImpact:
    "Very long headings can reduce scannability and may be truncated in SERP snippets or navigation.",
  defaultEffort: "low",
  scored: true,
  signalOwner: "headings",
  ruleVersion: 1,
  evaluator: (snapshot: PageSnapshot) => {
    if (snapshot.headings.length === 0) {
      return passed("HEAD-005", "No headings to evaluate", 0, "headings", 0, {
        severity: "low",
        impact: "No headings present, so none are excessively long.",
        effort: "low",
        source: "html-parse",
        responsible: "content-editor",
      });
    }

    const longHeadings = snapshot.headings.filter((h) => h.text.length > 100);

    if (longHeadings.length === 0) {
      return passed("HEAD-005", "No excessively long headings found", 0, "headings", 0, {
        severity: "low",
        impact: "All headings are within a reasonable length.",
        effort: "low",
        source: "html-parse",
        responsible: "content-editor",
      });
    }

    return warning(
      "HEAD-005",
      `${longHeadings.length} heading(s) exceed 100 characters`,
      longHeadings.length,
      "headings",
      0,
      {
        severity: "low",
        impact: "Long headings may be truncated in search results and harder to scan.",
        effort: "low",
        source: "html-parse",
        responsible: "content-editor",
        samples: longHeadings
          .slice(0, 3)
          .map((h) => `H${h.level}: "${h.text.substring(0, 80)}..."`),
        confidence: 75,
      },
    );
  },
};
