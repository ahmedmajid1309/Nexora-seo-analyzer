import { describe, it, expect } from "vitest";
import { titlePresentRule } from "../title-present";
import { titleLengthRule } from "../title-length";
import { titleDuplicateRule } from "../title-duplicate";
import { descriptionPresentRule } from "../description-present";
import { descriptionLengthRule } from "../description-length";
import { descriptionDuplicateRule } from "../description-duplicate";
import { canonicalPresentRule } from "../canonical-present";
import { canonicalValidRule } from "../canonical-valid";
import { canonicalFragmentRule } from "../canonical-fragment";
import { canonicalMultipleRule } from "../canonical-multiple";
import { robotsMetaRule } from "../robots-meta";
import { viewportCharsetRule } from "../viewport-charset";
import { faviconPresentRule } from "../favicon-present";
import { langAttributeRule } from "../lang-attribute";
import { createMockSnapshot } from "../../__tests__/test-utils";

describe("META-001: title-present", () => {
  it("passes when title is present with non-empty text", () => {
    const snapshot = createMockSnapshot();
    const result = titlePresentRule.evaluator(snapshot);
    expect(result.state).toBe("passed");
    expect(result.checkId).toBe("META-001");
  });

  it("fails when title is null", () => {
    const snapshot = createMockSnapshot({
      document: { ...createMockSnapshot().document, title: null },
    });
    const result = titlePresentRule.evaluator(snapshot);
    expect(result.state).toBe("failed");
    expect(result.checkId).toBe("META-001");
  });

  it("fails when title is empty after trimming", () => {
    const snapshot = createMockSnapshot({
      document: { ...createMockSnapshot().document, title: "   " },
    });
    const result = titlePresentRule.evaluator(snapshot);
    expect(result.state).toBe("failed");
    expect(result.checkId).toBe("META-001");
  });
});

describe("META-002: title-length", () => {
  it("passes when title length is between 30 and 60 characters", () => {
    const snapshot = createMockSnapshot({
      document: {
        ...createMockSnapshot().document,
        title: "Optimal Title Length for SEO Success Here",
      },
    });
    const result = titleLengthRule.evaluator(snapshot);
    expect(result.state).toBe("passed");
    expect(result.checkId).toBe("META-002");
  });

  it("warns when title is too short", () => {
    const snapshot = createMockSnapshot({
      document: { ...createMockSnapshot().document, title: "Short" },
    });
    const result = titleLengthRule.evaluator(snapshot);
    expect(result.state).toBe("warning");
    expect(result.checkId).toBe("META-002");
  });

  it("warns when title is too long", () => {
    const snapshot = createMockSnapshot({
      document: {
        ...createMockSnapshot().document,
        title:
          "This is an extremely long title that will definitely exceed the maximum recommended length of sixty characters by a significant margin",
      },
    });
    const result = titleLengthRule.evaluator(snapshot);
    expect(result.state).toBe("warning");
    expect(result.checkId).toBe("META-002");
  });

  it("warns when title is null", () => {
    const snapshot = createMockSnapshot({
      document: { ...createMockSnapshot().document, title: null },
    });
    const result = titleLengthRule.evaluator(snapshot);
    expect(result.state).toBe("warning");
    expect(result.checkId).toBe("META-002");
  });

  it("warns when title is empty", () => {
    const snapshot = createMockSnapshot({
      document: { ...createMockSnapshot().document, title: "" },
    });
    const result = titleLengthRule.evaluator(snapshot);
    expect(result.state).toBe("warning");
    expect(result.checkId).toBe("META-002");
  });
});

