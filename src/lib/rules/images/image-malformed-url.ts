import { passed, failed, notApplicable } from "../helpers/result";
import { isValidUrl } from "../helpers/urls";
import type { RuleDefinition, Provenance } from "../types";
import type { PageSnapshot } from "@/lib/extraction/schemas";

const provenance: Provenance = {
  upstreamRuleId: "not applicable",
  upstreamSourcePath: "not applicable",
  upstreamCommitHash: "not applicable",
  disposition: "REWRITE",
};

export const imageMalformedUrl: RuleDefinition = {
  provenance,
  id: "IMAGE-004",
  name: "Malformed Image Src URL",
  description:
    "Checks for img src values that are neither valid absolute URLs nor recognizable relative paths",
  category: "images",
  executionMode: "static",
  defaultSeverity: "high",
  defaultImpact: "Malformed image URLs result in broken images and poor user experience",
  defaultEffort: "low",
  scored: true,
  signalOwner: "images",
  ruleVersion: 1,
  evaluator: (snapshot: PageSnapshot) => {
    const images = snapshot.images;
    if (images.length === 0) {
      return notApplicable(
        "IMAGE-004",
        "No images found on page",
        "images",
        "No images to evaluate",
      );
    }

    const malformed = images.filter((img) => {
      const src = img.rawSrc.trim();
      if (!src || src.length === 0) return false;
      if (
        src.startsWith("/") ||
        src.startsWith("./") ||
        src.startsWith("../") ||
        src.startsWith("data:")
      )
        return false;
      return !isValidUrl(src);
    });

    if (malformed.length > 0) {
      return failed(
        "IMAGE-004",
        `Found ${malformed.length} image(s) with malformed src URL`,
        malformed.length,
        "images",
        0,
        {
          severity: "high",
          samples: malformed.slice(0, 3).map((img) => img.rawSrc),
        },
      );
    }

    return passed(
      "IMAGE-004",
      "All image src values are valid URLs or relative paths",
      0,
      "images",
    );
  },
};
