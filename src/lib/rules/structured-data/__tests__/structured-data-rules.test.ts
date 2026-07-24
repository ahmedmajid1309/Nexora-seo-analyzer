import { describe, it, expect } from "vitest";
import { createMockSnapshot } from "../../__tests__/test-utils";
import { jsonldPresentRule } from "../jsonld-present";
import { jsonldParseSuccessRule } from "../jsonld-parse-success";
import { jsonldContextRule } from "../jsonld-context";
import { jsonldTypeRule } from "../jsonld-type";
import { jsonldTypesDiscoveredRule } from "../jsonld-types-discovered";
import { microdataRdfaSignalRule } from "../microdata-rdfa-signal";

describe("SCHEMA-001 - jsonldPresentRule", () => {
  it("passes when structured data is present", () => {
    const result = jsonldPresentRule.evaluator(
      createMockSnapshot({
        structuredData: [
          {
            rawSample: '{"@context":"https://schema.org","@type":"WebPage"}',
            parseSuccess: true,
            parsedTypes: ["WebPage"],
            context: "https://schema.org",
            elementOrder: 0,
            parseErrorCategory: "none",
          },
        ],
      }),
    );
    expect(result.state).toBe("passed");
    expect(result.checkId).toBe("SCHEMA-001");
  });

  it("fails when no structured data exists", () => {
    const result = jsonldPresentRule.evaluator(createMockSnapshot({ structuredData: [] }));
    expect(result.state).toBe("failed");
    expect(result.checkId).toBe("SCHEMA-001");
  });
});

describe("SCHEMA-002 - jsonldParseSuccessRule", () => {
  it("passes when no INVALID_JSON_LD extraction warnings exist", () => {
    const result = jsonldParseSuccessRule.evaluator(createMockSnapshot({ extractionWarnings: [] }));
    expect(result.state).toBe("passed");
    expect(result.checkId).toBe("SCHEMA-002");
  });

  it("passes when extraction warnings do not include INVALID_JSON_LD", () => {
    const result = jsonldParseSuccessRule.evaluator(
      createMockSnapshot({
        extractionWarnings: [{ code: "MISSING_HEAD", message: "Something else" }],
      }),
    );
    expect(result.state).toBe("passed");
    expect(result.checkId).toBe("SCHEMA-002");
  });

  it("fails when INVALID_JSON_LD extraction warnings exist", () => {
    const result = jsonldParseSuccessRule.evaluator(
      createMockSnapshot({
        extractionWarnings: [{ code: "INVALID_JSON_LD", message: "Parse error at line 1" }],
      }),
    );
    expect(result.state).toBe("failed");
    expect(result.checkId).toBe("SCHEMA-002");
  });
});

describe("SCHEMA-003 - jsonldContextRule", () => {
  it("returns not-applicable when no structured data", () => {
    const result = jsonldContextRule.evaluator(createMockSnapshot({ structuredData: [] }));
    expect(result.state).toBe("not-applicable");
    expect(result.checkId).toBe("SCHEMA-003");
  });

  it("passes when all blocks have @context", () => {
    const result = jsonldContextRule.evaluator(
      createMockSnapshot({
        structuredData: [
          {
            rawSample: "{}",
            parseSuccess: true,
            parsedTypes: ["WebPage"],
            context: "https://schema.org",
            elementOrder: 0,
            parseErrorCategory: "none",
          },
          {
            rawSample: "{}",
            parseSuccess: true,
            parsedTypes: ["Article"],
            context: "https://schema.org",
            elementOrder: 1,
            parseErrorCategory: "none",
          },
        ],
      }),
    );
    expect(result.state).toBe("passed");
    expect(result.checkId).toBe("SCHEMA-003");
  });

  it("fails when some blocks are missing @context", () => {
    const result = jsonldContextRule.evaluator(
      createMockSnapshot({
        structuredData: [
          {
            rawSample: "{}",
            parseSuccess: true,
            parsedTypes: ["WebPage"],
            context: "https://schema.org",
            elementOrder: 0,
            parseErrorCategory: "none",
          },
          {
            rawSample: "{}",
            parseSuccess: true,
            parsedTypes: ["Product"],
            context: null,
            elementOrder: 1,
            parseErrorCategory: "none",
          },
        ],
      }),
    );
    expect(result.state).toBe("failed");
    expect(result.checkId).toBe("SCHEMA-003");
  });
});

