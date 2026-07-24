import type { PageSnapshot } from "@/lib/extraction/types";

export function hasVisibleText(snapshot: PageSnapshot): boolean {
  return snapshot.content.visibleText.trim().length > 0;
}

export function getTextLength(snapshot: PageSnapshot): number {
  return snapshot.content.visibleText.length;
}

export function getWordCount(snapshot: PageSnapshot): number {
  return snapshot.content.wordCount;
}

export function hasCanonical(snapshot: PageSnapshot): boolean {
  return snapshot.document.baseHref !== null;
}

export function hasTitle(snapshot: PageSnapshot): boolean {
  return snapshot.document.title !== null;
}

export function hasMetaDescription(snapshot: PageSnapshot): boolean {
  return snapshot.metadata.some((m) => m.name === "description" && m.normalizedValue !== null);
}

export function countHeadings(snapshot: PageSnapshot): number {
  return snapshot.headings.length;
}

export function countH1(snapshot: PageSnapshot): number {
  return snapshot.headings.filter((h) => h.level === 1).length;
}

export function hasForms(snapshot: PageSnapshot): boolean {
  return snapshot.forms.formCount > 0;
}

export function hasImages(snapshot: PageSnapshot): boolean {
  return snapshot.images.length > 0;
}

export function hasLinks(snapshot: PageSnapshot): boolean {
  return snapshot.links.length > 0;
}

export function hasInternalLinks(snapshot: PageSnapshot): boolean {
  return snapshot.links.some((l) => l.isSameOrigin);
}

export function hasExternalLinks(snapshot: PageSnapshot): boolean {
  return snapshot.links.some(
    (l) => (!l.isSameOrigin && l.classification === "https") || l.classification === "http",
  );
}

export function hasStructuredData(snapshot: PageSnapshot): boolean {
  return snapshot.structuredData.length > 0;
}

export function hasMicrodata(snapshot: PageSnapshot): boolean {
  return snapshot.microdata.present;
}

export function hasRdfa(snapshot: PageSnapshot): boolean {
  return snapshot.rdfa.present;
}

export function hasIframes(snapshot: PageSnapshot): boolean {
  return snapshot.resources.some((r) => r.type === "iframe");
}

export function countIframes(snapshot: PageSnapshot): number {
  return snapshot.resources.filter((r) => r.type === "iframe").length;
}

export function hasTables(snapshot: PageSnapshot): boolean {
  return snapshot.content.tableCount > 0;
}

export function hasMedia(snapshot: PageSnapshot): boolean {
  return snapshot.resources.some((r) => r.type === "video" || r.type === "audio");
}

export function hasOgTitle(snapshot: PageSnapshot): boolean {
  return snapshot.social.openGraph.some((og) => og.property === "og:title");
}

export function hasTwitterCard(snapshot: PageSnapshot): boolean {
  return snapshot.social.twitter.some((tw) => tw.name === "twitter:card");
}
