import { describe, it, expect } from "vitest";
import { createMockSnapshot } from "../../__tests__/test-utils";
import { h1PresentRule } from "../h1-present";
import { h1MultipleRule } from "../h1-multiple";
import { h1EmptyRule } from "../h1-empty";
import { headingHierarchyRule } from "../heading-hierarchy";
import { headingLongRule } from "../heading-long";
import { headingRepeatedRule } from "../heading-repeated";
import { headingMeaningfulRule } from "../heading-meaningful";
import { headingSummaryRule } from "../heading-summary";

describe("HEAD-001: h1PresentRule", () => {
  it("passes when a non-empty H1 is present", () => {
    const snapshot = createMockSnapshot({
      headings: [
        {
          level: 1,
          text: "Main Title",
          isEmpty: false,
          isHidden: false,
          elementId: null,
          selector: undefined,
          order: 0,
          rawTextLength: 10,
        },
      ],
    });
    const result = h1PresentRule.evaluator(snapshot);
    expect(result.checkId).toBe("HEAD-001");
    expect(result.state).toBe("passed");
  });

  it("fails when no H1 tag exists", () => {
    const snapshot = createMockSnapshot({
      headings: [
        {
          level: 2,
          text: "Subheading",
          isEmpty: false,
          isHidden: false,
          elementId: null,
          selector: undefined,
          order: 0,
          rawTextLength: 10,
        },
      ],
    });
    const result = h1PresentRule.evaluator(snapshot);
    expect(result.checkId).toBe("HEAD-001");
    expect(result.state).toBe("failed");
  });

  it("fails when H1 exists but is empty", () => {
    const snapshot = createMockSnapshot({
      headings: [
        {
          level: 1,
          text: "   ",
          isEmpty: true,
          isHidden: false,
          elementId: null,
          selector: undefined,
          order: 0,
          rawTextLength: 0,
        },
      ],
    });
    const result = h1PresentRule.evaluator(snapshot);
    expect(result.checkId).toBe("HEAD-001");
    expect(result.state).toBe("failed");
  });
});

describe("HEAD-002: h1MultipleRule", () => {
  it("passes when there is a single H1", () => {
    const snapshot = createMockSnapshot({
      headings: [
        {
          level: 1,
          text: "Title",
          isEmpty: false,
          isHidden: false,
          elementId: null,
          selector: undefined,
          order: 0,
          rawTextLength: 5,
        },
      ],
    });
    const result = h1MultipleRule.evaluator(snapshot);
    expect(result.checkId).toBe("HEAD-002");
    expect(result.state).toBe("passed");
  });

  it("passes when there are no H1s", () => {
    const snapshot = createMockSnapshot({
      headings: [
        {
          level: 2,
          text: "Sub",
          isEmpty: false,
          isHidden: false,
          elementId: null,
          selector: undefined,
          order: 0,
          rawTextLength: 3,
        },
      ],
    });
    const result = h1MultipleRule.evaluator(snapshot);
    expect(result.checkId).toBe("HEAD-002");
    expect(result.state).toBe("passed");
  });

  it("warns when there are multiple H1s", () => {
    const snapshot = createMockSnapshot({
      headings: [
        {
          level: 1,
          text: "First H1",
          isEmpty: false,
          isHidden: false,
          elementId: null,
          selector: undefined,
          order: 0,
          rawTextLength: 9,
        },
        {
          level: 1,
          text: "Second H1",
          isEmpty: false,
          isHidden: false,
          elementId: null,
          selector: undefined,
          order: 1,
          rawTextLength: 10,
        },
      ],
    });
    const result = h1MultipleRule.evaluator(snapshot);
    expect(result.checkId).toBe("HEAD-002");
    expect(result.state).toBe("warning");
  });
});

describe("HEAD-003: h1EmptyRule", () => {
  it("passes when no empty headings exist", () => {
    const snapshot = createMockSnapshot({
      headings: [
        {
          level: 1,
          text: "Title",
          isEmpty: false,
          isHidden: false,
          elementId: null,
          selector: undefined,
          order: 0,
          rawTextLength: 5,
        },
        {
          level: 2,
          text: "Section",
          isEmpty: false,
          isHidden: false,
          elementId: null,
          selector: undefined,
          order: 1,
          rawTextLength: 7,
        },
      ],
    });
    const result = h1EmptyRule.evaluator(snapshot);
    expect(result.checkId).toBe("HEAD-003");
    expect(result.state).toBe("passed");
  });

  it("fails when empty headings exist", () => {
    const snapshot = createMockSnapshot({
      headings: [
        {
          level: 1,
          text: "Title",
          isEmpty: false,
          isHidden: false,
          elementId: null,
          selector: undefined,
          order: 0,
          rawTextLength: 5,
        },
        {
          level: 2,
          text: "",
          isEmpty: true,
          isHidden: false,
          elementId: null,
          selector: undefined,
          order: 1,
          rawTextLength: 0,
        },
      ],
    });
    const result = h1EmptyRule.evaluator(snapshot);
    expect(result.checkId).toBe("HEAD-003");
    expect(result.state).toBe("failed");
  });

  it("fails when heading contains only whitespace", () => {
    const snapshot = createMockSnapshot({
      headings: [
        {
          level: 1,
          text: "   ",
          isEmpty: false,
          isHidden: false,
          elementId: null,
          selector: undefined,
          order: 0,
          rawTextLength: 0,
        },
      ],
    });
    const result = h1EmptyRule.evaluator(snapshot);
    expect(result.checkId).toBe("HEAD-003");
    expect(result.state).toBe("failed");
  });
});

