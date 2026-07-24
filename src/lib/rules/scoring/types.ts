import type { RuleCategory } from "../types";

export type PerformanceSource = "pagespeed-mobile" | "pagespeed-desktop-fallback" | null;

export type ScoreFamily =
  "seo-health" | "accessibility" | "security-trust" | "aeo-readiness" | "geo-readiness";

export const SCORE_FAMILIES: ScoreFamily[] = [
  "seo-health",
  "accessibility",
  "security-trust",
  "aeo-readiness",
  "geo-readiness",
];

export const CALCULATION_VERSION = "1.0.0";

export interface ApplicabilityContext {
  hasForms: boolean;
  hasTables: boolean;
  hasIframes: boolean;
  hasMedia: boolean;
  hasJsonLd: boolean;
  hasHreflang: boolean;
  hasTargetKeyword: boolean;
  isIndexable: boolean;
  hasRelevantSocialMetadata: boolean;
  hasRelevantImageElements: boolean;
}

export type RuleCategoryWeightMap = Record<RuleCategory | string, number>;

export interface ScoreFamilyDefinition {
  family: ScoreFamily;
  name: string;
  categories: RuleCategoryWeightMap;
  description: string;
}

export interface CriticalCap {
  capId: string;
  triggerCheckIds: string[];
  reason: string;
  maxScore: number;
  applied: boolean;
}

export interface CategoryContribution {
  category: string;
  rawScore: number;
  cappedScore: number;
  maxWeight: number;
  earnedWeight: number;
  applicableCount: number;
  evaluatedCount: number;
  unavailableCount: number;
  notApplicableCount: number;
  informationalCount: number;
  passedCount: number;
  warningCount: number;
  failedCount: number;
}

export interface ScoreFamilyResult {
  family: ScoreFamily;
  name: string;
  rawScore: number;
  cappedScore: number;
  confidence: number;
  categories: CategoryContribution[];
}

export interface ScoreBreakdown {
  calculationVersion: string;
  rawScore: number;
  cappedScore: number;
  confidence: number;
  applicableScoredRuleCount: number;
  evaluatedRuleCount: number;
  unavailableRuleCount: number;
  notApplicableRuleCount: number;
  informationalRuleCount: number;
  maxAvailableWeight: number;
  earnedWeight: number;
  appliedCaps: CriticalCap[];
  scoreFamilies: ScoreFamilyResult[];
  categoryContributions: CategoryContribution[];
  excludedSignals: string[];
  performanceScore: number | null;
  performanceStatus: "unavailable" | "available";
  performanceSource: PerformanceSource;
  performanceConfidence: number | null;
  performanceExplanation: string;
}

export interface ScorePreviewData {
  requestId: string;
  requestedUrl: string;
  finalUrl: string;
  totalRules: number;
  stateCounts: Record<string, number>;
  scoreFamilies: ScoreFamilyResult[];
  confidence: number;
  appliedCaps: CriticalCap[];
  topFindings: Array<{
    checkId: string;
    state: string;
    category: string;
    summary: string;
  }>;
  findingsTruncated: boolean;
  partialStage: string | null;
  unavailableStage: string | null;
  performanceScore: number | null;
  performanceStatus: "unavailable" | "available";
  performanceSource: PerformanceSource;
  performanceConfidence: number | null;
  calculationVersion: string;
}
