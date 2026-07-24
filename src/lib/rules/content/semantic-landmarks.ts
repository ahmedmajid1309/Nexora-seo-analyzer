import type { RuleDefinition, Provenance } from "../types";
import type { PageSnapshot } from "@/lib/extraction/types";
import { passed, notApplicable } from "../helpers/result";
import {
  hasNavigation,
  hasArticles,
  hasSections,
  hasAside,
  hasHeader,
  hasFooter,
} from "../helpers/applicability";

const provenance: Provenance = {
  upstreamRuleId: "CONTENT-006",
  upstreamSourcePath: "src/rules/content/semantic-landmarks.ts",
  upstreamCommitHash: "bbca017b56086a2959382d8260b97021736ca18f",
  disposition: "PORT_AS_IS",
};

interface LandmarkInfo {
  name: string;
  present: boolean;
  count: number;
}

export const semanticLandmarksRule: RuleDefinition = {
  id: "CONTENT-006",
  name: "Semantic HTML5 landmarks are present",
  description:
    "Reports on the usage of semantic HTML5 landmark elements (nav, article, section, aside, header, footer) for document structure.",
  category: "content",
  executionMode: "static",
  defaultSeverity: "informational",
  defaultImpact:
    "Semantic landmarks improve accessibility and help search engines understand page structure.",
  defaultEffort: "low",
  scored: false,
  provenance,
  signalOwner: "content",
  ruleVersion: 1,
  evaluator: (snapshot: PageSnapshot) => {
    const landmarks: LandmarkInfo[] = [
      { name: "nav", present: hasNavigation(snapshot), count: snapshot.content.navCount },
      { name: "article", present: hasArticles(snapshot), count: snapshot.content.articleCount },
      { name: "section", present: hasSections(snapshot), count: snapshot.content.sectionCount },
      { name: "aside", present: hasAside(snapshot), count: snapshot.content.asideCount },
      { name: "header", present: hasHeader(snapshot), count: snapshot.content.headerCount },
      { name: "footer", present: hasFooter(snapshot), count: snapshot.content.footerCount },
    ];

    const present = landmarks.filter((l) => l.present);

    if (present.length === 0) {
      return notApplicable(
        "CONTENT-006",
        "No semantic landmark elements found",
        "content",
        "Page does not use nav, article, section, aside, header, or footer elements.",
      );
    }

    const summary = present.map((l) => `${l.name} (${l.count})`).join(", ");

    return passed(
      "CONTENT-006",
      `Semantic landmarks detected: ${summary}`,
      present.length,
      "content",
      "landmarks present",
      {
        severity: "informational",
        impact: `Page uses ${present.length} landmark type(s): ${summary}.`,
        effort: "low",
        source: "html-parse",
        responsible: "developer",
      },
    );
  },
};