describe("HEAD-004: headingHierarchyRule", () => {
  it("fails when no headings exist", () => {
    const snapshot = createMockSnapshot({ headings: [] });
    const result = headingHierarchyRule.evaluator(snapshot);
    expect(result.checkId).toBe("HEAD-004");
    expect(result.state).toBe("failed");
  });

  it("passes when heading levels are sequential", () => {
    const snapshot = createMockSnapshot({
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
        {
          level: 3,
          text: "H3",
          isEmpty: false,
          isHidden: false,
          elementId: null,
          selector: undefined,
          order: 2,
          rawTextLength: 2,
        },
      ],
    });
    const result = headingHierarchyRule.evaluator(snapshot);
    expect(result.checkId).toBe("HEAD-004");
    expect(result.state).toBe("passed");
  });

  it("fails when heading levels skip a depth", () => {
    const snapshot = createMockSnapshot({
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
          level: 3,
          text: "H3",
          isEmpty: false,
          isHidden: false,
          elementId: null,
          selector: undefined,
          order: 1,
          rawTextLength: 2,
        },
      ],
    });
    const result = headingHierarchyRule.evaluator(snapshot);
    expect(result.checkId).toBe("HEAD-004");
    expect(result.state).toBe("failed");
  });
});

describe("HEAD-005: headingLongRule", () => {
  it("passes when no headings exist", () => {
    const snapshot = createMockSnapshot({ headings: [] });
    const result = headingLongRule.evaluator(snapshot);
    expect(result.checkId).toBe("HEAD-005");
    expect(result.state).toBe("passed");
  });

  it("passes when no headings exceed 100 characters", () => {
    const snapshot = createMockSnapshot({
      headings: [
        {
          level: 1,
          text: "Short title",
          isEmpty: false,
          isHidden: false,
          elementId: null,
          selector: undefined,
          order: 0,
          rawTextLength: 11,
        },
      ],
    });
    const result = headingLongRule.evaluator(snapshot);
    expect(result.checkId).toBe("HEAD-005");
    expect(result.state).toBe("passed");
  });

  it("warns when headings exceed 100 characters", () => {
    const longText = "A".repeat(101);
    const snapshot = createMockSnapshot({
      headings: [
        {
          level: 1,
          text: longText,
          isEmpty: false,
          isHidden: false,
          elementId: null,
          selector: undefined,
          order: 0,
          rawTextLength: 101,
        },
      ],
    });
    const result = headingLongRule.evaluator(snapshot);
    expect(result.checkId).toBe("HEAD-005");
    expect(result.state).toBe("warning");
  });
});

describe("HEAD-006: headingRepeatedRule", () => {
  it("passes when no headings exist", () => {
    const snapshot = createMockSnapshot({ headings: [] });
    const result = headingRepeatedRule.evaluator(snapshot);
    expect(result.checkId).toBe("HEAD-006");
    expect(result.state).toBe("passed");
  });

  it("passes when all heading text is unique", () => {
    const snapshot = createMockSnapshot({
      headings: [
        {
          level: 1,
          text: "Unique A",
          isEmpty: false,
          isHidden: false,
          elementId: null,
          selector: undefined,
          order: 0,
          rawTextLength: 8,
        },
        {
          level: 2,
          text: "Unique B",
          isEmpty: false,
          isHidden: false,
          elementId: null,
          selector: undefined,
          order: 1,
          rawTextLength: 8,
        },
      ],
    });
    const result = headingRepeatedRule.evaluator(snapshot);
    expect(result.checkId).toBe("HEAD-006");
    expect(result.state).toBe("passed");
  });

  it("warns when heading text is duplicated", () => {
    const snapshot = createMockSnapshot({
      headings: [
        {
          level: 1,
          text: "Same Text",
          isEmpty: false,
          isHidden: false,
          elementId: null,
          selector: undefined,
          order: 0,
          rawTextLength: 9,
        },
        {
          level: 2,
          text: "Same Text",
          isEmpty: false,
          isHidden: false,
          elementId: null,
          selector: undefined,
          order: 1,
          rawTextLength: 9,
        },
      ],
    });
    const result = headingRepeatedRule.evaluator(snapshot);
    expect(result.checkId).toBe("HEAD-006");
    expect(result.state).toBe("warning");
  });

  it("ignores empty strings when checking duplicates", () => {
    const snapshot = createMockSnapshot({
      headings: [
        {
          level: 1,
          text: "   ",
          isEmpty: true,
          isHidden: false,
          elementId: null,
          selector: undefined,
          order: 0,
          rawTextLength: 0,
        },
        {
          level: 2,
          text: "   ",
          isEmpty: true,
          isHidden: false,
          elementId: null,
          selector: undefined,
          order: 1,
          rawTextLength: 0,
        },
      ],
    });
    const result = headingRepeatedRule.evaluator(snapshot);
    expect(result.checkId).toBe("HEAD-006");
    expect(result.state).toBe("passed");
  });
});