describe("META-003: title-duplicate", () => {
  it("passes when exactly one title element exists", () => {
    const snapshot = createMockSnapshot({
      document: { ...createMockSnapshot().document, titleElementCount: 1 },
    });
    const result = titleDuplicateRule.evaluator(snapshot);
    expect(result.state).toBe("passed");
    expect(result.checkId).toBe("META-003");
  });

  it("fails when no title element exists", () => {
    const snapshot = createMockSnapshot({
      document: { ...createMockSnapshot().document, titleElementCount: 0 },
    });
    const result = titleDuplicateRule.evaluator(snapshot);
    expect(result.state).toBe("failed");
    expect(result.checkId).toBe("META-003");
  });

  it("fails when multiple title elements exist", () => {
    const snapshot = createMockSnapshot({
      document: { ...createMockSnapshot().document, titleElementCount: 2 },
    });
    const result = titleDuplicateRule.evaluator(snapshot);
    expect(result.state).toBe("failed");
    expect(result.checkId).toBe("META-003");
  });
});

describe("META-004: description-present", () => {
  it("passes when meta description is present with content", () => {
    const snapshot = createMockSnapshot({
      metadata: [
        {
          name: "description",
          rawValue: "A compelling meta description for the page",
          normalizedValue: "A compelling meta description for the page",
          sourceAttribute: "content",
          elementOrder: 1,
        },
      ],
    });
    const result = descriptionPresentRule.evaluator(snapshot);
    expect(result.state).toBe("passed");
    expect(result.checkId).toBe("META-004");
  });

  it("fails when no meta description tag exists", () => {
    const snapshot = createMockSnapshot({ metadata: [] });
    const result = descriptionPresentRule.evaluator(snapshot);
    expect(result.state).toBe("failed");
    expect(result.checkId).toBe("META-004");
  });

  it("fails when meta description tag has empty content", () => {
    const snapshot = createMockSnapshot({
      metadata: [
        {
          name: "description",
          rawValue: "",
          normalizedValue: "",
          sourceAttribute: "content",
          elementOrder: 1,
        },
      ],
    });
    const result = descriptionPresentRule.evaluator(snapshot);
    expect(result.state).toBe("failed");
    expect(result.checkId).toBe("META-004");
  });
});

describe("META-005: description-length", () => {
  it("passes when description length is between 120 and 160 characters", () => {
    const description = "A".repeat(140);
    const snapshot = createMockSnapshot({
      metadata: [
        {
          name: "description",
          rawValue: description,
          normalizedValue: description,
          sourceAttribute: "content",
          elementOrder: 1,
        },
      ],
    });
    const result = descriptionLengthRule.evaluator(snapshot);
    expect(result.state).toBe("passed");
    expect(result.checkId).toBe("META-005");
  });

  it("warns when description is too short", () => {
    const description = "Short description";
    const snapshot = createMockSnapshot({
      metadata: [
        {
          name: "description",
          rawValue: description,
          normalizedValue: description,
          sourceAttribute: "content",
          elementOrder: 1,
        },
      ],
    });
    const result = descriptionLengthRule.evaluator(snapshot);
    expect(result.state).toBe("warning");
    expect(result.checkId).toBe("META-005");
  });

  it("warns when description is too long", () => {
    const description = "A".repeat(200);
    const snapshot = createMockSnapshot({
      metadata: [
        {
          name: "description",
          rawValue: description,
          normalizedValue: description,
          sourceAttribute: "content",
          elementOrder: 1,
        },
      ],
    });
    const result = descriptionLengthRule.evaluator(snapshot);
    expect(result.state).toBe("warning");
    expect(result.checkId).toBe("META-005");
  });

  it("warns when no description tag exists", () => {
    const snapshot = createMockSnapshot({ metadata: [] });
    const result = descriptionLengthRule.evaluator(snapshot);
    expect(result.state).toBe("warning");
    expect(result.checkId).toBe("META-005");
  });

  it("warns when description is empty", () => {
    const snapshot = createMockSnapshot({
      metadata: [
        {
          name: "description",
          rawValue: "",
          normalizedValue: "",
          sourceAttribute: "content",
          elementOrder: 1,
        },
      ],
    });
    const result = descriptionLengthRule.evaluator(snapshot);
    expect(result.state).toBe("warning");
    expect(result.checkId).toBe("META-005");
  });
});

