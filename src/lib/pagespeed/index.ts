export { fetchPageSpeed, fetchPageSpeedBoth } from "./parser";
export type { FetchPageSpeedOptions, FetchPageSpeedBothOptions } from "./parser";
export type {
  PageSpeedResult,
  PageSpeedOutput,
  PageSpeedStrategy,
  PageSpeedLabMetrics,
  PageSpeedFieldData,
  PageSpeedOpportunity,
} from "./types";
export {
  PageSpeedError,
  PageSpeedQuotaError,
  PageSpeedAuthError,
  PageSpeedApiError,
  PageSpeedNetworkError,
  PageSpeedParseError,
  classifyPageSpeedError,
} from "./errors";
export { clearPageSpeedCache } from "./cache";
