import { passed, warning, notApplicable } from "../helpers/result";
import type { RuleDefinition, Provenance } from "../types";
import type { PageSnapshot } from "@/lib/extraction/schemas";

const provenance: Provenance = {
  upstreamRuleId: "not applicable",
  upstreamSourcePath: "not applicable",
  upstreamCommitHash: "not applicable",
  disposition: "REWRITE",
};

export const imageDimensions: RuleDefinition = {
  provenance,
  id: "IMAGE-005",
  name: "Missing Image Dimensions",
  description: "Checks for images missing width and/or height attributes which cause layout shift",
  category: "images",
  executionMode: "static",
  defaultSeverity: "medium",
  defaultImpact: "Images without width/height cause Cumulative Layout Shift (CLS)",
  defaultEffort: "low",
  scored: true,
  signalOwner: "images",
  ruleVersion: 1,
  evaluator: (snapshot: PageSnapshot) => {
    const images = snapshot.images;
    if (images.length === 0) {
      return notApplicable(
        "IMAGE-005",
        "No images found on page",
        "images",
        "No images to evaluate",
      );
    }

    const noDimensions = images.filter((img) => img.width === null || img.height === null);

    if (noDimensions.length > 0) {
      return warning(
        "IMAGE-005",
        `Found ${noDimensions.length} image(s) missing width and/or height attributes out of ${images.length}`,
        noDimensions.length,
        "images",
        0,
        {
          severity: "medium",
          samples: noDimensions.slice(0, 3).map((img) => img.rawSrc),
        },
      );
    }

    return passed("IMAGE-005", "All images have width and height attributes", 0, "images");
  },
};
