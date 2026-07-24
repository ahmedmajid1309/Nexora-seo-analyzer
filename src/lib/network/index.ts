export { normalizeUrl } from "./normalize-url";
export type { NormalizedOutput } from "./normalize-url";

export { validateUrl } from "./validate-url";

export { parseAndValidateHost, isBracketedIpv6 } from "./parse-host";

export { parseIpv4ToBigInt, classifyIpv4, classifyIpv6, classifyAddress } from "./ip-address";
export type { IpClassification } from "./ip-address";

export { checkUrlPolicy, checkResolvedAddresses, checkSingleAddress } from "./network-policy";

export { resolveHost, defaultResolver } from "./resolve-host";
export type { HostResolver } from "./types";

export { checkRedirect } from "./redirect-policy";

export { classifyContentType, sniffIsHtml } from "./content-type";

export { readResponseStream, buildRequestOptions } from "./response-reader";

export { safeFetch } from "./safe-fetch";

export {
  NetworkError,
  networkError,
  FetchPreviewInputSchema,
  FetchResultSchema,
  NetworkErrorCodeEnum,
} from "./types";
export type {
  NetworkErrorCode,
  FetchResult,
  RedirectStep,
  ResolvedAddress,
  FetchPreviewInput,
} from "./types";

export {
  ALLOWED_SCHEMES,
  ALLOWED_PORTS,
  MAX_FETCH_SIZE_BYTES,
  MAX_DECOMPRESSED_SIZE_BYTES,
  DNS_TIMEOUT_MS,
  CONNECTION_TIMEOUT_MS,
  TOTAL_DEADLINE_MS,
  MAX_REDIRECTS,
  USER_AGENT,
} from "./constants";
