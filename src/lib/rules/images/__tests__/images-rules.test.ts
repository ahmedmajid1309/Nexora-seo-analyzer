import { describe, it, expect } from "vitest";
import { createMockSnapshot } from "../../__tests__/test-utils";
import { altEmpty } from "../alt-empty";
import { altLength } from "../alt-length";
import { altMissing } from "../alt-missing";
import { imageDimensions } from "../image-dimensions";
import { imageMalformedUrl } from "../image-malformed-url";
import { imageNoSrc } from "../image-no-src";
import { lazyLoading } from "../lazy-loading";
import { modernFormat } from "../modern-format";

describe("altEmpty (IMAGE-002)", () => {
  it("returns not-applicable when no images exist", () => {
    const snapshot = createMockSnapshot({ images: [] });
    const result = altEmpty.evaluator(snapshot);
    expect(result.state).toBe("not-applicable");
    expect(result.checkId).toBe("IMAGE-002");
  });

  it("returns passed when all images have populated alt text", () => {
    const snapshot = createMockSnapshot({
      images: [
        {
          rawSrc: "a.jpg",
          resolvedSrc: "a.jpg",
          srcset: null,
          sizes: null,
          hasAlt: true,
          altText: "description",
          width: 100,
          height: 100,
          loading: null,
          decoding: null,
          fetchPriority: null,
          referrerPolicy: null,
          elementOrder: 0,
          parentPicture: false,
        },
      ],
    });
    const result = altEmpty.evaluator(snapshot);
    expect(result.state).toBe("passed");
    expect(result.checkId).toBe("IMAGE-002");
  });

  it("returns warning when some images have empty alt text", () => {
    const snapshot = createMockSnapshot({
      images: [
        {
          rawSrc: "a.jpg",
          resolvedSrc: "a.jpg",
          srcset: null,
          sizes: null,
          hasAlt: true,
          altText: "",
          width: 100,
          height: 100,
          loading: null,
          decoding: null,
          fetchPriority: null,
          referrerPolicy: null,
          elementOrder: 0,
          parentPicture: false,
        },
        {
          rawSrc: "b.jpg",
          resolvedSrc: "b.jpg",
          srcset: null,
          sizes: null,
          hasAlt: true,
          altText: "good",
          width: 100,
          height: 100,
          loading: null,
          decoding: null,
          fetchPriority: null,
          referrerPolicy: null,
          elementOrder: 1,
          parentPicture: false,
        },
      ],
    });
    const result = altEmpty.evaluator(snapshot);
    expect(result.state).toBe("warning");
    expect(result.checkId).toBe("IMAGE-002");
  });

  it("returns warning when hasAlt is true but altText is null", () => {
    const snapshot = createMockSnapshot({
      images: [
        {
          rawSrc: "a.jpg",
          resolvedSrc: "a.jpg",
          srcset: null,
          sizes: null,
          hasAlt: true,
          altText: null,
          width: 100,
          height: 100,
          loading: null,
          decoding: null,
          fetchPriority: null,
          referrerPolicy: null,
          elementOrder: 0,
          parentPicture: false,
        },
      ],
    });
    const result = altEmpty.evaluator(snapshot);
    expect(result.state).toBe("warning");
    expect(result.checkId).toBe("IMAGE-002");
  });
});

