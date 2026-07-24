import type { CheerioAPI } from "cheerio";
import type { MetadataEntry } from "./types";
import { MAX_META_ENTRIES } from "./constants";

export function extractMetadata($: CheerioAPI): { metadata: MetadataEntry[]; truncated: boolean } {
  const metadata: MetadataEntry[] = [];
  let truncated = false;

  $("title").each(() => {
    if (metadata.length >= MAX_META_ENTRIES) {
      truncated = true;
      return false;
    }
    const text = $("title").first().text().trim();
    if (text) {
      metadata.push({
        name: "title",
        rawValue: text,
        normalizedValue: text,
        sourceAttribute: "innerText",
        elementOrder: metadata.length,
      });
    }
  });

  $("meta").each((_i, el) => {
    if (metadata.length >= MAX_META_ENTRIES) {
      truncated = true;
      return false;
    }
    const name = (
      $(el).attr("name") ??
      $(el).attr("property") ??
      $(el).attr("http-equiv") ??
      ""
    ).toLowerCase();
    const content = $(el).attr("content") ?? "";
    let normalized: string | null = content;
    if (name === "robots" || name.includes("bot")) {
      normalized = content
        .toLowerCase()
        .split(",")
        .map((s) => s.trim())
        .join(", ");
    }
    metadata.push({
      name,
      rawValue: content,
      normalizedValue: normalized || null,
      sourceAttribute: name ? "name" : "http-equiv",
      elementOrder: metadata.length,
    });
  });

  $("link[rel='canonical']").each((_i, el) => {
    if (metadata.length >= MAX_META_ENTRIES) {
      truncated = true;
      return false;
    }
    const href = $(el).attr("href") ?? "";
    metadata.push({
      name: "canonical",
      rawValue: href,
      normalizedValue: href || null,
      sourceAttribute: "href",
      elementOrder: metadata.length,
    });
  });

  $("link[rel='alternate']").each((_i, el) => {
    if (metadata.length >= MAX_META_ENTRIES) {
      truncated = true;
      return false;
    }
    const href = $(el).attr("href") ?? "";
    const hreflang = $(el).attr("hreflang") ?? "";
    metadata.push({
      name: `alternate${hreflang ? `[${hreflang}]` : ""}`,
      rawValue: href,
      normalizedValue: href || null,
      sourceAttribute: "href",
      elementOrder: metadata.length,
    });
  });

  $("link[rel*='icon']").each((_i, el) => {
    if (metadata.length >= MAX_META_ENTRIES) {
      truncated = true;
      return false;
    }
    const href = $(el).attr("href") ?? "";
    const rel = $(el).attr("rel") ?? "icon";
    metadata.push({
      name: `link:${rel}`,
      rawValue: href,
      normalizedValue: href || null,
      sourceAttribute: "href",
      elementOrder: metadata.length,
    });
  });

  $("link[rel='manifest']").each((_i, el) => {
    if (metadata.length >= MAX_META_ENTRIES) {
      truncated = true;
      return false;
    }
    metadata.push({
      name: "manifest",
      rawValue: $(el).attr("href") ?? "",
      normalizedValue: $(el).attr("href") ?? null,
      sourceAttribute: "href",
      elementOrder: metadata.length,
    });
  });

  return { metadata, truncated };
}
