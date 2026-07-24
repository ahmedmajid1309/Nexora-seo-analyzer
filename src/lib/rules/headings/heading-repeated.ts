import type { RuleDefinition, Provenance } from "../types";
import type { PageSnapshot } from "@/lib/extraction/types";
import { passed, warning } from "../helpers/result";

const provenance: Provenance = {
  upstreamRuleId: "not applicable",
  upstreamSourcePath: "not applicable",
  upstreamCommitHash: "not applicable",
  disposition: "REWRITE",
};

export const headingRepeatedRule: RuleDefinition = {
  id: "HEAD-006",
  provenance,
  name: "Repeated heading text",
  description:
    "Flags identical heading text appearing more than once on the page, which can confuse users and search engines.",
  category: "headings",
  executionMode: "static",
  defaultSeverity: "low",
  defaultImpact:
    "Duplicate heading text can make it harder for users and search engines to distinguish sections.",
  defaultEffort: "low",
  scored: true,
  signalOwner: "headings",
  ruleVersion: 1,
  evaluator: (snapshot: PageSnapshot) => {
    if (snapshot.headings.length === 0) {
      return passed("HEAD-006", "No headings to evaluate", 0, "headings", 0, {
        severity: "low",
        impact: "No headings present, so none are repeated.",
        effort: "low",
        source: "html-parse",
        responsible: "content-editor",
      });
    }

    const textCounts = new Map<string, { count: number; levels: number[] }>();
    for (const h of snapshot.headings) {
      const trimmed = h.text.trim().toLowerCase();
      if (trimmed.length === 0) continue;
      const entry = textCounts.get(trimmed) ?? { count: 0, levels: [] };
      entry.count++;
      entry.levels.push(h.level);
      textCounts.set(trimmed, entry);
    }

    const duplicates = Array.from(textCounts.entries()).filter(([, v]) => v.count > 1);

    if (duplicates.length === 0) {
      return passed("HEAD-006", "No repeated heading text found", false, "headings", false, {
        severity: "low",
        impact: "All heading text is unique.",
        effort: "low",
        source: "html-parse",
        responsible: "content-editor",
      });
    }

    return warning(
      "HEAD-006",
      `${duplicates.length} heading text(s) appear more than once`,
      duplicates.length,
      "headings",
      0,
      {
        severity: "low",
        impact: "Duplicate heading text reduces clarity and may imply redundant sections.",
        effort: "low",
        source: "html-parse",
        responsible: "content-editor",
        samples: duplicates
          .slice(0, 3)
          .map(([text, info]) => `"${text}" (H${info.levels.join(", H")})`),
        confidence: 80,
      },
    );
  },
};
