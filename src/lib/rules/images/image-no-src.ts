import { passed, failed, notApplicable } from "../helpers/result";
import type { RuleDefinition, Provenance } from "../types";
import type { PageSnapshot } from "@/lib/extraction/schemas";

const provenance: Provenance = {
  upstreamRuleId: "not applicable",
  upstreamSourcePath: "not applicable",
  upstreamCommitHash: "not applicable",
  disposition: "REWRITE",
};

export const imageNoSrc: RuleDefinition = {
  provenance,
  id: "IMAGE-003",
  name: "Missing or Empty Src",
  description: "Checks for img elements with missing or empty src attributes",
  category: "images",
  executionMode: "static",
  defaultSeverity: "high",
  defaultImpact: "Images without src cannot render and waste HTML parsing time",
  defaultEffort: "low",
  scored: true,
  signalOwner: "images",
  ruleVersion: 1,
  evaluator: (snapshot: PageSnapshot) => {
    const images = snapshot.images;
    if (images.length === 0) {
      return notApplicable(
        "IMAGE-003",
        "No images found on page",
        "images",
        "No images to evaluate",
      );
    }

    const noSrc = images.filter((img) => !img.rawSrc || img.rawSrc.trim().length === 0);

    if (noSrc.length > 0) {
      return failed(
        "IMAGE-003",
        `Found ${noSrc.length} image(s) with missing or empty src`,
        noSrc.length,
        "images",
        0,
        {
          severity: "high",
          samples: noSrc.slice(0, 3).map((img) => img.selector ?? "(no selector)"),
        },
      );
    }

    return passed("IMAGE-003", "All images have a valid src attribute", 0, "images");
  },
};
