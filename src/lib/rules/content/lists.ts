import type { RuleDefinition, Provenance } from "../types";
import type { PageSnapshot } from "@/lib/extraction/types";
import { passed, notApplicable } from "../helpers/result";

const provenance: Provenance = {
  upstreamRuleId: "CONTENT-005",
  upstreamSourcePath: "src/rules/content/lists.ts",
  upstreamCommitHash: "bbca017b56086a2959382d8260b97021736ca18f",
  disposition: "PORT_AS_IS",
};

export const listsRule: RuleDefinition = {
  id: "CONTENT-005",
  name: "List elements are present",
  description:
    "Checks whether the page uses ordered or unordered list elements for content organization.",
  category: "content",
  executionMode: "static",
  defaultSeverity: "informational",
  defaultImpact:
    "Lists help break down information into scannable chunks, improving readability and user experience.",
  defaultEffort: "low",
  scored: false,
  provenance,
  signalOwner: "content",
  ruleVersion: 1,
  evaluator: (snapshot: PageSnapshot) => {
    if (snapshot.content.listCount > 0) {
      return passed(
        "CONTENT-005",
        `Page contains ${snapshot.content.listCount} list(s)`,
        snapshot.content.listCount,
        "content",
        "> 0",
        {
          severity: "informational",
          impact: "Lists improve scannability and content structure for users.",
          effort: "low",
          source: "html-parse",
          responsible: "content-editor",
        },
      );
    }

    return notApplicable(
      "CONTENT-005",
      "No list elements found on the page",
      "content",
      "Page does not use <ul> or <ol> elements.",
    );
  },
};
