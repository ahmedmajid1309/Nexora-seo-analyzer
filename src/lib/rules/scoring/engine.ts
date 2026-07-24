import type { RuleResult } from "../types";
import type { PageSnapshot } from "@/lib/extraction/schemas";
import type { PageSpeedOutput } from "@/lib/pagespeed/types";
import { evaluateApplicability } from "./applicability";
import {
  type ScoreBreakdown,
  type ScoreFamilyResult,
  type CategoryContribution,
  type CriticalCap,
  type RuleCategoryWeightMap,
  type ScoreFamilyDefinition,
  type ScoreFamily,
  type PerformanceSource,
  CALCULATION_VERSION,
} from "./types";
import { evaluateCaps, getApplicableCapsForFamily, CAP_SPECS } from "./cap-registry";
import { SCORE_FAMILY_DEFINITIONS } from "./weights";

const STATE_MULTIPLIER: Record<string, number> = {
  passed: 1.0,
  warning: 0.5,
  failed: 0.0,
};

function getCategoryContribution(
  category: string,
  results: RuleResult[],
  weights: RuleCategoryWeightMap,
  caps: CriticalCap[],
  family: string,
): CategoryContribution {
  const categoryResults = results.filter((r) => r.category === category);
  const scored = categoryResults.filter((r) => r.scored);
  const informational = categoryResults.filter((r) => !r.scored);

  let maxWeight = 0;
  let earnedWeight = 0;
  let applicableCount = 0;
  let evaluatedCount = 0;
  let unavailableCount = 0;
  let notApplicableCount = 0;
  const informationalCount = informational.length;
  let passedCount = 0;
  let warningCount = 0;
  let failedCount = 0;

  const catWeight = weights[category] ?? 0;

  for (const r of scored) {
    const multiplier = STATE_MULTIPLIER[r.state];
    if (multiplier !== undefined) {
      maxWeight += catWeight;
      earnedWeight += catWeight * multiplier;
      evaluatedCount++;
      applicableCount++;
      if (r.state === "passed") passedCount++;
      else if (r.state === "warning") warningCount++;
      else if (r.state === "failed") failedCount++;
    } else if (r.state === "not-applicable") {
      notApplicableCount++;
    } else if (r.state === "unavailable") {
      unavailableCount++;
      maxWeight += catWeight;
    }
  }

  const rawScore = maxWeight > 0 ? (earnedWeight / maxWeight) * 100 : 100;

  const familyCaps = getApplicableCapsForFamily(caps, family, CAP_SPECS);
  const maxCap = familyCaps.length > 0 ? Math.min(...familyCaps.map((c) => c.maxScore)) : 100;
  const cappedScore = Math.min(rawScore, maxCap);

  return {
    category,
    rawScore,
    cappedScore,
    maxWeight: maxWeight,
    earnedWeight,
    applicableCount,
    evaluatedCount,
    unavailableCount,
    notApplicableCount,
    informationalCount,
    passedCount,
    warningCount,
    failedCount,
  };
}

function calculateCategoryConfidence(evaluatedCount: number, expectedCount: number): number {
  if (expectedCount === 0) return 100;
  return Math.round((evaluatedCount / expectedCount) * 100);
}

function calculateScoreFamily(
  family: string,
  definitions: ScoreFamilyDefinition[],
  results: RuleResult[],
  caps: CriticalCap[],
): ScoreFamilyResult {
  const def = definitions.find((d: ScoreFamilyDefinition) => d.family === family);
  if (!def) {
    return {
      family: family as ScoreFamily,
      name: family,
      rawScore: 0,
      cappedScore: 0,
      confidence: 0,
      categories: [],
    };
  }

  const categories = Object.keys(def.categories).filter((cat) => (def.categories[cat] ?? 0) > 0);

  const contributions: CategoryContribution[] = categories.map((cat) =>
    getCategoryContribution(cat, results, def.categories, caps, family),
  );

  const activeCategories = contributions.filter((c) => c.maxWeight > 0);
  const totalMaxWeight = activeCategories.reduce((s, c) => s + c.maxWeight, 0);
  const totalEarnedWeight = activeCategories.reduce((s, c) => s + c.earnedWeight, 0);
  const totalEvaluated = activeCategories.reduce((s, c) => s + c.evaluatedCount, 0);
  const totalApplicable = activeCategories.reduce(
    (s, c) => s + c.applicableCount + c.unavailableCount,
    0,
  );

  const rawScore = totalMaxWeight > 0 ? (totalEarnedWeight / totalMaxWeight) * 100 : 100;

  const familyCaps = getApplicableCapsForFamily(caps, family, CAP_SPECS);
  const maxCap = familyCaps.length > 0 ? Math.min(...familyCaps.map((c) => c.maxScore)) : 100;
  const cappedScore = Math.min(rawScore, maxCap);

  const confidence = calculateCategoryConfidence(totalEvaluated, totalApplicable);

  return {
    family: def.family,
    name: def.name,
    rawScore: Math.round(rawScore * 100) / 100,
    cappedScore: Math.round(cappedScore * 100) / 100,
    confidence,
    categories: contributions,
  };
}

function calculateOverallConfidence(familyResults: ScoreFamilyResult[]): number {
  if (familyResults.length === 0) return 100;
  const avg = familyResults.reduce((s, f) => s + f.confidence, 0) / familyResults.length;
  return Math.round(avg);
}

