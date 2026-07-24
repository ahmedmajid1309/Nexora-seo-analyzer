import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import { parseHtml } from "../parse-html";
import { extractSocial } from "../extract-social";

const fixtureDir = join(__dirname, "fixtures");
function loadFixture(name: string): string {
  return readFileSync(join(fixtureDir, `${name}.html`), "utf-8");
}

describe("extractSocial", () => {
  describe("Open Graph rich fixture", () => {
    it("extracts all og: properties", () => {
      const html = loadFixture("og-rich");
      const { $ } = parseHtml(html);
      const { openGraph } = extractSocial($);

      expect(openGraph.length).toBeGreaterThanOrEqual(6);

      const props = openGraph.map((og) => og.property);
      expect(props).toContain("og:title");
      expect(props).toContain("og:type");
      expect(props).toContain("og:url");
      expect(props).toContain("og:image");
      expect(props).toContain("og:description");
      expect(props).toContain("og:site_name");
    });

    it("captures content values correctly", () => {
      const html = loadFixture("og-rich");
      const { $ } = parseHtml(html);
      const { openGraph } = extractSocial($);

      const title = openGraph.find((og) => og.property === "og:title")!;
      expect(title.content).toBe("Open Graph Title");

      const image = openGraph.find((og) => og.property === "og:image")!;
      expect(image.content).toBe("https://example.com/image.jpg");
    });

    it("assigns sequential elementOrder", () => {
      const html = loadFixture("og-rich");
      const { $ } = parseHtml(html);
      const { openGraph } = extractSocial($);

      openGraph.forEach((og, i) => {
        expect(og.elementOrder).toBe(i);
      });
    });
  });

  describe("Twitter card rich fixture", () => {
    it("extracts all twitter: properties", () => {
      const html = loadFixture("twitter-rich");
      const { $ } = parseHtml(html);
      const { twitter } = extractSocial($);

      expect(twitter.length).toBeGreaterThanOrEqual(4);

      const names = twitter.map((t) => t.name);
      expect(names).toContain("twitter:card");
      expect(names).toContain("twitter:site");
      expect(names).toContain("twitter:title");
      expect(names).toContain("twitter:description");
    });

    it("captures content values", () => {
      const html = loadFixture("twitter-rich");
      const { $ } = parseHtml(html);
      const { twitter } = extractSocial($);

      const card = twitter.find((t) => t.name === "twitter:card")!;
      expect(card.content).toBe("summary_large_image");

      const site = twitter.find((t) => t.name === "twitter:site")!;
      expect(site.content).toBe("@nexora");
    });

    it("assigns sequential elementOrder", () => {
      const html = loadFixture("twitter-rich");
      const { $ } = parseHtml(html);
      const { twitter } = extractSocial($);

      twitter.forEach((t, i) => {
        expect(t.elementOrder).toBe(i);
      });
    });
  });

  describe("page with no social metadata", () => {
    it("returns empty arrays", () => {
      const html = loadFixture("empty-headings");
      const { $ } = parseHtml(html);
      const { openGraph, twitter } = extractSocial($);

      expect(openGraph).toHaveLength(0);
      expect(twitter).toHaveLength(0);
    });
  });
});