describe("HEAD-007: headingMeaningfulRule", () => {
  it("passes when no headings exist", () => {
    const snapshot = createMockSnapshot({ headings: [] });
    const result = headingMeaningfulRule.evaluator(snapshot);
    expect(result.checkId).toBe("HEAD-007");
    expect(result.state).toBe("passed");
  });

  it("passes when all headings contain meaningful text", () => {
    const snapshot = createMockSnapshot({
      headings: [
        {
          level: 1,
          text: "Meaningful Title",
          isEmpty: false,
          isHidden: false,
          elementId: null,
          selector: undefined,
          order: 0,
          rawTextLength: 16,
        },
      ],
    });
    const result = headingMeaningfulRule.evaluator(snapshot);
    expect(result.checkId).toBe("HEAD-007");
    expect(result.state).toBe("passed");
  });

  it("warns when heading contains only punctuation", () => {
    const snapshot = createMockSnapshot({
      headings: [
        {
          level: 1,
          text: "!!!",
          isEmpty: false,
          isHidden: false,
          elementId: null,
          selector: undefined,
          order: 0,
          rawTextLength: 3,
        },
      ],
    });
    const result = headingMeaningfulRule.evaluator(snapshot);
    expect(result.checkId).toBe("HEAD-007");
    expect(result.state).toBe("warning");
  });
});

describe("HEAD-008: headingSummaryRule", () => {
  it("returns passed with heading counts summary", () => {
    const snapshot = createMockSnapshot({
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
        {
          level: 2,
          text: "H2 again",
          isEmpty: false,
          isHidden: false,
          elementId: null,
          selector: undefined,
          order: 2,
          rawTextLength: 8,
        },
      ],
    });
    const result = headingSummaryRule.evaluator(snapshot);
    expect(result.checkId).toBe("HEAD-008");
    expect(result.state).toBe("passed");
  });

  it("reports no H1 when none are present", () => {
    const snapshot = createMockSnapshot({
      headings: [
        {
          level: 2,
          text: "Sub",
          isEmpty: false,
          isHidden: false,
          elementId: null,
          selector: undefined,
          order: 0,
          rawTextLength: 3,
        },
      ],
    });
    const result = headingSummaryRule.evaluator(snapshot);
    expect(result.checkId).toBe("HEAD-008");
    expect(result.state).toBe("passed");
    expect(result.evidence.summary).toContain("No H1 found");
  });

  it("reports multiple H1s when present", () => {
    const snapshot = createMockSnapshot({
      headings: [
        {
          level: 1,
          text: "First",
          isEmpty: false,
          isHidden: false,
          elementId: null,
          selector: undefined,
          order: 0,
          rawTextLength: 5,
        },
        {
          level: 1,
          text: "Second",
          isEmpty: false,
          isHidden: false,
          elementId: null,
          selector: undefined,
          order: 1,
          rawTextLength: 6,
        },
      ],
    });
    const result = headingSummaryRule.evaluator(snapshot);
    expect(result.checkId).toBe("HEAD-008");
    expect(result.state).toBe("passed");
    expect(result.evidence.summary).toContain("Multiple H1s");
  });

  it("reports depth gaps when present", () => {
    const snapshot = createMockSnapshot({
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
          level: 3,
          text: "H3",
          isEmpty: false,
          isHidden: false,
          elementId: null,
          selector: undefined,
          order: 1,
          rawTextLength: 2,
        },
      ],
    });
    const result = headingSummaryRule.evaluator(snapshot);
    expect(result.checkId).toBe("HEAD-008");
    expect(result.state).toBe("passed");
    expect(result.evidence.summary).toContain("Depth gaps detected");
  });
});
