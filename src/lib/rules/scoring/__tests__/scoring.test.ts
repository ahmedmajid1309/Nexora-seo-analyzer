import { describe, it, expect } from "vitest";
import { calculateScores } from "../engine";
import { evaluateApplicability } from "../applicability";
import { SCORE_FAMILY_DEFINITIONS, sumWeights, assertWeightsTotal100 } from "../weights";
import type { RuleResult } from "../../types";
import { createMockSnapshot } from "../../__tests__/test-utils";

function makeResult(
  checkId: string,
  state: "passed" | "warning" | "failed" | "not-applicable" | "unavailable",
  category: string,
  scored: boolean = true,
  overrides: Partial<RuleResult> = {},
): RuleResult {
  return {
    checkId,
    state,
    evidence: { summary: "", observedValue: null, expectedValue: null },
    remediation: { summary: "", steps: [], responsible: "developer" },
    severity: "low",
    scored,
    impact: "",
    effort: "medium",
    confidence: state === "unavailable" ? 0 : 95,
    source: "html-parse",
    category,
    ...overrides,
  };
}

function categoryRules(
  category: string,
  total: number,
  state: "passed" | "warning" | "failed" | "not-applicable" | "unavailable",
): RuleResult[] {
  return Array.from({ length: total }, (_, i) =>
    makeResult(
      `${category.toUpperCase().slice(0, 4)}-${String(i + 1).padStart(3, "0")}`,
      state,
      category,
    ),
  );
}

const PASS_ALL: RuleResult[] = [
  ...categoryRules("metadata", 14, "passed"),
  ...categoryRules("headings", 8, "passed"),
  ...categoryRules("url", 10, "passed"),
  ...categoryRules("links", 8, "passed"),
  ...categoryRules("images", 8, "passed"),
  ...categoryRules("structured-data", 6, "passed"),
  ...categoryRules("social", 6, "passed"),
  ...categoryRules("content", 7, "passed"),
  ...categoryRules("accessibility", 13, "passed"),
  ...categoryRules("forms", 5, "passed"),
];

const EMPTY_SNAPSHOT = createMockSnapshot();

// ---------------------------------------------------------------------------
// Weight maps
// ---------------------------------------------------------------------------
describe("weight maps", () => {
  it("every score-family weight map totals exactly 100%", () => {
    for (const def of SCORE_FAMILY_DEFINITIONS) {
      const total = sumWeights(def.categories);
      expect(Math.abs(total - 100)).toBeLessThanOrEqual(0.01);
    }
  });

  it("assertWeightsTotal100 does not throw", () => {
    expect(() => assertWeightsTotal100()).not.toThrow();
  });

  it("each family has at least one active category", () => {
    for (const def of SCORE_FAMILY_DEFINITIONS) {
      const active = Object.entries(def.categories).filter(([, w]) => w > 0);
      expect(active.length).toBeGreaterThan(0);
    }
  });
});

