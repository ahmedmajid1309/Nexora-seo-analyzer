import type { PageSnapshot } from "@/lib/extraction/types";

export function getTitleText(snapshot: PageSnapshot): string | null {
  return snapshot.document.title;
}

export function getDescriptionText(snapshot: PageSnapshot): string | null {
  const desc = snapshot.metadata.find((m) => m.name === "description");
  return desc?.normalizedValue ?? null;
}

export function getVisibleText(snapshot: PageSnapshot): string {
  return snapshot.content.visibleText;
}

export function getHeadingTexts(snapshot: PageSnapshot): string[] {
  return snapshot.headings.map((h) => h.text);
}

export function isEmptyOrWhitespace(text: string | null): boolean {
  return text === null || text.trim().length === 0;
}

export function getOgTitle(snapshot: PageSnapshot): string | null {
  const og = snapshot.social.openGraph.find((e) => e.property === "og:title");
  return og?.content ?? null;
}

export function getOgDescription(snapshot: PageSnapshot): string | null {
  const og = snapshot.social.openGraph.find((e) => e.property === "og:description");
  return og?.content ?? null;
}

export function getTwitterTitle(snapshot: PageSnapshot): string | null {
  const tw = snapshot.social.twitter.find((e) => e.name === "twitter:title");
  return tw?.content ?? null;
}

export function getTwitterDescription(snapshot: PageSnapshot): string | null {
  const tw = snapshot.social.twitter.find((e) => e.name === "twitter:description");
  return tw?.content ?? null;
}
