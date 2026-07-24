import { passed, warning, notApplicable } from "../helpers/result";
import type { RuleDefinition, Provenance } from "../types";
import type { PageSnapshot } from "@/lib/extraction/schemas";

const MODERN_FORMATS = ["webp", "avif"];

const provenance: Provenance = {
  upstreamRuleId: "not applicable",
  upstreamSourcePath: "not applicable",
  upstreamCommitHash: "not applicable",
  disposition: "REWRITE",
};

export const modernFormat: RuleDefinition = {
  provenance,
  id: "IMAGE-007",
  name: "Modern Image Format Usage",
  description: "Checks if images use modern formats like WebP or AVIF for better compression",
  category: "images",
  executionMode: "static",
  defaultSeverity: "informational",
  defaultImpact: "Modern formats offer superior compression and faster page loads",
  defaultEffort: "medium",
  scored: true,
  signalOwner: "images",
  ruleVersion: 1,
  evaluator: (snapshot: PageSnapshot) => {
    const images = snapshot.images;
    if (images.length === 0) {
      return notApplicable(
        "IMAGE-007",
        "No images found on page",
        "images",
        "No images to evaluate",
      );
    }

    const totalNonData = images.filter((img) => !img.rawSrc.startsWith("data:"));
    const modernImages = totalNonData.filter((img) =>
      MODERN_FORMATS.some((fmt) => {
        const src = img.rawSrc.toLowerCase();
        return src.endsWith(`.${fmt}`) || src.includes(`.${fmt}?`) || src.includes(`.${fmt}#`);
      }),
    );
    const modernCount = modernImages.length;

    if (modernCount === 0 && totalNonData.length > 0) {
      return warning(
        "IMAGE-007",
        "No images use modern formats (WebP or AVIF)",
        modernCount,
        "images",
        totalNonData.length,
        {
          severity: "informational",
        },
      );
    }

    return passed(
      "IMAGE-007",
      `${modernCount} of ${totalNonData.length} non-data images use modern formats`,
      modernCount,
      "images",
      totalNonData.length,
      {
        severity: "informational",
      },
    );
  },
};
