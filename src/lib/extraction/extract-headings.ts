import type { CheerioAPI } from "cheerio";
import type { HeadingInfo } from "./types";
import { MAX_HEADINGS } from "./constants";

export function extractHeadings($: CheerioAPI): { headings: HeadingInfo[]; truncated: boolean } {
  const headings: HeadingInfo[] = [];
  let truncated = false;

  for (let level = 1; level <= 6; level++) {
    const sel = `h${level}`;
    $(sel).each((_i, el) => {
      if (headings.length >= MAX_HEADINGS) {
        truncated = true;
        return false;
      }
      const $el = $(el);
      const text = $el.text().trim();
      const isHidden =
        $el.css("display") === "none" ||
        $el.attr("hidden") !== undefined ||
        $el.attr("aria-hidden") === "true";
      headings.push({
        level,
        text,
        rawTextLength: text.length,
        isEmpty: text.length === 0,
        isHidden,
        elementId: $el.attr("id") ?? null,
        order: headings.length,
      });
    });
    if (truncated) break;
  }

  return { headings, truncated };
}