function calculateOverallScore(familyResults: ScoreFamilyResult[]): {
  raw: number;
  capped: number;
} {
  if (familyResults.length === 0) return { raw: 0, capped: 0 };
  const rawSum = familyResults.reduce((s, f) => s + f.rawScore, 0);
  const cappedSum = familyResults.reduce((s, f) => s + f.cappedScore, 0);
  return {
    raw: Math.round((rawSum / familyResults.length) * 100) / 100,
    capped: Math.round((cappedSum / familyResults.length) * 100) / 100,
  };
}

export interface ScoringInput {
  results: RuleResult[];
  snapshot: PageSnapshot;
  pagespeed?: PageSpeedOutput;
}

function computePageSpeedScore(pagespeed: PageSpeedOutput | undefined): {
  performanceScore: number | null;
  performanceStatus: "unavailable" | "available";
  performanceSource: PerformanceSource;
  performanceConfidence: number | null;
  performanceExplanation: string;
} {
  if (!pagespeed) {
    return {
      performanceScore: null,
      performanceStatus: "unavailable",
      performanceSource: null,
      performanceConfidence: null,
      performanceExplanation:
        "PageSpeed Insights API key is not configured. Add PAGESPEED_API_KEY to enable performance scoring.",
    };
  }

  const mobileScore = pagespeed.mobile?.labMetrics.performanceScore;
  const desktopScore = pagespeed.desktop?.labMetrics.performanceScore;

  const mobileValid = mobileScore !== undefined && mobileScore !== null;
  const desktopValid = desktopScore !== undefined && desktopScore !== null;

  if (!mobileValid && !desktopValid) {
    return {
      performanceScore: null,
      performanceStatus: "unavailable",
      performanceSource: null,
      performanceConfidence: null,
      performanceExplanation: "PageSpeed Insights returned no performance data.",
    };
  }

  if (mobileValid) {
    return {
      performanceScore: Math.round(mobileScore!),
      performanceStatus: "available",
      performanceSource: "pagespeed-mobile",
      performanceConfidence: 100,
      performanceExplanation: desktopValid
        ? "Performance score based on mobile Lighthouse data. Desktop data available under the Desktop tab."
        : "Performance score based on mobile Lighthouse data.",
    };
  }

  return {
    performanceScore: Math.round(desktopScore!),
    performanceStatus: "available",
    performanceSource: "pagespeed-desktop-fallback",
    performanceConfidence: 70,
    performanceExplanation:
      "Mobile PageSpeed data was unavailable. Score uses desktop Lighthouse data as a fallback. Confidence is reduced because the score is based on a desktop-only measurement.",
  };
}

export function calculateScores(input: ScoringInput): ScoreBreakdown {
  const { results, snapshot, pagespeed } = input;

  const applicableContext = evaluateApplicability(snapshot);

  const caps = evaluateCaps(results, applicableContext);

  const nonApplicableCount = results.filter((r) => r.state === "not-applicable").length;
  const unavailableCount = results.filter((r) => r.state === "unavailable").length;

  const familyResults: ScoreFamilyResult[] = SCORE_FAMILY_DEFINITIONS.map(
    (def: ScoreFamilyDefinition) =>
      calculateScoreFamily(def.family, SCORE_FAMILY_DEFINITIONS, results, caps),
  );

  const overall = calculateOverallScore(familyResults);
  const overallConfidence = calculateOverallConfidence(familyResults);

  const allCategoryContributions: CategoryContribution[] = [];
  const seenCategories = new Set<string>();
  for (const family of familyResults) {
    for (const cat of family.categories) {
      if (!seenCategories.has(cat.category)) {
        seenCategories.add(cat.category);
        allCategoryContributions.push(cat);
      }
    }
  }

  const maxAvailableWeight = allCategoryContributions.reduce((s, c) => s + c.maxWeight, 0);
  const earnedWeight = allCategoryContributions.reduce((s, c) => s + c.earnedWeight, 0);
  const evaluatedCount = allCategoryContributions.reduce((s, c) => s + c.evaluatedCount, 0);
  const applicableCount = allCategoryContributions.reduce((s, c) => s + c.applicableCount, 0);
  const informationalCount = allCategoryContributions.reduce((s, c) => s + c.informationalCount, 0);

  const ps = computePageSpeedScore(pagespeed);

  return {
    calculationVersion: CALCULATION_VERSION,
    rawScore: overall.raw,
    cappedScore: overall.capped,
    confidence: overallConfidence,
    applicableScoredRuleCount: applicableCount,
    evaluatedRuleCount: evaluatedCount,
    unavailableRuleCount: unavailableCount,
    notApplicableRuleCount: nonApplicableCount,
    informationalRuleCount: informationalCount,
    maxAvailableWeight,
    earnedWeight,
    appliedCaps: caps.filter((c) => c.applied),
    scoreFamilies: familyResults,
    categoryContributions: allCategoryContributions,
    excludedSignals: [],
    performanceScore: ps.performanceScore,
    performanceStatus: ps.performanceStatus,
    performanceSource: ps.performanceSource,
    performanceConfidence: ps.performanceConfidence,
    performanceExplanation: ps.performanceExplanation,
  };
}
