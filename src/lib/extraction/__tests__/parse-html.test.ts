import { describe, it, expect } from "vitest";
import { parseHtml } from "../parse-html";

describe("parseHtml", () => {
  it("parses valid HTML without warnings", () => {
    const result = parseHtml(
      "<!DOCTYPE html><html><head><title>Test</title></head><body><p>Hello</p></body></html>",
    );
    expect(result.warnings).toHaveLength(0);
    expect(result.approxNodeCount).toBeGreaterThan(0);
    expect(result.$("title").text()).toBe("Test");
    expect(result.$("p").text()).toBe("Hello");
  });

  it("handles empty HTML string", () => {
    const result = parseHtml("");
    expect(result.$).toBeDefined();
    expect(result.warnings.length).toBeLessThanOrEqual(1);
  });

  it("handles malformed HTML with unclosed tags", () => {
    const html =
      "<html><head><title>Malformed</title><body><p>Unclosed div<div><span>nested</span>";
    const result = parseHtml(html);
    expect(result.approxNodeCount).toBeGreaterThan(0);
    expect(result.$("p").length).toBe(1);
  });

  it("counts nodes in the parsed document", () => {
    const result = parseHtml("<html><body><div><p>Text</p><span>More</span></div></body></html>");
    expect(result.approxNodeCount).toBeGreaterThanOrEqual(5);
  });

  it("returns a CheerioAPI with query functionality", () => {
    const result = parseHtml("<ul><li>A</li><li>B</li></ul>");
    expect(result.$("li").length).toBe(2);
    expect(result.$("li").first().text()).toBe("A");
  });

  it("handles HTML with script and style tags", () => {
    const html =
      "<html><head><style>body{}</style></head><body><script>var x=1;</script><p>Text</p></body></html>";
    const result = parseHtml(html);
    expect(result.$("style").length).toBe(1);
    expect(result.$("script").length).toBe(1);
    expect(result.$("p").text()).toBe("Text");
  });

  it("handles extremely malformed HTML gracefully", () => {
    const html = "<<<<<<<>>>>>>>";
    const result = parseHtml(html);
    expect(result.$).toBeDefined();
    expect(result.$("*").length).toBeGreaterThanOrEqual(0);
  });

  it("handles HTML with nested deep structure", () => {
    const html =
      "<div>" +
      Array(100).fill("<div>").join("") +
      "deep" +
      Array(100).fill("</div>").join("") +
      "</div>";
    const result = parseHtml(html);
    const outermost = result.$("div").first();
    expect(outermost.length).toBe(1);
  });

  it("does not crash on null-like input", () => {
    const result = parseHtml("null");
    expect(result.$).toBeDefined();
    expect(result.warnings.length).toBeLessThanOrEqual(1);
  });

  it("parses multiple root elements", () => {
    const result = parseHtml("<p>One</p><p>Two</p>");
    expect(result.$("p").length).toBe(2);
  });
});
