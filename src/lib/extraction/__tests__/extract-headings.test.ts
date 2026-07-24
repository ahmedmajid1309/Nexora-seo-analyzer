import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import { parseHtml } from "../parse-html";
import { extractHeadings } from "../extract-headings";

const fixtureDir = join(__dirname, "fixtures");
function loadFixture(name: string): string {
  return readFileSync(join(fixtureDir, `${name}.html`), "utf-8");
}

describe("extractHeadings", () => {
  it("extracts all headings with correct levels from complete-headings fixture", () => {
    const html = loadFixture("complete-headings");
    const { $ } = parseHtml(html);
    const { headings, truncated } = extractHeadings($);

    expect(truncated).toBe(false);
    expect(headings.length).toBeGreaterThanOrEqual(10);

    const h1s = headings.filter((h) => h.level === 1);
    const h2s = headings.filter((h) => h.level === 2);
    const h3s = headings.filter((h) => h.level === 3);
    const h4s = headings.filter((h) => h.level === 4);
    const h5s = headings.filter((h) => h.level === 5);
    const h6s = headings.filter((h) => h.level === 6);

    expect(h1s).toHaveLength(2);
    expect(h2s).toHaveLength(5);
    expect(h3s).toHaveLength(3);
    expect(h4s).toHaveLength(1);
    expect(h5s).toHaveLength(1);
    expect(h6s).toHaveLength(1);
  });

  it("captures heading text and element IDs", () => {
    const html = loadFixture("complete-headings");
    const { $ } = parseHtml(html);
    const { headings } = extractHeadings($);

    const mainTitle = headings.find((h) => h.level === 1 && h.text === "Main Heading");
    expect(mainTitle).toBeDefined();
    expect(mainTitle!.elementId).toBe("main-title");
    expect(mainTitle!.rawTextLength).toBe("Main Heading".length);
    expect(mainTitle!.isEmpty).toBe(false);
  });

  it("detects aria-hidden headings", () => {
    const html = loadFixture("complete-headings");
    const { $ } = parseHtml(html);
    const { headings } = extractHeadings($);

    const hidden = headings.find((h) => h.text === "Hidden Heading");
    expect(hidden).toBeDefined();
    expect(hidden!.isHidden).toBe(true);
  });

  it("detects display:none and hidden attribute headings", () => {
    const html = loadFixture("complete-headings");
    const { $ } = parseHtml(html);
    const { headings } = extractHeadings($);

    const displayNone = headings.find((h) => h.text === "Display None Heading");
    expect(displayNone).toBeDefined();
    expect(displayNone!.isHidden).toBe(true);

    const hiddenAttr = headings.find((h) => h.text === "Hidden Attribute Heading");
    expect(hiddenAttr).toBeDefined();
    expect(hiddenAttr!.isHidden).toBe(true);
  });

  it("marks empty headings correctly", () => {
    const html = loadFixture("complete-headings");
    const { $ } = parseHtml(html);
    const { headings } = extractHeadings($);

    const empty = headings.find((h) => h.level === 1 && h.text === "");
    expect(empty).toBeDefined();
    expect(empty!.isEmpty).toBe(true);
    expect(empty!.rawTextLength).toBe(0);
  });

  it("returns empty array for empty-headings fixture", () => {
    const html = loadFixture("empty-headings");
    const { $ } = parseHtml(html);
    const { headings, truncated } = extractHeadings($);

    expect(truncated).toBe(false);
    expect(headings).toHaveLength(0);
  });

  it("orders headings by level and appearance", () => {
    const html = loadFixture("complete-headings");
    const { $ } = parseHtml(html);
    const { headings } = extractHeadings($);

    for (let i = 1; i < headings.length; i++) {
      expect(headings[i].order).toBeGreaterThan(headings[i - 1].order);
    }
  });
});
