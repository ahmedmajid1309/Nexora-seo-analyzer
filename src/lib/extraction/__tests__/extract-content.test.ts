import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import { parseHtml } from "../parse-html";
import { extractContent } from "../extract-content";

const fixtureDir = join(__dirname, "fixtures");
function loadFixture(name: string): string {
  return readFileSync(join(fixtureDir, `${name}.html`), "utf-8");
}

describe("extractContent", () => {
  it("excludes script and style content from visible text", () => {
    const html = loadFixture("scripts-styles-excluded");
    const { $ } = parseHtml(html);
    const content = extractContent($);

    expect(content.visibleText).not.toContain("hidden");
    expect(content.visibleText).not.toContain("console.log");
    expect(content.visibleText).not.toContain("color: red");
    expect(content.visibleText).toContain("Visible paragraph text");
    expect(content.visibleText).toContain("More visible content");
  });

  it("counts paragraphs, lists, tables, blockquotes, code blocks", () => {
    const html = loadFixture("large-text");
    const { $ } = parseHtml(html);
    const content = extractContent($);

    expect(content.paragraphCount).toBe(3);
    expect(content.listCount).toBe(3);
    expect(content.listItemCount).toBe(6);
    expect(content.tableCount).toBe(1);
    expect(content.blockquoteCount).toBe(1);
    expect(content.codePreCount).toBe(2);
  });

  it("detects semantic landmarks", () => {
    const html = loadFixture("large-text");
    const { $ } = parseHtml(html);
    const content = extractContent($);

    expect(content.hasMain).toBe(true);
    expect(content.articleCount).toBe(1);
    expect(content.sectionCount).toBe(1);
    expect(content.navCount).toBe(1);
    expect(content.headerCount).toBe(1);
    expect(content.footerCount).toBe(1);
    expect(content.asideCount).toBe(1);
    expect(content.addressCount).toBe(1);
  });

  it("extracts time elements", () => {
    const html = loadFixture("large-text");
    const { $ } = parseHtml(html);
    const content = extractContent($);

    expect(content.timeElements).toHaveLength(2);
    expect(content.timeElements[0].datetime).toBe("2026-01-15");
    expect(content.timeElements[0].text).toBe("January 15");
  });

  it("counts question headings", () => {
    const html = loadFixture("large-text");
    const { $ } = parseHtml(html);
    const content = extractContent($);

    expect(content.questionHeadingCount).toBe(1);
  });

  it("counts words and sentences", () => {
    const html = loadFixture("large-text");
    const { $ } = parseHtml(html);
    const content = extractContent($);

    expect(content.wordCount).toBeGreaterThan(0);
    expect(content.sentenceCount).toBeGreaterThan(0);
    expect(content.totalChars).toBeGreaterThan(0);
  });

  it("reports isTruncated false for normal content", () => {
    const html = loadFixture("large-text");
    const { $ } = parseHtml(html);
    const content = extractContent($);

    expect(content.isTruncated).toBe(false);
  });

  it("handles pages with no body", () => {
    const { $ } = parseHtml("<html><head><title>No body</title></head></html>");
    const content = extractContent($);

    expect(content.visibleText).toBe("");
    expect(content.totalChars).toBe(0);
  });

  it("handles empty HTML", () => {
    const { $ } = parseHtml("");
    const content = extractContent($);

    expect(content.visibleText).toBeDefined();
  });

  it("counts semantic landmarks from semantic-landmarks fixture", () => {
    const html = loadFixture("semantic-landmarks");
    const { $ } = parseHtml(html);
    const content = extractContent($);

    expect(content.navCount).toBe(2);
    expect(content.headerCount).toBe(2);
    expect(content.footerCount).toBe(2);
    expect(content.articleCount).toBe(1);
    expect(content.sectionCount).toBe(2);
    expect(content.asideCount).toBe(1);
  });

  it("corrects hasMain check", () => {
    const html = loadFixture("semantic-landmarks");
    const { $ } = parseHtml(html);
    const content = extractContent($);

    expect(content.hasMain).toBe(true);
  });
});