describe("SCHEMA-004 - jsonldTypeRule", () => {
  it("returns not-applicable when no structured data", () => {
    const result = jsonldTypeRule.evaluator(createMockSnapshot({ structuredData: [] }));
    expect(result.state).toBe("not-applicable");
    expect(result.checkId).toBe("SCHEMA-004");
  });

  it("passes when all blocks have @type", () => {
    const result = jsonldTypeRule.evaluator(
      createMockSnapshot({
        structuredData: [
          {
            rawSample: "{}",
            parseSuccess: true,
            parsedTypes: ["WebPage"],
            context: "https://schema.org",
            elementOrder: 0,
            parseErrorCategory: "none",
          },
          {
            rawSample: "{}",
            parseSuccess: true,
            parsedTypes: ["Article"],
            context: "https://schema.org",
            elementOrder: 1,
            parseErrorCategory: "none",
          },
        ],
      }),
    );
    expect(result.state).toBe("passed");
    expect(result.checkId).toBe("SCHEMA-004");
  });

  it("fails when some blocks are missing @type", () => {
    const result = jsonldTypeRule.evaluator(
      createMockSnapshot({
        structuredData: [
          {
            rawSample: "{}",
            parseSuccess: true,
            parsedTypes: ["WebPage"],
            context: "https://schema.org",
            elementOrder: 0,
            parseErrorCategory: "none",
          },
          {
            rawSample: "{}",
            parseSuccess: true,
            parsedTypes: [],
            context: "https://schema.org",
            elementOrder: 1,
            parseErrorCategory: "none",
          },
        ],
      }),
    );
    expect(result.state).toBe("failed");
    expect(result.checkId).toBe("SCHEMA-004");
  });
});

describe("SCHEMA-005 - jsonldTypesDiscoveredRule", () => {
  it("returns not-applicable when no structured data", () => {
    const result = jsonldTypesDiscoveredRule.evaluator(createMockSnapshot({ structuredData: [] }));
    expect(result.state).toBe("not-applicable");
    expect(result.checkId).toBe("SCHEMA-005");
  });

  it("passes with 'none' observed when blocks exist but have no parsed types", () => {
    const result = jsonldTypesDiscoveredRule.evaluator(
      createMockSnapshot({
        structuredData: [
          {
            rawSample: "{}",
            parseSuccess: true,
            parsedTypes: [],
            context: "https://schema.org",
            elementOrder: 0,
            parseErrorCategory: "none",
          },
        ],
      }),
    );
    expect(result.state).toBe("passed");
    expect(result.checkId).toBe("SCHEMA-005");
    expect(result.evidence.observedValue).toBe("none");
  });

  it("passes and lists discovered types when blocks have parsed types", () => {
    const result = jsonldTypesDiscoveredRule.evaluator(
      createMockSnapshot({
        structuredData: [
          {
            rawSample: "{}",
            parseSuccess: true,
            parsedTypes: ["WebPage"],
            context: "https://schema.org",
            elementOrder: 0,
            parseErrorCategory: "none",
          },
          {
            rawSample: "{}",
            parseSuccess: true,
            parsedTypes: ["Article", "BlogPosting"],
            context: "https://schema.org",
            elementOrder: 1,
            parseErrorCategory: "none",
          },
        ],
      }),
    );
    expect(result.state).toBe("passed");
    expect(result.checkId).toBe("SCHEMA-005");
    expect(result.evidence.observedValue).toBe(3);
    expect(result.evidence.expectedValue).toBe("Article, BlogPosting, WebPage");
  });
});

describe("SCHEMA-006 - microdataRdfaSignalRule", () => {
  it("returns not-applicable when neither microdata nor RDFa is present", () => {
    const result = microdataRdfaSignalRule.evaluator(
      createMockSnapshot({
        microdata: { present: false, itemCount: 0, itemTypes: [] },
        rdfa: { present: false, typeofCount: 0, propertyCount: 0 },
      }),
    );
    expect(result.state).toBe("not-applicable");
    expect(result.checkId).toBe("SCHEMA-006");
  });

  it("passes when microdata is present", () => {
    const result = microdataRdfaSignalRule.evaluator(
      createMockSnapshot({
        microdata: { present: true, itemCount: 2, itemTypes: ["Product"] },
        rdfa: { present: false, typeofCount: 0, propertyCount: 0 },
      }),
    );
    expect(result.state).toBe("passed");
    expect(result.checkId).toBe("SCHEMA-006");
  });

  it("passes when RDFa is present", () => {
    const result = microdataRdfaSignalRule.evaluator(
      createMockSnapshot({
        microdata: { present: false, itemCount: 0, itemTypes: [] },
        rdfa: { present: true, typeofCount: 1, propertyCount: 3 },
      }),
    );
    expect(result.state).toBe("passed");
    expect(result.checkId).toBe("SCHEMA-006");
  });

  it("passes when both microdata and RDFa are present", () => {
    const result = microdataRdfaSignalRule.evaluator(
      createMockSnapshot({
        microdata: { present: true, itemCount: 1, itemTypes: ["Product"] },
        rdfa: { present: true, typeofCount: 2, propertyCount: 5 },
      }),
    );
    expect(result.state).toBe("passed");
    expect(result.checkId).toBe("SCHEMA-006");
  });
});
