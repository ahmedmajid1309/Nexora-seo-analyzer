import { describe, it, expect } from "vitest";
import { createMockSnapshot } from "../../__tests__/test-utils";
import { ogTitleRule } from "../og-title";
import { ogDescriptionRule } from "../og-description";
import { ogImageRule } from "../og-image";
import { ogUrlRule } from "../og-url";
import { twitterCardRule } from "../twitter-card";
import { socialTitleConsistencyRule } from "../social-title-consistency";

describe("ogTitleRule", () => {
  it("passes when og:title is present", () => {
    const snapshot = createMockSnapshot({
      social: {
        openGraph: [{ property: "og:title", content: "My OG Title", elementOrder: 0 }],
        twitter: [],
      },
    });
    const result = ogTitleRule.evaluator(snapshot);
    expect(result.state).toBe("passed");
    expect(result.checkId).toBe("SOCIAL-001");
  });

  it("warns when og:title is missing", () => {
    const snapshot = createMockSnapshot({
      social: { openGraph: [], twitter: [] },
    });
    const result = ogTitleRule.evaluator(snapshot);
    expect(result.state).toBe("warning");
    expect(result.checkId).toBe("SOCIAL-001");
  });

  it("warns when openGraph has other properties but not og:title", () => {
    const snapshot = createMockSnapshot({
      social: {
        openGraph: [{ property: "og:description", content: "Desc", elementOrder: 0 }],
        twitter: [],
      },
    });
    const result = ogTitleRule.evaluator(snapshot);
    expect(result.state).toBe("warning");
  });
});

describe("ogDescriptionRule", () => {
  it("passes when og:description is present and non-empty", () => {
    const snapshot = createMockSnapshot({
      social: {
        openGraph: [
          { property: "og:description", content: "A great description", elementOrder: 0 },
        ],
        twitter: [],
      },
    });
    const result = ogDescriptionRule.evaluator(snapshot);
    expect(result.state).toBe("passed");
    expect(result.checkId).toBe("SOCIAL-002");
  });

  it("fails when og:description is missing", () => {
    const snapshot = createMockSnapshot({
      social: { openGraph: [], twitter: [] },
    });
    const result = ogDescriptionRule.evaluator(snapshot);
    expect(result.state).toBe("failed");
    expect(result.checkId).toBe("SOCIAL-002");
  });

  it("fails when og:description is whitespace-only", () => {
    const snapshot = createMockSnapshot({
      social: {
        openGraph: [{ property: "og:description", content: "   ", elementOrder: 0 }],
        twitter: [],
      },
    });
    const result = ogDescriptionRule.evaluator(snapshot);
    expect(result.state).toBe("failed");
  });
});

describe("ogImageRule", () => {
  it("passes when og:image is present", () => {
    const snapshot = createMockSnapshot({
      social: {
        openGraph: [
          { property: "og:image", content: "https://example.com/image.jpg", elementOrder: 0 },
        ],
        twitter: [],
      },
    });
    const result = ogImageRule.evaluator(snapshot);
    expect(result.state).toBe("passed");
    expect(result.checkId).toBe("SOCIAL-003");
  });

  it("fails when og:image is missing", () => {
    const snapshot = createMockSnapshot({
      social: { openGraph: [], twitter: [] },
    });
    const result = ogImageRule.evaluator(snapshot);
    expect(result.state).toBe("failed");
    expect(result.checkId).toBe("SOCIAL-003");
  });

  it("fails when other og properties exist but not og:image", () => {
    const snapshot = createMockSnapshot({
      social: {
        openGraph: [{ property: "og:title", content: "Title", elementOrder: 0 }],
        twitter: [],
      },
    });
    const result = ogImageRule.evaluator(snapshot);
    expect(result.state).toBe("failed");
  });
});

