import { describe, it, expect } from "vitest";
import { passed, warning, failed, notApplicable, unavailableResult } from "../helpers/result";
import {
  hasVisibleText,
  getTextLength,
  getWordCount,
  hasCanonical,
  hasTitle,
  hasMetaDescription,
  countHeadings,
  countH1,
  hasForms,
  hasImages,
  hasLinks,
  hasInternalLinks,
  hasExternalLinks,
  hasStructuredData,
  hasMicrodata,
  hasRdfa,
  hasIframes,
  countIframes,
  hasTables,
  hasMedia,
  hasOgTitle,
  hasTwitterCard,
} from "../helpers/evidence";
import {
  getTitleText,
  getDescriptionText,
  getVisibleText,
  getHeadingTexts,
  isEmptyOrWhitespace,
  getOgTitle,
  getOgDescription,
  getTwitterTitle,
  getTwitterDescription,
} from "../helpers/text";
import {
  isHttps,
  getProtocol,
  hasTrackingParams,
  hasSessionParams,
  countQueryParams,
  getUrlLength,
  hasUppercaseInPath,
  hasUnderscoreInPath,
  hasRepeatedSeparators,
  hasFragment,
  hasDefaultPort,
  hasNonAscii,
  isValidUrl,
  resolveUrl,
} from "../helpers/urls";
import {
  isTruncated,
  hasBody,
  hasHead,
  hasMainElement,
  hasArticles,
  hasSections,
  hasNavigation,
  hasHeader,
  hasFooter,
  hasAside,
  hasAddress,
  hasTimeElements,
  hasOgImage,
  hasTwitterImage,
  hasOgUrl,
} from "../helpers/applicability";
import { createMockSnapshot } from "./test-utils";

describe("result helpers", () => {
  it("passed() returns passed state", () => {
    const r = passed("TEST-001", "ok", true, "test", true);
    expect(r.state).toBe("passed");
    expect(r.checkId).toBe("TEST-001");
    expect(r.scored).toBe(true);
  });

  it("warning() returns warning state", () => {
    const r = warning("TEST-002", "caution", 5, "test", 0);
    expect(r.state).toBe("warning");
    expect(r.scored).toBe(true);
  });

  it("failed() returns failed state", () => {
    const r = failed("TEST-003", "fail", "got", "test", "expected");
    expect(r.state).toBe("failed");
    expect(r.scored).toBe(true);
  });

  it("notApplicable() returns not-applicable state with reason", () => {
    const r = notApplicable("TEST-004", "n/a", "test", "No data");
    expect(r.state).toBe("not-applicable");
    expect(r.scored).toBe(false);
    expect(r.applicabilityReason).toBe("No data");
  });

  it("unavailableResult() returns unavailable state with reason", () => {
    const r = unavailableResult("TEST-005", "error", "test", "Service down");
    expect(r.state).toBe("unavailable");
    expect(r.scored).toBe(false);
    expect(r.unavailableReason).toBe("Service down");
  });

  it("passed() accepts opts", () => {
    const r = passed("TEST-006", "ok", true, "test", true, {
      severity: "high",
      effort: "high",
      impact: "Big impact",
      source: "http-response",
      responsible: "seo",
      selector: "#main",
      samples: ["a", "b"],
      confidence: 80,
      steps: ["do X"],
      developerNotes: "note",
      contentNotes: "cnote",
    });
    expect(r.severity).toBe("high");
    expect(r.effort).toBe("high");
    expect(r.impact).toBe("Big impact");
    expect(r.source).toBe("http-response");
    expect(r.remediation.responsible).toBe("seo");
    expect(r.evidence.selector).toBe("#main");
    expect(r.evidence.samples).toEqual(["a", "b"]);
    expect(r.confidence).toBe(80);
    expect(r.remediation.steps).toEqual(["do X"]);
    expect(r.remediation.developerNotes).toBe("note");
    expect(r.remediation.contentNotes).toBe("cnote");
  });
});

