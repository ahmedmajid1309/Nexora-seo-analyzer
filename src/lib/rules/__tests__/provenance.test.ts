import { describe, it, expect } from "vitest";
import { getAllRules } from "../registry";

describe("Provenance compliance", () => {
  const allRules = getAllRules();

  it("every rule has a provenance record", () => {
    const missing = allRules.filter((r) => !r.provenance);
    expect(missing).toEqual([]);
  });

  it("every provenance check ID exists in the registry", () => {
    const ruleIds = new Set(allRules.map((r) => r.id));
    for (const rule of allRules) {
      expect(ruleIds.has(rule.id)).toBe(true);
    }
  });

  it("no duplicate provenance records exist (unique rule IDs)", () => {
    const ids = allRules.map((r) => r.id);
    const duplicates = ids.filter((id, i) => ids.indexOf(id) !== i);
    expect(duplicates).toEqual([]);
  });

  it("no fake upstream paths are accepted", () => {
    const fakePatterns = [
      "github.com/nicknisi",
      "github.com/seo-skills",
      "seomator",
      "seo-audit-skill",
    ];
    for (const rule of allRules) {
      const p = rule.provenance!;
      if (p.upstreamSourcePath && p.upstreamSourcePath !== "not applicable") {
        for (const pattern of fakePatterns) {
          expect(p.upstreamSourcePath.toLowerCase()).not.toContain(pattern);
        }
      }
    }
  });

  it("REWRITE disposition has not-applicable upstream fields", () => {
    const rewrites = allRules.filter((r) => r.provenance!.disposition === "REWRITE");
    for (const rule of rewrites) {
      expect(rule.provenance!.upstreamRuleId).toBe("not applicable");
      expect(rule.provenance!.upstreamSourcePath).toBe("not applicable");
      expect(rule.provenance!.upstreamCommitHash).toBe("not applicable");
    }
  });

  it("ported/adapted rules have valid upstream references", () => {
    const ported = allRules.filter((r) =>
      ["USE_AS_REFERENCE", "PORT_AS_IS", "PORT_WITH_MODIFICATIONS"].includes(
        r.provenance!.disposition,
      ),
    );
    for (const rule of ported) {
      expect(rule.provenance!.upstreamRuleId).not.toBe("not applicable");
      expect(rule.provenance!.upstreamSourcePath).not.toBe("not applicable");
      expect(rule.provenance!.upstreamCommitHash).toBeTruthy();
    }
  });

  it("provenance disposition is a valid value", () => {
    const valid = ["PORT_AS_IS", "PORT_WITH_MODIFICATIONS", "USE_AS_REFERENCE", "REWRITE"];
    for (const rule of allRules) {
      expect(valid).toContain(rule.provenance!.disposition);
    }
  });
});
