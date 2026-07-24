import { describe, it, expect } from "vitest";
import { extractFieldData } from "../field-data";

function loadingExperience(overrides?: Record<string, unknown>): Record<string, unknown> {
  return {
    id: "example.com",
    metrics: {
      LARGEST_CONTENTFUL_PAINT_MS: { percentile: 2500, distributions: [], category: "AVERAGE" },
      CUMULATIVE_LAYOUT_SHIFT_SCORE: { percentile: 0.15, distributions: [], category: "AVERAGE" },
      INTERACTION_TO_NEXT_PAINT: { percentile: 200, distributions: [], category: "GOOD" },
      FIRST_CONTENTFUL_PAINT_MS: { percentile: 1800, distributions: [], category: "FAST" },
    },
    overall_category: "AVERAGE",
    ...overrides,
  };
}

describe("extractFieldData", () => {
  it("extracts field data from a complete CrUX response", () => {
    const result = extractFieldData(loadingExperience() as Parameters<typeof extractFieldData>[0]);
    expect(result).not.toBeNull();
    expect(result!.overallCategory).toBe("AVERAGE");
    expect(result!.lcp).toEqual({ p75Ms: 2500, category: "AVERAGE" });
    expect(result!.cls).toEqual({ p75: 0.15, category: "AVERAGE" });
    expect(result!.inp).toEqual({ p75Ms: 200, category: "GOOD" });
    expect(result!.fcp).toEqual({ p75Ms: 1800, category: "FAST" });
  });

  it("returns null when loadingExperience is undefined", () => {
    expect(extractFieldData(undefined)).toBeNull();
  });

  it("returns partial data when metrics are missing", () => {
    const result = extractFieldData({
      metrics: undefined,
      overall_category: "UNKNOWN",
    } as Parameters<typeof extractFieldData>[0]);
    expect(result).not.toBeNull();
    expect(result!.lcp).toBeNull();
    expect(result!.overallCategory).toBe("UNKNOWN");
  });

  it("handles partial metrics gracefully", () => {
    const result = extractFieldData(
      loadingExperience({
        metrics: {
          LARGEST_CONTENTFUL_PAINT_MS: { percentile: 3000, distributions: [], category: "SLOW" },
        },
        overall_category: "SLOW",
      }) as Parameters<typeof extractFieldData>[0],
    );
    expect(result!.lcp).toEqual({ p75Ms: 3000, category: "SLOW" });
    expect(result!.cls).toBeNull();
    expect(result!.inp).toBeNull();
  });

  it("handles missing overall_category", () => {
    const result = extractFieldData({ metrics: {} } as Parameters<typeof extractFieldData>[0]);
    expect(result!.overallCategory).toBe("UNKNOWN");
  });
});
