import type { RuleDefinition, Provenance } from "../types";
import type { PageSnapshot } from "@/lib/extraction/types";
import { passed, failed, notApplicable } from "../helpers/result";
import { hasMedia } from "../helpers/evidence";

const provenance: Provenance = {
  upstreamRuleId: "A11Y-011",
  upstreamSourcePath: "src/rules/accessibility/media-captions.ts",
  upstreamCommitHash: "bbca017b56086a2959382d8260b97021736ca18f",
  disposition: "PORT_AS_IS",
};

export const mediaCaptionsRule: RuleDefinition = {
  id: "A11Y-011",
  name: "Media captions",
  description:
    "Checks that <video> and <audio> elements have associated <track> elements for captions.",
  category: "accessibility",
  executionMode: "static",
  defaultSeverity: "high",
  defaultImpact:
    "Media without captions is inaccessible to deaf and hard-of-hearing users and fails WCAG 1.2.2.",
  defaultEffort: "medium",
  scored: true,
  provenance,
  signalOwner: "accessibility",
  ruleVersion: 1,
  evaluator: (snapshot: PageSnapshot) => {
    if (!hasMedia(snapshot)) {
      return notApplicable(
        "A11Y-011",
        "No media elements found on page",
        "accessibility",
        "No video or audio elements present in document",
      );
    }

    const captionData = snapshot.accessibility.mediaCaptions;

    if (captionData.withoutTrack === 0) {
      return passed(
        "A11Y-011",
        "All media elements have caption tracks",
        `${captionData.withTrack}/${captionData.total}`,
        "accessibility",
        "0 media elements missing captions",
        {
          severity: "low",
          impact: "Media content is accessible to deaf and hard-of-hearing users.",
          effort: "medium",
          source: "html-parse",
          responsible: "developer",
        },
      );
    }

    return failed(
      "A11Y-011",
      `${captionData.withoutTrack} media element(s) are missing caption tracks`,
      `${captionData.withoutTrack}/${captionData.total}`,
      "accessibility",
      "0 media elements missing captions",
      {
        severity: "high",
        impact: "Media without captions fails WCAG 1.2.2 and excludes deaf users.",
        effort: "medium",
        source: "html-parse",
        responsible: "developer",
      },
    );
  },
};
