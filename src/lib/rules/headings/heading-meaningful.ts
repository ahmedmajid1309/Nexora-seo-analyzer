import type { RuleDefinition, Provenance } from "../types";
import type { PageSnapshot } from "@/lib/extraction/types";
import { passed, warning } from "../helpers/result";

const provenance: Provenance = {
  upstreamRuleId: "not applicable",
  upstreamSourcePath: "not applicable",
  upstreamCommitHash: "not applicable",
  disposition: "REWRITE",
};

const NON_MEANINGFUL_REGEX = /^[\s\p{P}\p{S}]+$/u;

export const headingMeaningfulRule: RuleDefinition = {
  id: "HEAD-007",
  provenance,
  name: "Headings with meaningful text",
  description:
    "Flags headings that contain only punctuation, symbols, or whitespace (no meaningful alphanumeric content).",
  category: "headings",
  executionMode: "static",
  defaultSeverity: "medium",
  defaultImpact:
    "Headings should contain descriptive text to convey the structure and topic of the page section.",
  defaultEffort: "low",
  scored: true,
  signalOwner: "headings",
  ruleVersion: 1,
  evaluator: (snapshot: PageSnapshot) => {
    if (snapshot.headings.length === 0) {
      return passed("HEAD-007", "No headings to evaluate", 0, "headings", 0, {
        severity: "low",
        impact: "No headings present.",
        effort: "low",
        source: "html-parse",
        responsible: "content-editor",
      });
    }

    const nonMeaningful = snapshot.headings.filter((h) => {
      const trimmed = h.text.trim();
      return trimmed.length > 0 && NON_MEANINGFUL_REGEX.test(trimmed);
    });

    if (nonMeaningful.length === 0) {
      return passed("HEAD-007", "All headings contain meaningful text", false, "headings", false, {
        severity: "low",
        impact: "Every heading provides descriptive content.",
        effort: "low",
        source: "html-parse",
        responsible: "content-editor",
      });
    }

    return warning(
      "HEAD-007",
      `${nonMeaningful.length} heading(s) contain only non-meaningful characters`,
      nonMeaningful.length,
      "headings",
      0,
      {
        severity: "medium",
        impact: "Headings with only punctuation or symbols fail to describe the section content.",
        effort: "low",
        source: "html-parse",
        responsible: "content-editor",
        samples: nonMeaningful.slice(0, 3).map((h) => `H${h.level}: "${h.text}"`),
        confidence: 95,
      },
    );
  },
};