describe("META-006: description-duplicate", () => {
  it("passes when exactly one meta description tag exists", () => {
    const snapshot = createMockSnapshot({
      metadata: [
        {
          name: "description",
          rawValue: "desc",
          normalizedValue: "desc",
          sourceAttribute: "content",
          elementOrder: 1,
        },
      ],
    });
    const result = descriptionDuplicateRule.evaluator(snapshot);
    expect(result.state).toBe("passed");
    expect(result.checkId).toBe("META-006");
  });

  it("fails when no meta description tag exists", () => {
    const snapshot = createMockSnapshot({ metadata: [] });
    const result = descriptionDuplicateRule.evaluator(snapshot);
    expect(result.state).toBe("failed");
    expect(result.checkId).toBe("META-006");
  });

  it("fails when multiple meta description tags exist", () => {
    const snapshot = createMockSnapshot({
      metadata: [
        {
          name: "description",
          rawValue: "first",
          normalizedValue: "first",
          sourceAttribute: "content",
          elementOrder: 1,
        },
        {
          name: "description",
          rawValue: "second",
          normalizedValue: "second",
          sourceAttribute: "content",
          elementOrder: 2,
        },
      ],
    });
    const result = descriptionDuplicateRule.evaluator(snapshot);
    expect(result.state).toBe("failed");
    expect(result.checkId).toBe("META-006");
  });
});

describe("META-007: canonical-present", () => {
  it("passes when canonical link is present with non-empty href", () => {
    const snapshot = createMockSnapshot({
      document: { ...createMockSnapshot().document, baseHref: "https://example.com/page/" },
    });
    const result = canonicalPresentRule.evaluator(snapshot);
    expect(result.state).toBe("passed");
    expect(result.checkId).toBe("META-007");
  });

  it("fails when no canonical link tag exists", () => {
    const snapshot = createMockSnapshot({
      document: { ...createMockSnapshot().document, baseHref: null },
    });
    const result = canonicalPresentRule.evaluator(snapshot);
    expect(result.state).toBe("failed");
    expect(result.checkId).toBe("META-007");
  });

  it("fails when canonical link has empty href", () => {
    const snapshot = createMockSnapshot({
      document: { ...createMockSnapshot().document, baseHref: "" },
    });
    const result = canonicalPresentRule.evaluator(snapshot);
    expect(result.state).toBe("failed");
    expect(result.checkId).toBe("META-007");
  });
});

describe("META-008: canonical-valid", () => {
  it("passes when canonical URL is a valid absolute URL", () => {
    const snapshot = createMockSnapshot({
      document: { ...createMockSnapshot().document, baseHref: "https://example.com/page/" },
    });
    const result = canonicalValidRule.evaluator(snapshot);
    expect(result.state).toBe("passed");
    expect(result.checkId).toBe("META-008");
  });

  it("warns when no canonical link tag exists", () => {
    const snapshot = createMockSnapshot({
      document: { ...createMockSnapshot().document, baseHref: null },
    });
    const result = canonicalValidRule.evaluator(snapshot);
    expect(result.state).toBe("warning");
    expect(result.checkId).toBe("META-008");
  });

  it("fails when canonical href is empty", () => {
    const snapshot = createMockSnapshot({
      document: { ...createMockSnapshot().document, baseHref: "" },
    });
    const result = canonicalValidRule.evaluator(snapshot);
    expect(result.state).toBe("failed");
    expect(result.checkId).toBe("META-008");
  });

  it("fails when canonical URL is invalid", () => {
    const snapshot = createMockSnapshot({
      document: { ...createMockSnapshot().document, baseHref: "not-a-url" },
    });
    const result = canonicalValidRule.evaluator(snapshot);
    expect(result.state).toBe("failed");
    expect(result.checkId).toBe("META-008");
  });
});

