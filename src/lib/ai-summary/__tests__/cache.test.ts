import { beforeEach, describe, expect, it } from "vitest";
import {
  clearAiSummaryCacheForTests,
  getAiSummaryCacheSize,
  getCachedSummary,
  setCachedSummaryWithLimit,
} from "../cache";

describe("AI summary cache", () => {
  beforeEach(() => clearAiSummaryCacheForTests());

  it("evicts oldest entries when max entries is exceeded", () => {
    setCachedSummaryWithLimit("a", { value: 1 }, 60_000, 2);
    setCachedSummaryWithLimit("b", { value: 2 }, 60_000, 2);
    setCachedSummaryWithLimit("c", { value: 3 }, 60_000, 2);

    expect(getAiSummaryCacheSize()).toBe(2);
    expect(getCachedSummary("a")).toBeNull();
    expect(getCachedSummary("b")).toEqual({ value: 2 });
    expect(getCachedSummary("c")).toEqual({ value: 3 });
  });

  it("expires entries by TTL", () => {
    setCachedSummaryWithLimit("a", { value: 1 }, 1, 10);

    return new Promise<void>((resolve) => {
      setTimeout(() => {
        expect(getCachedSummary("a")).toBeNull();
        resolve();
      }, 5);
    });
  });
});
