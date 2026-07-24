import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import { parseHtml } from "../parse-html";
import { extractMetadata } from "../extract-metadata";

const fixtureDir = join(__dirname, "fixtures");
function loadFixture(name: string): string {
  return readFileSync(join(fixtureDir, `${name}.html`), "utf-8");
}

describe("extractMetadata", () => {
  it("extracts all metadata from metadata-rich fixture", () => {
    const html = loadFixture("metadata-rich");
    const { $ } = parseHtml(html);
    const { metadata, truncated } = extractMetadata($);

    expect(truncated).toBe(false);
    const names = metadata.map((m) => m.name);
    expect(names).toContain("title");
    expect(names).toContain("description");
    expect(names).toContain("keywords");
    expect(names).toContain("author");
    expect(names).toContain("robots");
    expect(names).toContain("canonical");
    expect(names).toContain("alternate[es]");
    expect(names).toContain("link:icon");
    expect(names).toContain("manifest");
    expect(names).toContain("content-type");

    const desc = metadata.find((m) => m.name === "description")!;
    expect(desc.sourceAttribute).toBe("name");
    expect(desc.rawValue).toBeTruthy();

    const titleEntry = metadata.find((m) => m.name === "title")!;
    expect(titleEntry.sourceAttribute).toBe("innerText");
    expect(titleEntry.rawValue).toBe("Rich Metadata Page");
  });

  it("handles metadata-poor fixture (title only)", () => {
    const html = loadFixture("metadata-poor");
    const { $ } = parseHtml(html);
    const { metadata, truncated } = extractMetadata($);

    expect(truncated).toBe(false);
    expect(metadata.length).toBeGreaterThanOrEqual(1);
    expect(metadata[0].name).toBe("title");
    expect(metadata[0].rawValue).toBe("Minimal");
  });

  it("extracts duplicate metadata entries separately", () => {
    const html = loadFixture("duplicate-metadata");
    const { $ } = parseHtml(html);
    const { metadata, truncated } = extractMetadata($);

    expect(truncated).toBe(false);
    const descriptions = metadata.filter((m) => m.name === "description");
    expect(descriptions).toHaveLength(2);
    expect(descriptions[0].rawValue).toBe("First description");
    expect(descriptions[1].rawValue).toBe("Second description");

    const canonicals = metadata.filter((m) => m.name === "canonical");
    expect(canonicals).toHaveLength(2);
  });

  it("normalizes robots meta content", () => {
    const html = loadFixture("metadata-rich");
    const { $ } = parseHtml(html);
    const { metadata } = extractMetadata($);

    const robots = metadata.find((m) => m.name === "robots");
    expect(robots).toBeDefined();
    expect(robots!.normalizedValue).toBe("index, follow");
  });

  it("captures link rel icon entries", () => {
    const html = loadFixture("metadata-rich");
    const { $ } = parseHtml(html);
    const { metadata } = extractMetadata($);

    const icons = metadata.filter((m) => m.name.startsWith("link:"));
    expect(icons.length).toBeGreaterThanOrEqual(1);
    expect(icons.some((m) => m.name === "link:icon")).toBe(true);
  });

  it("captures canonical link", () => {
    const html = loadFixture("metadata-rich");
    const { $ } = parseHtml(html);
    const { metadata } = extractMetadata($);

    const canonical = metadata.find((m) => m.name === "canonical");
    expect(canonical).toBeDefined();
    expect(canonical!.rawValue).toBe("https://example.com/metadata-rich");
  });

  it("captures manifest link", () => {
    const html = loadFixture("metadata-rich");
    const { $ } = parseHtml(html);
    const { metadata } = extractMetadata($);

    const manifest = metadata.find((m) => m.name === "manifest");
    expect(manifest).toBeDefined();
    expect(manifest!.rawValue).toBe("/manifest.json");
  });

  it("extracts og:property metas as metadata entries", () => {
    const html = loadFixture("og-rich");
    const { $ } = parseHtml(html);
    const { metadata } = extractMetadata($);

    expect(metadata.some((m) => m.name === "og:title")).toBe(true);
    expect(metadata.some((m) => m.name === "og:type")).toBe(true);
  });

  it("extracts link alternate with hreflang", () => {
    const html = loadFixture("metadata-rich");
    const { $ } = parseHtml(html);
    const { metadata } = extractMetadata($);

    const alt = metadata.find((m) => m.name === "alternate[es]");
    expect(alt).toBeDefined();
    expect(alt!.rawValue).toBe("https://example.com/es/metadata-rich");
  });
});
