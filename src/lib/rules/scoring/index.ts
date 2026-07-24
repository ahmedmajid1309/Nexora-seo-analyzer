export { calculateScores } from "./engine";
export type { ScoringInput } from "./engine";
export { evaluateApplicability } from "./applicability";
export { evaluateCaps, CAP_SPECS } from "./cap-registry";
export { SCORE_FAMILY_DEFINITIONS, sumWeights, assertWeightsTotal100 } from "./weights";
export type {
  ScoreBreakdown,
  ScoreFamilyResult,
  CategoryContribution,
  CriticalCap,
  ApplicabilityContext,
  ScoreFamily,
  RuleCategoryWeightMap,
  ScorePreviewData,
} from "./types";
export { CALCULATION_VERSION, SCORE_FAMILIES } from "./types";
