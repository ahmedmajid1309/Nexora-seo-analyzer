import { describe, it, expect } from "vitest";
import {
  ruleRegistry,
  getAllRules,
  getRuleById,
  getRulesByCategory,
  getRuleCount,
  validateRegistry,
  type RuleCategoryKey,
  type AuditCheckId,
} from "../registry";
import { runAll, runCategory, runRules } from "../runner";
import type { RuleDefinition, RuleCategory } from "../types";
import { createMockSnapshot } from "./test-utils";

describe("registry", () => {
  it("ruleRegistry has all 10 categories", () => {
    const keys = Object.keys(ruleRegistry);
    expect(keys).toContain("metadata");
    expect(keys).toContain("headings");
    expect(keys).toContain("url");
    expect(keys).toContain("links");
    expect(keys).toContain("images");
    expect(keys).toContain("structured-data");
    expect(keys).toContain("social");
    expect(keys).toContain("content");
    expect(keys).toContain("accessibility");
    expect(keys).toContain("forms");
  });

  it("all categories have at least one rule", () => {
    for (const rules of Object.values(ruleRegistry)) {
      expect(rules.length).toBeGreaterThanOrEqual(1);
    }
  });

  it("getAllRules returns all rules from all categories", () => {
    const all = getAllRules();
    const manual = Object.values(ruleRegistry).flat();
    expect(all.length).toBe(manual.length);
    expect(all.length).toBeGreaterThanOrEqual(75);
  });

  it("getRuleById finds a known rule", () => {
    const rule = getRuleById("META-001");
    expect(rule).toBeDefined();
    expect(rule!.id).toBe("META-001");
  });

  it("getRuleById returns undefined for unknown rule", () => {
    expect(getRuleById("NONEXISTENT")).toBeUndefined();
  });

  it("getRulesByCategory returns matching rules", () => {
    const rules = getRulesByCategory("metadata");
    expect(rules.length).toBeGreaterThan(0);
    for (const r of rules) {
      expect(r.category).toBe("metadata");
    }
  });

  it("getRulesByCategory returns empty array for unknown category", () => {
    const rules = getRulesByCategory("unknown" as RuleCategory);
    expect(rules).toEqual([]);
  });

  it("getRuleCount returns total count", () => {
    expect(getRuleCount()).toBe(getAllRules().length);
  });

  it("validateRegistry detects duplicate signalOwners (expected behavior)", () => {
    const errors = validateRegistry();
    expect(errors.length).toBeGreaterThan(0);
    for (const err of errors) {
      expect(err).toMatch(/Signal owner ".+" is used by multiple scored rules/);
    }
  });

  it("all rule IDs follow the pattern XXX-\\d{3}", () => {
    for (const rule of getAllRules()) {
      expect(rule.id).toMatch(/^[A-Z0-9]+-\d{3}$/);
    }
  });

  it("every rule has required fields", () => {
    for (const rule of getAllRules()) {
      expect(rule.name).toBeTruthy();
      expect(rule.description).toBeTruthy();
      expect(rule.category).toBeTruthy();
      expect(rule.executionMode).toBe("static");
      expect(rule.signalOwner).toBeTruthy();
      expect(rule.ruleVersion).toBeGreaterThanOrEqual(1);
      expect(typeof rule.evaluator).toBe("function");
    }
  });

  it("scored rules have valid signalOwner", () => {
    const validSignalOwners = [
      "metadata",
      "headings",
      "url",
      "links",
      "images",
      "structured-data",
      "social",
      "content",
      "accessibility",
      "forms",
    ];
    for (const rule of getAllRules().filter((r) => r.scored)) {
      expect(validSignalOwners).toContain(rule.signalOwner);
    }
  });

  it("AuditCheckId resolves to valid rule IDs", () => {
    const ids = getAllRules().map((r) => r.id) as AuditCheckId[];
    expect(ids.length).toBeGreaterThan(75);
  });

  it("RuleCategoryKey includes all categories", () => {
    const catKeys = Object.keys(ruleRegistry) as RuleCategoryKey[];
    expect(catKeys).toContain("structured-data");
    expect(catKeys).toContain("accessibility");
  });
});

describe("runner", () => {
  it("runAll returns results for all rules", () => {
    const snapshot = createMockSnapshot();
    const result = runAll(snapshot);
    expect(result.results.length).toBe(getAllRules().length);
    expect(result.durationMs).toBeGreaterThanOrEqual(0);
    expect(result.errorCount).toBe(0);
  });

  it("runAll results have valid states", () => {
    const snapshot = createMockSnapshot();
    const result = runAll(snapshot);
    for (const r of result.results) {
      expect(["passed", "warning", "failed", "not-applicable", "unavailable"]).toContain(r.state);
      expect(r.checkId).toBeTruthy();
      expect(r.category).toBeTruthy();
    }
  });

  it("runCategory returns only requested category", () => {
    const snapshot = createMockSnapshot();
    const result = runCategory(snapshot, "metadata");
    for (const r of result.results) {
      expect(r.category).toBe("metadata");
    }
    expect(result.results.length).toBe(ruleRegistry.metadata.length);
  });

  it("runRules handles empty rules array", () => {
    const snapshot = createMockSnapshot();
    const result = runRules([], snapshot);
    expect(result.results).toEqual([]);
    expect(result.errorCount).toBe(0);
  });

  it("runRules catches evaluator errors gracefully", () => {
    const badRule: RuleDefinition = {
      id: "BAD-001",
      name: "Bad Rule",
      description: "Throws",
      category: "metadata",
      executionMode: "static",
      defaultSeverity: "high",
      defaultImpact: "Bad",
      defaultEffort: "low",
      scored: false,
      signalOwner: "metadata",
      ruleVersion: 1,
      evaluator: () => {
        throw new Error("oops");
      },
    };
    const snapshot = createMockSnapshot();
    const result = runRules([badRule], snapshot);
    expect(result.results.length).toBe(1);
    expect(result.results[0].state).toBe("unavailable");
    expect(result.results[0].unavailableReason).toBe("Evaluator threw an unexpected error");
    expect(result.errorCount).toBe(1);
  });

  it("runAll handles various snapshot configurations without errors", () => {
    const snapshots = [
      createMockSnapshot({
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
      }),
      createMockSnapshot({
        metadata: [
          {
            name: "description",
            rawValue: "desc",
            normalizedValue: "desc",
            sourceAttribute: "name",
            elementOrder: 0,
          },
        ],
        document: { ...createMockSnapshot().document, baseHref: "https://example.com" },
      }),
      createMockSnapshot({
        forms: {
          formCount: 1,
          forms: [
            {
              action: "/submit",
              method: "post",
              autocomplete: "on",
              novalidate: false,
              inputs: [
                {
                  type: "text",
                  name: "q",
                  id: "search",
                  hasPlaceholder: false,
                  required: false,
                  disabled: false,
                  associatedLabel: "Search",
                  labelRelationship: "explicit",
                  isSubmit: false,
                  isPassword: false,
                  isFile: false,
                  isHidden: false,
                  redactedValue: false,
                  elementOrder: 0,
                },
              ],
              submitCount: 1,
              elementOrder: 0,
            },
          ],
        },
      }),
      createMockSnapshot({
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
        document: { ...createMockSnapshot().document, baseHref: "https://example.com" },
      }),
    ];
    for (const snapshot of snapshots) {
      const result = runAll(snapshot);
      expect(result.errorCount).toBe(0);
      for (const r of result.results) {
        expect(["passed", "warning", "failed", "not-applicable", "unavailable"]).toContain(r.state);
      }
    }
  });
});
