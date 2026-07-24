import { passed, warning, notApplicable } from "../helpers/result";
import type { RuleDefinition, Provenance } from "../types";
import type { PageSnapshot } from "@/lib/extraction/schemas";

const MAX_ALT_LENGTH = 125;

const provenance: Provenance = {
  upstreamRuleId: "not applicable",
  upstreamSourcePath: "not applicable",
  upstreamCommitHash: "not applicable",
  disposition: "REWRITE",
};

export const altLength: RuleDefinition = {
  provenance,
  id: "IMAGE-006",
  name: "Alt Text Length",
  description: "Checks for alt text that exceeds recommended maximum length",
  category: "images",
  executionMode: "static",
  defaultSeverity: "medium",
  defaultImpact:
    "Very long alt text may be truncated by screen readers and dilute keyword relevance",
  defaultEffort: "low",
  scored: true,
  signalOwner: "accessibility",
  ruleVersion: 1,
  evaluator: (snapshot: PageSnapshot) => {
    const images = snapshot.images;
    if (images.length === 0) {
      return notApplicable(
        "IMAGE-006",
        "No images found on page",
        "images",
        "No images to evaluate",
      );
    }

    const longAlt = images.filter(
      (img) => img.hasAlt && img.altText !== null && img.altText.length > MAX_ALT_LENGTH,
    );

    if (longAlt.length > 0) {
      return warning(
        "IMAGE-006",
        `Found ${longAlt.length} image(s) with alt text exceeding ${MAX_ALT_LENGTH} characters`,
        longAlt.length,
        "images",
        0,
        {
          severity: "medium",
          samples: longAlt.slice(0, 3).map((img) => `"${img.altText!.substring(0, 60)}..."`),
        },
      );
    }

    return passed("IMAGE-006", "All alt text is within recommended length", 0, "images");
  },
};
