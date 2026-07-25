import { test, expect } from "@playwright/test";

test.describe("Smoke tests", () => {
  test("homepage loads and shows heading", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.getByText(/Evidence-Backed/i)).toBeVisible();
  });

  test("homepage has URL input", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.getByLabel(/website url/i)).toBeVisible();
  });

  test("homepage has enabled submit button (audit is live)", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("button", { name: /analyze website/i })).toBeEnabled();
  });

  test("methodology page loads", async ({ page }) => {
    await page.goto("/methodology");
    await expect(page.getByRole("heading", { name: "Methodology" })).toBeVisible();
  });

  test("privacy page loads", async ({ page }) => {
    await page.goto("/privacy");
    await expect(page.getByRole("heading", { name: "Privacy Policy" })).toBeVisible();
  });

  test("terms page loads", async ({ page }) => {
    await page.goto("/terms");
    await expect(page.getByRole("heading", { name: "Terms of Service" })).toBeVisible();
  });

  test("limited site audit page loads", async ({ page }) => {
    await page.goto("/site-audit");
    await expect(page.getByRole("heading", { name: /Crawl up to 25 pages/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Run Site Audit/i })).toBeVisible();
  });

  test("site result route shows loading shell", async ({ page }) => {
    await page.route("/api/audit/site", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          requestId: "e2e",
          data: {
            requestId: "e2e",
            auditType: "site",
            requestedUrl: "https://example.com",
            normalizedOrigin: "https://example.com",
            startedAt: new Date().toISOString(),
            completedAt: new Date().toISOString(),
            durationMs: 1,
            pageLimit: 1,
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
              coverage: {
                discovered: 1,
                selected: 1,
                audited: 1,
                failed: 0,
                skipped: 0,
                blocked: 0,
              },
              appliedCaps: [],
              explanation: "Formula",
            },
            repeatedTemplateIssues: [],
            duplicateMetadataGroups: [],
            internalLinkFindings: [],
            redirectFindings: [],
            orphanCandidates: [],
          },
        }),
      });
    });
    await page.goto("/site-result?url=https%3A%2F%2Fexample.com&pageLimit=1");
    await expect(page.getByText("Full-Site SEO Report")).toBeVisible();
  });

  test("not-found page shows for invalid URL", async ({ page }) => {
    await page.goto("/nonexistent-page");
    await expect(page.getByText("Page not found")).toBeVisible();
  });

  test("keyboard navigation works on homepage", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.keyboard.press("Tab");
    const focused = page.locator(":focus");
    await expect(focused).toBeVisible();
  });
});
