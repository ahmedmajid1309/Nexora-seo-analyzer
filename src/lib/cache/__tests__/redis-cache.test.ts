import { describe, expect, it } from "vitest";
import { createAuditCacheKey } from "../redis-cache";

describe("Redis audit cache keys", () => {
  it("invalidates by schema, calculation, and rule versions", () => {
    const base = createAuditCacheKey({
      auditType: "quick",
      url: "https://example.com",
      calculationVersion: "calc-1",
      ruleVersion: "rules-1",
    });
    const changedCalculation = createAuditCacheKey({
      auditType: "quick",
      url: "https://example.com",
      calculationVersion: "calc-2",
      ruleVersion: "rules-1",
    });
    const changedRules = createAuditCacheKey({
      auditType: "quick",
      url: "https://example.com",
      calculationVersion: "calc-1",
      ruleVersion: "rules-2",
    });

    expect(base).toMatch(/^audit-cache:[a-f0-9]{64}$/);
    expect(changedCalculation).not.toBe(base);
    expect(changedRules).not.toBe(base);
  });
});
