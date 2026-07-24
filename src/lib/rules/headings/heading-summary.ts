import type { RuleDefinition, Provenance } from "../types";
import type { PageSnapshot } from "@/lib/extraction/types";
import { passed } from "../helpers/result";

const provenance: Provenance = {
  upstreamRuleId: "not applicable",
  upstreamSourcePath: "not applicable",
  upstreamCommitHash: "not applicable",
  disposition: "REWRITE",
};

export const headingSummaryRule: RuleDefinition = {
  id: "HEAD-008",
  provenance,
  name: "Heading structure summary",
  description:
    "Provides an informational summary of the page's heading structure, including counts per level and hierarchy observations.",
  category: "headings",
  executionMode: "static",
  defaultSeverity: "informational",
  defaultImpact:
    "Understanding the heading structure helps assess content organization and accessibility.",
  defaultEffort: "low",
  scored: false,
  signalOwner: "headings",
  ruleVersion: 1,
  evaluator: (snapshot: PageSnapshot) => {
    const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    for (const h of snapshot.headings) {
      counts[h.level] = (counts[h.level] ?? 0) + 1;
    }

    const total = snapshot.headings.length;
    const summaryParts: string[] = [`Total headings: ${total}`];
    for (let level = 1; level <= 6; level++) {
      if (counts[level] > 0) {
        summaryParts.push(`H${level}: ${counts[level]}`);
      }
    }

    const h1s = snapshot.headings.filter((h) => h.level === 1).length;
    const hasDepthGaps = snapshot.headings.some((h, i) => {
      if (i === 0) return false;
      return h.level > snapshot.headings[i - 1].level + 1;
    });

    if (h1s === 0) summaryParts.push("No H1 found");
    else if (h1s > 1) summaryParts.push(`Multiple H1s (${h1s})`);
    if (hasDepthGaps) summaryParts.push("Depth gaps detected");

    return passed("HEAD-008", summaryParts.join(" | "), total, "headings", total, {
      severity: "informational",
      impact: "Summary of page heading structure.",
      effort: "low",
      source: "html-parse",
      responsible: "content-editor",
      confidence: 100,
    });
  },
};
