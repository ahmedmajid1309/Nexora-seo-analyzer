import type { ScoreFamilyDefinition, RuleCategoryWeightMap } from "./types";

export const SEO_HEALTH_WEIGHTS: RuleCategoryWeightMap = {
  metadata: 20,
  headings: 10,
  url: 10,
  links: 10,
  images: 8,
  "structured-data": 8,
  social: 8,
  content: 10,
  accessibility: 8,
  forms: 8,
};

export const ACCESSIBILITY_WEIGHTS: RuleCategoryWeightMap = {
  accessibility: 40,
  forms: 20,
  images: 20,
  content: 20,
  metadata: 0,
  headings: 0,
  url: 0,
  links: 0,
  "structured-data": 0,
  social: 0,
};

export const SECURITY_TRUST_WEIGHTS: RuleCategoryWeightMap = {
  url: 30,
  links: 25,
  forms: 25,
  metadata: 20,
  headings: 0,
  images: 0,
  "structured-data": 0,
  social: 0,
  content: 0,
  accessibility: 0,
};

export const AEO_READINESS_WEIGHTS: RuleCategoryWeightMap = {
  content: 35,
  headings: 25,
  "structured-data": 25,
  social: 15,
  metadata: 0,
  url: 0,
  links: 0,
  images: 0,
  accessibility: 0,
  forms: 0,
};

export const GEO_READINESS_WEIGHTS: RuleCategoryWeightMap = {
  content: 30,
  social: 25,
  "structured-data": 25,
  metadata: 20,
  headings: 0,
  url: 0,
  links: 0,
  images: 0,
  accessibility: 0,
  forms: 0,
};

export const SCORE_FAMILY_DEFINITIONS: ScoreFamilyDefinition[] = [
  {
    family: "seo-health",
    name: "SEO Health",
    categories: SEO_HEALTH_WEIGHTS,
    description: "Overall SEO health assessment based on verified static findings",
  },
  {
    family: "accessibility",
    name: "Accessibility",
    categories: ACCESSIBILITY_WEIGHTS,
    description: "Accessibility compliance and inclusivity assessment",
  },
  {
    family: "security-trust",
    name: "Security and Trust",
    categories: SECURITY_TRUST_WEIGHTS,
    description: "Security and trust signals including HTTPS and safe form handling",
  },
  {
    family: "aeo-readiness",
    name: "AEO Readiness",
    categories: AEO_READINESS_WEIGHTS,
    description: "Readiness for answer-engine consumption — informational, not a ranking predictor",
  },
  {
    family: "geo-readiness",
    name: "GEO Readiness",
    categories: GEO_READINESS_WEIGHTS,
    description: "Readiness for generative AI consumption — informational, not a ranking predictor",
  },
];

export function sumWeights(weights: RuleCategoryWeightMap): number {
  return Object.values(weights).reduce((sum, w) => sum + w, 0);
}

export function assertWeightsTotal100(): void {
  for (const def of SCORE_FAMILY_DEFINITIONS) {
    const total = sumWeights(def.categories);
    if (Math.abs(total - 100) > 0.01) {
      throw new Error(`Weights for "${def.family}" total ${total}%, expected exactly 100%`);
    }
  }
}
