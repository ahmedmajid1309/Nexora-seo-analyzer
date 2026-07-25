import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "../route";
import { resetConcurrentCount } from "@/lib/audit/abuse-protection";

const mocks = vi.hoisted(() => ({
  runSiteAudit: vi.fn(),
}));

vi.mock("@/lib/site-audit", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/site-audit")>()),
  runSiteAudit: mocks.runSiteAudit,
}));

function request(body: unknown) {
  return new NextRequest("http://localhost/api/audit/site", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "content-type": "application/json", "x-forwarded-for": crypto.randomUUID() },
  });
}

describe("POST /api/audit/site", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetConcurrentCount();
  });

  it("rejects invalid input clearly", async () => {
    const response = await POST(request({ url: "ftp://example.com" }));
    const json = await response.json();
    expect(response.status).toBe(400);
    expect(json.error.code).toBe("VALIDATION_ERROR");
  });

  it("rejects page limits above 25", async () => {
    const response = await POST(request({ url: "https://example.com", pageLimit: 26 }));
    const json = await response.json();
    expect(response.status).toBe(400);
    expect(json.error.message).toContain("25");
  });

  it("runs bounded site audit with normalized defaults", async () => {
    mocks.runSiteAudit.mockResolvedValueOnce({
      requestId: "req",
      auditType: "site",
      requestedUrl: "example.com",
      normalizedOrigin: "https://example.com",
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      durationMs: 1,
      pageLimit: 10,
      crawlMode: "links-and-sitemap",
      progress: [],
      decisions: [],
      pages: [],
      siteFindings: [],
      aggregate: {
        siteHealthScore: 100,
        averageAuditedPageScore: 100,
        crossPageHealthScore: 100,
        coverageScore: 100,
        confidence: 100,
        coverage: { discovered: 0, selected: 0, audited: 0, failed: 0, skipped: 0, blocked: 0 },
        appliedCaps: [],
        explanation: "Formula",
      },
      repeatedTemplateIssues: [],
      duplicateMetadataGroups: [],
      internalLinkFindings: [],
      redirectFindings: [],
      orphanCandidates: [],
    });
    const response = await POST(request({ url: "example.com" }));
    expect(response.status).toBe(200);
    expect(mocks.runSiteAudit).toHaveBeenCalledWith(
      expect.objectContaining({
        url: "https://example.com",
        pageLimit: 10,
        crawlMode: "links-and-sitemap",
      }),
    );
  });
});