describe("altLength (IMAGE-006)", () => {
  it("returns not-applicable when no images exist", () => {
    const snapshot = createMockSnapshot({ images: [] });
    const result = altLength.evaluator(snapshot);
    expect(result.state).toBe("not-applicable");
    expect(result.checkId).toBe("IMAGE-006");
  });

  it("returns passed when alt text is within recommended length", () => {
    const snapshot = createMockSnapshot({
      images: [
        {
          rawSrc: "a.jpg",
          resolvedSrc: "a.jpg",
          srcset: null,
          sizes: null,
          hasAlt: true,
          altText: "short alt",
          width: 100,
          height: 100,
          loading: null,
          decoding: null,
          fetchPriority: null,
          referrerPolicy: null,
          elementOrder: 0,
          parentPicture: false,
        },
      ],
    });
    const result = altLength.evaluator(snapshot);
    expect(result.state).toBe("passed");
    expect(result.checkId).toBe("IMAGE-006");
  });

  it("returns warning when alt text exceeds 125 characters", () => {
    const snapshot = createMockSnapshot({
      images: [
        {
          rawSrc: "a.jpg",
          resolvedSrc: "a.jpg",
          srcset: null,
          sizes: null,
          hasAlt: true,
          altText: "x".repeat(130),
          width: 100,
          height: 100,
          loading: null,
          decoding: null,
          fetchPriority: null,
          referrerPolicy: null,
          elementOrder: 0,
          parentPicture: false,
        },
      ],
    });
    const result = altLength.evaluator(snapshot);
    expect(result.state).toBe("warning");
    expect(result.checkId).toBe("IMAGE-006");
  });
});

describe("altMissing (IMAGE-001)", () => {
  it("returns not-applicable when no images on page (total === 0)", () => {
    const snapshot = createMockSnapshot({
      accessibility: {
        documentLanguage: "en",
        imageAltPresent: { total: 0, withAlt: 0, withoutAlt: 0 },
        formLabelRelationships: { total: 0, withLabel: 0, withoutLabel: 0 },
        inputAccessibleNames: { total: 0, withName: 0, withoutName: 0 },
        buttonTextSignals: { total: 0, withText: 0, withoutText: 0 },
        linkAccessibleNames: { total: 0, withName: 0, withoutName: 0 },
        landmarkElements: { nav: 0, header: 0, footer: 0, aside: 0, main: 1, section: 0 },
        headingElements: { total: 0 },
        skipLinkCandidates: [],
        tableHeaderCells: { totalTh: 0 },
        ariaAttributes: { total: 0, roles: [] },
        duplicateIds: [],
        tabindexValues: [],
        iframeTitles: { total: 0, withTitle: 0, withoutTitle: 0 },
        mediaCaptions: { total: 0, withTrack: 0, withoutTrack: 0 },
        viewportZoomRestricted: false,
      },
    });
    const result = altMissing.evaluator(snapshot);
    expect(result.state).toBe("not-applicable");
    expect(result.checkId).toBe("IMAGE-001");
  });

  it("returns passed when all images have alt attributes", () => {
    const snapshot = createMockSnapshot({
      accessibility: {
        documentLanguage: "en",
        imageAltPresent: { total: 3, withAlt: 3, withoutAlt: 0 },
        formLabelRelationships: { total: 0, withLabel: 0, withoutLabel: 0 },
        inputAccessibleNames: { total: 0, withName: 0, withoutName: 0 },
        buttonTextSignals: { total: 0, withText: 0, withoutText: 0 },
        linkAccessibleNames: { total: 0, withName: 0, withoutName: 0 },
        landmarkElements: { nav: 0, header: 0, footer: 0, aside: 0, main: 1, section: 0 },
        headingElements: { total: 0 },
        skipLinkCandidates: [],
        tableHeaderCells: { totalTh: 0 },
        ariaAttributes: { total: 0, roles: [] },
        duplicateIds: [],
        tabindexValues: [],
        iframeTitles: { total: 0, withTitle: 0, withoutTitle: 0 },
        mediaCaptions: { total: 0, withTrack: 0, withoutTrack: 0 },
        viewportZoomRestricted: false,
      },
    });
    const result = altMissing.evaluator(snapshot);
    expect(result.state).toBe("passed");
    expect(result.checkId).toBe("IMAGE-001");
  });

  it("returns failed when some images are missing alt", () => {
    const snapshot = createMockSnapshot({
      accessibility: {
        documentLanguage: "en",
        imageAltPresent: { total: 5, withAlt: 3, withoutAlt: 2 },
        formLabelRelationships: { total: 0, withLabel: 0, withoutLabel: 0 },
        inputAccessibleNames: { total: 0, withName: 0, withoutName: 0 },
        buttonTextSignals: { total: 0, withText: 0, withoutText: 0 },
        linkAccessibleNames: { total: 0, withName: 0, withoutName: 0 },
        landmarkElements: { nav: 0, header: 0, footer: 0, aside: 0, main: 1, section: 0 },
        headingElements: { total: 0 },
        skipLinkCandidates: [],
        tableHeaderCells: { totalTh: 0 },
        ariaAttributes: { total: 0, roles: [] },
        duplicateIds: [],
        tabindexValues: [],
        iframeTitles: { total: 0, withTitle: 0, withoutTitle: 0 },
        mediaCaptions: { total: 0, withTrack: 0, withoutTrack: 0 },
        viewportZoomRestricted: false,
      },
    });
    const result = altMissing.evaluator(snapshot);
    expect(result.state).toBe("failed");
    expect(result.checkId).toBe("IMAGE-001");
  });
});

