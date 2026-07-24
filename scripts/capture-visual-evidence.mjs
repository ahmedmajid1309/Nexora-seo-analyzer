// Capture script for visual-review evidence
// Usage: node scripts/capture-visual-evidence.mjs
// Requires: dev server running on localhost:3000

import { chromium } from "playwright";
import { mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "..", "visual-evidence");
const BASE = "http://localhost:3000";

if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });

const VIEWPORTS = {
  mobile: { width: 390, height: 844 },
  desktop: { width: 1440, height: 900 },
};

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function screenshot(page, name, opts = {}) {
  const { selector, fullPage } = opts;
  const path = join(OUT, name);
  if (selector) {
    const el = await page.$(selector);
    if (el) {
      await el.screenshot({ path });
      console.log(`  \u2713 ${name}`);
    } else {
      console.warn(`  \u26a0 selector not found: ${name}`);
    }
  } else {
    await page.screenshot({ path, fullPage: fullPage ?? true });
    console.log(`  \u2713 ${name}`);
  }
  return path;
}

async function run() {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({
    deviceScaleFactor: 2,
    colorScheme: "dark",
  });

  // ──────────────────────────────────────────────
  // 1. DESKTOP (1440px) — Homepage
  // ──────────────────────────────────────────────
  console.log("\n=== Desktop Homepage ===");
  const desktop = await ctx.newPage();
  await desktop.setViewportSize(VIEWPORTS.desktop);
  await desktop.goto(BASE, { waitUntil: "load" });
  await sleep(2000);

  await screenshot(desktop, "01-homepage-1440-full.png");
  await screenshot(desktop, "02-homepage-1440-hero.png", { selector: "main" });

  await desktop.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await sleep(800);
  await desktop.evaluate(() => window.scrollTo(0, 0));
  await sleep(500);
  await desktop.close();

  // ──────────────────────────────────────────────
  // 2. MOBILE (390px) — Homepage
  // ──────────────────────────────────────────────
  console.log("\n=== Mobile Homepage ===");
  const mobile = await ctx.newPage();
  await mobile.setViewportSize(VIEWPORTS.mobile);
  await mobile.goto(BASE, { waitUntil: "load" });
  await sleep(2000);

  await screenshot(mobile, "03-homepage-390-full.png");
  await screenshot(mobile, "04-homepage-390-hero.png", { selector: "main" });
  await mobile.close();

  // ──────────────────────────────────────────────
  // 3. DESKTOP — Mock Result (instant)
  // ──────────────────────────────────────────────
  console.log("\n=== Desktop Mock Result ===");
  const dr = await ctx.newPage();
  await dr.setViewportSize(VIEWPORTS.desktop);
  await dr.goto(`${BASE}/mock-result?instant`, { waitUntil: "load" });
  await dr.waitForSelector("text=Audit Results", { timeout: 15000 });
  await sleep(1500);

  // Full page
  await screenshot(dr, "05-result-1440-full.png");

  // Overview section
  await screenshot(dr, "06-result-1440-overview.png", { selector: "#section-overview" });

  // Critical issues
  await screenshot(dr, "07-result-1440-critical.png", { selector: "#section-critical" });

  // Quick wins
  await screenshot(dr, "08-result-1440-quickwins.png", { selector: "#section-quickwins" });

  // All findings
  await dr.evaluate(() => document.getElementById("section-findings")?.scrollIntoView());
  await sleep(300);
  await screenshot(dr, "09-result-1440-findings.png", { selector: "#section-findings" });

  // Expand first finding in critical issues
  await dr.evaluate(() => document.getElementById("section-critical")?.scrollIntoView());
  await sleep(300);
  // Click the first FindingCard toggle button (first button inside the first card in critical)
  const firstFindingBtn = await dr.$("#section-critical .space-y-3 > div:first-child button");
  if (firstFindingBtn) {
    await firstFindingBtn.click({ force: true });
    await sleep(800);
  }
  await screenshot(dr, "10-result-1440-critical-expanded.png", { selector: "#section-critical" });

  // Performance (mobile tab)
  await dr.evaluate(() => document.getElementById("section-performance")?.scrollIntoView());
  await sleep(300);
  await screenshot(dr, "11-result-1440-performance-mobile.png", {
    selector: "#section-performance",
  });

  // Performance (desktop tab)
  const dtTab = await dr.$("#section-performance button:has-text('Desktop')");
  if (dtTab) {
    await dtTab.click({ force: true });
    await sleep(500);
  }
  await screenshot(dr, "12-result-1440-performance-desktop.png", {
    selector: "#section-performance",
  });

  // SERP + Social
  await dr.evaluate(() => document.getElementById("section-serp")?.scrollIntoView());
  await sleep(300);
  await screenshot(dr, "13-result-1440-serp-social.png", {
    selector: "#section-serp, #section-social",
  });
  await dr.close();

  // ──────────────────────────────────────────────
  // 4. MOBILE (390px) — Mock Result
  // ──────────────────────────────────────────────
  console.log("\n=== Mobile Mock Result ===");
  const mr = await ctx.newPage();
  await mr.setViewportSize(VIEWPORTS.mobile);
  await mr.goto(`${BASE}/mock-result?instant`, { waitUntil: "load" });
  await mr.waitForSelector("text=Audit Results", { timeout: 15000 });
  await sleep(1000);

  // Hide the floating site header so it doesn't intercept clicks
  await mr.evaluate(() => {
    const headers = document.querySelectorAll("header, [class*='fixed']");
    headers.forEach((h) => {
      const text = h.textContent || "";
      if (text.includes("Nexora") || text.includes("Audit")) {
        h.style.display = "none";
      }
    });
  });
  await sleep(300);

  await screenshot(mr, "14-result-390-full.png");
  await screenshot(mr, "15-result-390-overview.png", { selector: "#section-overview" });
  await screenshot(mr, "16-result-390-critical.png", { selector: "#section-critical" });

  // Open mobile filter drawer (force to bypass header interception)
  const filterBtn = await mr.$("button[aria-label='Open filters']");
  if (filterBtn) {
    await filterBtn.click({ force: true });
    await sleep(600);
  }
  await screenshot(mr, "17-result-390-filter-drawer.png");

  // Close filter drawer
  const closeFilter = await mr.$("button[aria-label='Close filters']");
  if (closeFilter) {
    await closeFilter.click({ force: true });
    await sleep(300);
  }

  // Open mobile nav dropdown (force to bypass header interception)
  const navToggleMr = await mr.$("button[aria-label='Toggle report navigation']");
  if (navToggleMr) {
    await navToggleMr.click({ force: true });
    await sleep(500);
  }
  await screenshot(mr, "18-result-390-mobile-nav.png");
  if (navToggleMr) await navToggleMr.click({ force: true });
  await sleep(300);

  // SERP + Social mobile
  await mr.evaluate(() => document.getElementById("section-serp")?.scrollIntoView());
  await sleep(300);
  await screenshot(mr, "19-result-390-serp-social.png", {
    selector: "#section-serp, #section-social",
  });
  await mr.close();

  // ──────────────────────────────────────────────
  // 5. Loading journey screenshots
  // ──────────────────────────────────────────────
  console.log("\n=== Loading Journey ===");
  const lj = await ctx.newPage();
  await lj.setViewportSize(VIEWPORTS.desktop);
  await lj.goto(`${BASE}/mock-result`, { waitUntil: "load" });
  await lj.waitForSelector("text=Analyzing your website", { timeout: 10000 });
  await sleep(1000);
  await screenshot(lj, "20-loading-early.png");
  await sleep(4000);
  await screenshot(lj, "21-loading-mid.png");
  await sleep(4000);
  await screenshot(lj, "22-loading-late.png");
  await lj.close();

  console.log("\n=== Loading Journey Mobile ===");
  const ljm = await ctx.newPage();
  await ljm.setViewportSize(VIEWPORTS.mobile);
  await ljm.goto(`${BASE}/mock-result`, { waitUntil: "load" });
  await ljm.waitForSelector("text=Analyzing your website", { timeout: 10000 });
  await sleep(3000);
  await screenshot(ljm, "23-loading-mid-390.png");
  await ljm.close();

  await browser.close();
  console.log("\n\u2713 All screenshots captured in", OUT);
}

run().catch((err) => {
  console.error("Capture failed:", err);
  process.exit(1);
});
