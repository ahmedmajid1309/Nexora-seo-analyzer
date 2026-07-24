// Verification evidence capture script
// Requires: dev server running on localhost:3000
import { chromium } from "playwright";
import { mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "..", "visual-evidence");
const BASE = "http://localhost:3000";

if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function screenshot(page, name, opts = {}) {
  const { selector, fullPage, clip } = opts;
  const path = join(OUT, name);
  if (selector) {
    const el = await page.$(selector);
    if (el) {
      await el.scrollIntoViewIfNeeded();
      await sleep(300);
      await el.screenshot({ path });
      console.log(`  \u2713 ${name}`);
    } else {
      console.warn(`  \u26a0 selector not found: ${name}`);
    }
  } else if (clip) {
    await page.screenshot({ path, clip });
    console.log(`  \u2713 ${name}`);
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

  // 1. DESKTOP HEADER CLOSE-UP (1440px)
  console.log("\n=== 1. Desktop Header Close-up ===");
  const dh = await ctx.newPage();
  await dh.setViewportSize({ width: 1440, height: 900 });
  await dh.goto(BASE, { waitUntil: "networkidle" });
  await sleep(2000);
  await screenshot(dh, "01-desktop-header-closeup.png", { selector: "header" });
  await dh.close();

  // 2. MOBILE HEADER CLOSE-UP (390px)
  console.log("\n=== 2. Mobile Header Close-up ===");
  const mh = await ctx.newPage();
  await mh.setViewportSize({ width: 390, height: 844 });
  await mh.goto(BASE, { waitUntil: "networkidle" });
  await sleep(2000);
  await screenshot(mh, "02-mobile-header-closeup.png", { selector: "header" });
  await mh.close();

  // 3. FOOTER LOGO
  console.log("\n=== 3. Footer Logo ===");
  const fl = await ctx.newPage();
  await fl.setViewportSize({ width: 1440, height: 900 });
  await fl.goto(BASE, { waitUntil: "networkidle" });
  await sleep(2000);
  await fl.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await sleep(1000);
  await screenshot(fl, "03-footer-logo.png", { fullPage: false });
  await fl.close();

  // 4. DESKTOP RESULT HEADER with global + report navigation
  console.log("\n=== 4. Desktop Result Header ===");
  const drh = await ctx.newPage();
  await drh.setViewportSize({ width: 1440, height: 900 });
  await drh.goto(`${BASE}/mock-result?instant`, { waitUntil: "networkidle" });
  await sleep(2000);
  // Crop to show both headers
  await screenshot(drh, "04-result-header-both-layers.png", {
    clip: { x: 0, y: 0, width: 1440, height: 140 },
  });
  await drh.close();

  // 5. 1440px FULL HOMEPAGE
  console.log("\n=== 5. Desktop Full Homepage ===");
  const dhp = await ctx.newPage();
  await dhp.setViewportSize({ width: 1440, height: 900 });
  await dhp.goto(BASE, { waitUntil: "networkidle" });
  await sleep(2000);
  await screenshot(dhp, "05-homepage-1440-full.png");
  await dhp.close();

  // 6. 390px FULL HOMEPAGE
  console.log("\n=== 6. Mobile Full Homepage ===");
  const mhp = await ctx.newPage();
  await mhp.setViewportSize({ width: 390, height: 844 });
  await mhp.goto(BASE, { waitUntil: "networkidle" });
  await sleep(2000);
  await screenshot(mhp, "06-homepage-390-full.png");
  await mhp.close();

  // 7. DESKTOP COMPACT SCORE OVERVIEW
  console.log("\n=== 7. Desktop Score Overview ===");
  const dso = await ctx.newPage();
  await dso.setViewportSize({ width: 1440, height: 900 });
  await dso.goto(`${BASE}/mock-result?instant`, { waitUntil: "networkidle" });
  await sleep(2000);
  await screenshot(dso, "07-score-overview-1440.png", { selector: "#section-overview" });
  await dso.close();

  // 8. MOBILE COMPACT SCORE OVERVIEW
  console.log("\n=== 8. Mobile Score Overview ===");
  const mso = await ctx.newPage();
  await mso.setViewportSize({ width: 390, height: 844 });
  await mso.goto(`${BASE}/mock-result?instant`, { waitUntil: "networkidle" });
  await sleep(2000);
  await mso.evaluate(() => {
    const h = document.querySelector("header");
    if (h) h.style.display = "none";
  });
  await sleep(300);
  await screenshot(mso, "08-score-overview-390.png", { selector: "#section-overview" });
  await mso.close();

  // 9. LOADING BRIEFING
  console.log("\n=== 9. Loading Briefing ===");
  const lb = await ctx.newPage();
  await lb.setViewportSize({ width: 1440, height: 900 });
  await lb.goto(`${BASE}/mock-result`, { waitUntil: "load" });
  await lb.waitForSelector("text=Analyzing your website", { timeout: 10000 });
  await sleep(2000);
  await screenshot(lb, "09-loading-briefing.png");
  await lb.close();

  // 10. POPULATED DESKTOP RESULT
  console.log("\n=== 10. Desktop Populated Result ===");
  const dpr = await ctx.newPage();
  await dpr.setViewportSize({ width: 1440, height: 900 });
  await dpr.goto(`${BASE}/mock-result?instant`, { waitUntil: "networkidle" });
  await sleep(2000);
  await screenshot(dpr, "10-result-1440-populated.png");
  await dpr.close();

  // 11. POPULATED MOBILE RESULT
  console.log("\n=== 11. Mobile Populated Result ===");
  const mpr = await ctx.newPage();
  await mpr.setViewportSize({ width: 390, height: 844 });
  await mpr.goto(`${BASE}/mock-result?instant`, { waitUntil: "networkidle" });
  await sleep(2000);
  await screenshot(mpr, "11-result-390-populated.png");
  await mpr.close();

  await browser.close();
  console.log("\n\u2713 All 11 screenshots captured in", OUT);
}

run().catch((err) => {
  console.error("Capture failed:", err);
  process.exit(1);
});
