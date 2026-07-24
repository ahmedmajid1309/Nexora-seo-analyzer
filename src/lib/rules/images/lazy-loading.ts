import { passed, warning, notApplicable } from "../helpers/result";
import type { RuleDefinition, Provenance } from "../types";
import type { PageSnapshot } from "@/lib/extraction/schemas";

const provenance: Provenance = {
  upstreamRuleId: "not applicable",
  upstreamSourcePath: "not applicable",
  upstreamCommitHash: "not applicable",
  disposition: "REWRITE",
};

export const lazyLoading: RuleDefinition = {
  provenance,
  id: "IMAGE-008",
  name: "Lazy Loading Attribution",
  description: "Checks for loading='lazy' attribute presence on images for deferred loading",
  category: "images",
  executionMode: "static",
  defaultSeverity: "informational",
  defaultImpact: "Lazy loading improves initial page load performance for below-the-fold images",
  defaultEffort: "low",
  scored: true,
  signalOwner: "images",
  ruleVersion: 1,
  evaluator: (snapshot: PageSnapshot) => {
    const images = snapshot.images;
    if (images.length === 0) {
      return notApplicable(
        "IMAGE-008",
        "No images found on page",
        "images",
        "No images to evaluate",
      );
    }

    const withLazy = images.filter((img) => img.loading === "lazy");
    const withoutLazy = images.filter(
      (img) => img.loading === null || (img.loading !== "lazy" && img.loading !== "eager"),
    );

    if (withoutLazy.length === images.length) {
      return warning(
        "IMAGE-008",
        "No images use loading='lazy' attribute",
        withLazy.length,
        "images",
        images.length,
        {
          severity: "informational",
        },
      );
    }

    return passed(
      "IMAGE-008",
      `${withLazy.length} of ${images.length} images use loading='lazy'`,
      withLazy.length,
      "images",
      images.length,
      {
        severity: "informational",
      },
    );
  },
};
