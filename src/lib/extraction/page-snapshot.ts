import type { FetchResult } from "@/lib/network/types";
import { parseHtml } from "./parse-html";
import { extractDocument } from "./extract-document";
import { extractMetadata } from "./extract-metadata";
import { extractHeadings } from "./extract-headings";
import { extractLinks } from "./extract-links";
import { extractImages } from "./extract-images";
import { extractStructuredData } from "./extract-structured-data";
import { extractSocial } from "./extract-social";
import { extractContent } from "./extract-content";
import { extractAccessibility } from "./extract-accessibility";
import { extractForms } from "./extract-forms";
import { extractResources } from "./extract-resources";
import { SCHEMA_VERSION } from "./constants";
import type { PageSnapshot } from "./schemas";
import type { ExtractionWarningCode } from "./types";

function warn(code: ExtractionWarningCode, message: string, details?: string) {
  return { code, message, ...(details ? { details } : {}) };
}

export function buildPageSnapshot(fetchResult: FetchResult): PageSnapshot {
  const extractionWarnings: ReturnType<typeof warn>[] = [];
  const html = fetchResult.html;

  const parserResult = parseHtml(html);
  for (const w of parserResult.warnings) {
    extractionWarnings.push(warn(w.code as ExtractionWarningCode, w.message));
  }
  const $ = parserResult.$;

  const documentInfo = extractDocument($, fetchResult.finalUrl);

  if (!documentInfo.hasHead) {
    extractionWarnings.push(warn("MISSING_HEAD", "Document has no <head> element"));
  }
  if (!documentInfo.hasBody) {
    extractionWarnings.push(warn("MISSING_BODY", "Document has no <body> element"));
  }

  if (documentInfo.baseHref) {
    try {
      new URL(documentInfo.baseHref, fetchResult.finalUrl);
    } catch {
      extractionWarnings.push(
        warn("INVALID_BASE_URL", `<base href="${documentInfo.baseHref}" could not be parsed`),
      );
    }
  }

  const { metadata, truncated: metaTruncated } = extractMetadata($);
  if (metaTruncated)
    extractionWarnings.push(warn("COLLECTION_TRUNCATED", "Metadata collection limit reached"));

  const { headings, truncated: headingsTruncated } = extractHeadings($);
  if (headingsTruncated)
    extractionWarnings.push(warn("COLLECTION_TRUNCATED", "Heading collection limit reached"));

  const { links, truncated: linksTruncated } = extractLinks(
    $,
    fetchResult.finalUrl,
    documentInfo.baseHref,
  );
  if (linksTruncated)
    extractionWarnings.push(warn("COLLECTION_TRUNCATED", "Link collection limit reached"));

  const { images, truncated: imagesTruncated } = extractImages(
    $,
    fetchResult.finalUrl,
    documentInfo.baseHref,
  );
  if (imagesTruncated)
    extractionWarnings.push(warn("COLLECTION_TRUNCATED", "Image collection limit reached"));

  const { blocks, microdata, rdfa, truncated: sdTruncated } = extractStructuredData($);
  if (sdTruncated)
    extractionWarnings.push(
      warn("COLLECTION_TRUNCATED", "Structured data collection limit reached"),
    );
  for (const block of blocks) {
    if (!block.parseSuccess) {
      extractionWarnings.push(
        warn("INVALID_JSON_LD", `JSON-LD block ${block.elementOrder} failed to parse`),
      );
    }
  }

  const social = extractSocial($);
  const content = extractContent($);
  if (content.isTruncated)
    extractionWarnings.push(warn("TEXT_TRUNCATED", "Extracted text was truncated at limit"));

  const accessibility = extractAccessibility($, documentInfo.lang);
  if (accessibility.duplicateIds.length > 0) {
    extractionWarnings.push(
      warn("DUPLICATE_IDS", `Found ${accessibility.duplicateIds.length} duplicate id values`),
    );
  }

  const forms = extractForms($);
  const { resources, truncated: resourcesTruncated } = extractResources(
    $,
    fetchResult.finalUrl,
    documentInfo.baseHref,
  );
  if (resourcesTruncated)
    extractionWarnings.push(warn("COLLECTION_TRUNCATED", "Resource collection limit reached"));

  return {
    schemaVersion: SCHEMA_VERSION,
    extractedAt: new Date().toISOString(),
    requestedUrl: fetchResult.requestedUrl,
    finalUrl: fetchResult.finalUrl,
    response: {
      status: fetchResult.status,
      contentType: fetchResult.contentType,
      byteLength: fetchResult.byteLength,
      redirectChain: fetchResult.redirectChain.map((r) => ({
        url: r.url,
        statusCode: r.statusCode,
      })),
      timing: { ...fetchResult.timing },
    },
    document: documentInfo,
    metadata,
    headings,
    links,
    images,
    structuredData: blocks,
    microdata,
    rdfa,
    social,
    content,
    accessibility,
    forms,
    resources,
    extractionWarnings,
  } as PageSnapshot;
}
