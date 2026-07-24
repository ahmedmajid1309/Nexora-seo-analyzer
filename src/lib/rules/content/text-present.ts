import type { RuleDefinition, Provenance } from "../types";
import type { PageSnapshot } from "@/lib/extraction/types";
import { passed, failed } from "../helpers/result";

const provenance: Provenance = {
  upstreamRuleId: "CONTENT-002",
  upstreamSourcePath: "src/rules/content/text-present.ts",
  upstreamCommitHash: "bbca017b56086a2959382d8260b97021736ca18f",
  disposition: "PORT_AS_IS",
};

export const textPresentRule: RuleDefinition = {
  id: "CONTENT-002",
  name: "Meaningful text content is present",
  description: "Checks that the page contains extractable visible text content beyond whitespace.",
  category: "content",
  executionMode: "static",
  defaultSeverity: "high",
  defaultImpact:
    "Pages without meaningful text content cannot be properly indexed or understood by search engines.",
  defaultEffort: "low",
  scored: true,
  provenance,
  signalOwner: "content",
  ruleVersion: 1,
  evaluator: (snapshot: PageSnapshot) => {
    if (snapshot.content.visibleText.trim().length > 0) {
      return passed("CONTENT-002", "Meaningful text content is present", true, "content", true, {
        severity: "low",
        impact: "Page contains readable text content for indexing and user comprehension.",
        effort: "low",
        source: "html-parse",
        responsible: "content-editor",
      });
    }

    return failed("CONTENT-002", "No meaningful text content found", false, "content", true, {
      severity: "high",
      impact: "Search engines cannot index the page without meaningful text content.",
      effort: "high",
      source: "html-parse",
      responsible: "content-editor",
    });
  },
};
