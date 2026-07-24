import type { PageSnapshot } from "@/lib/extraction/types";

export function isTruncated(snapshot: PageSnapshot): boolean {
  return snapshot.content.isTruncated;
}

export function hasBody(snapshot: PageSnapshot): boolean {
  return snapshot.document.hasBody;
}

export function hasHead(snapshot: PageSnapshot): boolean {
  return snapshot.document.hasHead;
}

export function hasMainElement(snapshot: PageSnapshot): boolean {
  return snapshot.content.hasMain;
}

export function hasArticles(snapshot: PageSnapshot): boolean {
  return snapshot.content.articleCount > 0;
}

export function hasSections(snapshot: PageSnapshot): boolean {
  return snapshot.content.sectionCount > 0;
}

export function hasNavigation(snapshot: PageSnapshot): boolean {
  return snapshot.content.navCount > 0;
}

export function hasHeader(snapshot: PageSnapshot): boolean {
  return snapshot.content.headerCount > 0;
}

export function hasFooter(snapshot: PageSnapshot): boolean {
  return snapshot.content.footerCount > 0;
}

export function hasAside(snapshot: PageSnapshot): boolean {
  return snapshot.content.asideCount > 0;
}

export function hasAddress(snapshot: PageSnapshot): boolean {
  return snapshot.content.addressCount > 0;
}

export function hasTimeElements(snapshot: PageSnapshot): boolean {
  return snapshot.content.timeElements.length > 0;
}

export function hasOgImage(snapshot: PageSnapshot): boolean {
  return snapshot.social.openGraph.some((og) => og.property === "og:image");
}

export function hasTwitterImage(snapshot: PageSnapshot): boolean {
  return snapshot.social.twitter.some((tw) => tw.name === "twitter:image");
}

export function hasOgUrl(snapshot: PageSnapshot): boolean {
  return snapshot.social.openGraph.some((og) => og.property === "og:url");
}
