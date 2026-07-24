import { describe, it, expect } from "vitest";
import { createMockSnapshot } from "../../__tests__/test-utils";
import { documentLanguageRule } from "../document-language";
import { imageAltPresentRule } from "../image-alt-present";
import { buttonNamesRule } from "../button-names";
import { linkNamesRule } from "../link-names";
import { formLabelsRule } from "../form-labels";
import { duplicateIdsRule } from "../duplicate-ids";
import { iframeTitlesRule } from "../iframe-titles";
import { landmarkElementsRule } from "../landmark-elements";
import { mediaCaptionsRule } from "../media-captions";
import { skipLinksRule } from "../skip-links";
import { tableHeadersRule } from "../table-headers";
import { tabindexValuesRule } from "../tabindex-values";
import { zoomRestrictionRule } from "../zoom-restriction";

describe("documentLanguageRule (A11Y-001)", () => {
  it("passes when document has a lang attribute", () => {
    const snapshot = createMockSnapshot({
      document: { ...createMockSnapshot().document, lang: "en", declaredLanguage: "en" },
    });
    const result = documentLanguageRule.evaluator(snapshot);
    expect(result.state).toBe("passed");
    expect(result.checkId).toBe("A11Y-001");
  });

  it("fails when document has no lang attribute", () => {
    const snapshot = createMockSnapshot({
      document: { ...createMockSnapshot().document, lang: "", declaredLanguage: null },
    });
    const result = documentLanguageRule.evaluator(snapshot);
    expect(result.state).toBe("failed");
    expect(result.checkId).toBe("A11Y-001");
  });

  it("fails when lang attribute is whitespace only", () => {
    const snapshot = createMockSnapshot({
      document: { ...createMockSnapshot().document, lang: "   ", declaredLanguage: "   " },
    });
    const result = documentLanguageRule.evaluator(snapshot);
    expect(result.state).toBe("failed");
    expect(result.checkId).toBe("A11Y-001");
  });
});

describe("imageAltPresentRule (A11Y-002)", () => {
  it("passes when all images have alt text", () => {
    const snapshot = createMockSnapshot({
      accessibility: {
        ...createMockSnapshot().accessibility,
        imageAltPresent: { total: 3, withAlt: 3, withoutAlt: 0 },
      },
    });
    const result = imageAltPresentRule.evaluator(snapshot);
    expect(result.state).toBe("passed");
    expect(result.checkId).toBe("A11Y-002");
  });

  it("fails when some images are missing alt text", () => {
    const snapshot = createMockSnapshot({
      accessibility: {
        ...createMockSnapshot().accessibility,
        imageAltPresent: { total: 3, withAlt: 1, withoutAlt: 2 },
      },
    });
    const result = imageAltPresentRule.evaluator(snapshot);
    expect(result.state).toBe("failed");
    expect(result.checkId).toBe("A11Y-002");
  });

  it("passes when there are no images", () => {
    const snapshot = createMockSnapshot({
      accessibility: {
        ...createMockSnapshot().accessibility,
        imageAltPresent: { total: 0, withAlt: 0, withoutAlt: 0 },
      },
    });
    const result = imageAltPresentRule.evaluator(snapshot);
    expect(result.state).toBe("passed");
    expect(result.checkId).toBe("A11Y-002");
  });
});

describe("buttonNamesRule (A11Y-004)", () => {
  it("passes when all buttons have accessible names", () => {
    const snapshot = createMockSnapshot({
      accessibility: {
        ...createMockSnapshot().accessibility,
        buttonTextSignals: { total: 2, withText: 2, withoutText: 0 },
      },
    });
    const result = buttonNamesRule.evaluator(snapshot);
    expect(result.state).toBe("passed");
    expect(result.checkId).toBe("A11Y-004");
  });

  it("fails when some buttons are missing accessible names", () => {
    const snapshot = createMockSnapshot({
      accessibility: {
        ...createMockSnapshot().accessibility,
        buttonTextSignals: { total: 4, withText: 1, withoutText: 3 },
      },
    });
    const result = buttonNamesRule.evaluator(snapshot);
    expect(result.state).toBe("failed");
    expect(result.checkId).toBe("A11Y-004");
  });

  it("passes when there are no buttons", () => {
    const snapshot = createMockSnapshot({
      accessibility: {
        ...createMockSnapshot().accessibility,
        buttonTextSignals: { total: 0, withText: 0, withoutText: 0 },
      },
    });
    const result = buttonNamesRule.evaluator(snapshot);
    expect(result.state).toBe("passed");
    expect(result.checkId).toBe("A11Y-004");
  });
});

