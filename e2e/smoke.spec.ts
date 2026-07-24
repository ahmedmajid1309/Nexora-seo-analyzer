import { test, expect } from "@playwright/test";

test.describe("Smoke tests", () => {
  test("homepage loads and shows heading", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText(/Evidence-Backed/i)).toBeVisible();
  });

  test("homepage has URL input", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByLabel(/website url/i)).toBeVisible();
  });

  test("homepage has enabled submit button (audit is live)", async ({ page }) => {
    await page.goto("/");
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

  test("not-found page shows for invalid URL", async ({ page }) => {
    await page.goto("/nonexistent-page");
    await expect(page.getByText("Page not found")).toBeVisible();
  });

  test("keyboard navigation works on homepage", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    const focused = page.locator(":focus");
    await expect(focused).toBeVisible();
  });
});
