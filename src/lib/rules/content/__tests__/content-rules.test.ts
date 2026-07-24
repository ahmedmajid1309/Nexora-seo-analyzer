import { describe, it, expect } from "vitest";
import { createMockSnapshot } from "../../__tests__/test-utils";
import { mainElementRule } from "../main-element";
import { textPresentRule } from "../text-present";
import { textAmountRule } from "../text-amount";
import { paragraphsRule } from "../paragraphs";
import { listsRule } from "../lists";
import { semanticLandmarksRule } from "../semantic-landmarks";
import { questionHeadingsRule } from "../question-headings";

describe("CONTENT-001 - mainElementRule", () => {
  it("passes when page has a <main> element", () => {
    const result = mainElementRule.evaluator(createMockSnapshot());
    expect(result.state).toBe("passed");
    expect(result.checkId).toBe("CONTENT-001");
  });

  it("fails when page has no <main> element", () => {
    const result = mainElementRule.evaluator(
      createMockSnapshot({
        content: { ...createMockSnapshot().content, hasMain: false },
      }),
    );
    expect(result.state).toBe("failed");
    expect(result.checkId).toBe("CONTENT-001");
  });
});

describe("CONTENT-002 - textPresentRule", () => {
  it("passes when visible text is present", () => {
    const result = textPresentRule.evaluator(createMockSnapshot());
    expect(result.state).toBe("passed");
    expect(result.checkId).toBe("CONTENT-002");
  });

  it("fails when visible text is empty", () => {
    const result = textPresentRule.evaluator(
      createMockSnapshot({
        content: { ...createMockSnapshot().content, visibleText: "" },
      }),
    );
    expect(result.state).toBe("failed");
    expect(result.checkId).toBe("CONTENT-002");
  });

  it("fails when visible text is only whitespace", () => {
    const result = textPresentRule.evaluator(
      createMockSnapshot({
        content: { ...createMockSnapshot().content, visibleText: "   \n  \t  " },
      }),
    );
    expect(result.state).toBe("failed");
    expect(result.checkId).toBe("CONTENT-002");
  });
});

describe("CONTENT-003 - textAmountRule", () => {
  it("passes when word count is 100 or more", () => {
    const result = textAmountRule.evaluator(
      createMockSnapshot({
        content: { ...createMockSnapshot().content, wordCount: 150 },
      }),
    );
    expect(result.state).toBe("passed");
    expect(result.checkId).toBe("CONTENT-003");
  });

  it("warns when word count is below 100", () => {
    const result = textAmountRule.evaluator(
      createMockSnapshot({
        content: { ...createMockSnapshot().content, wordCount: 42 },
      }),
    );
    expect(result.state).toBe("warning");
    expect(result.checkId).toBe("CONTENT-003");
  });

  it("returns not-applicable when content is truncated", () => {
    const result = textAmountRule.evaluator(
      createMockSnapshot({
        content: { ...createMockSnapshot().content, isTruncated: true, wordCount: 50 },
      }),
    );
    expect(result.state).toBe("not-applicable");
    expect(result.checkId).toBe("CONTENT-003");
  });
});

describe("CONTENT-004 - paragraphsRule", () => {
  it("passes when page has at least one paragraph", () => {
    const result = paragraphsRule.evaluator(
      createMockSnapshot({
        content: { ...createMockSnapshot().content, paragraphCount: 3 },
      }),
    );
    expect(result.state).toBe("passed");
    expect(result.checkId).toBe("CONTENT-004");
  });

  it("returns not-applicable when page has no paragraphs", () => {
    const result = paragraphsRule.evaluator(
      createMockSnapshot({
        content: { ...createMockSnapshot().content, paragraphCount: 0 },
      }),
    );
    expect(result.state).toBe("not-applicable");
    expect(result.checkId).toBe("CONTENT-004");
  });
});

describe("CONTENT-005 - listsRule", () => {
  it("passes when page has at least one list", () => {
    const result = listsRule.evaluator(
      createMockSnapshot({
        content: { ...createMockSnapshot().content, listCount: 2, listItemCount: 5 },
      }),
    );
    expect(result.state).toBe("passed");
    expect(result.checkId).toBe("CONTENT-005");
  });

  it("returns not-applicable when page has no lists", () => {
    const result = listsRule.evaluator(
      createMockSnapshot({
        content: { ...createMockSnapshot().content, listCount: 0 },
      }),
    );
    expect(result.state).toBe("not-applicable");
    expect(result.checkId).toBe("CONTENT-005");
  });
});

describe("CONTENT-006 - semanticLandmarksRule", () => {
  it("passes when at least one semantic landmark is present", () => {
    const result = semanticLandmarksRule.evaluator(
      createMockSnapshot({
        content: { ...createMockSnapshot().content, navCount: 1 },
      }),
    );
    expect(result.state).toBe("passed");
    expect(result.checkId).toBe("CONTENT-006");
  });

  it("passes when multiple landmark types are present", () => {
    const result = semanticLandmarksRule.evaluator(
      createMockSnapshot({
        content: {
          ...createMockSnapshot().content,
          navCount: 1,
          articleCount: 2,
          sectionCount: 3,
          headerCount: 1,
          footerCount: 1,
          asideCount: 0,
        },
      }),
    );
    expect(result.state).toBe("passed");
    expect(result.checkId).toBe("CONTENT-006");
  });

  it("returns not-applicable when no semantic landmarks are found", () => {
    const result = semanticLandmarksRule.evaluator(
      createMockSnapshot({
        content: {
          ...createMockSnapshot().content,
          navCount: 0,
          articleCount: 0,
          sectionCount: 0,
          asideCount: 0,
          headerCount: 0,
          footerCount: 0,
        },
      }),
    );
    expect(result.state).toBe("not-applicable");
    expect(result.checkId).toBe("CONTENT-006");
  });
});

describe("CONTENT-007 - questionHeadingsRule", () => {
  it("passes when page has question-oriented headings", () => {
    const result = questionHeadingsRule.evaluator(
      createMockSnapshot({
        content: { ...createMockSnapshot().content, questionHeadingCount: 2 },
      }),
    );
    expect(result.state).toBe("passed");
    expect(result.checkId).toBe("CONTENT-007");
  });

  it("returns not-applicable when no question-oriented headings are found", () => {
    const result = questionHeadingsRule.evaluator(createMockSnapshot());
    expect(result.state).toBe("not-applicable");
    expect(result.checkId).toBe("CONTENT-007");
  });
});