describe("ogUrlRule", () => {
  it("returns not-applicable when og:url is missing", () => {
    const snapshot = createMockSnapshot({
      social: { openGraph: [], twitter: [] },
    });
    const result = ogUrlRule.evaluator(snapshot);
    expect(result.state).toBe("not-applicable");
    expect(result.checkId).toBe("SOCIAL-004");
  });

  it("passes when og:url is present and no canonical exists", () => {
    const snapshot = createMockSnapshot({
      social: {
        openGraph: [{ property: "og:url", content: "https://example.com/page", elementOrder: 0 }],
        twitter: [],
      },
      document: { ...createMockSnapshot().document, baseHref: null },
    });
    const result = ogUrlRule.evaluator(snapshot);
    expect(result.state).toBe("passed");
    expect(result.checkId).toBe("SOCIAL-004");
  });

  it("passes when og:url matches canonical", () => {
    const snapshot = createMockSnapshot({
      social: {
        openGraph: [{ property: "og:url", content: "https://example.com/page", elementOrder: 0 }],
        twitter: [],
      },
      document: {
        ...createMockSnapshot().document,
        baseHref: "https://example.com/page",
      },
    });
    const result = ogUrlRule.evaluator(snapshot);
    expect(result.state).toBe("passed");
  });

  it("warns when og:url differs from canonical", () => {
    const snapshot = createMockSnapshot({
      social: {
        openGraph: [{ property: "og:url", content: "https://example.com/other", elementOrder: 0 }],
        twitter: [],
      },
      document: {
        ...createMockSnapshot().document,
        baseHref: "https://example.com/page",
      },
    });
    const result = ogUrlRule.evaluator(snapshot);
    expect(result.state).toBe("warning");
  });
});

describe("twitterCardRule", () => {
  it("passes when twitter:card is present", () => {
    const snapshot = createMockSnapshot({
      social: {
        openGraph: [],
        twitter: [{ name: "twitter:card", content: "summary_large_image", elementOrder: 0 }],
      },
    });
    const result = twitterCardRule.evaluator(snapshot);
    expect(result.state).toBe("passed");
    expect(result.checkId).toBe("SOCIAL-005");
  });

  it("fails when twitter:card is missing", () => {
    const snapshot = createMockSnapshot({
      social: { openGraph: [], twitter: [] },
    });
    const result = twitterCardRule.evaluator(snapshot);
    expect(result.state).toBe("failed");
    expect(result.checkId).toBe("SOCIAL-005");
  });

  it("fails when only other twitter properties exist", () => {
    const snapshot = createMockSnapshot({
      social: {
        openGraph: [],
        twitter: [{ name: "twitter:title", content: "My Title", elementOrder: 0 }],
      },
    });
    const result = twitterCardRule.evaluator(snapshot);
    expect(result.state).toBe("failed");
  });
});

describe("socialTitleConsistencyRule", () => {
  it("returns not-applicable when no social tags are defined", () => {
    const snapshot = createMockSnapshot({
      social: { openGraph: [], twitter: [] },
    });
    const result = socialTitleConsistencyRule.evaluator(snapshot);
    expect(result.state).toBe("not-applicable");
    expect(result.checkId).toBe("SOCIAL-006");
  });

  it("passes when all social tags match the page metadata", () => {
    const snapshot = createMockSnapshot({
      document: { ...createMockSnapshot().document, title: "My Page" },
      metadata: [
        {
          name: "description",
          rawValue: "My description",
          normalizedValue: "My description",
          sourceAttribute: "name",
          elementOrder: 0,
        },
      ],
      social: {
        openGraph: [
          { property: "og:title", content: "My Page", elementOrder: 0 },
          {
            property: "og:description",
            content: "My description",
            elementOrder: 1,
          },
        ],
        twitter: [
          { name: "twitter:title", content: "My Page", elementOrder: 0 },
          {
            name: "twitter:description",
            content: "My description",
            elementOrder: 1,
          },
        ],
      },
    });
    const result = socialTitleConsistencyRule.evaluator(snapshot);
    expect(result.state).toBe("passed");
    expect(result.checkId).toBe("SOCIAL-006");
  });

  it("warns when og:title differs from page title", () => {
    const snapshot = createMockSnapshot({
      document: { ...createMockSnapshot().document, title: "Page Title" },
      social: {
        openGraph: [{ property: "og:title", content: "Different Title", elementOrder: 0 }],
        twitter: [],
      },
    });
    const result = socialTitleConsistencyRule.evaluator(snapshot);
    expect(result.state).toBe("warning");
    expect(result.evidence.summary).toContain("og:title differs from <title>");
  });

  it("warns when twitter:description differs from meta description", () => {
    const snapshot = createMockSnapshot({
      document: { ...createMockSnapshot().document, title: "Page Title" },
      metadata: [
        {
          name: "description",
          rawValue: "Meta description",
          normalizedValue: "Meta description",
          sourceAttribute: "name",
          elementOrder: 0,
        },
      ],
      social: {
        openGraph: [],
        twitter: [
          {
            name: "twitter:description",
            content: "Twitter description",
            elementOrder: 0,
          },
        ],
      },
    });
    const result = socialTitleConsistencyRule.evaluator(snapshot);
    expect(result.state).toBe("warning");
    expect(result.evidence.summary).toContain("twitter:description differs from meta description");
  });
});
