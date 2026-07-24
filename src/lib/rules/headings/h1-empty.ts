import type { RuleDefinition, Provenance } from "../types";
import type { PageSnapshot } from "@/lib/extraction/types";
import { passed, failed } from "../helpers/result";

const provenance: Provenance = {
  upstreamRuleId: "not applicable",
  upstreamSourcePath: "not applicable",
  upstreamCommitHash: "not applicable",
  disposition: "REWRITE",
};

export const h1EmptyRule: RuleDefinition = {
  id: "HEAD-003",
  provenance,
  name: "Empty heading elements",
  description: "Checks for heading elements (any level) that are empty or contain only whitespace.",
  category: "headings",
  executionMode: "static",
  defaultSeverity: "high",
  defaultImpact:
    "Empty headings provide no information to users or search engines and may indicate incomplete content.",
  defaultEffort: "low",
  scored: true,
  signalOwner: "headings",
  ruleVersion: 1,
  evaluator: (snapshot: PageSnapshot) => {
    const emptyHeadings = snapshot.headings.filter((h) => h.isEmpty || h.text.trim().length === 0);

    if (emptyHeadings.length === 0) {
      return passed("HEAD-003", "No empty heading elements found", 0, "headings", 0, {
        severity: "low",
        impact: "All headings contain meaningful content.",
        effort: "low",
        source: "html-parse",
        responsible: "content-editor",
      });
    }

    const levelLabels = emptyHeadings.map((h) => `H${h.level}`).join(", ");

    return failed(
      "HEAD-003",
      `${emptyHeadings.length} empty heading element(s) found (${levelLabels})`,
      emptyHeadings.length,
      "headings",
      0,
      {
        severity: "high",
        impact:
          "Empty headings degrade accessibility and SEO; each heading should contain descriptive text.",
        effort: "low",
        source: "html-parse",
        responsible: "content-editor",
        samples: emptyHeadings.slice(0, 3).map((h) => `H${h.level} at order ${h.order}`),
      },
    );
  },
};