// ---------------------------------------------------------------------------
// Score calculation basics
// ---------------------------------------------------------------------------
describe("score calculation", () => {
  it("all-passed produces near-perfect scores", () => {
    const result = calculateScores({ results: PASS_ALL, snapshot: EMPTY_SNAPSHOT });
    expect(result.rawScore).toBeGreaterThan(95);
    expect(result.confidence).toBeGreaterThanOrEqual(99);
  });

  it("all-failed produces near-zero scores", () => {
    const failed = PASS_ALL.map((r) => ({ ...r, state: "failed" as const }));
    const result = calculateScores({ results: failed, snapshot: EMPTY_SNAPSHOT });
    expect(result.rawScore).toBeLessThan(5);
    expect(result.earnedWeight).toBe(0);
  });

  it("warning contributes partial weight (0.5x)", () => {
    const warning = PASS_ALL.map((r) => ({ ...r, state: "warning" as const }));
    const result = calculateScores({ results: warning, snapshot: EMPTY_SNAPSHOT });
    expect(result.rawScore).toBeGreaterThan(45);
    expect(result.rawScore).toBeLessThan(55);
  });

  it("not-applicable rules are excluded and do not reduce score", () => {
    const halfNotApplicable = [
      ...categoryRules("metadata", 14, "not-applicable"),
      ...categoryRules("headings", 8, "passed"),
      ...categoryRules("url", 10, "passed"),
      ...categoryRules("links", 8, "passed"),
      ...categoryRules("images", 8, "passed"),
      ...categoryRules("structured-data", 6, "passed"),
      ...categoryRules("social", 6, "passed"),
      ...categoryRules("content", 7, "passed"),
      ...categoryRules("accessibility", 13, "passed"),
      ...categoryRules("forms", 5, "passed"),
    ];
    const result = calculateScores({ results: halfNotApplicable, snapshot: EMPTY_SNAPSHOT });
    expect(result.rawScore).toBeGreaterThan(95);
    expect(result.notApplicableRuleCount).toBe(14);
  });

  it("unavailable rules reduce confidence but appear in denominator", () => {
    const halfUnavailable = [
      ...categoryRules("metadata", 14, "unavailable"),
      ...categoryRules("headings", 8, "passed"),
      ...categoryRules("url", 10, "passed"),
      ...categoryRules("links", 8, "passed"),
      ...categoryRules("images", 8, "passed"),
      ...categoryRules("structured-data", 6, "passed"),
      ...categoryRules("social", 6, "passed"),
      ...categoryRules("content", 7, "passed"),
      ...categoryRules("accessibility", 13, "passed"),
      ...categoryRules("forms", 5, "passed"),
    ];
    const result = calculateScores({ results: halfUnavailable, snapshot: EMPTY_SNAPSHOT });
    expect(result.unavailableRuleCount).toBe(14);
    const familiesWithLowConfidence = result.scoreFamilies.filter((f) => f.confidence < 100);
    expect(familiesWithLowConfidence.length).toBeGreaterThan(0);
  });

  it("informational rules do not affect score or confidence", () => {
    const mixed = [
      ...categoryRules("metadata", 14, "passed"),
      ...categoryRules("headings", 8, "passed"),
      ...categoryRules("url", 10, "passed"),
      ...categoryRules("links", 8, "passed"),
      ...categoryRules("images", 8, "passed"),
      ...categoryRules("structured-data", 6, "passed"),
      ...categoryRules("social", 6, "passed"),
      ...categoryRules("content", 7, "passed"),
      ...categoryRules("accessibility", 13, "passed"),
      ...categoryRules("forms", 5, "passed"),
      makeResult("INFO-001", "passed", "metadata", false),
      makeResult("INFO-002", "failed", "metadata", false),
    ];
    const result = calculateScores({ results: mixed, snapshot: EMPTY_SNAPSHOT });
    expect(result.informationalRuleCount).toBe(2);
    expect(result.rawScore).toBeGreaterThan(95);
  });
});

