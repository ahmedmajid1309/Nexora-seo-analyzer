import type { RuleDefinition, Provenance } from "../types";
import type { PageSnapshot } from "@/lib/extraction/types";
import { passed, failed } from "../helpers/result";

const provenance: Provenance = {
  upstreamRuleId: "core-h1-present",
  upstreamSourcePath: "src/rules/core/h1-present.ts",
  upstreamCommitHash: "bbca017b56086a2959382d8260b97021736ca18f",
  disposition: "PORT_AS_IS",
};

export const h1PresentRule: RuleDefinition = {
  id: "HEAD-001",
  name: "H1 tag is present",
  description: "Checks that the page contains at least one non-empty H1 heading element.",
  category: "headings",
  executionMode: "static",
  defaultSeverity: "high",
  defaultImpact:
    "H1 headings are critical for conveying page topic and improving search engine understanding of the content.",
  defaultEffort: "low",
  scored: true,
  provenance,
  signalOwner: "headings",
  ruleVersion: 1,
  evaluator: (snapshot: PageSnapshot) => {
    const h1s = snapshot.headings.filter((h) => h.level === 1);
    const nonEmpty = h1s.find((h) => !h.isEmpty && h.text.trim().length > 0);

    if (nonEmpty) {
      return passed("HEAD-001", "H1 tag is present", true, "headings", true, {
        severity: "low",
        impact: "Page has a properly defined H1 heading.",
        effort: "low",
        source: "html-parse",
        responsible: "content-editor",
      });
    }

    if (h1s.length > 0) {
      return failed(
        "HEAD-001",
        "H1 tag exists but is empty or only contains whitespace",
        h1s[0].text,
        "headings",
        "non-empty heading text",
        {
          severity: "high",
          impact: "An empty H1 provides no value to users or search engines.",
          effort: "low",
          source: "html-parse",
          responsible: "content-editor",
        },
      );
    }

    return failed("HEAD-001", "No H1 tag found", false, "headings", true, {
      severity: "high",
      impact: "Every page should have exactly one H1 that describes its topic.",
      effort: "low",
      source: "html-parse",
      responsible: "content-editor",
    });
  },
};
