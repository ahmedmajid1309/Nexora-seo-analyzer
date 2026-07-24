import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import { parseHtml } from "../parse-html";
import { extractAccessibility } from "../extract-accessibility";

const fixtureDir = join(__dirname, "fixtures");
function loadFixture(name: string): string {
  return readFileSync(join(fixtureDir, `${name}.html`), "utf-8");
}

describe("extractAccessibility", () => {
  describe("inaccessible-name-signals fixture", () => {
    it("counts images with and without alt text", () => {
      const html = loadFixture("inaccessible-name-signals");
      const { $ } = parseHtml(html);
      const a11y = extractAccessibility($, "en");

      expect(a11y.imageAltPresent.total).toBe(3);
      expect(a11y.imageAltPresent.withAlt).toBe(2);
      expect(a11y.imageAltPresent.withoutAlt).toBe(1);
    });

    it("detects form label relationships", () => {
      const html = loadFixture("inaccessible-name-signals");
      const { $ } = parseHtml(html);
      const a11y = extractAccessibility($, "en");

      expect(a11y.formLabelRelationships.total).toBeGreaterThanOrEqual(3);
      expect(a11y.formLabelRelationships.withLabel).toBeGreaterThanOrEqual(1);
      expect(a11y.formLabelRelationships.withoutLabel).toBeGreaterThanOrEqual(1);
    });

    it("detects button text signals", () => {
      const html = loadFixture("inaccessible-name-signals");
      const { $ } = parseHtml(html);
      const a11y = extractAccessibility($, "en");

      expect(a11y.buttonTextSignals.total).toBe(4);
      expect(a11y.buttonTextSignals.withText).toBeGreaterThanOrEqual(3);
      expect(a11y.buttonTextSignals.withoutText).toBeGreaterThanOrEqual(1);
    });

    it("detects link accessible names", () => {
      const html = loadFixture("inaccessible-name-signals");
      const { $ } = parseHtml(html);
      const a11y = extractAccessibility($, "en");

      expect(a11y.linkAccessibleNames.total).toBeGreaterThanOrEqual(4);
      expect(a11y.linkAccessibleNames.withName).toBeGreaterThanOrEqual(2);
      expect(a11y.linkAccessibleNames.withoutName).toBeGreaterThanOrEqual(1);
    });

    it("detects skip link candidates", () => {
      const html = loadFixture("inaccessible-name-signals");
      const { $ } = parseHtml(html);
      const a11y = extractAccessibility($, "en");

      expect(a11y.skipLinkCandidates.length).toBeGreaterThanOrEqual(2);
      const texts = a11y.skipLinkCandidates.map((s) => s.text.toLowerCase());
      expect(texts.some((t) => t.includes("skip"))).toBe(true);
      expect(texts.some((t) => t.includes("main"))).toBe(true);
    });

    it("detects table header cells", () => {
      const html = loadFixture("inaccessible-name-signals");
      const { $ } = parseHtml(html);
      const a11y = extractAccessibility($, "en");

      expect(a11y.tableHeaderCells.totalTh).toBe(1);
    });

    it("detects ARIA roles", () => {
      const html = loadFixture("inaccessible-name-signals");
      const { $ } = parseHtml(html);
      const a11y = extractAccessibility($, "en");

      expect(a11y.ariaAttributes.total).toBeGreaterThanOrEqual(1);
      expect(a11y.ariaAttributes.roles).toContain("navigation");
      expect(a11y.ariaAttributes.roles).toContain("button");
    });

    it("detects iframe titles", () => {
      const html = loadFixture("inaccessible-name-signals");
      const { $ } = parseHtml(html);
      const a11y = extractAccessibility($, "en");

      expect(a11y.iframeTitles.total).toBe(2);
      expect(a11y.iframeTitles.withTitle).toBe(1);
      expect(a11y.iframeTitles.withoutTitle).toBe(1);
    });

    it("detects media captions", () => {
      const html = loadFixture("inaccessible-name-signals");
      const { $ } = parseHtml(html);
      const a11y = extractAccessibility($, "en");

      expect(a11y.mediaCaptions.total).toBe(2);
      expect(a11y.mediaCaptions.withTrack).toBe(1);
      expect(a11y.mediaCaptions.withoutTrack).toBe(1);
    });

    it("detects viewport zoom restriction", () => {
      const html = loadFixture("inaccessible-name-signals");
      const { $ } = parseHtml(html);
      const a11y = extractAccessibility($, "en");

      expect(a11y.viewportZoomRestricted).toBe(true);
    });

    it("sets document language", () => {
      const html = loadFixture("inaccessible-name-signals");
      const { $ } = parseHtml(html);
      const a11y = extractAccessibility($, "en");

      expect(a11y.documentLanguage).toBe("en");
    });

    it("sets document language to null when not provided", () => {
      const html = loadFixture("inaccessible-name-signals");
      const { $ } = parseHtml(html);
      const a11y = extractAccessibility($, null);

      expect(a11y.documentLanguage).toBeNull();
    });
  });

  describe("duplicate-ids fixture", () => {
    it("detects duplicate IDs", () => {
      const html = loadFixture("duplicate-ids");
      const { $ } = parseHtml(html);
      const a11y = extractAccessibility($, null);

      expect(a11y.duplicateIds).toContain("duplicate");
      expect(a11y.duplicateIds).toContain("dup-id");
      expect(a11y.duplicateIds).toContain("triple");
      expect(a11y.duplicateIds).not.toContain("unique-one");
      expect(a11y.duplicateIds).not.toContain("unique-two");
    });

    it("detects tabindex values", () => {
      const html = loadFixture("duplicate-ids");
      const { $ } = parseHtml(html);
      const a11y = extractAccessibility($, null);

      expect(a11y.tabindexValues.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("semantic-landmarks fixture", () => {
    it("counts landmark elements", () => {
      const html = loadFixture("semantic-landmarks");
      const { $ } = parseHtml(html);
      const a11y = extractAccessibility($, "en");

      expect(a11y.landmarkElements.nav).toBe(2);
      expect(a11y.landmarkElements.header).toBe(2);
      expect(a11y.landmarkElements.footer).toBe(2);
      expect(a11y.landmarkElements.main).toBe(1);
      expect(a11y.landmarkElements.aside).toBe(1);
      expect(a11y.landmarkElements.section).toBe(2);
    });

    it("counts heading elements", () => {
      const html = loadFixture("semantic-landmarks");
      const { $ } = parseHtml(html);
      const a11y = extractAccessibility($, "en");

      expect(a11y.headingElements.total).toBe(2);
    });
  });

  describe("empty page", () => {
    it("handles empty HTML gracefully", () => {
      const { $ } = parseHtml("");
      const a11y = extractAccessibility($, null);

      expect(a11y.imageAltPresent.total).toBe(0);
      expect(a11y.landmarkElements.nav).toBe(0);
      expect(a11y.duplicateIds).toHaveLength(0);
      expect(a11y.skipLinkCandidates).toHaveLength(0);
      expect(a11y.viewportZoomRestricted).toBe(false);
    });
  });
});
