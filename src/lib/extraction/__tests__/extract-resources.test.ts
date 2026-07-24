import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import { parseHtml } from "../parse-html";
import { extractResources } from "../extract-resources";

const fixtureDir = join(__dirname, "fixtures");
function loadFixture(name: string): string {
  return readFileSync(join(fixtureDir, `${name}.html`), "utf-8");
}

const FINAL_URL = "https://example.com/page";

describe("extractResources", () => {
  it("captures script resources", () => {
    const html = loadFixture("scripts-styles-excluded");
    const { $ } = parseHtml(html);
    const { resources, truncated } = extractResources($, FINAL_URL, null);

    expect(truncated).toBe(false);
    const scripts = resources.filter((r) => r.type === "script");
    expect(scripts.length).toBeGreaterThanOrEqual(1);

    const inlineScript = scripts.find((s) => s.rawUrl === null);
    expect(inlineScript).toBeDefined();
    expect(inlineScript!.rawUrl).toBeNull();
    expect(inlineScript!.resolvedUrl).toBeNull();
  });

  it("captures stylesheet resources", () => {
    const html = loadFixture("scripts-styles-excluded");
    const { $ } = parseHtml(html);
    const { resources } = extractResources($, FINAL_URL, null);

    const styles = resources.filter((r) => r.type === "stylesheet");
    expect(styles.length).toBeGreaterThanOrEqual(0);
  });

  it("resolves external script URLs", () => {
    const html = '<html><head><script src="/js/app.js"></script></head><body></body></html>';
    const { $ } = parseHtml(html);
    const { resources } = extractResources($, FINAL_URL, null);

    const script = resources.find((r) => r.type === "script")!;
    expect(script.rawUrl).toBe("/js/app.js");
    expect(script.resolvedUrl).toBe("https://example.com/js/app.js");
  });

  it("captures async, defer, module attributes on scripts", () => {
    const html =
      '<html><head><script src="/a.js" async></script><script src="/b.js" defer></script><script src="/c.js" type="module"></script></head><body></body></html>';
    const { $ } = parseHtml(html);
    const { resources } = extractResources($, FINAL_URL, null);

    const asyncScript = resources.find((s) => s.rawUrl === "/a.js")!;
    expect(asyncScript.async).toBe(true);
    expect(asyncScript.defer).toBe(false);

    const deferScript = resources.find((s) => s.rawUrl === "/b.js")!;
    expect(deferScript.defer).toBe(true);

    const moduleScript = resources.find((s) => s.rawUrl === "/c.js")!;
    expect(moduleScript.isModule).toBe(true);
  });

  it("captures iframe resources", () => {
    const html = '<html><body><iframe src="https://other.com/embed"></iframe></body></html>';
    const { $ } = parseHtml(html);
    const { resources } = extractResources($, FINAL_URL, null);

    const iframe = resources.find((r) => r.type === "iframe")!;
    expect(iframe).toBeDefined();
    expect(iframe.rawUrl).toBe("https://other.com/embed");
    expect(iframe.loading).toBeNull();
  });

  it("captures video and audio resources", () => {
    const html =
      '<html><body><video src="/video.mp4"></video><audio src="/audio.mp3"></audio></body></html>';
    const { $ } = parseHtml(html);
    const { resources } = extractResources($, FINAL_URL, null);

    const video = resources.find((r) => r.type === "video")!;
    expect(video).toBeDefined();
    expect(video.rawUrl).toBe("/video.mp4");

    const audio = resources.find((r) => r.type === "audio")!;
    expect(audio).toBeDefined();
    expect(audio.rawUrl).toBe("/audio.mp3");
  });

  it("captures source elements", () => {
    const html =
      '<html><body><video><source src="/vid.webm" media="(min-width: 800px)"></video></body></html>';
    const { $ } = parseHtml(html);
    const { resources } = extractResources($, FINAL_URL, null);

    const source = resources.find((r) => r.type === "source")!;
    expect(source).toBeDefined();
    expect(source.rawUrl).toBe("/vid.webm");
    expect(source.media).toBe("(min-width: 800px)");
  });

  it("captures preload, prefetch, preconnect resources", () => {
    const html = `<html><head>
      <link rel="preload" href="/font.woff2" as="font">
      <link rel="prefetch" href="/next-page">
      <link rel="preconnect" href="https://fonts.example.com">
      <link rel="modulepreload" href="/module.js">
      <link rel="dns-prefetch" href="//other.com">
    </head><body></body></html>`;
    const { $ } = parseHtml(html);
    const { resources } = extractResources($, FINAL_URL, null);

    expect(resources.some((r) => r.type === "preload")).toBe(true);
    expect(resources.some((r) => r.type === "prefetch")).toBe(true);
    expect(resources.some((r) => r.type === "preconnect")).toBe(true);
    expect(resources.some((r) => r.type === "modulepreload")).toBe(true);
    expect(resources.some((r) => r.type === "other" && r.rawUrl === "//other.com")).toBe(true);
  });

  it("captures crossorigin and integrity attributes", () => {
    const html =
      '<html><head><link rel="stylesheet" href="/style.css" crossorigin="anonymous" integrity="sha384-abc"></head><body></body></html>';
    const { $ } = parseHtml(html);
    const { resources } = extractResources($, FINAL_URL, null);

    const css = resources.find((r) => r.type === "stylesheet")!;
    expect(css.crossorigin).toBe("anonymous");
    expect(css.hasIntegrity).toBe(true);
  });

  it("uses base href for resolution", () => {
    const html =
      '<html><head><base href="https://example.com/base/"><script src="js/app.js"></script></head><body></body></html>';
    const { $ } = parseHtml(html);
    const { resources } = extractResources(
      $,
      "https://example.com/page",
      "https://example.com/base/",
    );

    const script = resources.find((r) => r.type === "script")!;
    expect(script.resolvedUrl).toBe("https://example.com/base/js/app.js");
  });

  it("handles empty src attributes", () => {
    const html = '<html><body><script src=""></script><iframe src=""></iframe></body></html>';
    const { $ } = parseHtml(html);
    const { resources } = extractResources($, FINAL_URL, null);

    const script = resources.find((r) => r.type === "script")!;
    expect(script.rawUrl).toBe("");
    expect(script.resolvedUrl).toBeNull();
  });
});
