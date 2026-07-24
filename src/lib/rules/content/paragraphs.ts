import type { RuleDefinition, Provenance } from "../types";
import type { PageSnapshot } from "@/lib/extraction/types";
import { passed, notApplicable } from "../helpers/result";

const provenance: Provenance = {
  upstreamRuleId: "CONTENT-004",
  upstreamSourcePath: "src/rules/content/paragraphs.ts",
  upstreamCommitHash: "bbca017b56086a2959382d8260b97021736ca18f",
  disposition: "PORT_AS_IS",
};

export const paragraphsRule: RuleDefinition = {
  id: "CONTENT-004",
  name: "Paragraph elements are present",
  description: "Checks that the page contains <p> elements indicating structured text content.",
  category: "content",
  executionMode: "static",
  defaultSeverity: "informational",
  defaultImpact:
    "Paragraphs indicate well-structured content that is easier for users and search engines to process.",
  defaultEffort: "low",
  scored: false,
  provenance,
  signalOwner: "content",
  ruleVersion: 1,
  evaluator: (snapshot: PageSnapshot) => {
    if (snapshot.content.paragraphCount > 0) {
      return passed(
        "CONTENT-004",
        `Page contains ${snapshot.content.paragraphCount} paragraph(s)`,
        snapshot.content.paragraphCount,
        "content",
        "> 0",
        {
          severity: "informational",
          impact: "Paragraphs help organize content into readable blocks for users.",
          effort: "low",
          source: "html-parse",
          responsible: "content-editor",
        },
      );
    }

    return notApplicable(
      "CONTENT-004",
      "No paragraph elements found on the page",
      "content",
      "Page does not use <p> elements.",
    );
  },
};