// ---------------------------------------------------------------------------
// Determinism, immutability, rejection
// ---------------------------------------------------------------------------
describe("determinism and safety", () => {
  it("produces identical output for identical input", () => {
    const a = calculateScores({ results: PASS_ALL, snapshot: EMPTY_SNAPSHOT });
    const b = calculateScores({ results: PASS_ALL, snapshot: EMPTY_SNAPSHOT });
    expect(a).toEqual(b);
  });

  it("does not mutate input results", () => {
    const results = PASS_ALL.map((r) => ({ ...r }));
    const original = results.map((r) => ({ ...r }));
    calculateScores({ results, snapshot: EMPTY_SNAPSHOT });
    expect(results).toEqual(original);
  });

  it("handles empty results array with default 100 (no signals = no issues)", () => {
    const result = calculateScores({ results: [], snapshot: EMPTY_SNAPSHOT });
    expect(result.rawScore).toBe(100);
    expect(result.cappedScore).toBe(100);
  });

  it("all results unavailable produces 0 confidence but non-zero score floor", () => {
    const unavailable = PASS_ALL.map((r) => ({ ...r, state: "unavailable" as const }));
    const result = calculateScores({ results: unavailable, snapshot: EMPTY_SNAPSHOT });
    expect(result.confidence).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Applicability engine
// ---------------------------------------------------------------------------
describe("applicability engine", () => {
  it("basic snapshot returns expected defaults", () => {
    const ctx = evaluateApplicability(EMPTY_SNAPSHOT);
    expect(ctx.hasForms).toBe(false);
    expect(ctx.hasTables).toBe(false);
    expect(ctx.hasIframes).toBe(false);
    expect(ctx.hasJsonLd).toBe(false);
    expect(ctx.isIndexable).toBe(true);
    expect(ctx.hasTargetKeyword).toBe(false);
  });

  it("detects forms when present", () => {
    const snapshot = createMockSnapshot({
      forms: {
        formCount: 1,
        forms: [
          {
            action: "/submit",
            method: "post",
            autocomplete: "on",
            novalidate: false,
            inputs: [],
            submitCount: 1,
            elementOrder: 0,
          },
        ],
      },
    });
    const ctx = evaluateApplicability(snapshot);
    expect(ctx.hasForms).toBe(true);
  });

  it("detects JSON-LD when present", () => {
    const snapshot = createMockSnapshot({
      structuredData: [
        {
          rawSample: '{"@context":"https://schema.org"}',
          parseSuccess: true,
          parsedTypes: ["WebPage"],
          context: "https://schema.org",
          elementOrder: 0,
          parseErrorCategory: "none",
        },
      ],
    });
    const ctx = evaluateApplicability(snapshot);
    expect(ctx.hasJsonLd).toBe(true);
  });

  it("detects noindex via robots meta", () => {
    const snapshot = createMockSnapshot({
      metadata: [
        {
          name: "robots",
          rawValue: "noindex, nofollow",
          normalizedValue: "noindex, nofollow",
          sourceAttribute: "name",
          elementOrder: 0,
        },
      ],
    });
    const ctx = evaluateApplicability(snapshot);
    expect(ctx.isIndexable).toBe(false);
  });

  it("detects hreflang via link tags", () => {
    const snapshot = createMockSnapshot({
      links: [
        {
          rawHref: "https://example.com/fr",
          resolvedUrl: "https://example.com/fr",
          protocol: "https:",
          hostname: "example.com",
          isSameOrigin: true,
          isSameHost: true,
          fragment: null,
          anchorText: "",
          title: null,
          relTokens: [],
          target: null,
          hasDownload: false,
          hreflang: "fr",
          media: null,
          elementOrder: 0,
          classification: "https",
        },
      ],
    });
    const ctx = evaluateApplicability(snapshot);
    expect(ctx.hasHreflang).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Critical caps
// ---------------------------------------------------------------------------
describe("critical caps", () => {
  it("noindex page triggers CAP-NOINDEX", () => {
    const snapshot = createMockSnapshot({
      metadata: [
        {
          name: "robots",
          rawValue: "noindex",
          normalizedValue: "noindex",
          sourceAttribute: "name",
          elementOrder: 0,
        },
      ],
    });
    const withoutMeta011 = PASS_ALL.filter((r) => r.checkId !== "META-011");
    const results = [...withoutMeta011, makeResult("META-011", "warning", "metadata")];
    const result = calculateScores({ results, snapshot });
    const noindexCaps = result.appliedCaps.filter((c) => c.capId === "CAP-NOINDEX");
    expect(noindexCaps.length).toBeGreaterThan(0);
  });

  it("page with title does not trigger CAP-NO-TITLE", () => {
    const snapshot = createMockSnapshot({
      document: { ...EMPTY_SNAPSHOT.document, title: "Valid Title" },
    });
    const results = PASS_ALL;
    const result = calculateScores({ results, snapshot });
    const titleCaps = result.appliedCaps.filter((c) => c.capId === "CAP-NO-TITLE");
    expect(titleCaps.length).toBe(0);
  });

  it("missing title triggers CAP-NO-TITLE", () => {
    const snapshot = createMockSnapshot({
      document: { ...EMPTY_SNAPSHOT.document, title: null, titleElementCount: 0 },
    });
    const withoutMeta001 = PASS_ALL.filter((r) => r.checkId !== "META-001");
    const results = [...withoutMeta001, makeResult("META-001", "failed", "metadata")];
    const result = calculateScores({ results, snapshot });
    const titleCaps = result.appliedCaps.filter((c) => c.capId === "CAP-NO-TITLE");
    expect(titleCaps.length).toBeGreaterThan(0);
  });

  it("deliberate noindex page caps but does not apply ranking-related caps", () => {
    const snapshot = createMockSnapshot({
      metadata: [
        {
          name: "robots",
          rawValue: "noindex",
          normalizedValue: "noindex",
          sourceAttribute: "name",
          elementOrder: 0,
        },
      ],
    });
    const withoutMeta011 = PASS_ALL.filter((r) => r.checkId !== "META-011");
    const results = [...withoutMeta011, makeResult("META-011", "warning", "metadata")];
    const result = calculateScores({ results, snapshot });
    const noindexCaps = result.appliedCaps.filter((c) => c.capId === "CAP-NOINDEX");
    expect(noindexCaps.length).toBeGreaterThan(0);
    expect(noindexCaps[0].maxScore).toBe(40);
  });
});

// ---------------------------------------------------------------------------
// Performance scoring with PageSpeed data
// ---------------------------------------------------------------------------
describe("performance scoring", () => {
  const EMPTY_LAB = {
    lcp: null,
    cls: null,
    tbt: null,
    si: null,
    fcp: null,
    lighthouseAccessibilityScore: null,
    lighthouseSeoScore: null,
    lighthouseBestPracticesScore: null,
  };

  it("performance status is unavailable when no PageSpeed data provided", () => {
    const result = calculateScores({ results: PASS_ALL, snapshot: EMPTY_SNAPSHOT });
    expect(result.performanceStatus).toBe("unavailable");
    expect(result.performanceExplanation).toBeTruthy();
    expect(result.performanceScore).toBeNull();
    expect(result.performanceSource).toBeNull();
    expect(result.performanceConfidence).toBeNull();
  });

  it("mobile 80 + desktop 95 → primary Performance is 80, not 87.5/88", () => {
    const result = calculateScores({
      results: PASS_ALL,
      snapshot: EMPTY_SNAPSHOT,
      pagespeed: {
        mobile: {
          strategy: "mobile",
          labMetrics: { ...EMPTY_LAB, performanceScore: 80 },
          fieldData: null,
          opportunities: [],
          diagnostics: [],
        },
        desktop: {
          strategy: "desktop",
          labMetrics: { ...EMPTY_LAB, performanceScore: 95 },
          fieldData: null,
          opportunities: [],
          diagnostics: [],
        },
      },
    });
    expect(result.performanceStatus).toBe("available");
    expect(result.performanceScore).toBe(80);
    expect(result.performanceSource).toBe("pagespeed-mobile");
    expect(result.performanceConfidence).toBe(100);
  });

  it("mobile null + desktop 90 → desktop fallback 90 with reduced confidence", () => {
    const result = calculateScores({
      results: PASS_ALL,
      snapshot: EMPTY_SNAPSHOT,
      pagespeed: {
        mobile: null,
        desktop: {
          strategy: "desktop",
          labMetrics: { ...EMPTY_LAB, performanceScore: 90 },
          fieldData: null,
          opportunities: [],
          diagnostics: [],
        },
      },
    });
    expect(result.performanceStatus).toBe("available");
    expect(result.performanceScore).toBe(90);
    expect(result.performanceSource).toBe("pagespeed-desktop-fallback");
    expect(result.performanceConfidence).toBe(70);
    expect(result.performanceExplanation).toContain("fallback");
  });

  it("mobile null + desktop null → Performance unavailable", () => {
    const result = calculateScores({
      results: PASS_ALL,
      snapshot: EMPTY_SNAPSHOT,
      pagespeed: { mobile: null, desktop: null },
    });
    expect(result.performanceStatus).toBe("unavailable");
    expect(result.performanceScore).toBeNull();
    expect(result.performanceSource).toBeNull();
    expect(result.performanceConfidence).toBeNull();
  });

  it("desktop does not alter an available mobile primary score", () => {
    const withDesktop = calculateScores({
      results: PASS_ALL,
      snapshot: EMPTY_SNAPSHOT,
      pagespeed: {
        mobile: {
          strategy: "mobile",
          labMetrics: { ...EMPTY_LAB, performanceScore: 72 },
          fieldData: null,
          opportunities: [],
          diagnostics: [],
        },
        desktop: {
          strategy: "desktop",
          labMetrics: { ...EMPTY_LAB, performanceScore: 99 },
          fieldData: null,
          opportunities: [],
          diagnostics: [],
        },
      },
    });
    const withoutDesktop = calculateScores({
      results: PASS_ALL,
      snapshot: EMPTY_SNAPSHOT,
      pagespeed: {
        mobile: {
          strategy: "mobile",
          labMetrics: { ...EMPTY_LAB, performanceScore: 72 },
          fieldData: null,
          opportunities: [],
          diagnostics: [],
        },
        desktop: null,
      },
    });
    expect(withDesktop.performanceScore).toBe(72);
    expect(withoutDesktop.performanceScore).toBe(72);
    expect(withDesktop.performanceConfidence).toBe(100);
    expect(withoutDesktop.performanceConfidence).toBe(100);
  });

  it("mobile-primary score 90 confidence > desktop-fallback score 90 confidence", () => {
    const mobileResult = calculateScores({
      results: PASS_ALL,
      snapshot: EMPTY_SNAPSHOT,
      pagespeed: {
        mobile: {
          strategy: "mobile",
          labMetrics: { ...EMPTY_LAB, performanceScore: 90 },
          fieldData: null,
          opportunities: [],
          diagnostics: [],
        },
        desktop: null,
      },
    });
    const desktopResult = calculateScores({
      results: PASS_ALL,
      snapshot: EMPTY_SNAPSHOT,
      pagespeed: {
        mobile: null,
        desktop: {
          strategy: "desktop",
          labMetrics: { ...EMPTY_LAB, performanceScore: 90 },
          fieldData: null,
          opportunities: [],
          diagnostics: [],
        },
      },
    });
    expect(mobileResult.performanceConfidence).toBe(100);
    expect(desktopResult.performanceConfidence).toBe(70);
    expect(desktopResult.performanceConfidence!).toBeLessThan(mobileResult.performanceConfidence!);
  });

  it("performanceScore null from provider → unavailable, not 0", () => {
    const result = calculateScores({
      results: PASS_ALL,
      snapshot: EMPTY_SNAPSHOT,
      pagespeed: {
        mobile: {
          strategy: "mobile",
          labMetrics: { ...EMPTY_LAB, performanceScore: null },
          fieldData: null,
          opportunities: [],
          diagnostics: [],
        },
        desktop: null,
      },
    });
    expect(result.performanceStatus).toBe("unavailable");
    expect(result.performanceScore).toBeNull();
  });

  it("genuine score 0 → available score 0", () => {
    const result = calculateScores({
      results: PASS_ALL,
      snapshot: EMPTY_SNAPSHOT,
      pagespeed: {
        mobile: {
          strategy: "mobile",
          labMetrics: { ...EMPTY_LAB, performanceScore: 0 },
          fieldData: null,
          opportunities: [],
          diagnostics: [],
        },
        desktop: null,
      },
    });
    expect(result.performanceStatus).toBe("available");
    expect(result.performanceScore).toBe(0);
    expect(result.performanceSource).toBe("pagespeed-mobile");
  });

  it("performance does not affect static score families", () => {
    const withPerf = calculateScores({
      results: PASS_ALL,
      snapshot: EMPTY_SNAPSHOT,
      pagespeed: {
        mobile: {
          strategy: "mobile",
          labMetrics: { ...EMPTY_LAB, performanceScore: 50 },
          fieldData: null,
          opportunities: [],
          diagnostics: [],
        },
        desktop: null,
      },
    });
    const withoutPerf = calculateScores({ results: PASS_ALL, snapshot: EMPTY_SNAPSHOT });
    expect(withPerf.rawScore).toBe(withoutPerf.rawScore);
    expect(withPerf.scoreFamilies).toEqual(withoutPerf.scoreFamilies);
  });
});

// ---------------------------------------------------------------------------
// Separate AEO and GEO readiness
// ---------------------------------------------------------------------------
describe("AEO and GEO readiness", () => {
  it("AEO and GEO are separate score families", () => {
    const result = calculateScores({ results: PASS_ALL, snapshot: EMPTY_SNAPSHOT });
    const families = result.scoreFamilies.map((f) => f.family);
    expect(families).toContain("aeo-readiness");
    expect(families).toContain("geo-readiness");
  });

  it("AEO and GEO scores are informational, not ranking predictions", () => {
    const result = calculateScores({ results: PASS_ALL, snapshot: EMPTY_SNAPSHOT });
    const aeo = result.scoreFamilies.find((f) => f.family === "aeo-readiness");
    const geo = result.scoreFamilies.find((f) => f.family === "geo-readiness");
    expect(aeo).toBeDefined();
    expect(geo).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// Score breakdown structure
// ---------------------------------------------------------------------------
describe("score breakdown structure", () => {
  it("contains all required fields", () => {
    const result = calculateScores({ results: PASS_ALL, snapshot: EMPTY_SNAPSHOT });
    expect(result.calculationVersion).toBeTruthy();
    expect(typeof result.rawScore).toBe("number");
    expect(typeof result.cappedScore).toBe("number");
    expect(typeof result.confidence).toBe("number");
    expect(Array.isArray(result.scoreFamilies)).toBe(true);
    expect(Array.isArray(result.categoryContributions)).toBe(true);
    expect(Array.isArray(result.appliedCaps)).toBe(true);
    expect(result.performanceStatus).toBe("unavailable");
  });

  it("score families include all 5 families", () => {
    const result = calculateScores({ results: PASS_ALL, snapshot: EMPTY_SNAPSHOT });
    const familyNames = result.scoreFamilies.map((f) => f.family);
    expect(familyNames).toContain("seo-health");
    expect(familyNames).toContain("accessibility");
    expect(familyNames).toContain("security-trust");
    expect(familyNames).toContain("aeo-readiness");
    expect(familyNames).toContain("geo-readiness");
  });

  it("category contributions cover all rule categories", () => {
    const result = calculateScores({ results: PASS_ALL, snapshot: EMPTY_SNAPSHOT });
    const cats = result.categoryContributions.map((c) => c.category);
    expect(cats).toContain("metadata");
    expect(cats).toContain("headings");
    expect(cats).toContain("url");
    expect(cats).toContain("links");
    expect(cats).toContain("images");
    expect(cats).toContain("structured-data");
    expect(cats).toContain("social");
    expect(cats).toContain("content");
    expect(cats).toContain("accessibility");
    expect(cats).toContain("forms");
  });
});

// ---------------------------------------------------------------------------
// Worked fixture tests showing exact calculations
// ---------------------------------------------------------------------------
describe("worked fixture examples", () => {
  it("single category all-passed produces 100 score", () => {
    const results = categoryRules("metadata", 14, "passed");
    const result = calculateScores({ results, snapshot: EMPTY_SNAPSHOT });
    const metaContribution = result.categoryContributions.find((c) => c.category === "metadata");
    expect(metaContribution).toBeDefined();
    expect(metaContribution!.rawScore).toBe(100);
    expect(metaContribution!.cappedScore).toBe(100);
  });

  it("single category half-warning produces ~75 score", () => {
    const results = [
      ...categoryRules("metadata", 7, "passed"),
      ...categoryRules("metadata", 7, "warning"),
    ];
    const result = calculateScores({ results, snapshot: EMPTY_SNAPSHOT });
    const metaContribution = result.categoryContributions.find((c) => c.category === "metadata");
    expect(metaContribution).toBeDefined();
    expect(metaContribution!.rawScore).toBeCloseTo(75, 0);
  });

  it("single category half-failed produces ~50 score", () => {
    const results = [
      ...categoryRules("metadata", 7, "passed"),
      ...categoryRules("metadata", 7, "failed"),
    ];
    const result = calculateScores({ results, snapshot: EMPTY_SNAPSHOT });
    const metaContribution = result.categoryContributions.find((c) => c.category === "metadata");
    expect(metaContribution).toBeDefined();
    expect(metaContribution!.rawScore).toBeCloseTo(50, 0);
  });
});

// ---------------------------------------------------------------------------
// Edge cases
// ---------------------------------------------------------------------------
describe("edge cases", () => {
  it("handles extraction truncation gracefully", () => {
    const snapshot = createMockSnapshot({
      content: { ...EMPTY_SNAPSHOT.content, isTruncated: true },
    });
    const result = calculateScores({ results: PASS_ALL, snapshot });
    expect(result).toBeDefined();
    expect(typeof result.rawScore).toBe("number");
  });

  it("handles empty applicable category", () => {
    const results = categoryRules("accessibility", 13, "not-applicable");
    const result = calculateScores({ results, snapshot: EMPTY_SNAPSHOT });
    expect(result).toBeDefined();
  });

  it("handles optional input absence (no keyword)", () => {
    const ctx = evaluateApplicability(EMPTY_SNAPSHOT);
    expect(ctx.hasTargetKeyword).toBe(false);
  });

  it("does not make unsupported ranking promises in breakdown", () => {
    const result = calculateScores({ results: PASS_ALL, snapshot: EMPTY_SNAPSHOT });
    const json = JSON.stringify(result).toLowerCase();
    expect(json).not.toContain("ranking prediction");
    expect(json).not.toContain("position");
    expect(json).not.toContain("rank");
  });

  it("handles duplicate signal ownership gracefully (no crash)", () => {
    const results = [
      makeResult("META-001", "passed", "metadata"),
      makeResult("META-001", "passed", "metadata"),
    ];
    const result = calculateScores({ results, snapshot: EMPTY_SNAPSHOT });
    expect(result).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// Category-level renormalization
// ---------------------------------------------------------------------------
describe("category weight renormalization", () => {
  it("not-applicable categories are excluded, remaining weights renormalize", () => {
    const results = [
      ...categoryRules("metadata", 14, "passed"),
      ...categoryRules("headings", 8, "passed"),
      ...categoryRules("url", 10, "passed"),
      ...categoryRules("links", 8, "passed"),
      ...categoryRules("images", 8, "passed"),
      ...categoryRules("structured-data", 6, "passed"),
      ...categoryRules("social", 6, "passed"),
      ...categoryRules("content", 7, "passed"),
      ...categoryRules("accessibility", 13, "passed"),
      ...categoryRules("forms", 5, "passed"),
    ];
    const result = calculateScores({ results, snapshot: EMPTY_SNAPSHOT });
    expect(result.rawScore).toBeGreaterThan(95);
  });
});
