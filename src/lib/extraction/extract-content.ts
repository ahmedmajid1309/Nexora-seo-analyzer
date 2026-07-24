import type { CheerioAPI } from "cheerio";
import type { ContentMetrics } from "./types";
import { MAX_EXTRACTED_TEXT_CHARS } from "./constants";
import { normalizeText, countWords, countSentences } from "./normalize-text";

export function extractContent($: CheerioAPI): ContentMetrics {
  const $body = $("body");
  const visibleText = extractVisibleText($, $body.length > 0 ? $body : $("html"));
  const cleaned = normalizeText(visibleText);

  let text = cleaned;
  let isTruncated = false;

  if (text.length > MAX_EXTRACTED_TEXT_CHARS) {
    text = text.slice(0, MAX_EXTRACTED_TEXT_CHARS);
    isTruncated = true;
  }

  const $root = $body.length > 0 ? $body : $("html");

  return {
    visibleText: text,
    totalChars: cleaned.length,
    wordCount: countWords(text),
    sentenceCount: countSentences(text),
    paragraphCount: $root.find("p").length,
    listCount: $root.find("ul, ol, dl").length,
    listItemCount: $root.find("li, dt, dd").length,
    tableCount: $root.find("table").length,
    blockquoteCount: $root.find("blockquote").length,
    codePreCount: $root.find("code, pre").length,
    hasMain: $("main").length > 0,
    articleCount: $root.find("article").length,
    sectionCount: $root.find("section").length,
    navCount: $root.find("nav").length,
    headerCount: $root.find("header").length,
    footerCount: $root.find("footer").length,
    asideCount: $root.find("aside").length,
    addressCount: $root.find("address").length,
    timeElements: extractTimeElements($),
    questionHeadingCount: countQuestionHeadings($),
    isTruncated,
  };
}

function extractVisibleText($: CheerioAPI, $root: ReturnType<CheerioAPI>): string {
  const parts: string[] = [];
  $root.contents().each((_i, node) => {
    if (node.type === "text") {
      parts.push(node.data ?? "");
    } else if (node.type === "tag") {
      const tag = (node.tagName ?? "").toLowerCase();
      if (!["script", "style", "noscript", "template", "svg"].includes(tag)) {
        parts.push(extractVisibleText($, $(node)));
      }
    }
  });
  return parts.join(" ");
}

function extractTimeElements(
  $: CheerioAPI,
): { datetime: string | null; text: string; elementOrder: number }[] {
  const result: { datetime: string | null; text: string; elementOrder: number }[] = [];
  $("time").each((_i, el) => {
    const $el = $(el);
    result.push({
      datetime: $el.attr("datetime") ?? null,
      text: $el.text().trim(),
      elementOrder: result.length,
    });
  });
  return result.slice(0, 50);
}

function countQuestionHeadings($: CheerioAPI): number {
  let count = 0;
  for (let l = 1; l <= 6; l++) {
    $(`h${l}`).each((_i, el) => {
      if ($(el).text().trim().endsWith("?")) count++;
    });
  }
  return count;
}