describe("linkNamesRule (A11Y-005)", () => {
  it("passes when all links have accessible names", () => {
    const snapshot = createMockSnapshot({
      accessibility: {
        ...createMockSnapshot().accessibility,
        linkAccessibleNames: { total: 5, withName: 5, withoutName: 0 },
      },
    });
    const result = linkNamesRule.evaluator(snapshot);
    expect(result.state).toBe("passed");
    expect(result.checkId).toBe("A11Y-005");
  });

  it("fails when some links are missing accessible names", () => {
    const snapshot = createMockSnapshot({
      accessibility: {
        ...createMockSnapshot().accessibility,
        linkAccessibleNames: { total: 5, withName: 3, withoutName: 2 },
      },
    });
    const result = linkNamesRule.evaluator(snapshot);
    expect(result.state).toBe("failed");
    expect(result.checkId).toBe("A11Y-005");
  });

  it("passes when there are no links", () => {
    const snapshot = createMockSnapshot({
      accessibility: {
        ...createMockSnapshot().accessibility,
        linkAccessibleNames: { total: 0, withName: 0, withoutName: 0 },
      },
    });
    const result = linkNamesRule.evaluator(snapshot);
    expect(result.state).toBe("passed");
    expect(result.checkId).toBe("A11Y-005");
  });
});

describe("formLabelsRule (A11Y-003)", () => {
  it("passes when all form inputs have associated labels", () => {
    const snapshot = createMockSnapshot({
      accessibility: {
        ...createMockSnapshot().accessibility,
        formLabelRelationships: { total: 3, withLabel: 3, withoutLabel: 0 },
      },
    });
    const result = formLabelsRule.evaluator(snapshot);
    expect(result.state).toBe("passed");
    expect(result.checkId).toBe("A11Y-003");
  });

  it("fails when some form inputs are missing labels", () => {
    const snapshot = createMockSnapshot({
      accessibility: {
        ...createMockSnapshot().accessibility,
        formLabelRelationships: { total: 3, withLabel: 1, withoutLabel: 2 },
      },
    });
    const result = formLabelsRule.evaluator(snapshot);
    expect(result.state).toBe("failed");
    expect(result.checkId).toBe("A11Y-003");
  });

  it("passes when there are no form inputs", () => {
    const snapshot = createMockSnapshot({
      accessibility: {
        ...createMockSnapshot().accessibility,
        formLabelRelationships: { total: 0, withLabel: 0, withoutLabel: 0 },
      },
    });
    const result = formLabelsRule.evaluator(snapshot);
    expect(result.state).toBe("passed");
    expect(result.checkId).toBe("A11Y-003");
  });
});

describe("duplicateIdsRule (A11Y-006)", () => {
  it("passes when no duplicate IDs are found", () => {
    const snapshot = createMockSnapshot({
      accessibility: {
        ...createMockSnapshot().accessibility,
        duplicateIds: [],
      },
    });
    const result = duplicateIdsRule.evaluator(snapshot);
    expect(result.state).toBe("passed");
    expect(result.checkId).toBe("A11Y-006");
  });

  it("fails when duplicate IDs are found", () => {
    const snapshot = createMockSnapshot({
      accessibility: {
        ...createMockSnapshot().accessibility,
        duplicateIds: ["header", "nav"],
      },
    });
    const result = duplicateIdsRule.evaluator(snapshot);
    expect(result.state).toBe("failed");
    expect(result.checkId).toBe("A11Y-006");
  });

  it("fails with single duplicate ID", () => {
    const snapshot = createMockSnapshot({
      accessibility: {
        ...createMockSnapshot().accessibility,
        duplicateIds: ["main-content"],
      },
    });
    const result = duplicateIdsRule.evaluator(snapshot);
    expect(result.state).toBe("failed");
    expect(result.checkId).toBe("A11Y-006");
  });
});

