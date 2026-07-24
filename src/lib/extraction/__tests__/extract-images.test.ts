import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import { parseHtml } from "../parse-html";
import { extractImages } from "../extract-images";

const fixtureDir = join(__dirname, "fixtures");
function loadFixture(name: string): string {
  return readFileSync(join(fixtureDir, `${name}.html`), "utf-8");
}

const FINAL_URL = "https://example.com/page";

describe("extractImages", () => {
  it("extracts all images from many-images fixture", () => {
    const html = loadFixture("many-images");
    const { $ } = parseHtml(html);
    const { images, truncated } = extractImages($, FINAL_URL, null);

    expect(truncated).toBe(false);
    expect(images.length).toBeGreaterThanOrEqual(6);
  });

  it("resolves relative image sources", () => {
    const html = loadFixture("many-images");
    const { $ } = parseHtml(html);
    const { images } = extractImages($, FINAL_URL, null);

    const img = images.find((i) => i.altText === "Photo one")!;
    expect(img.rawSrc).toBe("/images/photo1.jpg");
    expect(img.resolvedSrc).toBe("https://example.com/images/photo1.jpg");
  });

  it("preserves absolute image sources", () => {
    const html = loadFixture("many-images");
    const { $ } = parseHtml(html);
    const { images } = extractImages($, FINAL_URL, null);

    const cdn = images.find((i) => i.altText === "CDN photo")!;
    expect(cdn.rawSrc).toBe("https://cdn.example.com/photo3.jpg");
    expect(cdn.resolvedSrc).toBe("https://cdn.example.com/photo3.jpg");
  });

  it("captures image dimensions, loading, decoding", () => {
    const html = loadFixture("many-images");
    const { $ } = parseHtml(html);
    const { images } = extractImages($, FINAL_URL, null);

    const img = images.find((i) => i.altText === "Photo one")!;
    expect(img.width).toBe(800);
    expect(img.height).toBe(600);
    expect(img.loading).toBe("lazy");
    expect(img.decoding).toBe("async");
    expect(img.fetchPriority).toBe("high");
    expect(img.referrerPolicy).toBe("no-referrer");
  });

  it("captures srcset and sizes", () => {
    const html = loadFixture("many-images");
    const { $ } = parseHtml(html);
    const { images } = extractImages($, FINAL_URL, null);

    const cdn = images.find((i) => i.altText === "CDN photo")!;
    expect(cdn.srcset).toContain("photo3-small.jpg");
    expect(cdn.sizes).toContain("100vw");
  });

  it("detects missing alt text", () => {
    const html = loadFixture("many-images");
    const { $ } = parseHtml(html);
    const { images } = extractImages($, FINAL_URL, null);

    const noAlt = images.find((i) => i.rawSrc === "/images/no-alt.jpg")!;
    expect(noAlt.hasAlt).toBe(false);
    expect(noAlt.altText).toBeNull();
  });

  it("detects alt attribute even when empty", () => {
    const html = loadFixture("many-images");
    const { $ } = parseHtml(html);
    const { images } = extractImages($, FINAL_URL, null);

    const emptyAlt = images.find((i) => i.rawSrc === "")!;
    expect(emptyAlt.hasAlt).toBe(true);
    expect(emptyAlt.altText).toBe("");
  });

  it("marks images inside picture elements", () => {
    const html = loadFixture("many-images");
    const { $ } = parseHtml(html);
    const { images } = extractImages($, FINAL_URL, null);

    const picChild = images.find((i) => i.altText === "Picture child")!;
    expect(picChild.parentPicture).toBe(true);
  });

  it("captures input[type=image] elements", () => {
    const html = loadFixture("many-images");
    const { $ } = parseHtml(html);
    const { images } = extractImages($, FINAL_URL, null);

    const inputImg = images.find((i) => i.altText === "Submit")!;
    expect(inputImg).toBeDefined();
    expect(inputImg.rawSrc).toBe("/images/submit-btn.png");
  });

  it("captures video poster images", () => {
    const html = loadFixture("many-images");
    const { $ } = parseHtml(html);
    const { images } = extractImages($, FINAL_URL, null);

    const poster = images.find((i) => i.rawSrc === "/images/video-poster.jpg")!;
    expect(poster).toBeDefined();
    expect(poster.hasAlt).toBe(false);
    expect(poster.altText).toBeNull();
    expect(poster.parentPicture).toBe(false);
  });

  it("resolves empty src to null", () => {
    const html = loadFixture("many-images");
    const { $ } = parseHtml(html);
    const { images } = extractImages($, FINAL_URL, null);

    const empty = images.find((i) => i.rawSrc === "")!;
    expect(empty.resolvedSrc).toBeNull();
  });
});
