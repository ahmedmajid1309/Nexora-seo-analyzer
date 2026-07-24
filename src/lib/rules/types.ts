import type { PageSnapshot } from "@/lib/extraction/types";

export type RuleState = "passed" | "warning" | "failed" | "not-applicable" | "unavailable";

export type Severity = "critical" | "high" | "medium" | "low" | "informational";

export type Effort = "low" | "medium" | "high";

export type Source =
  "http-response" | "html-parse" | "rendered-dom" | "cross-page-analysis" | "external-api";

export type Responsible = "owner" | "seo" | "developer" | "content-editor" | "designer";

export type ExecutionMode = "static";

export type Disposition =
  "PORT_AS_IS" | "PORT_WITH_MODIFICATIONS" | "USE_AS_REFERENCE" | "REWRITE" | "SKIP" | "FUTURE";

export interface Provenance {
  upstreamRuleId: string;
  upstreamSourcePath: string;
  upstreamCommitHash: string;
  disposition: Disposition;
  modifications?: string;
}

export interface RuleEvidence {
  summary: string;
  observedValue: string | number | boolean | null;
  expectedValue: string | number | boolean | null;
  selector?: string;
  samples?: string[];
}

export interface RuleRemediation {
  summary: string;
  steps: string[];
  developerNotes?: string;
  contentNotes?: string;
  responsible: Responsible;
}

export interface RuleResult {
  checkId: string;
  state: RuleState;
  evidence: RuleEvidence;
  remediation: RuleRemediation;
  severity: Severity;
  scored: boolean;
  impact: string;
  effort: Effort;
  confidence: number;
  source: Source;
  category: string;
  applicabilityReason?: string;
  unavailableReason?: string;
}

export interface RuleDefinition {
  id: string;
  name: string;
  description: string;
  category: string;
  executionMode: ExecutionMode;
  defaultSeverity: Severity;
  defaultImpact: string;
  defaultEffort: Effort;
  scored: boolean;
  provenance?: Provenance;
  signalOwner: string;
  ruleVersion: number;
  evaluator: (snapshot: PageSnapshot) => RuleResult;
}

export type RuleCategory =
  | "metadata"
  | "headings"
  | "url"
  | "links"
  | "images"
  | "structured-data"
  | "social"
  | "content"
  | "accessibility"
  | "forms";

export const RULE_CATEGORIES: RuleCategory[] = [
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

export interface RuleRegistryEntry {
  id: string;
  name: string;
  category: RuleCategory;
  defaultSeverity: Severity;
  scored: boolean;
  signalOwner: string;
  provenance?: Provenance;
  ruleVersion: number;
}
