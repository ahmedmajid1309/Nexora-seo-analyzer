import { passed, failed, notApplicable } from "../helpers/result";
import type { RuleDefinition, Provenance } from "../types";
import type { PageSnapshot } from "@/lib/extraction/schemas";

const provenance: Provenance = {
  upstreamRuleId: "not applicable",
  upstreamSourcePath: "not applicable",
  upstreamCommitHash: "not applicable",
  disposition: "REWRITE",
};

export const altMissing: RuleDefinition = {
  provenance,
  id: "IMAGE-001",
  name: "Missing Alt Attributes",
  description: "Checks for images missing the alt attribute",
  category: "images",
  executionMode: "static",
  defaultSeverity: "high",
  defaultImpact: "Missing alt text hurts accessibility and SEO ranking signals",
  defaultEffort: "low",
  scored: true,
  signalOwner: "accessibility",
  ruleVersion: 1,
  evaluator: (snapshot: PageSnapshot) => {
    const { total, withoutAlt } = snapshot.accessibility.imageAltPresent;

    if (total === 0) {
      return notApplicable(
        "IMAGE-001",
        "No images found on page",
        "images",
        "No images to evaluate",
      );
    }

    if (withoutAlt > 0) {
      return failed(
        "IMAGE-001",
        `Found ${withoutAlt} image(s) missing alt attribute out of ${total}`,
        withoutAlt,
        "images",
        0,
        {
          severity: "high",
        },
      );
    }

    return passed("IMAGE-001", "All images have alt attributes", withoutAlt, "images", 0);
  },
};