describe("evidence helpers", () => {
  it("hasVisibleText returns true when text exists", () => {
    expect(hasVisibleText(createMockSnapshot())).toBe(true);
  });

  it("hasVisibleText returns false when text is empty", () => {
    const s = createMockSnapshot({ content: { ...createMockSnapshot().content, visibleText: "" } });
    expect(hasVisibleText(s)).toBe(false);
  });

  it("getTextLength returns correct length", () => {
    expect(getTextLength(createMockSnapshot())).toBe(33);
  });

  it("getWordCount returns count", () => {
    expect(getWordCount(createMockSnapshot())).toBe(7);
  });

  it("hasCanonical returns true when baseHref is set", () => {
    const s = createMockSnapshot({
      document: { ...createMockSnapshot().document, baseHref: "https://example.com" },
    });
    expect(hasCanonical(s)).toBe(true);
  });

  it("hasCanonical returns false when baseHref is null", () => {
    expect(hasCanonical(createMockSnapshot())).toBe(false);
  });

  it("hasTitle returns true when title is set", () => {
    expect(hasTitle(createMockSnapshot())).toBe(true);
  });

  it("hasTitle returns false when title is null", () => {
    const s = createMockSnapshot({ document: { ...createMockSnapshot().document, title: null } });
    expect(hasTitle(s)).toBe(false);
  });

  it("hasMetaDescription returns true when description exists", () => {
    const s = createMockSnapshot({
      metadata: [
        {
          name: "description",
          rawValue: "desc",
          normalizedValue: "desc",
          sourceAttribute: "name",
          elementOrder: 0,
        },
      ],
    });
    expect(hasMetaDescription(s)).toBe(true);
  });

  it("hasMetaDescription returns false when no description", () => {
    expect(hasMetaDescription(createMockSnapshot())).toBe(false);
  });

  it("countHeadings returns heading count", () => {
    const s = createMockSnapshot({
      headings: [
        {
          level: 1,
          text: "H1",
          isEmpty: false,
          isHidden: false,
          elementId: null,
          selector: undefined,
          order: 0,
          rawTextLength: 2,
        },
      ],
    });
    expect(countHeadings(s)).toBe(1);
  });

  it("countH1 counts only level 1 headings", () => {
    const s = createMockSnapshot({
      headings: [
        {
          level: 1,
          text: "H1",
          isEmpty: false,
          isHidden: false,
          elementId: null,
          selector: undefined,
          order: 0,
          rawTextLength: 2,
        },
        {
          level: 2,
          text: "H2",
          isEmpty: false,
          isHidden: false,
          elementId: null,
          selector: undefined,
          order: 1,
          rawTextLength: 2,
        },
      ],
    });
    expect(countH1(s)).toBe(1);
  });

  it("hasForms returns true when formCount > 0", () => {
    const s = createMockSnapshot({ forms: { formCount: 1, forms: [] } });
    expect(hasForms(s)).toBe(true);
  });

  it("hasImages returns true when images array is non-empty", () => {
    const s = createMockSnapshot({
      images: [
        {
          rawSrc: "a.jpg",
          resolvedSrc: null,
          srcset: null,
          sizes: null,
          hasAlt: false,
          altText: null,
          width: null,
          height: null,
          loading: null,
          decoding: null,
          fetchPriority: null,
          referrerPolicy: null,
          elementOrder: 0,
          parentPicture: false,
        },
      ],
    });
    expect(hasImages(s)).toBe(true);
  });

  it("hasLinks returns true when links array is non-empty", () => {
    const s = createMockSnapshot({
      links: [
        {
          rawHref: "https://example.com",
          resolvedUrl: "https://example.com",
          protocol: "https:",
          hostname: "example.com",
          isSameOrigin: true,
          isSameHost: true,
          fragment: null,
          anchorText: "link",
          title: null,
          relTokens: [],
          target: null,
          hasDownload: false,
          hreflang: null,
          media: null,
          elementOrder: 0,
          classification: "https",
        },
      ],
    });
    expect(hasLinks(s)).toBe(true);
  });

  it("hasInternalLinks returns true when isSameOrigin link exists", () => {
    const s = createMockSnapshot({
      links: [
        {
          rawHref: "/page",
          resolvedUrl: "https://example.com/page",
          protocol: "https:",
          hostname: "example.com",
          isSameOrigin: true,
          isSameHost: true,
          fragment: null,
          anchorText: "link",
          title: null,
          relTokens: [],
          target: null,
          hasDownload: false,
          hreflang: null,
          media: null,
          elementOrder: 0,
          classification: "https",
        },
      ],
    });
    expect(hasInternalLinks(s)).toBe(true);
  });

  it("hasStructuredData returns true when structuredData is non-empty", () => {
    const s = createMockSnapshot({
      structuredData: [
        {
          rawSample: "{}",
          parseSuccess: true,
          parsedTypes: ["WebPage"],
          context: null,
          elementOrder: 0,
          parseErrorCategory: "none",
        },
      ],
    });
    expect(hasStructuredData(s)).toBe(true);
  });

  it("hasMicrodata returns present flag", () => {
    const s = createMockSnapshot({
      microdata: { present: true, itemCount: 1, itemTypes: ["Product"] },
    });
    expect(hasMicrodata(s)).toBe(true);
  });

  it("hasRdfa returns present flag", () => {
    const s = createMockSnapshot({ rdfa: { present: true, typeofCount: 1, propertyCount: 2 } });
    expect(hasRdfa(s)).toBe(true);
  });

  it("hasIframes returns true when iframe resource exists", () => {
    const s = createMockSnapshot({
      resources: [
        {
          type: "iframe",
          rawUrl: "https://example.com/embed",
          resolvedUrl: "https://example.com/embed",
          async: false,
          defer: false,
          isModule: false,
          media: null,
          crossorigin: null,
          hasIntegrity: false,
          loading: null,
          elementOrder: 0,
        },
      ],
    });
    expect(hasIframes(s)).toBe(true);
    expect(countIframes(s)).toBe(1);
  });

  it("hasTables returns true when tableCount > 0", () => {
    const s = createMockSnapshot({ content: { ...createMockSnapshot().content, tableCount: 1 } });
    expect(hasTables(s)).toBe(true);
  });

  it("hasMedia returns true when video or audio resource exists", () => {
    const s = createMockSnapshot({
      resources: [
        {
          type: "video",
          rawUrl: "https://example.com/video.mp4",
          resolvedUrl: "https://example.com/video.mp4",
          async: false,
          defer: false,
          isModule: false,
          media: null,
          crossorigin: null,
          hasIntegrity: false,
          loading: null,
          elementOrder: 0,
        },
      ],
    });
    expect(hasMedia(s)).toBe(true);
  });

  it("hasOgTitle checks openGraph for og:title", () => {
    const s = createMockSnapshot({
      social: {
        openGraph: [{ property: "og:title", content: "OG Title", elementOrder: 0 }],
        twitter: [],
      },
    });
    expect(hasOgTitle(s)).toBe(true);
  });

  it("hasTwitterCard checks twitter for twitter:card", () => {
    const s = createMockSnapshot({
      social: {
        openGraph: [],
        twitter: [{ name: "twitter:card", content: "summary", elementOrder: 0 }],
      },
    });
    expect(hasTwitterCard(s)).toBe(true);
  });

  it("hasExternalLinks detects external links", () => {
    const s = createMockSnapshot({
      links: [
        {
          rawHref: "https://other.com",
          resolvedUrl: "https://other.com",
          protocol: "https:",
          hostname: "other.com",
          isSameOrigin: false,
          isSameHost: false,
          fragment: null,
          anchorText: "link",
          title: null,
          relTokens: [],
          target: null,
          hasDownload: false,
          hreflang: null,
          media: null,
          elementOrder: 0,
          classification: "https",
        },
      ],
    });
    expect(hasExternalLinks(s)).toBe(true);
  });
});

