import type { CheerioAPI } from "cheerio";
import type { StructuredDataBlock, MicrodataSignal, RdfaSignal } from "./types";
import { MAX_JSONLD_BLOCKS, MAX_JSONLD_TEXT_SAMPLE } from "./constants";

export function extractStructuredData($: CheerioAPI): {
  blocks: StructuredDataBlock[];
  microdata: MicrodataSignal;
  rdfa: RdfaSignal;
  truncated: boolean;
} {
  const blocks: StructuredDataBlock[] = [];
  let truncated = false;

  $('script[type="application/ld+json"]').each((_i, el) => {
    if (blocks.length >= MAX_JSONLD_BLOCKS) {
      truncated = true;
      return false;
    }
    const rawText = $(el).text().trim();
    const rawSample = rawText.slice(0, MAX_JSONLD_TEXT_SAMPLE);
    const parsed = tryParseJsonLd(rawText);

    blocks.push({
      rawSample,
      parseSuccess: parsed.success,
      parsedTypes: parsed.types,
      context: parsed.context,
      elementOrder: blocks.length,
      parseErrorCategory: parsed.errorCategory,
    });
  });

  const microdata = extractMicrodata($);
  const rdfa = extractRdfa($);

  return { blocks, microdata, rdfa, truncated };
}

function tryParseJsonLd(text: string): {
  success: boolean;
  types: string[];
  context: string | null;
  errorCategory: StructuredDataBlock["parseErrorCategory"];
} {
  if (!text) {
    return { success: false, types: [], context: null, errorCategory: "syntax-error" };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { success: false, types: [], context: null, errorCategory: "syntax-error" };
  }

  if (typeof parsed !== "object" || parsed === null) {
    return { success: false, types: [], context: null, errorCategory: "not-object-or-array" };
  }

  const types = new Set<string>();
  let context: string | null = null;

  if (Array.isArray(parsed)) {
    for (const item of parsed) {
      collectTypes(item, types);
      if (!context) context = extractContext(item);
    }
  } else {
    const obj = parsed as Record<string, unknown>;
    collectTypes(obj, types);
    context = extractContext(obj);

    if (obj["@graph"] && Array.isArray(obj["@graph"])) {
      for (const item of obj["@graph"]) {
        collectTypes(item, types);
      }
    }
  }

  return {
    success: true,
    types: Array.from(types),
    context,
    errorCategory: "none",
  };
}

function collectTypes(obj: unknown, types: Set<string>): void {
  if (typeof obj !== "object" || obj === null) return;
  const rec = obj as Record<string, unknown>;
  const typeVal = rec["@type"];
  if (typeof typeVal === "string") {
    types.add(typeVal);
  } else if (Array.isArray(typeVal)) {
    for (const t of typeVal) {
      if (typeof t === "string") types.add(t);
    }
  }
}

function extractContext(obj: Record<string, unknown>): string | null {
  const ctx = obj["@context"];
  if (typeof ctx === "string") return ctx;
  if (ctx && typeof ctx === "object") return JSON.stringify(ctx).slice(0, 500);
  return null;
}

function extractMicrodata($: CheerioAPI): MicrodataSignal {
  const items = $("[itemscope]");
  const types = new Set<string>();
  items.each((_i, el) => {
    const itemtype = $(el).attr("itemtype") ?? "";
    if (itemtype) types.add(itemtype);
  });
  return {
    present: items.length > 0,
    itemCount: items.length,
    itemTypes: Array.from(types),
  };
}

function extractRdfa($: CheerioAPI): RdfaSignal {
  const typeofCount = $("[typeof]").length;
  const propertyCount = $("[property]").length;
  return {
    present: typeofCount > 0 || propertyCount > 0,
    typeofCount,
    propertyCount,
  };
}
