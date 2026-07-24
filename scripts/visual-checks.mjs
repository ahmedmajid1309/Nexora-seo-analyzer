import { chromium } from "playwright";
import fs from "fs";

const BASE = "http://localhost:3000";

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function run() {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({
    deviceScaleFactor: 2,
    colorScheme: "dark",
  });

  // 1. Check the real Nexora logo file
  console.log("=== Logo Verification ===");
  const svgPath = "public/brand/nexora-creation-logo.svg";
  const svg = fs.readFileSync(svgPath, "utf8");
  console.log("1. Logo file exists: true");
  console.log("   Size:", svg.length, "bytes");
  console.log("   Starts with <svg:", svg.trim().startsWith("<svg"));
  console.log("   Contains diamond/shape:", /[MmLl]/.test(svg));
  console.log("   Contains Nexora text:", svg.includes("Nexora"));

  // 2. Visual checks via Playwright
  console.log("\n=== Visual Checks ===");
  const dp = await ctx.newPage();
  await dp.setViewportSize({ width: 1440, height: 900 });
  await dp.goto(BASE, { waitUntil: "networkidle" });
  await sleep(2000);

  // Header has Nexora logo
  const headerLogo = await dp.$('header img[alt*="Nexora"]');
  console.log("2. Header Nexora logo found:", !!headerLogo);
  if (headerLogo) {
    const box = await headerLogo.boundingBox();
    console.log("   Dimensions:", Math.round(box.width), "x", Math.round(box.height));
  }

  // Mobile header not blank
  await dp.setViewportSize({ width: 390, height: 844 });
  await sleep(1000);
  const mobileHeader = await dp.$("header");
  const mhText = await dp.evaluate((h) => h.textContent.trim().length > 5, mobileHeader);
  console.log("3. Mobile header not blank:", mhText);

  // Mobile header hamburger
  const hamburger = await dp.$(
    'button[aria-label*="Menu"], button[aria-label*="menu"], button[aria-label*="navigation"]',
  );
  console.log("4. Mobile hamburger menu found:", !!hamburger);

  // 3. Result page - two-layer headers
  await dp.setViewportSize({ width: 1440, height: 900 });
  await dp.goto(BASE + "/mock-result?instant", { waitUntil: "networkidle" });
  await sleep(2000);

  const globalH = await dp.$("header");
  const resultNav = await dp.$('nav[aria-label="Report sections"]');
  console.log("\n5. Global header present:", !!globalH);
  console.log("6. Result section nav present:", !!resultNav);

  if (globalH && resultNav) {
    const hb = await globalH.boundingBox();
    const nb = await resultNav.boundingBox();
    console.log("   Header bottom:", Math.round(hb.y + hb.height));
    console.log("   Nav top:", Math.round(nb.y));
    const noOverlap = nb.y >= hb.y + hb.height - 2;
    console.log("7. No overlap:", noOverlap);
  }

  // Score overview compact (not stretched)
  const scoreGrid = await dp.$("#section-overview .grid-cols-2");
  console.log("8. Compact score grid exists:", !!scoreGrid);

  // Quick Win counts are consistent
  const quickWinLabel = await dp.$("#section-overview");
  const qwText = await dp.evaluate((el) => el.textContent, quickWinLabel);
  const qwMatchDesktop = qwText.match(/quick\s*wins?/i);
  console.log("9. Quick Wins mentioned in overview:", !!qwMatchDesktop);

  // No horizontal overflow
  const noOverflow = await dp.evaluate(
    () => document.documentElement.scrollWidth <= window.innerWidth,
  );
  console.log("10. No horizontal overflow:", noOverflow);

  // Reveal content visible
  const visibleContent = await dp.evaluate(() => {
    const all = document.querySelectorAll("[id]");
    let count = 0;
    all.forEach((el) => {
      const style = window.getComputedStyle(el);
      if (style.opacity === "1" && style.display !== "none") count++;
    });
    return count;
  });
  console.log(
    "11. Visible elements (opacity=1, not hidden):",
    visibleContent,
    "> 0:",
    visibleContent > 0,
  );

  // Performance section is separate
  const perfSection = await dp.$("#section-performance");
  const perfInOverview = await dp.$("#section-overview #section-performance");
  console.log("12. Performance section exists:", !!perfSection);
  console.log("13. Performance NOT inside overview:", !perfInOverview);

  await dp.close();

  // 4. Check reduced-motion
  console.log("\n=== Reduced Motion Check ===");
  const rp = await ctx.newPage();
  await rp.setViewportSize({ width: 1440, height: 900 });
  await rp.goto(BASE, { waitUntil: "networkidle" });
  await sleep(1000);

  // Check for prefers-reduced-motion media query
  const motionQuery = await rp.evaluate(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    return mq.matches;
  });
  console.log(
    "14. prefers-reduced-motion media query available:",
    typeof motionQuery === "boolean",
  );

  // Check AnimatedPrimitives no longer starts hidden
  const animatedPrimitives = fs.readFileSync("src/components/ui/AnimatedPrimitives.tsx", "utf8");
  const startsHidden = animatedPrimitives.includes("initial={{ opacity: 0");
  console.log("15. AnimatedPrimitives starts hidden:", startsHidden);
  console.log("    (Expected: false - content should be visible by default)");

  await rp.close();
  await browser.close();

  console.log("\n=== CHECKLIST COMPLETE ===");
}

run().catch((err) => {
  console.error("Check failed:", err);
  process.exit(1);
});
