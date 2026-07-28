import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AuditResponseData } from "@/lib/audit/types";
import type { PageSnapshot } from "@/lib/extraction/types";
import type { RuleResult } from "@/lib/rules/types";

const mocks = vi.hoisted(() => ({
  runQuickAudit: vi.fn(),
  safeFetch: vi.fn(),
}));

vi.mock("@/lib/audit/quick-audit", () => ({ runQuickAudit: mocks.runQuickAudit }));
vi.mock("@/lib/network", () => ({ safeFetch: mocks.safeFetch }));

async function loadCoordinator() {
  const mod = await import("../coordinator");
  return mod.runSiteAudit;
}

function quick(url: string, links: string[] = []) {
  const snapshot = {
    finalUrl: url,
    document: { title: `Title ${url}` },
    metadata: [],
    headings: [{ level: 1, text: `H1 ${url}` }],
    links: links.map((href) => ({
      resolvedUrl: href,
      isSameOrigin: new URL(href).origin === "https://example.com",
    })),
    response: { status: 200, redirectChain: [] },
  } as unknown as PageSnapshot;
  const data = {
    serpPreview: { description: "Desc", canonicalUrl: url },
    findings: [],
    scoreFamilies: [
      { family: "seo-health", name: "SEO Health", rawScore: 90, cappedScore: 90, confidence: 100 },
    ],
  } as unknown as AuditResponseData;
  return { snapshot, data, results: [] as RuleResult[], scores: {} };
}

describe("Phase 11 crawl coordinator", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    mocks.safeFetch.mockResolvedValue({
      html: "User-agent: *\nSitemap: https://example.com/sitemap.xml",
    });
  });

  it("honors page limits and only requests PageSpeed for the starting page", async () => {
    mocks.safeFetch
      .mockResolvedValueOnce({ html: "User-agent: *\nSitemap: https://example.com/sitemap.xml" })
      .mockResolvedValueOnce({
        html: "<urlset><url><loc>https://example.com/b</loc></url><url><loc>https://example.com/c</loc></url></urlset>",
      });
    mocks.runQuickAudit
      .mockResolvedValueOnce(
        quick("https://example.com", ["https://example.com/a", "https://external.com/x"]),
      )
      .mockResolvedValueOnce(quick("https://example.com/b"));
    const runSiteAudit = await loadCoordinator();
    const result = await runSiteAudit({
      requestId: "req",
      url: "https://example.com",
      pageLimit: 2,
      crawlMode: "links-and-sitemap",
      deadlineMs: 10_000,
    });
    expect(result.pages).toHaveLength(2);
    expect(mocks.runQuickAudit.mock.calls.map((call) => call[0].pagespeed)).toEqual([true, false]);
    expect(
      result.decisions.some(
        (d) =>
          d.url === "https://external.com/x" &&
          d.reason === "External origin excluded from site crawl",
      ),
    ).toBe(true);
    expect(result.progress.map((p) => p.state)).toContain("running-cross-page-checks");
    expect(result.progress.map((p) => p.state)).toContain("fetching-entry-page");
  });

  it("returns partial reports when one selected page fails", async () => {
    mocks.runQuickAudit
      .mockResolvedValueOnce(quick("https://example.com", ["https://example.com/a"]))
      .mockRejectedValueOnce(new Error("network down"))
      .mockRejectedValueOnce(new Error("network down"));
    const runSiteAudit = await loadCoordinator();
    const result = await runSiteAudit({
      requestId: "req",
      url: "https://example.com",
      pageLimit: 2,
      crawlMode: "links-only",
      deadlineMs: 10_000,
    });
    expect(result.pages.some((p) => p.status === "failed")).toBe(true);
    expect(
      result.pages.find((p) => p.finalUrl === "https://example.com")?.links.brokenInternal,
    ).toEqual(["https://example.com/a"]);
    expect(result.progress.at(-1)?.state).toBe("partial");
  });

  it("records robots-blocked pages", async () => {
    mocks.safeFetch.mockResolvedValueOnce({ html: "User-agent: *\nDisallow: /blocked" });
    mocks.runQuickAudit.mockResolvedValueOnce(
      quick("https://example.com", ["https://example.com/blocked"]),
    );
    const runSiteAudit = await loadCoordinator();
    const result = await runSiteAudit({
      requestId: "req",
      url: "https://example.com",
      pageLimit: 2,
      crawlMode: "links-only",
      deadlineMs: 10_000,
    });
    expect(result.pages.some((p) => p.status === "blocked")).toBe(true);
    expect(
      result.decisions.some((d) => d.state === "blocked" && d.reason === "Blocked by robots.txt"),
    ).toBe(true);
  });
});
