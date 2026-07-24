import type { RuleDefinition, Provenance } from "../types";
import type { PageSnapshot } from "@/lib/extraction/types";
import { passed, failed } from "../helpers/result";

const provenance: Provenance = {
  upstreamRuleId: "A11Y-002",
  upstreamSourcePath: "src/rules/accessibility/image-alt-present.ts",
  upstreamCommitHash: "bbca017b56086a2959382d8260b97021736ca18f",
  disposition: "PORT_AS_IS",
};

export const imageAltPresentRule: RuleDefinition = {
  id: "A11Y-002",
  name: "Image alt text present",
  description: "Checks that all images have meaningful alt text attributes.",
  category: "accessibility",
  executionMode: "static",
  defaultSeverity: "high",
  defaultImpact:
    "Alt text is essential for screen reader users and provides context when images fail to load, also contributing to image SEO.",
  defaultEffort: "low",
  scored: true,
  provenance,
  signalOwner: "accessibility",
  ruleVersion: 1,
  evaluator: (snapshot: PageSnapshot) => {
    const altData = snapshot.accessibility.imageAltPresent;

    if (altData.withoutAlt === 0) {
      return passed(
        "A11Y-002",
        "All images have alt text",
        `${altData.withAlt}/${altData.total}`,
        "accessibility",
        "0 images missing alt text",
        {
          severity: "low",
          impact: "All images are accessible to screen reader users.",
          effort: "low",
          source: "html-parse",
          responsible: "content-editor",
        },
      );
    }

    return failed(
      "A11Y-002",
      `${altData.withoutAlt} image(s) are missing alt text`,
      `${altData.withoutAlt}/${altData.total}`,
      "accessibility",
      "0 images missing alt text",
      {
        severity: "high",
        impact: "Images without alt text are invisible to screen readers and hurt SEO.",
        effort: "low",
        source: "html-parse",
        responsible: "content-editor",
      },
    );
  },
};
