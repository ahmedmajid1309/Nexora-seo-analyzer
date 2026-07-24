// Final verification evidence capture
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

async function shot(page, name, opts = {}) {
  const path = join(OUT, name);
  if (opts.selector) {
    const el = await page.$(opts.selector);
    if (el) {
      await el.scrollIntoViewIfNeeded();
      await sleep(300);
      await el.screenshot({ path });
    } else {
      console.warn("  \u26a0 selector not found:", name);
    }
  } else {
    await page.screenshot({ path, fullPage: opts.fullPage ?? true });
  }
  console.log("  \u2713", name);
}

async function run() {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ deviceScaleFactor: 2, colorScheme: "dark" });

  // 1. Desktop header close-up
  console.log("\n=== 1. Desktop header ===");
  const p1 = await ctx.newPage();
  await p1.setViewportSize({ width: 1440, height: 900 });
  await p1.goto(BASE, { waitUntil: "networkidle" });
  await sleep(2000);
  await shot(p1, "A1-desktop-header.png", { selector: "header" });
  await p1.close();

  // 2. Mobile header close-up
  console.log("\n=== 2. Mobile header ===");
  const p2 = await ctx.newPage();
  await p2.setViewportSize({ width: 390, height: 844 });
  await p2.goto(BASE, { waitUntil: "networkidle" });
  await sleep(2000);
  await shot(p2, "A2-mobile-header.png", { selector: "header" });
  await p2.close();

  // 3. Footer logo
  console.log("\n=== 3. Footer logo ===");
  const p3 = await ctx.newPage();
  await p3.setViewportSize({ width: 1440, height: 900 });
  await p3.goto(BASE, { waitUntil: "networkidle" });
  await sleep(2000);
  await p3.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await sleep(1000);
  await shot(p3, "A3-footer-logo.png");
  await p3.close();

  // 4. Desktop result header/navigation (two layers)
  console.log("\n=== 4. Desktop result header ===");
  const p4 = await ctx.newPage();
  await p4.setViewportSize({ width: 1440, height: 900 });
  await p4.goto(`${BASE}/mock-result?instant`, { waitUntil: "networkidle" });
  await sleep(2000);
  await shot(p4, "A4-result-header.png", { selector: "body", fullPage: false });
  await p4.close();

  // 5. Desktop score overview
  console.log("\n=== 5. Desktop score overview ===");
  const p5 = await ctx.newPage();
  await p5.setViewportSize({ width: 1440, height: 900 });
  await p5.goto(`${BASE}/mock-result?instant`, { waitUntil: "networkidle" });
  await sleep(2000);
  await shot(p5, "A5-score-overview-1440.png", { selector: "#section-overview" });
  await p5.close();

  // 6. Mobile score overview
  console.log("\n=== 6. Mobile score overview ===");
  const p6 = await ctx.newPage();
  await p6.setViewportSize({ width: 390, height: 844 });
  await p6.goto(`${BASE}/mock-result?instant`, { waitUntil: "networkidle" });
  await sleep(2000);
  await p6.evaluate(() => {
    const h = document.querySelector("header");
    if (h) h.style.display = "none";
  });
  await sleep(300);
  await shot(p6, "A6-score-overview-390.png", { selector: "#section-overview" });
  await p6.close();

  await browser.close();
  console.log("\n\u2713 All evidence captured in", OUT);
}

run().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});
