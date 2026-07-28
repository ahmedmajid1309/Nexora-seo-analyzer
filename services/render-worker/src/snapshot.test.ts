import { describe, expect, it } from "vitest";
import { extractRenderedSnapshot } from "./snapshot.js";

describe("rendered snapshot contract", () => {
  it("returns bounded SEO, accessibility, resource, and lab fields without sensitive browser state", async () => {
    const snapshot = await extractRenderedSnapshot({
      page: {
        url: () => "https://example.com/rendered",
        evaluate: async (fn: () => unknown) => {
          const previousDocument = globalThis.document;
          const previousLocation = globalThis.location;
          const previousPerformance = globalThis.performance;
          Object.defineProperty(globalThis, "location", {
            configurable: true,
            value: { href: "https://example.com/rendered", origin: "https://example.com" },
          });
          Object.defineProperty(globalThis, "window", {
            configurable: true,
            value: { __nexoraLab: { lcp: 75, cls: 0.01, longTasks: [60] } },
          });
          Object.defineProperty(globalThis, "performance", {
            configurable: true,
            value: {
              getEntriesByType: (type: string) => {
                if (type === "navigation")
                  return [
                    {
                      requestStart: 10,
                      responseStart: 30,
                      domContentLoadedEventEnd: 100,
                      loadEventEnd: 120,
                    },
                  ];
                if (type === "paint") return [{ name: "first-contentful-paint", startTime: 50 }];
                if (type === "resource") return [{ transferSize: 1234 }];
                return [];
              },
            },
          });
          Object.defineProperty(globalThis, "document", {
            configurable: true,
            value: {
              title: "Rendered title",
              documentElement: { getAttribute: () => "en" },
              body: {
                innerText: "Rendered body text with meaningful content for users and crawlers.",
                querySelectorAll: () => [{ textContent: "Rendered body text" }],
              },
              forms: [{}, {}],
              images: [
                { hasAttribute: () => true, alt: "Logo" },
                { hasAttribute: () => false, alt: "" },
              ],
              querySelector: (selector: string) => {
                if (selector.includes("viewport")) return { content: "width=device-width" };
                if (selector.includes("description")) return { content: "Rendered description" };
                if (selector.includes("robots")) return { content: "index,follow" };
                if (selector.includes("canonical"))
                  return { href: "https://example.com/canonical" };
                return null;
              },
              querySelectorAll: (selector: string) => {
                if (selector === "h1") return [{ textContent: "Rendered H1" }];
                if (selector === "h2") return [];
                if (selector === "h1,h2,h3,h4,h5,h6") return [{ textContent: "Rendered H1" }];
                if (selector === "a[href]")
                  return [{ href: "https://example.com/a" }, { href: "https://other.test/" }];
                if (selector === 'script[type="application/ld+json"]')
                  return [{ textContent: '{"@type":"Article"}' }];
                if (selector === "*") return [{}, {}, {}];
                if (selector === "input, textarea, select")
                  return [{ type: "text" }, { type: "password" }];
                return [];
              },
            },
          });
          try {
            return fn();
          } finally {
            Object.defineProperty(globalThis, "document", {
              configurable: true,
              value: previousDocument,
            });
            Object.defineProperty(globalThis, "location", {
              configurable: true,
              value: previousLocation,
            });
            Object.defineProperty(globalThis, "performance", {
              configurable: true,
              value: previousPerformance,
            });
            Reflect.deleteProperty(globalThis, "window");
          }
        },
      } as never,
      requestedUrl: "https://example.com",
      statusCode: 200,
      durationMs: 150,
      consoleErrorCount: 1,
      consoleErrors: ["Boom"],
      requestFailedCount: 1,
      failedResources: [
        { url: "https://example.com/missing.js", resourceType: "script", failureText: "404" },
      ],
      timedOut: false,
    });

    expect(snapshot.requestedUrl).toBe("https://example.com");
    expect(snapshot.finalUrl).toBe("https://example.com/rendered");
    expect(snapshot.document.headingCounts.h1).toBe(1);
    expect(snapshot.document.internalLinkCount).toBe(1);
    expect(snapshot.document.externalLinkCount).toBe(1);
    expect(snapshot.document.imageAlt).toEqual({ total: 2, withAlt: 1, withoutAlt: 1 });
    expect(snapshot.document.structuredDataTypes).toEqual(["Article"]);
    expect(snapshot.lab.source).toBe("Rendered browser lab observation");
    expect(snapshot.lab.navigationTtfbMs).toBe(20);
    expect(snapshot.lab.observedLcpMs).toBe(75);
    expect(snapshot.lab.observedCls).toBe(0.01);
    expect(snapshot.lab.longTaskCount).toBe(1);
    expect(JSON.stringify(snapshot)).not.toContain("localStorage");
    expect(JSON.stringify(snapshot)).not.toContain("sessionStorage");
    expect(JSON.stringify(snapshot)).not.toContain("cookie");
    expect(JSON.stringify(snapshot)).not.toContain("Authorization");
  });
});