describe("text helpers", () => {
  it("getTitleText returns document.title", () => {
    expect(getTitleText(createMockSnapshot())).toBe("Test Page Title");
  });

  it("getDescriptionText returns description metadata", () => {
    const s = createMockSnapshot({
      metadata: [
        {
          name: "description",
          rawValue: "desc",
          normalizedValue: "My desc",
          sourceAttribute: "name",
          elementOrder: 0,
        },
      ],
    });
    expect(getDescriptionText(s)).toBe("My desc");
  });

  it("getDescriptionText returns null when no description", () => {
    expect(getDescriptionText(createMockSnapshot())).toBeNull();
  });

  it("getVisibleText returns content visibleText", () => {
    expect(getVisibleText(createMockSnapshot())).toBe("Hello world this is test content.");
  });

  it("getHeadingTexts returns heading texts", () => {
    const s = createMockSnapshot({
      headings: [
        {
          level: 1,
          text: "H1",
          isEmpty: false,
          isHidden: false,
          elementId: null,
          selector: undefined,
          order: 0,
          rawTextLength: 2,
        },
        {
          level: 2,
          text: "H2",
          isEmpty: false,
          isHidden: false,
          elementId: null,
          selector: undefined,
          order: 1,
          rawTextLength: 2,
        },
      ],
    });
    expect(getHeadingTexts(s)).toEqual(["H1", "H2"]);
  });

  it("isEmptyOrWhitespace returns true for null", () => {
    expect(isEmptyOrWhitespace(null)).toBe(true);
  });

  it("isEmptyOrWhitespace returns true for empty string", () => {
    expect(isEmptyOrWhitespace("")).toBe(true);
  });

  it("isEmptyOrWhitespace returns true for whitespace", () => {
    expect(isEmptyOrWhitespace("   ")).toBe(true);
  });

  it("isEmptyOrWhitespace returns false for non-empty", () => {
    expect(isEmptyOrWhitespace("text")).toBe(false);
  });

  it("getOgTitle returns og:title content", () => {
    const s = createMockSnapshot({
      social: {
        openGraph: [{ property: "og:title", content: "OG Title", elementOrder: 0 }],
        twitter: [],
      },
    });
    expect(getOgTitle(s)).toBe("OG Title");
  });

  it("getOgTitle returns null if missing", () => {
    expect(getOgTitle(createMockSnapshot())).toBeNull();
  });

  it("getOgDescription returns og:description content", () => {
    const s = createMockSnapshot({
      social: {
        openGraph: [{ property: "og:description", content: "OG Desc", elementOrder: 0 }],
        twitter: [],
      },
    });
    expect(getOgDescription(s)).toBe("OG Desc");
  });

  it("getTwitterTitle returns twitter:title content", () => {
    const s = createMockSnapshot({
      social: {
        openGraph: [],
        twitter: [{ name: "twitter:title", content: "Tw Title", elementOrder: 0 }],
      },
    });
    expect(getTwitterTitle(s)).toBe("Tw Title");
  });

  it("getTwitterDescription returns twitter:description content", () => {
    const s = createMockSnapshot({
      social: {
        openGraph: [],
        twitter: [{ name: "twitter:description", content: "Tw Desc", elementOrder: 0 }],
      },
    });
    expect(getTwitterDescription(s)).toBe("Tw Desc");
  });
});

