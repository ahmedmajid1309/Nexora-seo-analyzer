import type { CheerioAPI } from "cheerio";
import type { ImageInfo } from "./types";
import { MAX_IMAGES } from "./constants";

export function extractImages(
  $: CheerioAPI,
  finalUrl: string,
  baseHref: string | null,
): { images: ImageInfo[]; truncated: boolean } {
  const images: ImageInfo[] = [];
  let truncated = false;

  const baseUrl = baseHref ? resolveAbsolute(baseHref, finalUrl) || finalUrl : finalUrl;

  $("img").each((_i, el) => {
    if (images.length >= MAX_IMAGES) {
      truncated = true;
      return false;
    }
    const $el = $(el);
    const rawSrc = $el.attr("src") ?? "";
    const hasPictureParent = $el.parent("picture").length > 0;

    images.push({
      rawSrc,
      resolvedSrc: rawSrc ? resolveAbsolute(rawSrc, baseUrl) : null,
      srcset: $el.attr("srcset") ?? null,
      sizes: $el.attr("sizes") ?? null,
      hasAlt: $el.attr("alt") !== undefined,
      altText: $el.attr("alt") ?? null,
      width: parseDim($el.attr("width")),
      height: parseDim($el.attr("height")),
      loading: $el.attr("loading") ?? null,
      decoding: $el.attr("decoding") ?? null,
      fetchPriority: $el.attr("fetchpriority") ?? null,
      referrerPolicy: $el.attr("referrerpolicy") ?? null,
      elementOrder: images.length,
      parentPicture: hasPictureParent,
    });
  });

  $("input[type='image']").each((_i, el) => {
    if (images.length >= MAX_IMAGES) {
      truncated = true;
      return false;
    }
    const $el = $(el);
    const rawSrc = $el.attr("src") ?? "";
    images.push({
      rawSrc,
      resolvedSrc: rawSrc ? resolveAbsolute(rawSrc, baseUrl) : null,
      srcset: null,
      sizes: null,
      hasAlt: $el.attr("alt") !== undefined,
      altText: $el.attr("alt") ?? null,
      width: parseDim($el.attr("width")),
      height: parseDim($el.attr("height")),
      loading: null,
      decoding: null,
      fetchPriority: null,
      referrerPolicy: null,
      elementOrder: images.length,
      parentPicture: false,
    });
  });

  $("video[poster]").each((_i, el) => {
    if (images.length >= MAX_IMAGES) {
      truncated = true;
      return false;
    }
    const $el = $(el);
    const rawSrc = $el.attr("poster") ?? "";
    images.push({
      rawSrc,
      resolvedSrc: rawSrc ? resolveAbsolute(rawSrc, baseUrl) : null,
      srcset: null,
      sizes: null,
      hasAlt: false,
      altText: null,
      width: parseDim($el.attr("width")),
      height: parseDim($el.attr("height")),
      loading: null,
      decoding: null,
      fetchPriority: null,
      referrerPolicy: null,
      elementOrder: images.length,
      parentPicture: false,
    });
  });

  return { images, truncated };
}

function resolveAbsolute(src: string | null, base: string): string | null {
  if (!src) return null;
  try {
    return new URL(src, base).href;
  } catch {
    return null;
  }
}

function parseDim(val: string | undefined): number | null {
  if (val === undefined || val === null) return null;
  const n = parseInt(val, 10);
  return isNaN(n) ? null : n;
}
