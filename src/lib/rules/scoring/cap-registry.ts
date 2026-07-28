import type { CriticalCap } from "./types";

export interface CapSpec {
  capId: string;
  triggerCheckIds: string[];
  familyTarget: "seo-health" | "accessibility" | "security-trust";
  reason: string;
  maxScore: number;
}

export const CAP_SPECS: CapSpec[] = [
  {
    capId: "CAP-NOINDEX",
    triggerCheckIds: ["META-011"],
    familyTarget: "seo-health",
    reason: "Page has noindex directive — search engines cannot index this page",
    maxScore: 40,
  },
  {
    capId: "CAP-NO-TITLE",
    triggerCheckIds: ["META-001"],
    familyTarget: "seo-health",
    reason: "Page is missing a title tag — critical SERP element absent",
    maxScore: 50,
  },
  {
    capId: "CAP-NO-DESCRIPTION",
    triggerCheckIds: ["META-003"],
    familyTarget: "seo-health",
    reason: "Page is missing a meta description — SERP description control absent",
    maxScore: 80,
  },
  {
    capId: "CAP-NO-HTTPS",
    triggerCheckIds: ["URL-001"],
    familyTarget: "security-trust",
    reason: "Page does not use HTTPS — security and trust signal absent",
    maxScore: 30,
  },
  {
    capId: "CAP-CANONICAL-INVALID",
    triggerCheckIds: ["META-006"],
    familyTarget: "seo-health",
    reason: "Page has an invalid or conflicting canonical URL",
    maxScore: 60,
  },
];

export function evaluateCaps(
  results: Array<{ checkId: string; state: string; scored: boolean }>,
  applicableContext: { isIndexable: boolean },
): CriticalCap[] {
  const resultMap = new Map<string, string>();
  for (const r of results) {
    resultMap.set(r.checkId, r.state);
  }

  return CAP_SPECS.map((spec) => {
    const isTriggered = spec.triggerCheckIds.some((id) => {
      const state = resultMap.get(id);
      return (
        state === "failed" ||
        (id === "META-011" && state === "warning" && !applicableContext.isIndexable)
      );
    });

    return {
      capId: spec.capId,
      triggerCheckIds: spec.triggerCheckIds,
      reason: spec.reason,
      maxScore: spec.maxScore,
      applied: isTriggered,
    };
  });
}

export function getApplicableCapsForFamily(
  caps: CriticalCap[],
  family: string,
  specs: CapSpec[] = CAP_SPECS,
): CriticalCap[] {
  return caps.filter((c) => {
    const spec = specs.find((s) => s.capId === c.capId);
    return spec && spec.familyTarget === family && c.applied;
  });
}
