import type { RuleDefinition, Provenance } from "../types";
import type { PageSnapshot } from "@/lib/extraction/types";
import { passed, warning } from "../helpers/result";

const provenance: Provenance = {
  upstreamRuleId: "not applicable",
  upstreamSourcePath: "not applicable",
  upstreamCommitHash: "not applicable",
  disposition: "REWRITE",
};

export const h1MultipleRule: RuleDefinition = {
  id: "HEAD-002",
  provenance,
  name: "Multiple H1 tags",
  description:
    "Checks for multiple H1 elements on the page. HTML5 allows multiple H1s, but this is generally considered an advisory concern.",
  category: "headings",
  executionMode: "static",
  defaultSeverity: "low",
  defaultImpact:
    "Multiple H1 elements can dilute the topical focus of a page, though HTML5 document outlines do permit them.",
  defaultEffort: "low",
  scored: true,
  signalOwner: "headings",
  ruleVersion: 1,
  evaluator: (snapshot: PageSnapshot) => {
    const h1s = snapshot.headings.filter((h) => h.level === 1 && !h.isEmpty);

    if (h1s.length <= 1) {
      return passed("HEAD-002", "Page has a single H1 tag", h1s.length, "headings", 1, {
        severity: "low",
        impact: "A single H1 provides clear topical focus.",
        effort: "low",
        source: "html-parse",
        responsible: "content-editor",
      });
    }

    return warning("HEAD-002", `Page has ${h1s.length} H1 tags`, h1s.length, "headings", 1, {
      severity: "low",
      impact: "Multiple H1s can weaken the semantic structure; consider using a single H1.",
      effort: "low",
      source: "html-parse",
      responsible: "content-editor",
      developerNotes:
        "HTML5 allows multiple H1 elements, but best practice is to use one per page for clarity.",
      confidence: 70,
    });
  },
};
