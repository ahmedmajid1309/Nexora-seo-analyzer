import type { PageSnapshot } from "@/lib/extraction/schemas";
import type { RuleResult, RuleDefinition } from "./types";
import { getAllRules, getRulesByCategory } from "./registry";
import type { RuleCategory } from "./types";

export interface RunResult {
  results: RuleResult[];
  durationMs: number;
  errorCount: number;
}

export function runAll(snapshot: PageSnapshot): RunResult {
  return runRules(getAllRules(), snapshot);
}

export function runCategory(snapshot: PageSnapshot, category: RuleCategory): RunResult {
  return runRules(getRulesByCategory(category), snapshot);
}

export function runRules(rules: RuleDefinition[], snapshot: PageSnapshot): RunResult {
  const results: RuleResult[] = [];
  let errorCount = 0;
  const start = Date.now();

  for (const rule of rules) {
    try {
      const result = rule.evaluator(snapshot);
      results.push(result);
    } catch (err) {
      errorCount++;
      results.push({
        checkId: rule.id,
        state: "unavailable",
        evidence: {
          summary: `Unexpected error evaluating rule: ${err instanceof Error ? err.message : String(err)}`,
          observedValue: null,
          expectedValue: null,
        },
        remediation: {
          summary: "",
          steps: [],
          responsible: "developer",
        },
        severity: rule.defaultSeverity,
        scored: false,
        impact: rule.defaultImpact,
        effort: rule.defaultEffort,
        confidence: 0,
        source: "html-parse",
        category: rule.category,
        unavailableReason: "Evaluator threw an unexpected error",
      });
    }
  }

  return {
    results,
    durationMs: Date.now() - start,
    errorCount,
  };
}
