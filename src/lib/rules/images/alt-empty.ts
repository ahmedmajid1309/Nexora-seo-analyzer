import { passed, warning, notApplicable } from "../helpers/result";
import type { RuleDefinition, Provenance } from "../types";
import type { PageSnapshot } from "@/lib/extraction/schemas";

const provenance: Provenance = {
  upstreamRuleId: "not applicable",
  upstreamSourcePath: "not applicable",
  upstreamCommitHash: "not applicable",
  disposition: "REWRITE",
};

export const altEmpty: RuleDefinition = {
  provenance,
  id: "IMAGE-002",
  name: "Empty Alt Attributes",
  description:
    "Checks for images with empty alt text (separate from missing - decorative images may use empty alt)",
  category: "images",
  executionMode: "static",
  defaultSeverity: "medium",
  defaultImpact:
    "Empty alt text may indicate missing descriptive content for non-decorative images",
  defaultEffort: "low",
  scored: true,
  signalOwner: "accessibility",
  ruleVersion: 1,
  evaluator: (snapshot: PageSnapshot) => {
    const images = snapshot.images;
    if (images.length === 0) {
      return notApplicable(
        "IMAGE-002",
        "No images found on page",
        "images",
        "No images to evaluate",
      );
    }

    const emptyAlt = images.filter(
      (img) => img.hasAlt && (img.altText === "" || img.altText === null),
    );

    if (emptyAlt.length > 0) {
      return warning(
        "IMAGE-002",
        `Found ${emptyAlt.length} image(s) with empty alt text out of ${images.length}`,
        emptyAlt.length,
        "images",
        0,
        {
          severity: "medium",
          samples: emptyAlt.slice(0, 3).map((img) => img.rawSrc),
        },
      );
    }

    return passed("IMAGE-002", "All images have populated alt text", 0, "images");
  },
};