describe("urls helpers", () => {
  it("isHttps returns true for https", () => {
    expect(isHttps("https://example.com")).toBe(true);
  });

  it("isHttps returns false for http", () => {
    expect(isHttps("http://example.com")).toBe(false);
  });

  it("getProtocol extracts protocol", () => {
    expect(getProtocol("https://example.com")).toBe("https:");
  });

  it("getProtocol returns empty for invalid url", () => {
    expect(getProtocol("not-a-url")).toBe("");
  });

  it("hasTrackingParams detects tracking params", () => {
    expect(hasTrackingParams("https://example.com?utm_source=google")).toBe(true);
  });

  it("hasTrackingParams returns false without params", () => {
    expect(hasTrackingParams("https://example.com")).toBe(false);
  });

  it("hasSessionParams detects session params", () => {
    expect(hasSessionParams("https://example.com?sid=abc")).toBe(true);
  });

  it("countQueryParams returns count", () => {
    expect(countQueryParams("https://example.com?a=1&b=2")).toBe(2);
  });

  it("countQueryParams returns 0 for invalid url", () => {
    expect(countQueryParams("not-a-url")).toBe(0);
  });

  it("getUrlLength returns length", () => {
    expect(getUrlLength("https://example.com")).toBe(19);
  });

  it("hasUppercaseInPath detects uppercase", () => {
    expect(hasUppercaseInPath("https://example.com/About")).toBe(true);
  });

  it("hasUppercaseInPath returns false for lowercase", () => {
    expect(hasUppercaseInPath("https://example.com/about")).toBe(false);
  });

  it("hasUnderscoreInPath detects underscores", () => {
    expect(hasUnderscoreInPath("https://example.com/my_page")).toBe(true);
  });

  it("hasRepeatedSeparators detects double slashes", () => {
    expect(hasRepeatedSeparators("https://example.com//page")).toBe(true);
  });

  it("hasFragment detects fragments", () => {
    expect(hasFragment("https://example.com#section")).toBe(true);
  });

  it("hasFragment returns false without fragment", () => {
    expect(hasFragment("https://example.com")).toBe(false);
  });

  it("hasDefaultPort returns false for non-default port", () => {
    expect(hasDefaultPort("https://example.com:8080")).toBe(false);
  });

  it("hasDefaultPort returns false when URL has no explicit port", () => {
    expect(hasDefaultPort("https://example.com")).toBe(false);
  });

  it("hasNonAscii detects non-ASCII chars", () => {
    expect(hasNonAscii("https://example.com/café")).toBe(true);
  });

  it("isValidUrl validates urls", () => {
    expect(isValidUrl("https://example.com")).toBe(true);
    expect(isValidUrl("not-a-url")).toBe(false);
  });

  it("resolveUrl resolves relative URLs", () => {
    expect(resolveUrl("/page", "https://example.com")).toBe("https://example.com/page");
  });

  it("resolveUrl returns null for invalid", () => {
    expect(resolveUrl("", "")).toBeNull();
  });
});

