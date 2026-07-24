import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import { parseHtml } from "../parse-html";
import { extractDocument } from "../extract-document";

const fixtureDir = join(__dirname, "fixtures");
function loadFixture(name: string): string {
  return readFileSync(join(fixtureDir, `${name}.html`), "utf-8");
}

describe("extractDocument", () => {
  it("extracts full document info from valid-modern fixture", () => {
    const html = loadFixture("valid-modern");
    const { $ } = parseHtml(html);
    const doc = extractDocument($, "https://example.com/modern-valid");

    expect(doc.url).toBe("https://example.com/modern-valid");
    expect(doc.lang).toBe("en");
    expect(doc.dir).toBeNull();
    expect(doc.title).toBe("Modern Valid Page - Nexora SEO Analyzer");
    expect(doc.titleElementCount).toBe(1);
    expect(doc.hasHead).toBe(true);
    expect(doc.hasBody).toBe(true);
    expect(doc.declaredLanguage).toBe("en");
    expect(doc.baseHref).toBeNull();
    expect(doc.charsetDeclarations.length).toBeGreaterThanOrEqual(1);
    expect(doc.viewportDeclarations.length).toBeGreaterThanOrEqual(1);
  });

  it("extracts from metadata-poor fixture (minimal)", () => {
    const html = loadFixture("metadata-poor");
    const { $ } = parseHtml(html);
    const doc = extractDocument($, "https://example.com/minimal");

    expect(doc.title).toBe("Minimal");
    expect(doc.lang).toBeNull();
    expect(doc.hasHead).toBe(true);
    expect(doc.hasBody).toBe(true);
    expect(doc.charsetDeclarations).toHaveLength(0);
    expect(doc.viewportDeclarations).toHaveLength(0);
    expect(doc.baseHref).toBeNull();
  });

  it("handles malformed HTML (empty fallback)", () => {
    const { $ } = parseHtml("not even html");
    const doc = extractDocument($, "https://example.com/bad");
    expect(doc.url).toBe("https://example.com/bad");
    expect(doc.title).toBeNull();
    expect(doc.lang).toBeNull();
    expect(doc.approxDomNodeCount).toBeGreaterThanOrEqual(0);
  });

  it("extracts charset from meta charset tag", () => {
    const html = loadFixture("metadata-rich");
    const { $ } = parseHtml(html);
    const doc = extractDocument($, "https://example.com/metadata-rich");
    expect(doc.charsetDeclarations.some((c) => c.normalized === "UTF-8")).toBe(true);
  });

  it("extracts viewport declaration", () => {
    const html = loadFixture("metadata-rich");
    const { $ } = parseHtml(html);
    const doc = extractDocument($, "https://example.com/metadata-rich");
    expect(doc.viewportDeclarations.length).toBeGreaterThanOrEqual(1);
    expect(doc.viewportDeclarations[0].raw).toContain("width");
  });

  it("detects no title when head is missing", () => {
    const { $ } = parseHtml("<html><body><p>No head</p></body></html>");
    const doc = extractDocument($, "https://example.com/no-head");
    expect(doc.title).toBeNull();
    expect(doc.titleElementCount).toBe(0);
  });

  it("extracts base href when present", () => {
    const html = loadFixture("valid-base-url");
    const { $ } = parseHtml(html);
    const doc = extractDocument($, "https://example.com/page");
    expect(doc.baseHref).toBe("https://example.com/subdir/");
  });

  it("extracts declared language from lang attribute", () => {
    const html = loadFixture("valid-base-url");
    const { $ } = parseHtml(html);
    const doc = extractDocument($, "https://example.com/page");
    expect(doc.declaredLanguage).toBe("en");
  });
});
