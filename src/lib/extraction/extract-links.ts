import type { CheerioAPI } from "cheerio";
import type { LinkInfo } from "./types";
import { MAX_LINKS } from "./constants";

export function extractLinks(
  $: CheerioAPI,
  finalUrl: string,
  baseHref: string | null,
): { links: LinkInfo[]; truncated: boolean } {
  const links: LinkInfo[] = [];
  let truncated = false;

  const baseUrl = resolveBaseUrl(finalUrl, baseHref);
  const finalParsed = safeParseUrl(finalUrl);

  $("a[href], area[href]").each((_i, el) => {
    if (links.length >= MAX_LINKS) {
      truncated = true;
      return false;
    }
    const $el = $(el);
    const rawHref = ($el.attr("href") ?? "").trim();
    const classification = classifyHref(rawHref);

    const resolvedUrl = resolveUrl(rawHref, baseUrl, finalUrl);
    const parsed = resolvedUrl ? safeParseUrl(resolvedUrl) : null;

    links.push({
      rawHref,
      resolvedUrl,
      protocol: parsed?.protocol ?? null,
      hostname: parsed?.hostname ?? null,
      isSameOrigin: !!resolvedUrl && !!finalParsed && parsed?.origin === finalParsed.origin,
      isSameHost: !!resolvedUrl && !!finalParsed && parsed?.hostname === finalParsed.hostname,
      fragment: parsed?.hash?.replace(/^#/, "") ?? null,
      anchorText: $el.text().trim(),
      title: $el.attr("title") ?? null,
      relTokens: ($el.attr("rel") ?? "").split(/\s+/).filter(Boolean),
      target: $el.attr("target") ?? null,
      hasDownload: $el.attr("download") !== undefined,
      hreflang: $el.attr("hreflang") ?? null,
      media: $el.attr("media") ?? null,
      elementOrder: links.length,
      classification,
    });
  });

  return { links, truncated };
}

function classifyHref(href: string): LinkInfo["classification"] {
  if (!href) return "empty";
  if (href.startsWith("#")) return "fragment";
  if (href.startsWith("http://")) return "http";
  if (href.startsWith("https://")) return "https";
  if (href.startsWith("mailto:")) return "mailto";
  if (href.startsWith("tel:")) return "tel";
  if (href.startsWith("javascript:")) return "javascript";
  if (href.startsWith("data:")) return "data";
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(href)) return "other-scheme";
  if (href.includes(":") && !/^[/?#]/.test(href)) return "malformed";
  return "https";
}

function resolveUrl(href: string, baseUrl: string | null, fallbackUrl: string): string | null {
  try {
    return new URL(href, baseUrl ?? fallbackUrl).href;
  } catch {
    try {
      return new URL(href, fallbackUrl).href;
    } catch {
      return null;
    }
  }
}

function safeParseUrl(
  url: string,
): { protocol: string; hostname: string; origin: string; hash: string } | null {
  try {
    const u = new URL(url);
    return { protocol: u.protocol, hostname: u.hostname, origin: u.origin, hash: u.hash };
  } catch {
    return null;
  }
}

function resolveBaseUrl(finalUrl: string, baseHref: string | null): string | null {
  if (!baseHref) return null;
  try {
    return new URL(baseHref, finalUrl).href;
  } catch {
    return null;
  }
}
