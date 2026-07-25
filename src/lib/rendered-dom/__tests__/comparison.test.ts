import { describe, expect, it } from "vitest";
import { compareRenderedDom } from "../comparison";
import type { PageSnapshot } from "@/lib/extraction/types";
import type { RenderedDomSnapshot } from "../contracts";

function staticSnapshot(): PageSnapshot {
  return {
    schemaVersion: "1.0.0",
    extractedAt: "2026-01-01T00:00:00.000Z",
    requestedUrl: "https://example.com",
    finalUrl: "https://example.com",
    response: {
      status: 200,
      contentType: "text/html",
      byteLength: 100,
      redirectChain: [],
      timing: { dns: 0, connect: 0, tls: 0, firstByte: 1, total: 1 },
    },
    document: {
      url: "https://example.com",
      lang: "en",
      dir: null,
      title: "Static title",
      titleElementCount: 1,
      charsetDeclarations: [],
      viewportDeclarations: [],
      baseHref: null,
      hasBody: true,
      hasHead: true,
      approxDomNodeCount: 10,
      declaredLanguage: "en",
    },
    metadata: [
      {
        name: "description",
        rawValue: "Static description",
        normalizedValue: "Static description",
        sourceAttribute: "name",
        elementOrder: 1,
      },
    ],
    headings: [
      {
        level: 1,
        text: "Static H1",
        rawTextLength: 9,
        isEmpty: false,
        isHidden: false,
        elementId: null,
        order: 1,
      },
    ],
    links: [],
    images: [],
    structuredData: [],
    microdata: { present: false, itemCount: 0, itemTypes: [] },
    rdfa: { present: false, typeofCount: 0, propertyCount: 0 },
    social: { openGraph: [], twitter: [] },
    content: {
      visibleText: "Static H1 with enough supporting page content for a normal rendered document.",
      totalChars: 200,
      wordCount: 12,
      paragraphCount: 0,
      sentenceCount: 0,
      listCount: 0,
      listItemCount: 0,
      tableCount: 0,
      blockquoteCount: 0,
      codePreCount: 0,
      hasMain: false,
      articleCount: 0,
      sectionCount: 0,
      navCount: 0,
      headerCount: 0,
      footerCount: 0,
      asideCount: 0,
      addressCount: 0,
      timeElements: [],
      questionHeadingCount: 0,
      isTruncated: false,
    },
    accessibility: {
      documentLanguage: "en",
      imageAltPresent: { total: 0, withAlt: 0, withoutAlt: 0 },
      formLabelRelationships: { total: 0, withLabel: 0, withoutLabel: 0 },
      inputAccessibleNames: { total: 0, withName: 0, withoutName: 0 },
      buttonTextSignals: { total: 0, withText: 0, withoutText: 0 },
      linkAccessibleNames: { total: 0, withName: 0, withoutName: 0 },
      landmarkElements: { nav: 0, header: 0, footer: 0, aside: 0, main: 0, section: 0 },
      headingElements: { total: 1 },
      skipLinkCandidates: [],
      tableHeaderCells: { totalTh: 0 },
      ariaAttributes: { total: 0, roles: [] },
      duplicateIds: [],
      tabindexValues: [],
      iframeTitles: { total: 0, withTitle: 0, withoutTitle: 0 },
      mediaCaptions: { total: 0, withTrack: 0, withoutTrack: 0 },
      viewportZoomRestricted: false,
    },
    forms: { formCount: 0, forms: [] },
    resources: [],
    extractionWarnings: [],
  };
}

function renderedSnapshot(
  overrides: Partial<RenderedDomSnapshot["document"]> = {},
): RenderedDomSnapshot {
  return {
    schemaVersion: "1.0.0",
    requestedUrl: "https://example.com",
    finalUrl: "https://example.com",
    statusCode: 200,
    renderedAt: "2026-01-01T00:00:01.000Z",
    durationMs: 123,
    document: {
      title: "Static title",
      lang: "en",
      viewport: "width=device-width, initial-scale=1",
      canonical: null,
      metaDescription: "Static description",
      robots: null,
      h1Texts: ["Static H1"],
      headingCounts: { h1: 1, h2: 0, total: 1 },
      linkCount: 0,
      internalLinkCount: 0,
      externalLinkCount: 0,
      imageCount: 0,
      imageAlt: { total: 0, withAlt: 0, withoutAlt: 0 },
      structuredDataCount: 0,
      structuredDataTypes: [],
      forms: { total: 0, inputs: 0, passwordInputs: 0 },
      visibleTextLength: 200,
      meaningfulTextLength: 200,
      approxDomNodeCount: 12,
      domContentHash: "abc123",
      ...overrides,
    },
    javascript: {
      enabled: true,
      consoleErrorCount: 0,
      consoleErrors: [],
      requestFailedCount: 0,
      failedResources: [],
      timedOut: false,
    },
    lab: {
      source: "Rendered browser lab observation",
      navigationTtfbMs: 10,
      fcpMs: 50,
      observedLcpMs: 75,
      observedCls: 0,
      longTaskCount: 0,
      totalLongTaskDurationMs: 0,
      domContentLoadedMs: 100,
      loadMs: 120,
      resourceCount: 1,
      transferredBytesEstimate: 1000,
    },
  };
}

describe("compareRenderedDom", () => {
  it("returns available analysis with null-free metric deltas", () => {
    const result = compareRenderedDom({
      staticSnapshot: staticSnapshot(),
      renderedSnapshot: renderedSnapshot(),
    });

    expect(result.status).toBe("available");
    expect(result.domNodeDelta).toBe(2);
    expect(result.visibleTextDelta).toBe(0);
    expect(result.findings).toHaveLength(14);
    expect(result.findings.map((finding) => finding.checkId)).toEqual([
      "JS-001",
      "JS-002",
      "JS-003",
      "JS-004",
      "JS-005",
      "JS-006",
      "JS-007",
      "JS-008",
      "JS-009",
      "JS-010",
      "JS-011",
      "JS-012",
      "JS-013",
      "JS-014",
    ]);
    expect(
      result.findings.every((finding) => finding.evidence && finding.impact && finding.remediation),
    ).toBe(true);
  });

  it("reports changed rendered metadata without changing scoring", () => {
    const result = compareRenderedDom({
      staticSnapshot: staticSnapshot(),
      renderedSnapshot: renderedSnapshot({ title: "Rendered title" }),
    });

    expect(result.findings.find((finding) => finding.checkId === "JS-002")?.state).toBe("warning");
  });

  it("reports JavaScript-injected SEO signals and blank rendered content", () => {
    const staticPage = staticSnapshot();
    staticPage.document.title = null;
    staticPage.metadata = [];
    staticPage.headings = [];
    const result = compareRenderedDom({
      staticSnapshot: staticPage,
      renderedSnapshot: renderedSnapshot({
        title: "Rendered title",
        metaDescription: "Rendered description",
        canonical: "https://example.com/canonical",
        robots: "noindex",
        h1Texts: ["Rendered H1"],
        meaningfulTextLength: 20,
        internalLinkCount: 10,
        structuredDataCount: 1,
        structuredDataTypes: ["Article"],
      }),
    });

    for (const id of ["JS-001", "JS-003", "JS-004", "JS-005", "JS-006", "JS-008", "JS-009"]) {
      expect(result.findings.find((finding) => finding.checkId === id)?.state).toBe("warning");
    }
    expect(result.findings.find((finding) => finding.checkId === "JS-010")?.state).toBe("failed");
  });
});
