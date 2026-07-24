import type { RuleDefinition, Provenance } from "../types";
import type { PageSnapshot } from "@/lib/extraction/types";
import { passed, warning, notApplicable } from "../helpers/result";

const provenance: Provenance = {
  upstreamRuleId: "CONTENT-003",
  upstreamSourcePath: "src/rules/content/text-amount.ts",
  upstreamCommitHash: "bbca017b56086a2959382d8260b97021736ca18f",
  disposition: "PORT_AS_IS",
};

const LOW_WORD_COUNT_THRESHOLD = 100;

export const textAmountRule: RuleDefinition = {
  id: "CONTENT-003",
  name: "Text content amount is sufficient",
  description:
    "Advisory check that the page contains a reasonable amount of text content (at least 100 words).",
  category: "content",
  executionMode: "static",
  defaultSeverity: "low",
  defaultImpact:
    "Very low word counts may indicate thin content that provides limited value to users and search engines.",
  defaultEffort: "medium",
  scored: true,
  provenance,
  signalOwner: "content",
  ruleVersion: 1,
  evaluator: (snapshot: PageSnapshot) => {
    if (snapshot.content.isTruncated) {
      return notApplicable(
        "CONTENT-003",
        "Text content was truncated; cannot assess total word count",
        "content",
        "Extracted text was truncated at the collection limit.",
      );
    }

    const wordCount = snapshot.content.wordCount;

    if (wordCount >= LOW_WORD_COUNT_THRESHOLD) {
      return passed(
        "CONTENT-003",
        `Page contains ${wordCount} words`,
        wordCount,
        "content",
        `>= ${LOW_WORD_COUNT_THRESHOLD} words`,
        {
          severity: "low",
          impact: "Page has sufficient text content for meaningful indexing.",
          effort: "medium",
          source: "html-parse",
          responsible: "content-editor",
        },
      );
    }

    return warning(
      "CONTENT-003",
      `Page contains only ${wordCount} words`,
      wordCount,
      "content",
      `>= ${LOW_WORD_COUNT_THRESHOLD} words`,
      {
        severity: "low",
        impact: "Low word counts may be flagged as thin content by search engines.",
        effort: "medium",
        source: "html-parse",
        responsible: "content-editor",
      },
    );
  },
};