describe("META-009: canonical-fragment", () => {
  it("passes when canonical URL has no fragment", () => {
    const snapshot = createMockSnapshot({
      document: { ...createMockSnapshot().document, baseHref: "https://example.com/page/" },
    });
    const result = canonicalFragmentRule.evaluator(snapshot);
    expect(result.state).toBe("passed");
    expect(result.checkId).toBe("META-009");
  });

  it("fails when canonical URL contains a fragment", () => {
    const snapshot = createMockSnapshot({
      document: { ...createMockSnapshot().document, baseHref: "https://example.com/page/#section" },
    });
    const result = canonicalFragmentRule.evaluator(snapshot);
    expect(result.state).toBe("failed");
    expect(result.checkId).toBe("META-009");
  });

  it("fails when no canonical link tag exists", () => {
    const snapshot = createMockSnapshot({
      document: { ...createMockSnapshot().document, baseHref: null },
    });
    const result = canonicalFragmentRule.evaluator(snapshot);
    expect(result.state).toBe("failed");
    expect(result.checkId).toBe("META-009");
  });

  it("fails when canonical href is empty", () => {
    const snapshot = createMockSnapshot({
      document: { ...createMockSnapshot().document, baseHref: "" },
    });
    const result = canonicalFragmentRule.evaluator(snapshot);
    expect(result.state).toBe("failed");
    expect(result.checkId).toBe("META-009");
  });
});

describe("META-010: canonical-multiple", () => {
  it("passes when a canonical tag is present", () => {
    const snapshot = createMockSnapshot({
      document: { ...createMockSnapshot().document, baseHref: "https://example.com/page/" },
    });
    const result = canonicalMultipleRule.evaluator(snapshot);
    expect(result.state).toBe("passed");
    expect(result.checkId).toBe("META-010");
  });

  it("returns unavailable when no canonical tag exists", () => {
    const snapshot = createMockSnapshot({
      document: { ...createMockSnapshot().document, baseHref: null },
    });
    const result = canonicalMultipleRule.evaluator(snapshot);
    expect(result.state).toBe("unavailable");
    expect(result.checkId).toBe("META-010");
  });
});

describe("META-011: robots-meta", () => {
  it("passes when no robots meta tags exist (default allows indexing)", () => {
    const snapshot = createMockSnapshot({ metadata: [] });
    const result = robotsMetaRule.evaluator(snapshot);
    expect(result.state).toBe("passed");
    expect(result.checkId).toBe("META-011");
  });

  it("passes when robots directives allow indexing", () => {
    const snapshot = createMockSnapshot({
      metadata: [
        {
          name: "robots",
          rawValue: "index, follow",
          normalizedValue: "index, follow",
          sourceAttribute: "content",
          elementOrder: 1,
        },
      ],
    });
    const result = robotsMetaRule.evaluator(snapshot);
    expect(result.state).toBe("passed");
    expect(result.checkId).toBe("META-011");
  });

  it("warns when restrictive directives are found", () => {
    const snapshot = createMockSnapshot({
      metadata: [
        {
          name: "robots",
          rawValue: "noindex, nofollow",
          normalizedValue: "noindex, nofollow",
          sourceAttribute: "content",
          elementOrder: 1,
        },
      ],
    });
    const result = robotsMetaRule.evaluator(snapshot);
    expect(result.state).toBe("warning");
    expect(result.checkId).toBe("META-011");
  });
});

