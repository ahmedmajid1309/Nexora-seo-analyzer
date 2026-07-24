import type { CheerioAPI } from "cheerio";
import type { DocumentInfo } from "./types";

export function extractDocument($: CheerioAPI, url: string): DocumentInfo {
  const titleEls = $("head > title");
  const title = titleEls.length > 0 ? titleEls.first().text().trim() : null;

  const charsetDeclarations: { raw: string; normalized: string | null; elementOrder: number }[] =
    [];
  $("meta[charset]").each((_i, el) => {
    const raw = $(el).attr("charset") ?? "";
    charsetDeclarations.push({
      raw,
      normalized: raw.toUpperCase(),
      elementOrder: charsetDeclarations.length,
    });
  });
  $('meta[http-equiv="content-type"]').each((_i, el) => {
    const raw = $(el).attr("content") ?? "";
    charsetDeclarations.push({
      raw,
      normalized: extractCharset(raw),
      elementOrder: charsetDeclarations.length,
    });
  });

  const viewportDeclarations: { raw: string; elementOrder: number }[] = [];
  $('meta[name="viewport"]').each((_i, el) => {
    viewportDeclarations.push({
      raw: $(el).attr("content") ?? "",
      elementOrder: viewportDeclarations.length,
    });
  });

  const baseEl = $("base[href]").first();
  const baseHref = baseEl.length > 0 ? (baseEl.attr("href") ?? null) : null;

  const lang = $("html").attr("lang") ?? null;
  const dir = $("html").attr("dir") ?? null;

  const hasHead = $("head").length > 0;
  const hasBody = $("body").length > 0;

  const declaredLanguage = lang ? lang.split("-")[0].toLowerCase() : null;

  return {
    url,
    lang,
    dir,
    title,
    titleElementCount: titleEls.length,
    charsetDeclarations,
    viewportDeclarations,
    baseHref,
    hasBody,
    hasHead,
    approxDomNodeCount: countNodes($),
    declaredLanguage,
  };
}

function countNodes($: CheerioAPI): number {
  let count = 0;
  $("*").each(() => {
    count++;
    if (count >= 6000) return false;
  });
  return count;
}

function extractCharset(content: string): string | null {
  const m = content.match(/charset\s*=\s*([a-zA-Z0-9_-]+)/i);
  return m ? m[1].toUpperCase() : null;
}
