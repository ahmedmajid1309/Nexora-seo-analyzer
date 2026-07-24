import type { RuleDefinition, Provenance } from "../types";
import type { PageSnapshot } from "@/lib/extraction/types";
import { passed, failed } from "../helpers/result";

const provenance: Provenance = {
  upstreamRuleId: "not applicable",
  upstreamSourcePath: "not applicable",
  upstreamCommitHash: "not applicable",
  disposition: "REWRITE",
};

export const headingHierarchyRule: RuleDefinition = {
  id: "HEAD-004",
  provenance,
  name: "Heading hierarchy is sequential",
  description:
    "Checks that heading levels do not skip levels (e.g., H1 followed by H3 without H2).",
  category: "headings",
  executionMode: "static",
  defaultSeverity: "medium",
  defaultImpact:
    "Skipped heading levels can confuse assistive technology users and weaken document structure.",
  defaultEffort: "low",
  scored: true,
  signalOwner: "headings",
  ruleVersion: 1,
  evaluator: (snapshot: PageSnapshot) => {
    if (snapshot.headings.length === 0) {
      return failed(
        "HEAD-004",
        "No headings found to evaluate hierarchy",
        0,
        "headings",
        "at least one heading",
        {
          severity: "medium",
          impact: "Without headings, there is no document structure to evaluate.",
          effort: "medium",
          source: "html-parse",
          responsible: "content-editor",
        },
      );
    }

    const hasDepthGap = snapshot.headings.some((h, i) => {
      if (i === 0) return false;
      const prev = snapshot.headings[i - 1];
      return h.level > prev.level + 1;
    });

    if (!hasDepthGap) {
      return passed(
        "HEAD-004",
        "Heading hierarchy is sequential without skipped levels",
        false,
        "headings",
        false,
        {
          severity: "low",
          impact: "Headings follow a logical hierarchy.",
          effort: "low",
          source: "html-parse",
          responsible: "content-editor",
        },
      );
    }

    const gaps: string[] = [];
    for (let i = 1; i < snapshot.headings.length; i++) {
      const prev = snapshot.headings[i - 1];
      const curr = snapshot.headings[i];
      if (curr.level > prev.level + 1) {
        gaps.push(`H${prev.level} → H${curr.level}`);
      }
    }

    return failed(
      "HEAD-004",
      `Heading levels are skipped: ${gaps.join(", ")}`,
      true,
      "headings",
      false,
      {
        severity: "medium",
        impact: "Skipped heading levels produce a non-semantic document outline.",
        effort: "low",
        source: "html-parse",
        responsible: "content-editor",
        confidence: 90,
      },
    );
  },
};
