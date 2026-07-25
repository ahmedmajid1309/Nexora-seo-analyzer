import { describe, expect, it } from "vitest";
import { getSkipReason, isSameOrigin, normalizeCrawlUrl } from "../url-utils";
import { parseRobotsTxt, isBlockedByRobots } from "../robots";
import { parseSitemapUrls } from "../sitemap";
import { SiteAuditRequestSchema } from "../schemas";

describe("Phase 11 URL discovery contracts", () => {
  it("normalizes and deduplicates safe query variants", () => {
    expect(normalizeCrawlUrl("/About/?utm_source=x&b=2&a=1#team", "https://Example.com/")).toBe(
      "https://example.com/About?a=1&b=2",
    );
  });

  it("enforces HTTP/HTTPS and same-origin eligibility", () => {
    expect(normalizeCrawlUrl("mailto:test@example.com", "https://example.com/")).toBeNull();
    expect(normalizeCrawlUrl("javascript:alert(1)", "https://example.com/")).toBeNull();
    expect(isSameOrigin("https://example.com/a", "https://example.com")).toBe(true);
    expect(isSameOrigin("https://cdn.example.com/a", "https://example.com")).toBe(false);
  });

  it("skips downloads and destructive-looking URLs", () => {
    expect(getSkipReason("https://example.com/file.pdf")).toContain("Unsupported");
    expect(getSkipReason("https://example.com/logout")).toContain("Destructive");
    expect(getSkipReason("https://example.com/services")).toBeNull();
  });

  it("parses robots directives and sitemap URLs", () => {
    const robots = parseRobotsTxt(
      "User-agent: *\nDisallow: /private\nSitemap: https://example.com/sitemap.xml",
    );
    expect(robots.sitemaps).toEqual(["https://example.com/sitemap.xml"]);
    expect(isBlockedByRobots("https://example.com/private/page", robots)).toBe(true);
    expect(isBlockedByRobots("https://example.com/public", robots)).toBe(false);
  });

  it("parses sitemap loc entries", () => {
    expect(
      parseSitemapUrls("<urlset><url><loc>https://example.com/a&amp;b=1</loc></url></urlset>"),
    ).toEqual(["https://example.com/a&b=1"]);
  });

  it("caps public request page limit at 25", () => {
    expect(
      SiteAuditRequestSchema.safeParse({ url: "https://example.com", pageLimit: 26 }).success,
    ).toBe(false);
    expect(SiteAuditRequestSchema.parse({ url: "example.com" }).pageLimit).toBe(10);
  });
});
