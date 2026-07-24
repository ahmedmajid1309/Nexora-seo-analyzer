import type { RuleDefinition, Provenance } from "../types";
import type { PageSnapshot } from "@/lib/extraction/types";
import { passed, failed } from "../helpers/result";

const provenance: Provenance = {
  upstreamRuleId: "CONTENT-001",
  upstreamSourcePath: "src/rules/content/main-element.ts",
  upstreamCommitHash: "bbca017b56086a2959382d8260b97021736ca18f",
  disposition: "PORT_AS_IS",
};

export const mainElementRule: RuleDefinition = {
  id: "CONTENT-001",
  name: "Page has a <main> element",
  description:
    "Checks that the page contains a <main> landmark element for identifying primary content.",
  category: "content",
  executionMode: "static",
  defaultSeverity: "medium",
  defaultImpact:
    "The <main> element helps screen readers and assistive technologies navigate directly to the primary content.",
  defaultEffort: "low",
  scored: true,
  provenance,
  signalOwner: "content",
  ruleVersion: 1,
  evaluator: (snapshot: PageSnapshot) => {
    if (snapshot.content.hasMain) {
      return passed("CONTENT-001", "Page has a <main> element", true, "content", true, {
        severity: "low",
        impact:
          "Primary content is wrapped in a <main> landmark, aiding accessibility and semantic structure.",
        effort: "low",
        source: "html-parse",
        responsible: "developer",
      });
    }

    return failed("CONTENT-001", "No <main> element found", false, "content", true, {
      severity: "medium",
      impact:
        "Without <main>, assistive technologies cannot easily jump to the primary content region.",
      effort: "low",
      source: "html-parse",
      responsible: "developer",
    });
  },
};
