import * as cheerio from "cheerio";

export interface ParserResult {
  $: cheerio.CheerioAPI;
  warnings: { code: string; message: string }[];
  approxNodeCount: number;
}

export function parseHtml(html: string): ParserResult {
  const warnings: { code: string; message: string }[] = [];
  let $: cheerio.CheerioAPI;

  try {
    $ = cheerio.load(html);
  } catch {
    try {
      $ = cheerio.load(html, { _useHtmlParser2: true } as cheerio.CheerioOptions);
      warnings.push({
        code: "PARSER_LIMITATION",
        message: "Falling back to htmlparser2 for malformed HTML",
      });
    } catch {
      $ = cheerio.load("<html><body></body></html>");
      warnings.push({
        code: "MALFORMED_HTML",
        message: "HTML could not be parsed; using empty fallback",
      });
    }
  }

  const approxNodeCount = countNodes($);

  return { $, warnings, approxNodeCount };
}

function countNodes($: cheerio.CheerioAPI): number {
  let count = 0;
  $("*").each(() => {
    count++;
    if (count > 6000) return false;
  });
  return count;
}
