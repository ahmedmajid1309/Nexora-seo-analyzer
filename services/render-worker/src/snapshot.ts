import { createHash } from "node:crypto";
import type { Page } from "playwright";
import { RENDERED_DOM_CONTRACT_VERSION, type RenderedDomSnapshot } from "./contracts.js";

function hashContent(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function parseStructuredDataTypes(rawBlocks: string[]): string[] {
  const types = new Set<string>();
  for (const raw of rawBlocks.slice(0, 25)) {
    try {
      const parsed = JSON.parse(raw) as unknown;
      const values = Array.isArray(parsed) ? parsed : [parsed];
      for (const value of values) {
        if (!value || typeof value !== "object") continue;
        const type = (value as { "@type"?: unknown })["@type"];
        if (Array.isArray(type))
          type.forEach((entry) => typeof entry === "string" && types.add(entry));
        if (typeof type === "string") types.add(type);
      }
    } catch {
      // Invalid rendered JSON-LD is intentionally ignored in this compact snapshot.
    }
  }
  return [...types].sort().slice(0, 40);
}

export async function extractRenderedSnapshot(input: {
  page: Page;
  requestedUrl: string;
  statusCode: number | null;
  durationMs: number;
  consoleErrorCount: number;
  consoleErrors: string[];
  requestFailedCount: number;
  failedResources: { url: string; resourceType: string; failureText: string | null }[];
  timedOut: boolean;
}): Promise<RenderedDomSnapshot> {
  const documentData = await input.page.evaluate(() => {
    const text = (value: string | null | undefined) => value?.trim().replace(/\s+/g, " ") || null;
    const meta = (selector: string) =>
      text(document.querySelector<HTMLMetaElement>(selector)?.content);
    const canonical =
      document.querySelector<HTMLLinkElement>('link[rel~="canonical"]')?.href ?? null;
    const bodyText = text(document.body?.innerText) ?? "";
    const meaningfulText = Array.from(
      document.body?.querySelectorAll("main, article, h1, h2, h3, p, li") ?? [],
    )
      .map((node) => text(node.textContent))
      .filter(Boolean)
      .join(" ");
    const links = Array.from(document.querySelectorAll<HTMLAnchorElement>("a[href]"));
    const origin = location.origin;
    const images = Array.from(document.images);
    const forms = Array.from(document.forms);
    const inputs = Array.from(
      document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(
        "input, textarea, select",
      ),
    );
    const jsonLdBlocks = Array.from(
      document.querySelectorAll<HTMLScriptElement>('script[type="application/ld+json"]'),
    ).map((script) => script.textContent ?? "");
    const perfNavigation = performance.getEntriesByType("navigation")[0] as
      PerformanceNavigationTiming | undefined;
    const paintEntries = performance.getEntriesByType("paint");
    const resources = performance.getEntriesByType("resource") as PerformanceResourceTiming[];
    const labGlobals = (
      window as unknown as {
        __nexoraLab?: { lcp: number | null; cls: number; longTasks: number[] };
      }
    ).__nexoraLab;

    return {
      title: text(document.title),
      lang: text(document.documentElement.getAttribute("lang")),
      viewport: meta('meta[name="viewport" i]'),
      canonical: text(canonical),
      metaDescription: meta('meta[name="description" i]'),
      robots: meta('meta[name="robots" i]'),
      h1Texts: Array.from(document.querySelectorAll("h1"))
        .map((node) => text(node.textContent))
        .filter(Boolean)
        .slice(0, 10) as string[],
      headingCounts: {
        h1: document.querySelectorAll("h1").length,
        h2: document.querySelectorAll("h2").length,
        total: document.querySelectorAll("h1,h2,h3,h4,h5,h6").length,
      },
      linkCount: links.length,
      internalLinkCount: links.filter((link) => {
        try {
          return new URL(link.href, location.href).origin === origin;
        } catch {
          return false;
        }
      }).length,
      externalLinkCount: links.filter((link) => {
        try {
          return new URL(link.href, location.href).origin !== origin;
        } catch {
          return false;
        }
      }).length,
      imageCount: images.length,
      imageAlt: {
        total: images.length,
        withAlt: images.filter((image) => image.hasAttribute("alt") && image.alt.trim().length > 0)
          .length,
        withoutAlt: images.filter(
          (image) => !image.hasAttribute("alt") || image.alt.trim().length === 0,
        ).length,
      },
      structuredDataCount: jsonLdBlocks.length,
      structuredDataRaw: jsonLdBlocks.slice(0, 25),
      forms: {
        total: forms.length,
        inputs: inputs.length,
        passwordInputs: inputs.filter((input) => "type" in input && input.type === "password")
          .length,
      },
      visibleTextLength: bodyText.length,
      meaningfulTextLength: (meaningfulText || bodyText).length,
      approxDomNodeCount: document.querySelectorAll("*").length,
      textForHash: bodyText.slice(0, 200_000),
      lab: {
        navigationTtfbMs: perfNavigation
          ? Math.max(0, perfNavigation.responseStart - perfNavigation.requestStart)
          : null,
        fcpMs:
          paintEntries.find((entry) => entry.name === "first-contentful-paint")?.startTime ?? null,
        observedLcpMs: labGlobals?.lcp ?? null,
        observedCls: labGlobals ? labGlobals.cls : null,
        longTaskCount: labGlobals ? labGlobals.longTasks.length : null,
        totalLongTaskDurationMs: labGlobals
          ? labGlobals.longTasks.reduce((sum, duration) => sum + duration, 0)
          : null,
        domContentLoadedMs: perfNavigation
          ? Math.max(0, perfNavigation.domContentLoadedEventEnd)
          : null,
        loadMs: perfNavigation ? Math.max(0, perfNavigation.loadEventEnd) : null,
        resourceCount: resources.length,
        transferredBytesEstimate: resources.reduce(
          (sum, resource) => sum + Math.max(0, resource.transferSize || 0),
          0,
        ),
      },
    };
  });

  return {
    schemaVersion: RENDERED_DOM_CONTRACT_VERSION,
    requestedUrl: input.requestedUrl,
    finalUrl: input.page.url(),
    statusCode: input.statusCode,
    renderedAt: new Date().toISOString(),
    durationMs: input.durationMs,
    document: {
      title: documentData.title,
      lang: documentData.lang,
      viewport: documentData.viewport,
      canonical: documentData.canonical,
      metaDescription: documentData.metaDescription,
      robots: documentData.robots,
      h1Texts: documentData.h1Texts,
      headingCounts: documentData.headingCounts,
      linkCount: documentData.linkCount,
      internalLinkCount: documentData.internalLinkCount,
      externalLinkCount: documentData.externalLinkCount,
      imageCount: documentData.imageCount,
      imageAlt: documentData.imageAlt,
      structuredDataCount: documentData.structuredDataCount,
      structuredDataTypes: parseStructuredDataTypes(documentData.structuredDataRaw),
      forms: documentData.forms,
      visibleTextLength: documentData.visibleTextLength,
      meaningfulTextLength: documentData.meaningfulTextLength,
      approxDomNodeCount: documentData.approxDomNodeCount,
      domContentHash: hashContent(documentData.textForHash),
    },
    javascript: {
      enabled: true,
      consoleErrorCount: input.consoleErrorCount,
      consoleErrors: input.consoleErrors.slice(0, 10),
      requestFailedCount: input.requestFailedCount,
      failedResources: input.failedResources.slice(0, 10),
      timedOut: input.timedOut,
    },
    lab: {
      source: "Rendered browser lab observation",
      ...documentData.lab,
    },
  };
}