describe("applicability helpers", () => {
  it("isTruncated returns content.isTruncated", () => {
    expect(isTruncated(createMockSnapshot())).toBe(false);
    const s = createMockSnapshot({
      content: { ...createMockSnapshot().content, isTruncated: true },
    });
    expect(isTruncated(s)).toBe(true);
  });

  it("hasBody returns document.hasBody", () => {
    expect(hasBody(createMockSnapshot())).toBe(true);
  });

  it("hasHead returns document.hasHead", () => {
    expect(hasHead(createMockSnapshot())).toBe(true);
  });

  it("hasMainElement checks hasMain", () => {
    expect(hasMainElement(createMockSnapshot())).toBe(true);
    const s = createMockSnapshot({ content: { ...createMockSnapshot().content, hasMain: false } });
    expect(hasMainElement(s)).toBe(false);
  });

  it("hasArticles checks articleCount", () => {
    const s = createMockSnapshot({ content: { ...createMockSnapshot().content, articleCount: 2 } });
    expect(hasArticles(s)).toBe(true);
  });

  it("hasSections checks sectionCount", () => {
    const s = createMockSnapshot({ content: { ...createMockSnapshot().content, sectionCount: 1 } });
    expect(hasSections(s)).toBe(true);
  });

  it("hasNavigation checks navCount", () => {
    const s = createMockSnapshot({ content: { ...createMockSnapshot().content, navCount: 1 } });
    expect(hasNavigation(s)).toBe(true);
  });

  it("hasHeader checks headerCount", () => {
    const s = createMockSnapshot({ content: { ...createMockSnapshot().content, headerCount: 1 } });
    expect(hasHeader(s)).toBe(true);
  });

  it("hasFooter checks footerCount", () => {
    const s = createMockSnapshot({ content: { ...createMockSnapshot().content, footerCount: 1 } });
    expect(hasFooter(s)).toBe(true);
  });

  it("hasAside checks asideCount", () => {
    const s = createMockSnapshot({ content: { ...createMockSnapshot().content, asideCount: 1 } });
    expect(hasAside(s)).toBe(true);
  });

  it("hasAddress checks addressCount", () => {
    const s = createMockSnapshot({ content: { ...createMockSnapshot().content, addressCount: 1 } });
    expect(hasAddress(s)).toBe(true);
  });

  it("hasTimeElements checks timeElements length", () => {
    const s = createMockSnapshot({
      content: {
        ...createMockSnapshot().content,
        timeElements: [{ datetime: "2024-01-01", text: "Jan 1", elementOrder: 0 }],
      },
    });
    expect(hasTimeElements(s)).toBe(true);
  });

  it("hasOgImage checks for og:image", () => {
    const s = createMockSnapshot({
      social: {
        openGraph: [
          { property: "og:image", content: "https://example.com/image.jpg", elementOrder: 0 },
        ],
        twitter: [],
      },
    });
    expect(hasOgImage(s)).toBe(true);
  });

  it("hasTwitterImage checks for twitter:image", () => {
    const s = createMockSnapshot({
      social: {
        openGraph: [],
        twitter: [
          { name: "twitter:image", content: "https://example.com/image.jpg", elementOrder: 0 },
        ],
      },
    });
    expect(hasTwitterImage(s)).toBe(true);
  });

  it("hasOgUrl checks for og:url", () => {
    const s = createMockSnapshot({
      social: {
        openGraph: [{ property: "og:url", content: "https://example.com", elementOrder: 0 }],
        twitter: [],
      },
    });
    expect(hasOgUrl(s)).toBe(true);
  });
});
