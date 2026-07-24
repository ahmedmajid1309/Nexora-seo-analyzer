import { describe, it, expect } from "vitest";
import { createMockSnapshot } from "../../__tests__/test-utils";
import { malformedHref } from "../malformed-href";
import { emptyHref } from "../empty-href";
import { javascriptUrl } from "../javascript-url";
import { noopenerMissing } from "../noopener-missing";
import { genericAnchorText } from "../generic-anchor-text";
import { internalHttpLinks } from "../internal-http-links";
import { excessiveLinks } from "../excessive-links";
import { linkAccessible } from "../link-accessible";

const makeLink = (overrides: Record<string, unknown> = {}) => ({
  rawHref: "https://example.com/page",
  resolvedUrl: "https://example.com/page",
  protocol: "https:",
  hostname: "example.com",
  isSameOrigin: true,
  isSameHost: true,
  fragment: null,
  anchorText: "descriptive link",
  title: null,
  relTokens: [],
  target: null,
  hasDownload: false,
  hreflang: null,
  media: null,
  elementOrder: 0,
  classification: "https" as const,
  ...overrides,
});

describe("malformedHref (LINK-001)", () => {
  it("passes when all links have valid href attributes", () => {
    const result = malformedHref.evaluator(
      createMockSnapshot({ links: [makeLink(), makeLink({ rawHref: "/about" })] }),
    );
    expect(result.state).toBe("passed");
    expect(result.checkId).toBe("LINK-001");
  });

  it("fails when malformed links exist", () => {
    const result = malformedHref.evaluator(
      createMockSnapshot({
        links: [
          makeLink(),
          makeLink({ rawHref: " :invalid", classification: "malformed" as const }),
        ],
      }),
    );
    expect(result.state).toBe("failed");
    expect(result.checkId).toBe("LINK-001");
  });

  it("returns not-applicable when no links exist", () => {
    const result = malformedHref.evaluator(createMockSnapshot({ links: [] }));
    expect(result.state).toBe("not-applicable");
    expect(result.checkId).toBe("LINK-001");
  });
});

describe("emptyHref (LINK-002)", () => {
  it("passes when no links have empty href", () => {
    const result = emptyHref.evaluator(
      createMockSnapshot({ links: [makeLink(), makeLink({ rawHref: "/contact" })] }),
    );
    expect(result.state).toBe("passed");
    expect(result.checkId).toBe("LINK-002");
  });

  it("fails when empty href links exist", () => {
    const result = emptyHref.evaluator(
      createMockSnapshot({
        links: [
          makeLink(),
          makeLink({ rawHref: "", classification: "empty" as const }),
          makeLink({ rawHref: "#", classification: "empty" as const }),
        ],
      }),
    );
    expect(result.state).toBe("failed");
    expect(result.checkId).toBe("LINK-002");
  });

  it("returns not-applicable when no links exist", () => {
    const result = emptyHref.evaluator(createMockSnapshot({ links: [] }));
    expect(result.state).toBe("not-applicable");
    expect(result.checkId).toBe("LINK-002");
  });
});

describe("javascriptUrl (LINK-003)", () => {
  it("passes when no javascript: protocol links exist", () => {
    const result = javascriptUrl.evaluator(
      createMockSnapshot({ links: [makeLink(), makeLink({ rawHref: "/about" })] }),
    );
    expect(result.state).toBe("passed");
    expect(result.checkId).toBe("LINK-003");
  });

  it("fails when javascript: protocol links exist", () => {
    const result = javascriptUrl.evaluator(
      createMockSnapshot({
        links: [
          makeLink(),
          makeLink({ rawHref: "javascript:void(0)", classification: "javascript" as const }),
        ],
      }),
    );
    expect(result.state).toBe("failed");
    expect(result.checkId).toBe("LINK-003");
  });

  it("returns not-applicable when no links exist", () => {
    const result = javascriptUrl.evaluator(createMockSnapshot({ links: [] }));
    expect(result.state).toBe("not-applicable");
    expect(result.checkId).toBe("LINK-003");
  });
});

describe("noopenerMissing (LINK-004)", () => {
  it("passes when target=_blank links include rel=noopener", () => {
    const result = noopenerMissing.evaluator(
      createMockSnapshot({
        links: [makeLink({ target: "_blank", relTokens: ["noopener", "noreferrer"] })],
      }),
    );
    expect(result.state).toBe("passed");
    expect(result.checkId).toBe("LINK-004");
  });

  it("fails when target=_blank links are missing noopener and noreferrer", () => {
    const result = noopenerMissing.evaluator(
      createMockSnapshot({
        links: [makeLink({ target: "_blank", relTokens: [] })],
      }),
    );
    expect(result.state).toBe("failed");
    expect(result.checkId).toBe("LINK-004");
  });

  it("returns not-applicable when no target=_blank links exist", () => {
    const result = noopenerMissing.evaluator(createMockSnapshot({ links: [makeLink()] }));
    expect(result.state).toBe("not-applicable");
    expect(result.checkId).toBe("LINK-004");
  });

  it("returns not-applicable when no links exist", () => {
    const result = noopenerMissing.evaluator(createMockSnapshot({ links: [] }));
    expect(result.state).toBe("not-applicable");
    expect(result.checkId).toBe("LINK-004");
  });
});