describe("imageDimensions (IMAGE-005)", () => {
  it("returns not-applicable when no images exist", () => {
    const snapshot = createMockSnapshot({ images: [] });
    const result = imageDimensions.evaluator(snapshot);
    expect(result.state).toBe("not-applicable");
    expect(result.checkId).toBe("IMAGE-005");
  });

  it("returns passed when all images have width and height", () => {
    const snapshot = createMockSnapshot({
      images: [
        {
          rawSrc: "a.jpg",
          resolvedSrc: "a.jpg",
          srcset: null,
          sizes: null,
          hasAlt: true,
          altText: "a",
          width: 800,
          height: 600,
          loading: null,
          decoding: null,
          fetchPriority: null,
          referrerPolicy: null,
          elementOrder: 0,
          parentPicture: false,
        },
      ],
    });
    const result = imageDimensions.evaluator(snapshot);
    expect(result.state).toBe("passed");
    expect(result.checkId).toBe("IMAGE-005");
  });

  it("returns warning when some images lack width", () => {
    const snapshot = createMockSnapshot({
      images: [
        {
          rawSrc: "a.jpg",
          resolvedSrc: "a.jpg",
          srcset: null,
          sizes: null,
          hasAlt: true,
          altText: "a",
          width: null,
          height: 600,
          loading: null,
          decoding: null,
          fetchPriority: null,
          referrerPolicy: null,
          elementOrder: 0,
          parentPicture: false,
        },
      ],
    });
    const result = imageDimensions.evaluator(snapshot);
    expect(result.state).toBe("warning");
    expect(result.checkId).toBe("IMAGE-005");
  });

  it("returns warning when some images lack height", () => {
    const snapshot = createMockSnapshot({
      images: [
        {
          rawSrc: "a.jpg",
          resolvedSrc: "a.jpg",
          srcset: null,
          sizes: null,
          hasAlt: true,
          altText: "a",
          width: 800,
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
    const result = imageDimensions.evaluator(snapshot);
    expect(result.state).toBe("warning");
    expect(result.checkId).toBe("IMAGE-005");
  });
});

describe("imageMalformedUrl (IMAGE-004)", () => {
  it("returns not-applicable when no images exist", () => {
    const snapshot = createMockSnapshot({ images: [] });
    const result = imageMalformedUrl.evaluator(snapshot);
    expect(result.state).toBe("not-applicable");
    expect(result.checkId).toBe("IMAGE-004");
  });

  it("returns passed for valid absolute URL", () => {
    const snapshot = createMockSnapshot({
      images: [
        {
          rawSrc: "https://example.com/photo.jpg",
          resolvedSrc: "https://example.com/photo.jpg",
          srcset: null,
          sizes: null,
          hasAlt: true,
          altText: "a",
          width: 100,
          height: 100,
          loading: null,
          decoding: null,
          fetchPriority: null,
          referrerPolicy: null,
          elementOrder: 0,
          parentPicture: false,
        },
      ],
    });
    const result = imageMalformedUrl.evaluator(snapshot);
    expect(result.state).toBe("passed");
    expect(result.checkId).toBe("IMAGE-004");
  });

  it("returns passed for relative paths and data URIs", () => {
    const snapshot = createMockSnapshot({
      images: [
        {
          rawSrc: "/images/photo.jpg",
          resolvedSrc: "/images/photo.jpg",
          srcset: null,
          sizes: null,
          hasAlt: true,
          altText: "a",
          width: 100,
          height: 100,
          loading: null,
          decoding: null,
          fetchPriority: null,
          referrerPolicy: null,
          elementOrder: 0,
          parentPicture: false,
        },
        {
          rawSrc: "./photo.jpg",
          resolvedSrc: "./photo.jpg",
          srcset: null,
          sizes: null,
          hasAlt: true,
          altText: "a",
          width: 100,
          height: 100,
          loading: null,
          decoding: null,
          fetchPriority: null,
          referrerPolicy: null,
          elementOrder: 1,
          parentPicture: false,
        },
        {
          rawSrc: "../images/photo.jpg",
          resolvedSrc: "../images/photo.jpg",
          srcset: null,
          sizes: null,
          hasAlt: true,
          altText: "a",
          width: 100,
          height: 100,
          loading: null,
          decoding: null,
          fetchPriority: null,
          referrerPolicy: null,
          elementOrder: 2,
          parentPicture: false,
        },
        {
          rawSrc: "data:image/png;base64,iVBORw0KGgo=",
          resolvedSrc: "data:image/png;base64,iVBORw0KGgo=",
          srcset: null,
          sizes: null,
          hasAlt: true,
          altText: "a",
          width: 100,
          height: 100,
          loading: null,
          decoding: null,
          fetchPriority: null,
          referrerPolicy: null,
          elementOrder: 3,
          parentPicture: false,
        },
      ],
    });
    const result = imageMalformedUrl.evaluator(snapshot);
    expect(result.state).toBe("passed");
    expect(result.checkId).toBe("IMAGE-004");
  });

  it("returns failed for malformed URLs", () => {
    const snapshot = createMockSnapshot({
      images: [
        {
          rawSrc: "not-a-valid-url",
          resolvedSrc: null,
          srcset: null,
          sizes: null,
          hasAlt: true,
          altText: "a",
          width: 100,
          height: 100,
          loading: null,
          decoding: null,
          fetchPriority: null,
          referrerPolicy: null,
          elementOrder: 0,
          parentPicture: false,
        },
      ],
    });
    const result = imageMalformedUrl.evaluator(snapshot);
    expect(result.state).toBe("failed");
    expect(result.checkId).toBe("IMAGE-004");
  });
});

describe("imageNoSrc (IMAGE-003)", () => {
  it("returns not-applicable when no images exist", () => {
    const snapshot = createMockSnapshot({ images: [] });
    const result = imageNoSrc.evaluator(snapshot);
    expect(result.state).toBe("not-applicable");
    expect(result.checkId).toBe("IMAGE-003");
  });

  it("returns passed when all images have valid src", () => {
    const snapshot = createMockSnapshot({
      images: [
        {
          rawSrc: "photo.jpg",
          resolvedSrc: "photo.jpg",
          srcset: null,
          sizes: null,
          hasAlt: true,
          altText: "a",
          width: 100,
          height: 100,
          loading: null,
          decoding: null,
          fetchPriority: null,
          referrerPolicy: null,
          elementOrder: 0,
          parentPicture: false,
        },
      ],
    });
    const result = imageNoSrc.evaluator(snapshot);
    expect(result.state).toBe("passed");
    expect(result.checkId).toBe("IMAGE-003");
  });

  it("returns failed when an image has empty src", () => {
    const snapshot = createMockSnapshot({
      images: [
        {
          rawSrc: "",
          resolvedSrc: null,
          srcset: null,
          sizes: null,
          hasAlt: true,
          altText: "a",
          width: 100,
          height: 100,
          loading: null,
          decoding: null,
          fetchPriority: null,
          referrerPolicy: null,
          elementOrder: 0,
          parentPicture: false,
        },
      ],
    });
    const result = imageNoSrc.evaluator(snapshot);
    expect(result.state).toBe("failed");
    expect(result.checkId).toBe("IMAGE-003");
  });

  it("returns failed when an image has whitespace-only src", () => {
    const snapshot = createMockSnapshot({
      images: [
        {
          rawSrc: "   ",
          resolvedSrc: null,
          srcset: null,
          sizes: null,
          hasAlt: true,
          altText: "a",
          width: 100,
          height: 100,
          loading: null,
          decoding: null,
          fetchPriority: null,
          referrerPolicy: null,
          elementOrder: 0,
          parentPicture: false,
        },
      ],
    });
    const result = imageNoSrc.evaluator(snapshot);
    expect(result.state).toBe("failed");
    expect(result.checkId).toBe("IMAGE-003");
  });
});

describe("lazyLoading (IMAGE-008)", () => {
  it("returns not-applicable when no images exist", () => {
    const snapshot = createMockSnapshot({ images: [] });
    const result = lazyLoading.evaluator(snapshot);
    expect(result.state).toBe("not-applicable");
    expect(result.checkId).toBe("IMAGE-008");
  });

  it("returns warning when no images use lazy loading", () => {
    const snapshot = createMockSnapshot({
      images: [
        {
          rawSrc: "a.jpg",
          resolvedSrc: "a.jpg",
          srcset: null,
          sizes: null,
          hasAlt: true,
          altText: "a",
          width: 100,
          height: 100,
          loading: null,
          decoding: null,
          fetchPriority: null,
          referrerPolicy: null,
          elementOrder: 0,
          parentPicture: false,
        },
      ],
    });
    const result = lazyLoading.evaluator(snapshot);
    expect(result.state).toBe("warning");
    expect(result.checkId).toBe("IMAGE-008");
  });

  it("returns passed when some images use lazy loading", () => {
    const snapshot = createMockSnapshot({
      images: [
        {
          rawSrc: "a.jpg",
          resolvedSrc: "a.jpg",
          srcset: null,
          sizes: null,
          hasAlt: true,
          altText: "a",
          width: 100,
          height: 100,
          loading: "lazy",
          decoding: null,
          fetchPriority: null,
          referrerPolicy: null,
          elementOrder: 0,
          parentPicture: false,
        },
        {
          rawSrc: "b.jpg",
          resolvedSrc: "b.jpg",
          srcset: null,
          sizes: null,
          hasAlt: true,
          altText: "b",
          width: 100,
          height: 100,
          loading: null,
          decoding: null,
          fetchPriority: null,
          referrerPolicy: null,
          elementOrder: 1,
          parentPicture: false,
        },
      ],
    });
    const result = lazyLoading.evaluator(snapshot);
    expect(result.state).toBe("passed");
    expect(result.checkId).toBe("IMAGE-008");
  });

  it("returns passed when all images use lazy loading", () => {
    const snapshot = createMockSnapshot({
      images: [
        {
          rawSrc: "a.jpg",
          resolvedSrc: "a.jpg",
          srcset: null,
          sizes: null,
          hasAlt: true,
          altText: "a",
          width: 100,
          height: 100,
          loading: "lazy",
          decoding: null,
          fetchPriority: null,
          referrerPolicy: null,
          elementOrder: 0,
          parentPicture: false,
        },
        {
          rawSrc: "b.jpg",
          resolvedSrc: "b.jpg",
          srcset: null,
          sizes: null,
          hasAlt: true,
          altText: "b",
          width: 100,
          height: 100,
          loading: "lazy",
          decoding: null,
          fetchPriority: null,
          referrerPolicy: null,
          elementOrder: 1,
          parentPicture: false,
        },
      ],
    });
    const result = lazyLoading.evaluator(snapshot);
    expect(result.state).toBe("passed");
    expect(result.checkId).toBe("IMAGE-008");
  });
});

describe("modernFormat (IMAGE-007)", () => {
  it("returns not-applicable when no images exist", () => {
    const snapshot = createMockSnapshot({ images: [] });
    const result = modernFormat.evaluator(snapshot);
    expect(result.state).toBe("not-applicable");
    expect(result.checkId).toBe("IMAGE-007");
  });

  it("returns warning when no images use modern formats", () => {
    const snapshot = createMockSnapshot({
      images: [
        {
          rawSrc: "https://example.com/photo.jpg",
          resolvedSrc: "https://example.com/photo.jpg",
          srcset: null,
          sizes: null,
          hasAlt: true,
          altText: "a",
          width: 100,
          height: 100,
          loading: null,
          decoding: null,
          fetchPriority: null,
          referrerPolicy: null,
          elementOrder: 0,
          parentPicture: false,
        },
        {
          rawSrc: "https://example.com/photo.png",
          resolvedSrc: "https://example.com/photo.png",
          srcset: null,
          sizes: null,
          hasAlt: true,
          altText: "b",
          width: 100,
          height: 100,
          loading: null,
          decoding: null,
          fetchPriority: null,
          referrerPolicy: null,
          elementOrder: 1,
          parentPicture: false,
        },
      ],
    });
    const result = modernFormat.evaluator(snapshot);
    expect(result.state).toBe("warning");
    expect(result.checkId).toBe("IMAGE-007");
  });

  it("returns passed when some images use WebP", () => {
    const snapshot = createMockSnapshot({
      images: [
        {
          rawSrc: "https://example.com/photo.webp",
          resolvedSrc: "https://example.com/photo.webp",
          srcset: null,
          sizes: null,
          hasAlt: true,
          altText: "a",
          width: 100,
          height: 100,
          loading: null,
          decoding: null,
          fetchPriority: null,
          referrerPolicy: null,
          elementOrder: 0,
          parentPicture: false,
        },
        {
          rawSrc: "https://example.com/photo.jpg",
          resolvedSrc: "https://example.com/photo.jpg",
          srcset: null,
          sizes: null,
          hasAlt: true,
          altText: "b",
          width: 100,
          height: 100,
          loading: null,
          decoding: null,
          fetchPriority: null,
          referrerPolicy: null,
          elementOrder: 1,
          parentPicture: false,
        },
      ],
    });
    const result = modernFormat.evaluator(snapshot);
    expect(result.state).toBe("passed");
    expect(result.checkId).toBe("IMAGE-007");
  });

  it("returns passed when some images use AVIF with query param", () => {
    const snapshot = createMockSnapshot({
      images: [
        {
          rawSrc: "https://example.com/photo.avif?w=800",
          resolvedSrc: "https://example.com/photo.avif?w=800",
          srcset: null,
          sizes: null,
          hasAlt: true,
          altText: "a",
          width: 100,
          height: 100,
          loading: null,
          decoding: null,
          fetchPriority: null,
          referrerPolicy: null,
          elementOrder: 0,
          parentPicture: false,
        },
      ],
    });
    const result = modernFormat.evaluator(snapshot);
    expect(result.state).toBe("passed");
    expect(result.checkId).toBe("IMAGE-007");
  });

  it("returns passed when all images are data URIs (no non-data images)", () => {
    const snapshot = createMockSnapshot({
      images: [
        {
          rawSrc: "data:image/png;base64,iVBORw0KGgo=",
          resolvedSrc: "data:image/png;base64,iVBORw0KGgo=",
          srcset: null,
          sizes: null,
          hasAlt: true,
          altText: "a",
          width: 100,
          height: 100,
          loading: null,
          decoding: null,
          fetchPriority: null,
          referrerPolicy: null,
          elementOrder: 0,
          parentPicture: false,
        },
      ],
    });
    const result = modernFormat.evaluator(snapshot);
    expect(result.state).toBe("passed");
    expect(result.checkId).toBe("IMAGE-007");
  });
});
