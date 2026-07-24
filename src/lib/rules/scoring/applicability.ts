import type { PageSnapshot } from "@/lib/extraction/schemas";
import type { ApplicabilityContext } from "./types";

export function evaluateApplicability(snapshot: PageSnapshot): ApplicabilityContext {
  const hasForms = snapshot.forms.formCount > 0 && snapshot.forms.forms.length > 0;

  const hasTables = snapshot.content.tableCount > 0;

  const hasIframes = snapshot.accessibility.iframeTitles.total > 0;

  const hasMedia = snapshot.accessibility.mediaCaptions.total > 0;

  const hasJsonLd = snapshot.structuredData.length > 0;

  const hasHreflang =
    snapshot.document.lang !== null &&
    snapshot.links.some((l) => l.hreflang !== null && l.hreflang !== undefined);

  const hasTargetKeyword = false;

  const isIndexable = determineIndexable(snapshot);

  const hasRelevantSocialMetadata =
    snapshot.social.openGraph.length > 0 || snapshot.social.twitter.length > 0;

  const hasRelevantImageElements =
    snapshot.images.length > 0 || snapshot.accessibility.imageAltPresent.total > 0;

  return {
    hasForms,
    hasTables,
    hasIframes,
    hasMedia,
    hasJsonLd,
    hasHreflang,
    hasTargetKeyword,
    isIndexable,
    hasRelevantSocialMetadata,
    hasRelevantImageElements,
  };
}

function determineIndexable(snapshot: PageSnapshot): boolean {
  const robotsMeta = snapshot.metadata.find((m) => m.name === "robots" || m.name === "googlebot");
  if (robotsMeta) {
    const val =
      robotsMeta.normalizedValue?.toLowerCase() ?? robotsMeta.rawValue?.toLowerCase() ?? "";
    if (val.includes("noindex")) {
      return false;
    }
  }
  return true;
}
