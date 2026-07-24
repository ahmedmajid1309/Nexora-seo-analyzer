import type { CheerioAPI } from "cheerio";
import type { AccessibilitySignals } from "./types";
import {
  MAX_DUPLICATE_ID_REPORT,
  MAX_TABINDEX_VALUES,
  MAX_SKIP_LINK_CANDIDATES,
} from "./constants";

export function extractAccessibility($: CheerioAPI, lang: string | null): AccessibilitySignals {
  const images = $("img");
  let imgWithAlt = 0;
  let imgWithoutAlt = 0;
  images.each((_i, el) => {
    if ($(el).attr("alt") !== undefined) imgWithAlt++;
    else imgWithoutAlt++;
  });

  const inputs = $("input:not([type='hidden']), textarea, select");
  let inputsWithLabel = 0;
  let inputsWithoutLabel = 0;
  inputs.each((_i, el) => {
    const id = $(el).attr("id");
    if (id && $(`label[for='${id}']`).length > 0) {
      inputsWithLabel++;
    } else if (
      $(el).closest("label").length > 0 ||
      $(el).attr("aria-label") ||
      $(el).attr("aria-labelledby")
    ) {
      inputsWithLabel++;
    } else {
      inputsWithoutLabel++;
    }
  });

  const buttons = $("button, input[type='submit'], input[type='button']");
  let btnsWithText = 0;
  let btnsWithoutText = 0;
  buttons.each((_i, el) => {
    const $el = $(el);
    const tag = (el.tagName ?? "").toLowerCase();
    if (tag === "button" && $el.text().trim()) {
      btnsWithText++;
    } else if ($el.attr("aria-label") || $el.attr("aria-labelledby") || $el.attr("title")) {
      btnsWithText++;
    } else if (tag !== "button" && ($el.attr("value") ?? "").trim()) {
      btnsWithText++;
    } else {
      btnsWithoutText++;
    }
  });

  const anchors = $("a[href]");
  let linksWithName = 0;
  let linksWithoutName = 0;
  anchors.each((_i, el) => {
    const $el = $(el);
    if (
      $el.text().trim() ||
      $el.attr("aria-label") ||
      $el.attr("aria-labelledby") ||
      $el.attr("title")
    ) {
      linksWithName++;
    } else {
      linksWithoutName++;
    }
  });

  const landmarkElements = {
    nav: $("nav").length,
    header: $("header").length,
    footer: $("footer").length,
    aside: $("aside").length,
    main: $("main").length,
    section: $("section").length,
  };

  const headings = $("h1, h2, h3, h4, h5, h6").length;

  const skipLinkCandidates: AccessibilitySignals["skipLinkCandidates"] = [];
  $("a[href^='#']").each((_i, el) => {
    if (skipLinkCandidates.length >= MAX_SKIP_LINK_CANDIDATES) return false;
    const $el = $(el);
    const text = $el.text().trim().toLowerCase();
    const href = $el.attr("href") ?? "";
    if (
      text.includes("skip") ||
      text.includes("main") ||
      text.includes("content") ||
      text.includes("nav")
    ) {
      skipLinkCandidates.push({
        href,
        text: $el.text().trim(),
        elementOrder: skipLinkCandidates.length,
      });
    }
  });

  const thCount = $("th").length;

  const roles: string[] = [];
  const seenRoles = new Set<string>();
  $("[role]").each((_i, el) => {
    const role = $(el).attr("role") ?? "";
    if (role && !seenRoles.has(role)) {
      seenRoles.add(role);
      roles.push(role);
    }
  });

  const ids = new Map<string, number>();
  $("[id]").each((_i, el) => {
    const id = $(el).attr("id") ?? "";
    if (id) ids.set(id, (ids.get(id) ?? 0) + 1);
  });
  const duplicateIds = Array.from(ids.entries())
    .filter(([, c]) => c > 1)
    .map(([id]) => id)
    .slice(0, MAX_DUPLICATE_ID_REPORT);

  const tabindexValues: AccessibilitySignals["tabindexValues"] = [];
  $("[tabindex]").each((_i, el) => {
    if (tabindexValues.length >= MAX_TABINDEX_VALUES) return false;
    const val = parseInt($(el).attr("tabindex") ?? "", 10);
    if (!isNaN(val)) tabindexValues.push({ value: val, elementOrder: tabindexValues.length });
  });

  const iframes = $("iframe");
  let iframesWithTitle = 0;
  let iframesWithoutTitle = 0;
  iframes.each((_i, el) => {
    if ($(el).attr("title")) iframesWithTitle++;
    else iframesWithoutTitle++;
  });

  const media = $("video, audio");
  let mediaWithTrack = 0;
  let mediaWithoutTrack = 0;
  media.each((_i, el) => {
    if ($(el).find("track").length > 0) mediaWithTrack++;
    else mediaWithoutTrack++;
  });

  let viewportZoomRestricted = false;
  $('meta[name="viewport"]').each((_i, el) => {
    const content = $(el).attr("content") ?? "";
    if (
      /user-scalable\s*=\s*no/i.test(content) ||
      /maximum-scale\s*=\s*0/i.test(content) ||
      /maximum-scale\s*=\s*0\./i.test(content)
    ) {
      viewportZoomRestricted = true;
    }
  });

  return {
    documentLanguage: lang,
    imageAltPresent: { total: images.length, withAlt: imgWithAlt, withoutAlt: imgWithoutAlt },
    formLabelRelationships: {
      total: inputs.length,
      withLabel: inputsWithLabel,
      withoutLabel: inputsWithoutLabel,
    },
    inputAccessibleNames: {
      total: inputs.length,
      withName: inputsWithLabel,
      withoutName: inputsWithoutLabel,
    },
    buttonTextSignals: {
      total: buttons.length,
      withText: btnsWithText,
      withoutText: btnsWithoutText,
    },
    linkAccessibleNames: {
      total: anchors.length,
      withName: linksWithName,
      withoutName: linksWithoutName,
    },
    landmarkElements,
    headingElements: { total: headings },
    skipLinkCandidates,
    tableHeaderCells: { totalTh: thCount },
    ariaAttributes: { total: roles.length, roles },
    duplicateIds,
    tabindexValues,
    iframeTitles: {
      total: iframes.length,
      withTitle: iframesWithTitle,
      withoutTitle: iframesWithoutTitle,
    },
    mediaCaptions: {
      total: media.length,
      withTrack: mediaWithTrack,
      withoutTrack: mediaWithoutTrack,
    },
    viewportZoomRestricted,
  };
}
