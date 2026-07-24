import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import { parseHtml } from "../parse-html";
import { extractStructuredData } from "../extract-structured-data";

const fixtureDir = join(__dirname, "fixtures");
function loadFixture(name: string): string {
  return readFileSync(join(fixtureDir, `${name}.html`), "utf-8");
}

describe("extractStructuredData", () => {
  describe("JSON-LD object fixture", () => {
    it("parses a single valid JSON-LD object successfully", () => {
      const html = loadFixture("valid-jsonld-object");
      const { $ } = parseHtml(html);
      const { blocks, truncated } = extractStructuredData($);

      expect(truncated).toBe(false);
      expect(blocks).toHaveLength(1);
      expect(blocks[0].parseSuccess).toBe(true);
      expect(blocks[0].parsedTypes).toContain("WebPage");
      expect(blocks[0].context).toBe("https://schema.org");
      expect(blocks[0].parseErrorCategory).toBe("none");
    });
  });

  describe("JSON-LD array fixture", () => {
    it("parses a JSON-LD array and collects all types", () => {
      const html = loadFixture("valid-jsonld-array");
      const { $ } = parseHtml(html);
      const { blocks } = extractStructuredData($);

      expect(blocks).toHaveLength(1);
      expect(blocks[0].parseSuccess).toBe(true);
      expect(blocks[0].parsedTypes).toEqual(expect.arrayContaining(["Person", "Product"]));
      expect(blocks[0].parsedTypes).toHaveLength(2);
      expect(blocks[0].parseErrorCategory).toBe("none");
    });
  });

  describe("JSON-LD @graph fixture", () => {
    it("parses a JSON-LD @graph and collects types from graph items", () => {
      const html = loadFixture("valid-jsonld-graph");
      const { $ } = parseHtml(html);
      const { blocks } = extractStructuredData($);

      expect(blocks).toHaveLength(1);
      expect(blocks[0].parseSuccess).toBe(true);
      expect(blocks[0].parsedTypes).toEqual(expect.arrayContaining(["WebSite", "WebPage"]));
      expect(blocks[0].parsedTypes).toHaveLength(2);
      expect(blocks[0].context).toBe("https://schema.org");
    });
  });

  describe("malformed JSON-LD fixture", () => {
    it("reports parse failures for invalid JSON", () => {
      const html = loadFixture("malformed-jsonld");
      const { $ } = parseHtml(html);
      const { blocks } = extractStructuredData($);

      expect(blocks).toHaveLength(3);
      const invalidBlock = blocks[0];
      expect(invalidBlock.parseSuccess).toBe(false);
      expect(invalidBlock.parsedTypes).toHaveLength(0);
      expect(invalidBlock.parseErrorCategory).toBe("syntax-error");
    });

    it("reports not-object-or-array when JSON is a string", () => {
      const html = loadFixture("malformed-jsonld");
      const { $ } = parseHtml(html);
      const { blocks } = extractStructuredData($);

      const stringBlock = blocks[1];
      expect(stringBlock.parseSuccess).toBe(false);
      expect(stringBlock.parsedTypes).toHaveLength(0);
      expect(stringBlock.parseErrorCategory).toBe("not-object-or-array");
    });

    it("reports syntax-error for empty script content", () => {
      const html = loadFixture("malformed-jsonld");
      const { $ } = parseHtml(html);
      const { blocks } = extractStructuredData($);

      const emptyBlock = blocks[2];
      expect(emptyBlock.parseSuccess).toBe(false);
      expect(emptyBlock.parseErrorCategory).toBe("syntax-error");
    });
  });

  describe("microdata fixture", () => {
    it("detects microdata items and types", () => {
      const html = loadFixture("microdata");
      const { $ } = parseHtml(html);
      const { microdata } = extractStructuredData($);

      expect(microdata.present).toBe(true);
      expect(microdata.itemCount).toBe(4);
      expect(microdata.itemTypes).toContain("https://schema.org/Person");
      expect(microdata.itemTypes).toContain("https://schema.org/Product");
    });

    it("includes items without itemtype", () => {
      const html = loadFixture("microdata");
      const { $ } = parseHtml(html);
      const { microdata } = extractStructuredData($);

      expect(microdata.itemCount).toBe(4);
    });
  });

  describe("RDFa detection", () => {
    it("detects typeof and property attributes when present", () => {
      const html =
        '<html><body><div typeof="schema:Person"><span property="name">Alice</span></div></body></html>';
      const { $ } = parseHtml(html);
      const { rdfa } = extractStructuredData($);

      expect(rdfa.present).toBe(true);
      expect(rdfa.typeofCount).toBe(1);
      expect(rdfa.propertyCount).toBe(1);
    });

    it("reports absent when no RDFa attributes exist", () => {
      const html = loadFixture("microdata");
      const { $ } = parseHtml(html);
      const { rdfa } = extractStructuredData($);

      expect(rdfa.present).toBe(false);
      expect(rdfa.typeofCount).toBe(0);
      expect(rdfa.propertyCount).toBe(0);
    });
  });

  describe("no structured data", () => {
    it("returns empty blocks and absent microdata/rdfa", () => {
      const html = loadFixture("empty-headings");
      const { $ } = parseHtml(html);
      const { blocks, microdata, rdfa } = extractStructuredData($);

      expect(blocks).toHaveLength(0);
      expect(microdata.present).toBe(false);
      expect(microdata.itemCount).toBe(0);
      expect(rdfa.present).toBe(false);
    });
  });
});
