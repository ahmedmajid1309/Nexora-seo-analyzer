import type { RuleDefinition, Provenance } from "../types";
import type { PageSnapshot } from "@/lib/extraction/types";
import { passed, notApplicable } from "../helpers/result";

const provenance: Provenance = {
  upstreamRuleId: "CONTENT-007",
  upstreamSourcePath: "src/rules/content/question-headings.ts",
  upstreamCommitHash: "bbca017b56086a2959382d8260b97021736ca18f",
  disposition: "PORT_AS_IS",
};

export const questionHeadingsRule: RuleDefinition = {
  id: "CONTENT-007",
  name: "Question-oriented headings are present",
  description:
    "Detects headings that are phrased as questions, which may serve as Answer Engine Optimization (AEO) signals.",
  category: "content",
  executionMode: "static",
  defaultSeverity: "informational",
  defaultImpact:
    "Question-oriented headings can improve visibility in voice search and featured snippet results.",
  defaultEffort: "low",
  scored: false,
  provenance,
  signalOwner: "content",
  ruleVersion: 1,
  evaluator: (snapshot: PageSnapshot) => {
    const questionCount = snapshot.content.questionHeadingCount;

    if (questionCount > 0) {
      return passed(
        "CONTENT-007",
        `Page contains ${questionCount} question-oriented heading(s)`,
        questionCount,
        "content",
        "> 0",
        {
          severity: "informational",
          impact: "Question headings may improve discovery via voice search and featured snippets.",
          effort: "low",
          source: "html-parse",
          responsible: "content-editor",
        },
      );
    }

    return notApplicable(
      "CONTENT-007",
      "No question-oriented headings found",
      "content",
      "Page headings do not appear to be phrased as questions.",
    );
  },
};