describe("META-012: viewport-charset", () => {
  it("passes when both viewport and charset are present", () => {
    const snapshot = createMockSnapshot({
      document: {
        ...createMockSnapshot().document,
        viewportDeclarations: [{ raw: "width=device-width, initial-scale=1", elementOrder: 1 }],
        charsetDeclarations: [{ raw: "utf-8", normalized: "utf-8", elementOrder: 1 }],
      },
    });
    const result = viewportCharsetRule.evaluator(snapshot);
    expect(result.state).toBe("passed");
    expect(result.checkId).toBe("META-012");
  });

  it("fails when viewport is missing", () => {
    const snapshot = createMockSnapshot({
      document: {
        ...createMockSnapshot().document,
        viewportDeclarations: [],
      },
    });
    const result = viewportCharsetRule.evaluator(snapshot);
    expect(result.state).toBe("failed");
    expect(result.checkId).toBe("META-012");
  });

  it("fails when charset is missing", () => {
    const snapshot = createMockSnapshot({
      document: {
        ...createMockSnapshot().document,
        charsetDeclarations: [],
      },
    });
    const result = viewportCharsetRule.evaluator(snapshot);
    expect(result.state).toBe("failed");
    expect(result.checkId).toBe("META-012");
  });

  it("fails when both viewport and charset are missing", () => {
    const snapshot = createMockSnapshot({
      document: {
        ...createMockSnapshot().document,
        viewportDeclarations: [],
        charsetDeclarations: [],
      },
    });
    const result = viewportCharsetRule.evaluator(snapshot);
    expect(result.state).toBe("failed");
    expect(result.checkId).toBe("META-012");
  });
});

describe("META-013: favicon-present", () => {
  it("passes when a favicon resource is declared", () => {
    const snapshot = createMockSnapshot({
      resources: [
        {
          type: "other",
          rawUrl: "/favicon.ico",
          resolvedUrl: "https://example.com/favicon.ico",
          async: false,
          defer: false,
          isModule: false,
          media: null,
          crossorigin: null,
          hasIntegrity: false,
          loading: null,
          elementOrder: 1,
        },
      ],
    });
    const result = faviconPresentRule.evaluator(snapshot);
    expect(result.state).toBe("passed");
    expect(result.checkId).toBe("META-013");
  });

  it("passes when a resource URL contains 'favicon'", () => {
    const snapshot = createMockSnapshot({
      resources: [
        {
          type: "other",
          rawUrl: "https://example.com/assets/icon-favicon.svg",
          resolvedUrl: null,
          async: false,
          defer: false,
          isModule: false,
          media: null,
          crossorigin: null,
          hasIntegrity: false,
          loading: null,
          elementOrder: 1,
        },
      ],
    });
    const result = faviconPresentRule.evaluator(snapshot);
    expect(result.state).toBe("passed");
    expect(result.checkId).toBe("META-013");
  });

  it("fails when no favicon resource is declared", () => {
    const snapshot = createMockSnapshot({ resources: [] });
    const result = faviconPresentRule.evaluator(snapshot);
    expect(result.state).toBe("failed");
    expect(result.checkId).toBe("META-013");
  });

  it("fails when resources exist but none are favicon-related", () => {
    const snapshot = createMockSnapshot({
      resources: [
        {
          type: "stylesheet",
          rawUrl: "https://example.com/style.css",
          resolvedUrl: "https://example.com/style.css",
          async: false,
          defer: false,
          isModule: false,
          media: null,
          crossorigin: null,
          hasIntegrity: false,
          loading: null,
          elementOrder: 1,
        },
      ],
    });
    const result = faviconPresentRule.evaluator(snapshot);
    expect(result.state).toBe("failed");
    expect(result.checkId).toBe("META-013");
  });
});

describe("META-014: lang-attribute", () => {
  it("passes when lang attribute is present", () => {
    const snapshot = createMockSnapshot({
      document: { ...createMockSnapshot().document, lang: "en" },
    });
    const result = langAttributeRule.evaluator(snapshot);
    expect(result.state).toBe("passed");
    expect(result.checkId).toBe("META-014");
  });

  it("fails when lang attribute is missing", () => {
    const snapshot = createMockSnapshot({
      document: { ...createMockSnapshot().document, lang: null },
    });
    const result = langAttributeRule.evaluator(snapshot);
    expect(result.state).toBe("failed");
    expect(result.checkId).toBe("META-014");
  });

  it("warns when lang attribute is empty", () => {
    const snapshot = createMockSnapshot({
      document: { ...createMockSnapshot().document, lang: "" },
    });
    const result = langAttributeRule.evaluator(snapshot);
    expect(result.state).toBe("warning");
    expect(result.checkId).toBe("META-014");
  });
});
