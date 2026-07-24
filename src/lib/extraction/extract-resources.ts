import type { CheerioAPI } from "cheerio";
import type { ResourceInfo } from "./types";
import { MAX_RESOURCES } from "./constants";

export function extractResources(
  $: CheerioAPI,
  finalUrl: string,
  baseHref: string | null,
): { resources: ResourceInfo[]; truncated: boolean } {
  const resources: ResourceInfo[] = [];
  let truncated = false;
  const baseUrl = baseHref ? resolveAbs(baseHref, finalUrl) || finalUrl : finalUrl;

  $("script").each((_i, el) => {
    if (resources.length >= MAX_RESOURCES) {
      truncated = true;
      return false;
    }
    const $el = $(el);
    const src = $el.attr("src") ?? null;
    resources.push({
      type: "script",
      rawUrl: src,
      resolvedUrl: src ? resolveAbs(src, baseUrl) : null,
      async: $el.attr("async") !== undefined,
      defer: $el.attr("defer") !== undefined,
      isModule: $el.attr("type") === "module",
      media: null,
      crossorigin: $el.attr("crossorigin") ?? null,
      hasIntegrity: $el.attr("integrity") !== undefined,
      loading: null,
      elementOrder: resources.length,
    });
  });

  $("link[rel='stylesheet']").each((_i, el) => {
    if (resources.length >= MAX_RESOURCES) {
      truncated = true;
      return false;
    }
    const $el = $(el);
    const href = $el.attr("href") ?? null;
    resources.push({
      type: "stylesheet",
      rawUrl: href,
      resolvedUrl: href ? resolveAbs(href, baseUrl) : null,
      async: false,
      defer: false,
      isModule: false,
      media: $el.attr("media") ?? null,
      crossorigin: $el.attr("crossorigin") ?? null,
      hasIntegrity: $el.attr("integrity") !== undefined,
      loading: null,
      elementOrder: resources.length,
    });
  });

  const linkTypes: [string, ResourceInfo["type"]][] = [
    ["preload", "preload"],
    ["prefetch", "prefetch"],
    ["preconnect", "preconnect"],
    ["modulepreload", "modulepreload"],
    ["dns-prefetch", "other"],
  ];

  for (const [rel, type] of linkTypes) {
    $(`link[rel='${rel}']`).each((_i, el) => {
      if (resources.length >= MAX_RESOURCES) {
        truncated = true;
        return false;
      }
      const $el = $(el);
      const href = $el.attr("href") ?? null;
      resources.push({
        type,
        rawUrl: href,
        resolvedUrl: href ? resolveAbs(href, baseUrl) : null,
        async: false,
        defer: false,
        isModule: false,
        media: $el.attr("media") ?? null,
        crossorigin: $el.attr("crossorigin") ?? null,
        hasIntegrity: $el.attr("integrity") !== undefined,
        loading: null,
        elementOrder: resources.length,
      });
    });
  }

  $("iframe").each((_i, el) => {
    if (resources.length >= MAX_RESOURCES) {
      truncated = true;
      return false;
    }
    const $el = $(el);
    const src = $el.attr("src") ?? null;
    resources.push({
      type: "iframe",
      rawUrl: src,
      resolvedUrl: src ? resolveAbs(src, baseUrl) : null,
      async: false,
      defer: false,
      isModule: false,
      media: null,
      crossorigin: null,
      hasIntegrity: false,
      loading: $el.attr("loading") ?? null,
      elementOrder: resources.length,
    });
  });

  $("video, audio").each((_i, el) => {
    if (resources.length >= MAX_RESOURCES) {
      truncated = true;
      return false;
    }
    const $el = $(el);
    const tag = (el.tagName ?? "").toLowerCase();
    const src = $el.attr("src") ?? null;
    resources.push({
      type: tag === "video" ? "video" : "audio",
      rawUrl: src,
      resolvedUrl: src ? resolveAbs(src, baseUrl) : null,
      async: false,
      defer: false,
      isModule: false,
      media: null,
      crossorigin: $el.attr("crossorigin") ?? null,
      hasIntegrity: false,
      loading: null,
      elementOrder: resources.length,
    });
  });

  $("source").each((_i, el) => {
    if (resources.length >= MAX_RESOURCES) {
      truncated = true;
      return false;
    }
    const $el = $(el);
    const src = $el.attr("src") ?? null;
    resources.push({
      type: "source",
      rawUrl: src,
      resolvedUrl: src ? resolveAbs(src, baseUrl) : null,
      async: false,
      defer: false,
      isModule: false,
      media: $el.attr("media") ?? null,
      crossorigin: null,
      hasIntegrity: false,
      loading: null,
      elementOrder: resources.length,
    });
  });

  return { resources, truncated };
}

function resolveAbs(src: string | null, base: string): string | null {
  if (!src) return null;
  try {
    return new URL(src, base).href;
  } catch {
    return null;
  }
}
