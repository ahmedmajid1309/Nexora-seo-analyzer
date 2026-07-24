export type PageSpeedStrategy = "mobile" | "desktop";

export type PerformanceSource = "pagespeed-mobile" | "pagespeed-desktop-fallback" | null;

export interface PageSpeedLabMetrics {
  lcp: { value: number; score: number } | null;
  cls: { value: number; score: number } | null;
  tbt: { value: number; score: number } | null;
  si: { value: number; score: number } | null;
  fcp: { value: number; score: number } | null;
  performanceScore: number | null;
  lighthouseAccessibilityScore: number | null;
  lighthouseSeoScore: number | null;
  lighthouseBestPracticesScore: number | null;
}

export interface PageSpeedFieldData {
  lcp: { p75Ms: number; category: string } | null;
  cls: { p75: number; category: string } | null;
  inp: { p75Ms: number; category: string } | null;
  fcp: { p75Ms: number; category: string } | null;
  overallCategory: string;
}

export interface PageSpeedOpportunity {
  id: string;
  title: string;
  description: string;
  score: number;
  estimatedSavingsMs: number | null;
  details: string[];
}

export interface PageSpeedResult {
  strategy: PageSpeedStrategy;
  labMetrics: PageSpeedLabMetrics;
  fieldData: PageSpeedFieldData | null;
  opportunities: PageSpeedOpportunity[];
  diagnostics: PageSpeedOpportunity[];
}

export interface PageSpeedOutput {
  mobile: PageSpeedResult | null;
  desktop: PageSpeedResult | null;
  error?: string;
}
