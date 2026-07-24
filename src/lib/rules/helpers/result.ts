import type { RuleResult, Severity, Effort, Source, Responsible } from "../types";

export interface Opts {
  severity?: Severity;
  effort?: Effort;
  impact?: string;
  source?: Source;
  responsible?: Responsible;
  samples?: string[];
  selector?: string;
  confidence?: number;
  steps?: string[];
  developerNotes?: string;
  contentNotes?: string;
}

export function passed(
  checkId: string,
  summary: string,
  observed: string | number | boolean | null,
  category: string,
  expected: string | number | boolean | null = true,
  opts: Opts = {},
): RuleResult {
  return result("passed", checkId, summary, observed, expected, category, opts);
}

export function warning(
  checkId: string,
  summary: string,
  observed: string | number | boolean | null,
  category: string,
  expected: string | number | boolean | null,
  opts: Opts = {},
): RuleResult {
  return result("warning", checkId, summary, observed, expected, category, opts);
}

export function failed(
  checkId: string,
  summary: string,
  observed: string | number | boolean | null,
  category: string,
  expected: string | number | boolean | null,
  opts: Opts = {},
): RuleResult {
  return result("failed", checkId, summary, observed, expected, category, opts);
}

export function notApplicable(
  checkId: string,
  summary: string,
  category: string,
  reason: string,
  opts: Opts = {},
): RuleResult {
  return {
    checkId,
    state: "not-applicable",
    evidence: { summary, observedValue: null, expectedValue: null },
    remediation: { summary: "", steps: [], responsible: opts.responsible ?? "developer" },
    severity: opts.severity ?? "low",
    scored: false,
    impact: opts.impact ?? "",
    effort: opts.effort ?? "medium",
    confidence: 100,
    source: opts.source ?? "html-parse",
    category,
    applicabilityReason: reason,
  };
}

export function unavailableResult(
  checkId: string,
  summary: string,
  category: string,
  reason: string,
  opts: Opts = {},
): RuleResult {
  return {
    checkId,
    state: "unavailable",
    evidence: { summary, observedValue: null, expectedValue: null },
    remediation: { summary: "", steps: [], responsible: opts.responsible ?? "developer" },
    severity: opts.severity ?? "low",
    scored: false,
    impact: opts.impact ?? "",
    effort: opts.effort ?? "medium",
    confidence: 0,
    source: opts.source ?? "html-parse",
    category,
    unavailableReason: reason,
  };
}

function result(
  state: "passed" | "warning" | "failed",
  checkId: string,
  summary: string,
  observed: string | number | boolean | null,
  expected: string | number | boolean | null,
  category: string,
  opts: Opts,
): RuleResult {
  return {
    checkId,
    state,
    evidence: {
      summary,
      observedValue: observed,
      expectedValue: expected,
      selector: opts.selector,
      samples: opts.samples?.slice(0, 3),
    },
    remediation: {
      summary: opts.impact ?? "",
      steps: opts.steps ?? [],
      developerNotes: opts.developerNotes,
      contentNotes: opts.contentNotes,
      responsible: opts.responsible ?? "developer",
    },
    severity: opts.severity ?? "low",
    scored: true,
    impact: opts.impact ?? "",
    effort: opts.effort ?? "medium",
    confidence: opts.confidence ?? 95,
    source: opts.source ?? "html-parse",
    category,
  };
}