describe("iframeTitlesRule (A11Y-007)", () => {
  it("returns not-applicable when no iframes are present", () => {
    const snapshot = createMockSnapshot({
      resources: [],
    });
    const result = iframeTitlesRule.evaluator(snapshot);
    expect(result.state).toBe("not-applicable");
    expect(result.checkId).toBe("A11Y-007");
  });

  it("passes when all iframes have title attributes", () => {
    const snapshot = createMockSnapshot({
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
      accessibility: {
        ...createMockSnapshot().accessibility,
        iframeTitles: { total: 2, withTitle: 2, withoutTitle: 0 },
      },
    });
    const result = iframeTitlesRule.evaluator(snapshot);
    expect(result.state).toBe("passed");
    expect(result.checkId).toBe("A11Y-007");
  });

  it("fails when some iframes are missing title attributes", () => {
    const snapshot = createMockSnapshot({
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
      accessibility: {
        ...createMockSnapshot().accessibility,
        iframeTitles: { total: 2, withTitle: 0, withoutTitle: 2 },
      },
    });
    const result = iframeTitlesRule.evaluator(snapshot);
    expect(result.state).toBe("failed");
    expect(result.checkId).toBe("A11Y-007");
  });
});

describe("landmarkElementsRule (A11Y-013)", () => {
  it("passes when all core landmarks are present", () => {
    const snapshot = createMockSnapshot({
      accessibility: {
        ...createMockSnapshot().accessibility,
        landmarkElements: { nav: 1, header: 1, footer: 1, aside: 0, main: 1, section: 2 },
      },
    });
    const result = landmarkElementsRule.evaluator(snapshot);
    expect(result.state).toBe("passed");
    expect(result.checkId).toBe("A11Y-013");
  });

  it("returns warning when some core landmarks are missing", () => {
    const snapshot = createMockSnapshot({
      accessibility: {
        ...createMockSnapshot().accessibility,
        landmarkElements: { nav: 0, header: 1, footer: 0, aside: 0, main: 1, section: 0 },
      },
    });
    const result = landmarkElementsRule.evaluator(snapshot);
    expect(result.state).toBe("warning");
    expect(result.checkId).toBe("A11Y-013");
  });

  it("returns warning when all core landmarks are missing", () => {
    const snapshot = createMockSnapshot({
      accessibility: {
        ...createMockSnapshot().accessibility,
        landmarkElements: { nav: 0, header: 0, footer: 0, aside: 0, main: 0, section: 0 },
      },
    });
    const result = landmarkElementsRule.evaluator(snapshot);
    expect(result.state).toBe("warning");
    expect(result.checkId).toBe("A11Y-013");
  });
});

