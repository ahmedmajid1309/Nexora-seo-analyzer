import { chromium } from "playwright";
import type { RenderRequest, RenderedDomSnapshot } from "./contracts.js";
import { assertPublicHttpUrl } from "./security.js";
import { extractRenderedSnapshot } from "./snapshot.js";

export const MAX_NETWORK_REQUESTS = 150;
export const MAX_REDIRECTS = 8;

export async function renderPage(request: RenderRequest): Promise<RenderedDomSnapshot> {
  await assertPublicHttpUrl(request.url);
  const startedAt = performance.now();
  const browser = await chromium.launch({ headless: true });
  let consoleErrorCount = 0;
  const consoleErrors: string[] = [];
  let requestFailedCount = 0;
  const failedResources: { url: string; resourceType: string; failureText: string | null }[] = [];
  let statusCode: number | null = null;
  let timedOut = false;
  let requestCount = 0;
  const visitedDocuments = new Set<string>();

  try {
    const context = await browser.newContext({
      javaScriptEnabled: true,
      ignoreHTTPSErrors: false,
      userAgent: "NexoraRenderWorker/0.1 (+https://nexora.local)",
      viewport: { width: 1366, height: 768 },
      serviceWorkers: "block",
      acceptDownloads: false,
    });
    const page = await context.newPage();
    await page.addInitScript(() => {
      (
        window as unknown as {
          __nexoraLab?: { lcp: number | null; cls: number; longTasks: number[] };
        }
      ).__nexoraLab = {
        lcp: null,
        cls: 0,
        longTasks: [],
      };
      try {
        new PerformanceObserver((list) => {
          const lab = (window as unknown as { __nexoraLab?: { lcp: number | null } }).__nexoraLab;
          const last = list.getEntries().at(-1);
          if (lab && last) lab.lcp = last.startTime;
        }).observe({ type: "largest-contentful-paint", buffered: true });
      } catch {}
      try {
        new PerformanceObserver((list) => {
          const lab = (window as unknown as { __nexoraLab?: { cls: number } }).__nexoraLab;
          if (!lab) return;
          for (const entry of list.getEntries() as (PerformanceEntry & {
            value?: number;
            hadRecentInput?: boolean;
          })[]) {
            if (!entry.hadRecentInput) lab.cls += entry.value ?? 0;
          }
        }).observe({ type: "layout-shift", buffered: true });
      } catch {}
      try {
        new PerformanceObserver((list) => {
          const lab = (window as unknown as { __nexoraLab?: { longTasks: number[] } }).__nexoraLab;
          if (!lab) return;
          for (const entry of list.getEntries()) lab.longTasks.push(entry.duration);
        }).observe({ type: "longtask", buffered: true });
      } catch {}
    });

    page.on("console", (message) => {
      if (message.type() === "error") {
        consoleErrorCount += 1;
        if (consoleErrors.length < 10) consoleErrors.push(message.text().slice(0, 300));
      }
    });
    page.on("requestfailed", (failedRequest) => {
      requestFailedCount += 1;
      if (failedResources.length < 10) {
        failedResources.push({
          url: failedRequest.url().slice(0, 500),
          resourceType: failedRequest.resourceType(),
          failureText: failedRequest.failure()?.errorText ?? null,
        });
      }
    });
    page.on("popup", async (popup) => {
      await popup.close().catch(() => undefined);
    });
    page.on("download", async (download) => {
      await download.cancel().catch(() => undefined);
    });
    await page.route("**/*", async (route) => {
      try {
        const routedRequest = route.request();
        requestCount += 1;
        if (requestCount > MAX_NETWORK_REQUESTS) throw new Error("Excessive network requests");
        if (routedRequest.url().startsWith("ws:") || routedRequest.url().startsWith("wss:")) {
          throw new Error("WebSocket requests are blocked");
        }
        if (routedRequest.isNavigationRequest() && routedRequest.resourceType() === "document") {
          visitedDocuments.add(routedRequest.url());
          if (visitedDocuments.size > MAX_REDIRECTS + 1)
            throw new Error("Excessive redirect chain");
        }
        await assertPublicHttpUrl(routedRequest.url());
        await route.continue();
      } catch {
        await route.abort("blockedbyclient");
      }
    });

    try {
      const response = await page.goto(request.url, {
        waitUntil: "networkidle",
        timeout: request.timeoutMs,
      });
      statusCode = response?.status() ?? null;
    } catch (err) {
      if (err instanceof Error && err.message.toLowerCase().includes("timeout")) timedOut = true;
      throw err;
    }

    return await extractRenderedSnapshot({
      page,
      requestedUrl: request.url,
      statusCode,
      durationMs: Math.round(performance.now() - startedAt),
      consoleErrorCount,
      consoleErrors,
      requestFailedCount,
      failedResources,
      timedOut,
    });
  } finally {
    await browser
      .contexts()
      .at(0)
      ?.close()
      .catch(() => undefined);
    await browser.close();
  }
}
