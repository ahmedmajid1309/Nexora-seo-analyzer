import type { CheerioAPI } from "cheerio";
import type { OpenGraphEntry, TwitterCardEntry } from "./types";
import { MAX_OPENGRAPH_ENTRIES, MAX_TWITTER_ENTRIES } from "./constants";

export function extractSocial($: CheerioAPI): {
  openGraph: OpenGraphEntry[];
  twitter: TwitterCardEntry[];
} {
  const openGraph: OpenGraphEntry[] = [];
  const twitter: TwitterCardEntry[] = [];

  $('meta[property^="og:"]').each((_i, el) => {
    if (openGraph.length >= MAX_OPENGRAPH_ENTRIES) return false;
    openGraph.push({
      property: $(el).attr("property") ?? "",
      content: $(el).attr("content") ?? "",
      elementOrder: openGraph.length,
    });
  });

  $('meta[name^="twitter:"]').each((_i, el) => {
    if (twitter.length >= MAX_TWITTER_ENTRIES) return false;
    twitter.push({
      name: $(el).attr("name") ?? "",
      content: $(el).attr("content") ?? "",
      elementOrder: twitter.length,
    });
  });

  return { openGraph, twitter };
}