describe("genericAnchorText (LINK-005)", () => {
  it("passes when all links use descriptive anchor text", () => {
    const result = genericAnchorText.evaluator(
      createMockSnapshot({
        links: [
          makeLink({ anchorText: "SEO best practices guide" }),
          makeLink({ anchorText: "contact us today" }),
        ],
      }),
    );
    expect(result.state).toBe("passed");
    expect(result.checkId).toBe("LINK-005");
  });

  it("warns when generic anchor text like 'click here' is used", () => {
    const result = genericAnchorText.evaluator(
      createMockSnapshot({
        links: [
          makeLink({ anchorText: "click here" }),
          makeLink({ anchorText: "learn more about SEO" }),
        ],
      }),
    );
    expect(result.state).toBe("warning");
    expect(result.checkId).toBe("LINK-005");
  });

  it("returns not-applicable when no links exist", () => {
    const result = genericAnchorText.evaluator(createMockSnapshot({ links: [] }));
    expect(result.state).toBe("not-applicable");
    expect(result.checkId).toBe("LINK-005");
  });
});

describe("internalHttpLinks (LINK-006)", () => {
  it("passes when HTTPS page has no internal HTTP links", () => {
    const result = internalHttpLinks.evaluator(
      createMockSnapshot({
        links: [makeLink(), makeLink({ rawHref: "https://example.com/about" })],
      }),
    );
    expect(result.state).toBe("passed");
    expect(result.checkId).toBe("LINK-006");
  });

  it("fails when HTTPS page has internal HTTP links", () => {
    const result = internalHttpLinks.evaluator(
      createMockSnapshot({
        links: [
          makeLink({
            rawHref: "http://example.com/page",
            classification: "http" as const,
            isSameOrigin: true,
          }),
        ],
      }),
    );
    expect(result.state).toBe("failed");
    expect(result.checkId).toBe("LINK-006");
  });

  it("returns not-applicable when page is not served over HTTPS", () => {
    const result = internalHttpLinks.evaluator(
      createMockSnapshot({
        requestedUrl: "http://example.com/page",
        finalUrl: "http://example.com/page",
        links: [makeLink({ rawHref: "http://example.com/about" })],
      }),
    );
    expect(result.state).toBe("not-applicable");
    expect(result.checkId).toBe("LINK-006");
  });

  it("returns not-applicable when no links exist", () => {
    const result = internalHttpLinks.evaluator(createMockSnapshot({ links: [] }));
    expect(result.state).toBe("not-applicable");
    expect(result.checkId).toBe("LINK-006");
  });
});

describe("excessiveLinks (LINK-007)", () => {
  it("passes when number of links is within acceptable range", () => {
    const result = excessiveLinks.evaluator(
      createMockSnapshot({ links: Array.from({ length: 10 }, () => makeLink()) }),
    );
    expect(result.state).toBe("passed");
    expect(result.checkId).toBe("LINK-007");
  });

  it("warns when number of links exceeds threshold of 150", () => {
    const result = excessiveLinks.evaluator(
      createMockSnapshot({ links: Array.from({ length: 200 }, () => makeLink()) }),
    );
    expect(result.state).toBe("warning");
    expect(result.checkId).toBe("LINK-007");
  });

  it("returns not-applicable when no links exist", () => {
    const result = excessiveLinks.evaluator(createMockSnapshot({ links: [] }));
    expect(result.state).toBe("not-applicable");
    expect(result.checkId).toBe("LINK-007");
  });
});

describe("linkAccessible (LINK-008)", () => {
  it("passes when all links have accessible names", () => {
    const result = linkAccessible.evaluator(
      createMockSnapshot({
        accessibility: {
          documentLanguage: "en",
          imageAltPresent: { total: 0, withAlt: 0, withoutAlt: 0 },
          formLabelRelationships: { total: 0, withLabel: 0, withoutLabel: 0 },
          inputAccessibleNames: { total: 0, withName: 0, withoutName: 0 },
          buttonTextSignals: { total: 0, withText: 0, withoutText: 0 },
          linkAccessibleNames: { total: 5, withName: 5, withoutName: 0 },
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
      }),
    );
    expect(result.state).toBe("passed");
    expect(result.checkId).toBe("LINK-008");
  });

  it("fails when some links lack accessible names", () => {
    const result = linkAccessible.evaluator(
      createMockSnapshot({
        accessibility: {
          documentLanguage: "en",
          imageAltPresent: { total: 0, withAlt: 0, withoutAlt: 0 },
          formLabelRelationships: { total: 0, withLabel: 0, withoutLabel: 0 },
          inputAccessibleNames: { total: 0, withName: 0, withoutName: 0 },
          buttonTextSignals: { total: 0, withText: 0, withoutText: 0 },
          linkAccessibleNames: { total: 5, withName: 3, withoutName: 2 },
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
      }),
    );
    expect(result.state).toBe("failed");
    expect(result.checkId).toBe("LINK-008");
  });

  it("returns not-applicable when no links on page", () => {
    const result = linkAccessible.evaluator(
      createMockSnapshot({
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
      }),
    );
    expect(result.state).toBe("not-applicable");
    expect(result.checkId).toBe("LINK-008");
  });
});
