import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import { parseHtml } from "../parse-html";
import { extractLinks } from "../extract-links";

const fixtureDir = join(__dirname, "fixtures");
function loadFixture(name: string): string {
  return readFileSync(join(fixtureDir, `${name}.html`), "utf-8");
}

const FINAL_URL = "https://example.com/page";

describe("extractLinks", () => {
  it("classifies links correctly from relative-urls fixture", () => {
    const html = loadFixture("relative-urls");
    const { $ } = parseHtml(html);
    const { links, truncated } = extractLinks($, FINAL_URL, null);

    expect(truncated).toBe(false);
    expect(links.length).toBeGreaterThanOrEqual(12);

    const getClass = (text: string) => links.find((l) => l.anchorText === text)!.classification;

    expect(getClass("Relative path")).toBe("https");
    expect(getClass("Fragment only")).toBe("fragment");
    expect(getClass("Absolute HTTPS")).toBe("https");
    expect(getClass("Absolute HTTP")).toBe("http");
    expect(getClass("Email")).toBe("mailto");
    expect(getClass("Phone")).toBe("tel");
    expect(getClass("JavaScript")).toBe("javascript");
    expect(getClass("Data URI")).toBe("data");
    expect(getClass("Empty href")).toBe("empty");
    expect(getClass("FTP scheme")).toBe("other-scheme");
    expect(getClass("Malformed")).toBe("other-scheme");
  });

  it("resolves relative URLs against finalUrl", () => {
    const html = loadFixture("relative-urls");
    const { $ } = parseHtml(html);
    const { links } = extractLinks($, FINAL_URL, null);

    const relative = links.find((l) => l.anchorText === "Relative path")!;
    expect(relative.resolvedUrl).toBe("https://example.com/relative-path");
    expect(relative.isSameOrigin).toBe(true);
    expect(relative.isSameHost).toBe(true);
  });

  it("resolves relative URLs against base href when present", () => {
    const html = loadFixture("valid-base-url");
    const { $ } = parseHtml(html);
    const { links } = extractLinks(
      $,
      "https://example.com/some-page",
      "https://example.com/subdir/",
    );

    const relative = links.find((l) => l.anchorText === "Relative resolves via base")!;
    expect(relative.resolvedUrl).toBe("https://example.com/subdir/relative-page");
  });

  it("falls back to finalUrl when base href is invalid", () => {
    const html = loadFixture("invalid-base-url");
    const { $ } = parseHtml(html);
    const { links } = extractLinks($, FINAL_URL, "://invalid-base-url");

    expect(links.length).toBeGreaterThanOrEqual(1);
    const link = links[0];
    expect(link.resolvedUrl).toBe("https://example.com/some-page");
  });

  it("detects same-origin vs cross-origin", () => {
    const html = loadFixture("many-links");
    const { $ } = parseHtml(html);
    const { links } = extractLinks($, FINAL_URL, null);

    const external = links.find((l) => l.anchorText === "External Link")!;
    expect(external.isSameOrigin).toBe(false);
    expect(external.isSameHost).toBe(false);
    expect(external.hostname).toBe("external.com");
  });

  it("captures rel tokens, target, download, hreflang, media", () => {
    const html = loadFixture("many-links");
    const { $ } = parseHtml(html);
    const { links } = extractLinks($, FINAL_URL, null);

    const nofollow = links.find((l) => l.anchorText === "Link 2")!;
    expect(nofollow.relTokens).toContain("nofollow");

    const blank = links.find((l) => l.anchorText === "Link 3")!;
    expect(blank.target).toBe("_blank");
    expect(blank.relTokens).toContain("noopener");

    const download = links.find((l) => l.anchorText === "Link 5")!;
    expect(download.hasDownload).toBe(true);

    const hreflang = links.find((l) => l.anchorText === "Link 6")!;
    expect(hreflang.hreflang).toBe("en");

    const media = links.find((l) => l.anchorText === "Link 7")!;
    expect(media.media).toBe("print");
  });

  it("captures anchor text and title", () => {
    const html = loadFixture("many-links");
    const { $ } = parseHtml(html);
    const { links } = extractLinks($, FINAL_URL, null);

    const titled = links.find((l) => l.anchorText === "Link 4")!;
    expect(titled.title).toBe("Link Four");
  });

  it("includes area elements", () => {
    const html = loadFixture("many-links");
    const { $ } = parseHtml(html);
    const { links } = extractLinks($, FINAL_URL, null);

    const area = links.find((l) => l.rawHref === "https://example.com/area");
    expect(area).toBeDefined();
    expect(area!.anchorText).toBe("");
  });

  it("captures fragment links", () => {
    const html = loadFixture("many-links");
    const { $ } = parseHtml(html);
    const { links } = extractLinks($, FINAL_URL, null);

    const fragment = links.find((l) => l.anchorText === "Skip Link")!;
    expect(fragment.classification).toBe("fragment");
    expect(fragment.fragment).toBe("section");
  });

  it("marks mailto links", () => {
    const html = loadFixture("many-links");
    const { $ } = parseHtml(html);
    const { links } = extractLinks($, FINAL_URL, null);

    const mail = links.find((l) => l.anchorText === "Contact")!;
    expect(mail.classification).toBe("mailto");
  });
});
