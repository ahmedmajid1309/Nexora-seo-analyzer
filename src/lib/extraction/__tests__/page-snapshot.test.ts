import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import { buildPageSnapshot } from "../page-snapshot";
import { PageSnapshotSchema } from "../schemas";
import type { FetchResult } from "@/lib/network/types";

const fixtureDir = join(__dirname, "fixtures");
function loadFixture(name: string): string {
  return readFileSync(join(fixtureDir, `${name}.html`), "utf-8");
}

function makeFetchResult(html: string): FetchResult {
  return {
    requestedUrl: "https://example.com/page",
    normalizedUrl: "https://example.com/page",
    finalUrl: "https://example.com/page",
    status: 200,
    statusText: "OK",
    contentType: "text/html",
    byteLength: html.length,
    html,
    redirectChain: [],
    timing: { dns: 0, connect: 0, tls: 0, firstByte: 0, total: 10 },
  };
}

describe("buildPageSnapshot integration", () => {
  it("builds a valid PageSnapshot from valid-modern fixture", () => {
    const html = loadFixture("valid-modern");
    const fetchResult = makeFetchResult(html);
    const snapshot = buildPageSnapshot(fetchResult);

    expect(snapshot.requestedUrl).toBe("https://example.com/page");
    expect(snapshot.finalUrl).toBe("https://example.com/page");
    expect(snapshot.schemaVersion).toBe("1.0.0");
    expect(snapshot.extractedAt).toBeDefined();
    expect(() => new Date(snapshot.extractedAt)).not.toThrow();
  });

  it("passes schema validation with valid-modern fixture", () => {
    const html = loadFixture("valid-modern");
    const fetchResult = makeFetchResult(html);
    const snapshot = buildPageSnapshot(fetchResult);

    const parsed = PageSnapshotSchema.safeParse(snapshot);
    if (!parsed.success) {
      console.error(parsed.error.issues);
    }
    expect(parsed.success).toBe(true);
  });

  it("passes schema validation with metadata-rich fixture", () => {
    const html = loadFixture("metadata-rich");
    const snapshot = buildPageSnapshot(makeFetchResult(html));
    const parsed = PageSnapshotSchema.safeParse(snapshot);
    expect(parsed.success).toBe(true);
  });

  it("passes schema validation with large-text fixture", () => {
    const html = loadFixture("large-text");
    const snapshot = buildPageSnapshot(makeFetchResult(html));
    const parsed = PageSnapshotSchema.safeParse(snapshot);
    expect(parsed.success).toBe(true);
  });

  it("passes schema validation with semantic-landmarks fixture", () => {
    const html = loadFixture("semantic-landmarks");
    const snapshot = buildPageSnapshot(makeFetchResult(html));
    const parsed = PageSnapshotSchema.safeParse(snapshot);
    expect(parsed.success).toBe(true);
  });

  it("includes response snapshot data", () => {
    const html = loadFixture("valid-modern");
    const fetchResult = makeFetchResult(html);
    const snapshot = buildPageSnapshot(fetchResult);

    expect(snapshot.response.status).toBe(200);
    expect(snapshot.response.contentType).toBe("text/html");
    expect(snapshot.response.byteLength).toBe(html.length);
    expect(snapshot.response.redirectChain).toHaveLength(0);
    expect(snapshot.response.timing.total).toBe(10);
  });

  it("includes document info", () => {
    const html = loadFixture("valid-modern");
    const snapshot = buildPageSnapshot(makeFetchResult(html));

    expect(snapshot.document.url).toBe("https://example.com/page");
    expect(snapshot.document.hasHead).toBe(true);
    expect(snapshot.document.hasBody).toBe(true);
    expect(snapshot.document.title).toBeDefined();
  });

  it("includes extracted metadata", () => {
    const html = loadFixture("metadata-rich");
    const snapshot = buildPageSnapshot(makeFetchResult(html));

    expect(snapshot.metadata.length).toBeGreaterThan(0);
    expect(snapshot.metadata.some((m) => m.name === "title")).toBe(true);
    expect(snapshot.metadata.some((m) => m.name === "description")).toBe(true);
  });

  it("includes extracted headings", () => {
    const html = loadFixture("complete-headings");
    const snapshot = buildPageSnapshot(makeFetchResult(html));

    expect(snapshot.headings.length).toBeGreaterThan(0);
    expect(snapshot.headings.some((h) => h.level === 1)).toBe(true);
  });

  it("includes extracted links", () => {
    const html = loadFixture("many-links");
    const snapshot = buildPageSnapshot(makeFetchResult(html));

    expect(snapshot.links.length).toBeGreaterThan(0);
    expect(snapshot.links.some((l) => l.classification === "https")).toBe(true);
  });

  it("includes extracted images", () => {
    const html = loadFixture("many-images");
    const snapshot = buildPageSnapshot(makeFetchResult(html));

    expect(snapshot.images.length).toBeGreaterThan(0);
  });

  it("includes structured data blocks", () => {
    const html = loadFixture("valid-jsonld-object");
    const snapshot = buildPageSnapshot(makeFetchResult(html));

    expect(snapshot.structuredData.length).toBeGreaterThan(0);
    expect(snapshot.structuredData[0].parseSuccess).toBe(true);
  });

  it("includes microdata and rdfa signals", () => {
    const html = loadFixture("microdata");
    const snapshot = buildPageSnapshot(makeFetchResult(html));

    expect(snapshot.microdata.present).toBe(true);
    expect(snapshot.microdata.itemCount).toBeGreaterThan(0);
    expect(snapshot.rdfa.present).toBe(false);
  });

  it("includes social metadata", () => {
    const html = loadFixture("og-rich");
    const snapshot = buildPageSnapshot(makeFetchResult(html));

    expect(snapshot.social.openGraph.length).toBeGreaterThan(0);
  });

  it("includes content metrics", () => {
    const html = loadFixture("large-text");
    const snapshot = buildPageSnapshot(makeFetchResult(html));

    expect(snapshot.content.visibleText.length).toBeGreaterThan(0);
    expect(snapshot.content.wordCount).toBeGreaterThan(0);
    expect(snapshot.content.paragraphCount).toBeGreaterThan(0);
  });

  it("includes accessibility signals", () => {
    const html = loadFixture("inaccessible-name-signals");
    const snapshot = buildPageSnapshot(makeFetchResult(html));

    expect(snapshot.accessibility.imageAltPresent.total).toBeGreaterThan(0);
    expect(snapshot.accessibility.landmarkElements.main).toBe(0);
  });

  it("includes form info", () => {
    const html = loadFixture("forms-explicit-labels");
    const snapshot = buildPageSnapshot(makeFetchResult(html));

    expect(snapshot.forms.formCount).toBe(1);
    expect(snapshot.forms.forms[0].inputs.length).toBeGreaterThan(0);
  });

  it("includes extracted resources", () => {
    const html = loadFixture("scripts-styles-excluded");
    const snapshot = buildPageSnapshot(makeFetchResult(html));

    const scripts = snapshot.resources.filter((r) => r.type === "script");
    expect(scripts.length).toBeGreaterThan(0);
  });

  it("handles redirect chain in response", () => {
    const html = loadFixture("valid-modern");
    const fetchResult = makeFetchResult(html);
    fetchResult.redirectChain = [
      { url: "https://example.com/old", statusCode: 301 },
      { url: "https://example.com/new", statusCode: 200 },
    ];
    const snapshot = buildPageSnapshot(fetchResult);

    expect(snapshot.response.redirectChain).toHaveLength(2);
    expect(snapshot.response.redirectChain[0].url).toBe("https://example.com/old");
    expect(snapshot.response.redirectChain[0].statusCode).toBe(301);
  });

  it("does not crash on malformed HTML", () => {
    const fetchResult = makeFetchResult("<<<<<>>>>><<<invalid");
    const snapshot = buildPageSnapshot(fetchResult);

    expect(snapshot).toBeDefined();
    expect(snapshot.document).toBeDefined();
    expect(Array.isArray(snapshot.extractionWarnings)).toBe(true);
  });

  it("does not crash on empty HTML", () => {
    const fetchResult = makeFetchResult("");
    const snapshot = buildPageSnapshot(fetchResult);

    expect(snapshot).toBeDefined();
    expect(snapshot.extractionWarnings).toBeDefined();
  });

  it("produces deterministic output for same input", () => {
    const html = loadFixture("large-text");
    const result1 = buildPageSnapshot(makeFetchResult(html));
    const result2 = buildPageSnapshot(makeFetchResult(html));

    expect(result1.metadata).toEqual(result2.metadata);
    expect(result1.headings).toEqual(result2.headings);
    expect(result1.links).toEqual(result2.links);
    expect(result1.content.wordCount).toBe(result2.content.wordCount);
  });

  it("includes extraction warnings when JSON-LD is malformed", () => {
    const html = loadFixture("malformed-jsonld");
    const snapshot = buildPageSnapshot(makeFetchResult(html));

    const invalidJsonldWarnings = snapshot.extractionWarnings.filter(
      (w) => w.code === "INVALID_JSON_LD",
    );
    expect(invalidJsonldWarnings.length).toBeGreaterThanOrEqual(2);
  });

  it("includes extraction warnings for duplicate IDs", () => {
    const html = loadFixture("duplicate-ids");
    const snapshot = buildPageSnapshot(makeFetchResult(html));

    const dupWarnings = snapshot.extractionWarnings.filter((w) => w.code === "DUPLICATE_IDS");
    expect(dupWarnings.length).toBeGreaterThanOrEqual(1);
  });
});
