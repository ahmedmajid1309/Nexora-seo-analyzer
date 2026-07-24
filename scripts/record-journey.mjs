// Screen recording script for visual-review evidence
// Usage: node scripts/record-journey.mjs
// Requires: dev server running on localhost:3000

import { chromium } from "playwright";
import { mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "..", "visual-evidence");
const BASE = "http://localhost:3000";

if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });

const VIDEO_PATH = join(OUT, "journey-recording.webm");

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function run() {
  const browser = await chromium.launch({ headless: true });

  // Create context with video recording
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
    colorScheme: "dark",
    recordVideo: { dir: OUT, size: { width: 1440, height: 900 } },
  });

  const page = await ctx.newPage();

  // ── 1. Homepage opening animation ──
  console.log("1. Navigating to homepage...");
  await page.goto(BASE, { waitUntil: "load" });
  await sleep(2000);

  // ── 2. Homepage scrolling ──
  console.log("2. Scrolling homepage...");
  await page.evaluate(() => window.scrollTo({ top: 600, behavior: "smooth" }));
  await sleep(1500);
  await page.evaluate(() => window.scrollTo({ top: 1400, behavior: "smooth" }));
  await sleep(1500);
  await page.evaluate(() => window.scrollTo({ top: 2200, behavior: "smooth" }));
  await sleep(1500);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "smooth" }));
  await sleep(1500);

  // ── 3. Audit form interaction ──
  console.log("3. Interacting with audit form...");
  // Find the URL input and type a URL
  const urlInput = await page.$(
    "input[type='url'], input[placeholder*='url'], input[placeholder*='URL']",
  );
  if (urlInput) {
    await urlInput.click({ force: true });
    await sleep(500);
    await urlInput.fill("https://example.com");
    await sleep(800);
  }
  // Click the submit/audit button
  const auditBtn = await page.$(
    "button:has-text('Audit'), button:has-text('Analyze'), button[type='submit']",
  );
  if (auditBtn) {
    await auditBtn.click({ force: true });
    await sleep(1000);
  }

  // ── 4. Loading journey ──
  console.log("4. Loading journey...");
  // Navigate to mock-result loading page (simulates the audit loading)
  await page.goto(`${BASE}/mock-result`, { waitUntil: "load" });
  await page.waitForSelector("text=Analyzing your website", { timeout: 10000 });
  await sleep(1000);
  // Wait through loading stages
  for (let i = 0; i < 4; i++) {
    await sleep(3000);
    console.log(`   Loading stage ${i + 2}/5...`);
  }

  // ── 5. Transition to completed results ──
  console.log("5. Transitioning to completed results...");
  await page.goto(`${BASE}/mock-result?instant`, { waitUntil: "load" });
  await page.waitForSelector("text=Audit Results", { timeout: 15000 });
  await sleep(2000);

  // ── 6. Result page scrolling ──
  console.log("6. Scrolling result page...");
  await page.evaluate(() =>
    document.getElementById("section-critical")?.scrollIntoView({ behavior: "smooth" }),
  );
  await sleep(1500);
  await page.evaluate(() =>
    document.getElementById("section-quickwins")?.scrollIntoView({ behavior: "smooth" }),
  );
  await sleep(1500);
  await page.evaluate(() =>
    document.getElementById("section-findings")?.scrollIntoView({ behavior: "smooth" }),
  );
  await sleep(1500);
  await page.evaluate(() =>
    document.getElementById("section-performance")?.scrollIntoView({ behavior: "smooth" }),
  );
  await sleep(1500);
  await page.evaluate(() =>
    document.getElementById("section-serp")?.scrollIntoView({ behavior: "smooth" }),
  );
  await sleep(1500);

  // ── 7. Finding expansion ──
  console.log("7. Expanding a finding...");
  await page.evaluate(() =>
    document.getElementById("section-critical")?.scrollIntoView({ behavior: "smooth" }),
  );
  await sleep(1000);
  const findingBtn = await page.$("#section-critical .space-y-3 > div:first-child button");
  if (findingBtn) {
    await findingBtn.click({ force: true });
    await sleep(1500);
  }

  // ── 8. Filter interaction (switch viewport to mobile) ──
  console.log("8. Filter interaction...");
  await page.setViewportSize({ width: 390, height: 844 });
  await sleep(1000);
  await page.evaluate(() => window.scrollTo(0, 0));
  await sleep(500);
  // Scroll to findings section
  await page.evaluate(() =>
    document.getElementById("section-findings")?.scrollIntoView({ behavior: "smooth" }),
  );
  await sleep(1500);
  // Open filter drawer
  const filterBtn = await page.$("button[aria-label='Open filters']");
  if (filterBtn) {
    await filterBtn.click({ force: true });
    await sleep(1500);
  }
  // Change a filter
  const stateSelect = await page.$("[role='dialog'] select[aria-label='Filter by state']");
  if (stateSelect) {
    await stateSelect.selectOption("failed");
    await sleep(1000);
  }
  await sleep(1000);

  // Done - close browser (this finalizes the video)
  console.log("9. Recording complete.");
  await ctx.close();
  await browser.close();

  // Rename video to a cleaner name
  const videoPath = await page.video()?.path();
  console.log("\n\u2713 Recording saved. Paths:");
  if (videoPath) console.log("   Original:", videoPath);
  console.log("   Expected:", VIDEO_PATH);
  console.log("\nRecording duration: ~35 seconds");
}

run().catch((err) => {
  console.error("Recording failed:", err);
  process.exit(1);
});