describe("mediaCaptionsRule (A11Y-011)", () => {
  it("returns not-applicable when no media elements are present", () => {
    const snapshot = createMockSnapshot({
      resources: [],
    });
    const result = mediaCaptionsRule.evaluator(snapshot);
    expect(result.state).toBe("not-applicable");
    expect(result.checkId).toBe("A11Y-011");
  });

  it("passes when all media elements have caption tracks", () => {
    const snapshot = createMockSnapshot({
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
      accessibility: {
        ...createMockSnapshot().accessibility,
        mediaCaptions: { total: 1, withTrack: 1, withoutTrack: 0 },
      },
    });
    const result = mediaCaptionsRule.evaluator(snapshot);
    expect(result.state).toBe("passed");
    expect(result.checkId).toBe("A11Y-011");
  });

  it("fails when some media elements are missing caption tracks", () => {
    const snapshot = createMockSnapshot({
      resources: [
        {
          type: "audio",
          rawUrl: "https://example.com/audio.mp3",
          resolvedUrl: "https://example.com/audio.mp3",
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
      accessibility: {
        ...createMockSnapshot().accessibility,
        mediaCaptions: { total: 2, withTrack: 0, withoutTrack: 2 },
      },
    });
    const result = mediaCaptionsRule.evaluator(snapshot);
    expect(result.state).toBe("failed");
    expect(result.checkId).toBe("A11Y-011");
  });
});

describe("skipLinksRule (A11Y-012)", () => {
  it("passes when skip link candidates are found", () => {
    const snapshot = createMockSnapshot({
      accessibility: {
        ...createMockSnapshot().accessibility,
        skipLinkCandidates: [{ href: "#main-content", text: "Skip to content", elementOrder: 0 }],
      },
    });
    const result = skipLinksRule.evaluator(snapshot);
    expect(result.state).toBe("passed");
    expect(result.checkId).toBe("A11Y-012");
  });

  it("returns warning when no skip link candidates are detected", () => {
    const snapshot = createMockSnapshot({
      accessibility: {
        ...createMockSnapshot().accessibility,
        skipLinkCandidates: [],
      },
    });
    const result = skipLinksRule.evaluator(snapshot);
    expect(result.state).toBe("warning");
    expect(result.checkId).toBe("A11Y-012");
  });

  it("passes with multiple skip link candidates", () => {
    const snapshot = createMockSnapshot({
      accessibility: {
        ...createMockSnapshot().accessibility,
        skipLinkCandidates: [
          { href: "#skip", text: "Skip nav", elementOrder: 0 },
          { href: "#main", text: "Skip to main", elementOrder: 1 },
          { href: "#content", text: "Skip to content", elementOrder: 2 },
        ],
      },
    });
    const result = skipLinksRule.evaluator(snapshot);
    expect(result.state).toBe("passed");
    expect(result.checkId).toBe("A11Y-012");
  });
});

describe("tableHeadersRule (A11Y-008)", () => {
  it("returns not-applicable when no tables are present", () => {
    const snapshot = createMockSnapshot({
      content: { ...createMockSnapshot().content, tableCount: 0 },
    });
    const result = tableHeadersRule.evaluator(snapshot);
    expect(result.state).toBe("not-applicable");
    expect(result.checkId).toBe("A11Y-008");
  });

  it("passes when tables have header cells", () => {
    const snapshot = createMockSnapshot({
      content: { ...createMockSnapshot().content, tableCount: 2 },
      accessibility: {
        ...createMockSnapshot().accessibility,
        tableHeaderCells: { totalTh: 4 },
      },
    });
    const result = tableHeadersRule.evaluator(snapshot);
    expect(result.state).toBe("passed");
    expect(result.checkId).toBe("A11Y-008");
  });

  it("returns warning when tables are present but no th cells found", () => {
    const snapshot = createMockSnapshot({
      content: { ...createMockSnapshot().content, tableCount: 1 },
      accessibility: {
        ...createMockSnapshot().accessibility,
        tableHeaderCells: { totalTh: 0 },
      },
    });
    const result = tableHeadersRule.evaluator(snapshot);
    expect(result.state).toBe("warning");
    expect(result.checkId).toBe("A11Y-008");
  });
});

describe("tabindexValuesRule (A11Y-009)", () => {
  it("passes when no positive tabindex values exist", () => {
    const snapshot = createMockSnapshot({
      accessibility: {
        ...createMockSnapshot().accessibility,
        tabindexValues: [],
      },
    });
    const result = tabindexValuesRule.evaluator(snapshot);
    expect(result.state).toBe("passed");
    expect(result.checkId).toBe("A11Y-009");
  });

  it("returns warning when positive tabindex values are found", () => {
    const snapshot = createMockSnapshot({
      accessibility: {
        ...createMockSnapshot().accessibility,
        tabindexValues: [{ value: 5, elementOrder: 0 }],
      },
    });
    const result = tabindexValuesRule.evaluator(snapshot);
    expect(result.state).toBe("warning");
    expect(result.checkId).toBe("A11Y-009");
  });

  it("passes when only zero or negative tabindex values exist", () => {
    const snapshot = createMockSnapshot({
      accessibility: {
        ...createMockSnapshot().accessibility,
        tabindexValues: [
          { value: 0, elementOrder: 0 },
          { value: -1, elementOrder: 1 },
        ],
      },
    });
    const result = tabindexValuesRule.evaluator(snapshot);
    expect(result.state).toBe("passed");
    expect(result.checkId).toBe("A11Y-009");
  });
});

describe("zoomRestrictionRule (A11Y-010)", () => {
  it("passes when viewport zoom is not restricted", () => {
    const snapshot = createMockSnapshot({
      accessibility: {
        ...createMockSnapshot().accessibility,
        viewportZoomRestricted: false,
      },
    });
    const result = zoomRestrictionRule.evaluator(snapshot);
    expect(result.state).toBe("passed");
    expect(result.checkId).toBe("A11Y-010");
  });

  it("fails when viewport zoom is restricted", () => {
    const snapshot = createMockSnapshot({
      accessibility: {
        ...createMockSnapshot().accessibility,
        viewportZoomRestricted: true,
      },
    });
    const result = zoomRestrictionRule.evaluator(snapshot);
    expect(result.state).toBe("failed");
    expect(result.checkId).toBe("A11Y-010");
  });
});
