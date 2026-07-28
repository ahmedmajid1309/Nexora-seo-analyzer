import { expect, test } from "@playwright/test";

const finalUrl = "https://nexoracreation.com/";

const pageContext = {
  requestedUrl: finalUrl,
  finalUrl,
  pathname: "/",
  pageTitle: "Nexora Creation",
};

const finding = {
  checkId: "META-001",
  state: "failed",
  category: "metadata",
  severity: "critical",
  scored: true,
  summary: "Missing canonical tag",
  impact: "Search engines may split ranking signals across duplicate URLs.",
  remediationSummary: `Insert <link rel="canonical" href="${finalUrl}" /> inside the document head.`,
  remediationSteps: ["Add the canonical tag to the document head."],
  responsible: "developer",
  effort: "low",
  confidence: 100,
  page: pageContext,
  evidence: {
    source: "static-html",
    observedValue: "Canonical tag is missing.",
    expectedValue: "A self-referencing canonical URL matching the preferred final page URL.",
    selector: 'head > link[rel="canonical"]',
    elementSnippet: null,
    unavailableReason: null,
  },
};

const auditResponse = {
  success: true,
  requestId: "layout-test",
  data: {
    requestId: "layout-test",
    requestedUrl: finalUrl,
    finalUrl,
    responseStatus: 200,
    contentType: "text/html",
    byteLength: 42000,
    durationMs: 37,
    totalRules: 120,
    stateCounts: { failed: 4, warning: 9, passed: 92, "not-applicable": 12, unavailable: 3 },
    findings: [
      finding,
      { ...finding, checkId: "META-002", state: "passed", summary: "Title tag is present" },
      {
        ...finding,
        checkId: "FAQ-001",
        state: "not-applicable",
        summary: "FAQ schema not required",
      },
      {
        ...finding,
        checkId: "PSI-001",
        state: "unavailable",
        summary: "PageSpeed diagnostics unavailable",
      },
    ],
    findingsTruncated: false,
    categoryBreakdowns: [],
    scoreFamilies: [
      { family: "seo-health", name: "SEO Health", rawScore: 44, cappedScore: 40, confidence: 95 },
      {
        family: "accessibility",
        name: "Accessibility",
        rawScore: 76,
        cappedScore: 76,
        confidence: 90,
      },
      {
        family: "security-trust",
        name: "Security & Trust",
        rawScore: 88,
        cappedScore: 88,
        confidence: 100,
      },
      {
        family: "aeo-readiness",
        name: "AEO Readiness",
        rawScore: 64,
        cappedScore: 64,
        confidence: 91,
      },
      {
        family: "geo-readiness",
        name: "GEO Readiness",
        rawScore: 57,
        cappedScore: 57,
        confidence: 91,
      },
    ],
    confidence: 95,
    appliedCaps: [],
    extractionWarnings: [],
    partialStage: null,
    unavailableStage: null,
    performanceScore: null,
    performanceStatus: "unavailable",
    performanceSource: null,
    performanceConfidence: null,
    performanceExplanation: "Optional PageSpeed diagnostics were unavailable.",
    performanceMobile: null,
    performanceDesktop: null,
    serpPreview: {
      title: "Nexora Creation",
      description: "Digital growth and SEO execution for modern brands.",
      canonicalUrl: null,
      displayUrl: finalUrl,
    },
    socialPreview: {
      ogTitle: "Nexora Creation",
      ogDescription: "Digital growth and SEO execution for modern brands.",
      ogImage: null,
      ogUrl: finalUrl,
      ogType: "website",
      twitterCard: "summary_large_image",
      twitterTitle: "Nexora Creation",
      twitterDescription: "Digital growth and SEO execution for modern brands.",
      twitterImage: null,
    },
    executiveSummary: null,
    calculationVersion: "1.0",
    snapshotSchemaVersion: "1.0",
  },
};

test("result header and sticky report navigation do not overlap content", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.route("**/api/audit", async (route) => route.fulfill({ json: auditResponse }));
  await page.goto(`/result?url=${encodeURIComponent(finalUrl)}`);

  const globalHeader = page.locator("header").first();
  const reportHeader = page.getByTestId("report-header");
  const reportNavigation = page.getByTestId("report-navigation");
  await expect(page.getByRole("heading", { name: "Audit complete" })).toBeVisible();
  await expect(page.getByRole("button", { name: "New Audit" })).toBeVisible();

  const initialGlobalHeader = await globalHeader.boundingBox();
  const initialReportHeader = await reportHeader.boundingBox();
  const initialReportNavigation = await reportNavigation.boundingBox();
  expect(initialGlobalHeader).not.toBeNull();
  expect(initialReportHeader).not.toBeNull();
  expect(initialReportNavigation).not.toBeNull();
  expect(initialGlobalHeader!.y + initialGlobalHeader!.height + 12).toBeLessThanOrEqual(
    initialReportHeader!.y,
  );
  expect(initialReportHeader!.y + initialReportHeader!.height).toBeLessThanOrEqual(
    initialReportNavigation!.y,
  );

  await page.getByRole("button", { name: "All Checks" }).click();
  const allChecksHeading = page.getByRole("heading", { name: "All Checks" });
  await expect(allChecksHeading).toBeVisible();
  await page.waitForFunction(() => {
    const nav = document.querySelector('[data-testid="report-navigation"]');
    const heading = [...document.querySelectorAll("h2")].find(
      (element) => element.textContent?.trim() === "All Checks",
    );
    if (!nav || !heading) return false;
    return nav.getBoundingClientRect().bottom + 16 <= heading.getBoundingClientRect().top;
  });

  const stickyGlobalHeader = await globalHeader.boundingBox();
  const stickyReportNavigation = await reportNavigation.boundingBox();
  const activeSectionHeading = await allChecksHeading.boundingBox();
  const stickyBackdrop = await page.getByTestId("sticky-backdrop").boundingBox();
  expect(stickyGlobalHeader).not.toBeNull();
  expect(stickyReportNavigation).not.toBeNull();
  expect(activeSectionHeading).not.toBeNull();
  expect(stickyBackdrop).not.toBeNull();
  expect(stickyBackdrop!.y).toBe(0);
  expect(stickyBackdrop!.height).toBeGreaterThanOrEqual(
    stickyReportNavigation!.y + stickyReportNavigation!.height,
  );
  expect(stickyGlobalHeader!.y + stickyGlobalHeader!.height + 16).toBeLessThanOrEqual(
    stickyReportNavigation!.y,
  );
  expect(stickyReportNavigation!.y + stickyReportNavigation!.height + 16).toBeLessThanOrEqual(
    activeSectionHeading!.y,
  );
  await expect
    .poll(async () =>
      page.evaluate(() => {
        const element = document.elementFromPoint(4, 4);
        return element?.closest('[data-testid="sticky-backdrop"], header') !== null;
      }),
    )
    .toBe(true);
});
