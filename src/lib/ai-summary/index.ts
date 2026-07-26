export { buildQuickEvidencePack, buildSiteEvidencePack } from "./evidence-pack";
export { generateAiExecutiveSummary } from "./orchestrator";
export { getAiSummaryCacheSize } from "./cache";
export { getAiSummaryCircuitState } from "./circuit-breaker";
export type { AiExecutiveSummary, AiSummaryProgressEvent, AiSummaryResult } from "./types";

export function getAiSummaryReadiness() {
  return {
    enabled: process.env.AI_SUMMARY_ENABLED === "true",
    providersConfigured: {
      gemini: Boolean(process.env.GEMINI_API_KEY),
      groq: Boolean(process.env.GROQ_API_KEY),
    },
  };
}
