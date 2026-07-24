import { z } from "zod";
import { NexoraError } from "@/lib/errors";

export const NetworkErrorCodeEnum = z.enum([
  "INVALID_URL",
  "UNSUPPORTED_SCHEME",
  "UNSUPPORTED_PORT",
  "CREDENTIALS_NOT_ALLOWED",
  "HOSTNAME_NOT_ALLOWED",
  "IP_ADDRESS_NOT_ALLOWED",
  "DNS_RESOLUTION_FAILED",
  "DNS_TIMEOUT",
  "DNS_MIXED_PUBLIC_PRIVATE",
  "REDIRECT_LIMIT_EXCEEDED",
  "REDIRECT_LOOP",
  "REDIRECT_NOT_ALLOWED",
  "HTTPS_DOWNGRADE_NOT_ALLOWED",
  "FETCH_TIMEOUT",
  "CONNECTION_FAILED",
  "RESPONSE_TOO_LARGE",
  "UNSUPPORTED_CONTENT_TYPE",
  "INVALID_RESPONSE",
  "REQUEST_ABORTED",
  "INTERNAL_ERROR",
]);
export type NetworkErrorCode = z.infer<typeof NetworkErrorCodeEnum>;

export class NetworkError extends NexoraError {
  constructor(
    code: string,
    userMessage: string,
    diagnosticData?: Record<string, string | number | boolean | null | undefined>,
  ) {
    const httpStatus =
      code === "INVALID_URL" ||
      code === "UNSUPPORTED_SCHEME" ||
      code === "UNSUPPORTED_PORT" ||
      code === "CREDENTIALS_NOT_ALLOWED" ||
      code === "HOSTNAME_NOT_ALLOWED" ||
      code === "IP_ADDRESS_NOT_ALLOWED"
        ? 400
        : 502;
    super({ code, userMessage, httpStatus, diagnosticData });
    this.name = "NetworkError";
  }
}

export function networkError(
  code: string,
  message?: string,
  diagnostic?: Record<string, string | number | boolean | null | undefined>,
): NetworkError {
  const messages: Record<string, string> = {
    INVALID_URL: "The provided URL is not valid.",
    UNSUPPORTED_SCHEME: "Only http and https URLs are supported.",
    UNSUPPORTED_PORT: "The specified port is not allowed.",
    CREDENTIALS_NOT_ALLOWED: "URLs with embedded credentials are not allowed.",
    HOSTNAME_NOT_ALLOWED: "The specified hostname is not allowed.",
    IP_ADDRESS_NOT_ALLOWED: "The target IP address is not allowed.",
    DNS_RESOLUTION_FAILED: "Could not resolve the hostname.",
    DNS_TIMEOUT: "DNS resolution timed out.",
    DNS_MIXED_PUBLIC_PRIVATE: "Hostname resolved to mixed public and private addresses.",
    REDIRECT_LIMIT_EXCEEDED: "Too many redirects.",
    REDIRECT_LOOP: "Redirect loop detected.",
    REDIRECT_NOT_ALLOWED: "Redirect destination is not allowed.",
    HTTPS_DOWNGRADE_NOT_ALLOWED: "HTTPS to HTTP downgrade is not allowed.",
    FETCH_TIMEOUT: "Request timed out.",
    CONNECTION_FAILED: "Could not connect to the server.",
    RESPONSE_TOO_LARGE: "Response exceeded the maximum allowed size.",
    UNSUPPORTED_CONTENT_TYPE: "The response content type is not supported.",
    INVALID_RESPONSE: "Server returned an invalid response.",
    REQUEST_ABORTED: "Request was aborted.",
    INTERNAL_ERROR: "An internal error occurred.",
  };
  return new NetworkError(code, message ?? messages[code] ?? "An error occurred", diagnostic);
}

export const FetchPreviewInputSchema = z.object({
  url: z.string().min(1, "URL is required"),
});

export type FetchPreviewInput = z.infer<typeof FetchPreviewInputSchema>;

export const NormalizedUrlSchema = z.object({
  href: z.string(),
  protocol: z.string(),
  hostname: z.string(),
  port: z.string(),
  pathname: z.string(),
  search: z.string(),
  hash: z.string(),
  username: z.string(),
  password: z.string(),
});

export type NormalizedUrl = z.infer<typeof NormalizedUrlSchema>;

export const ResolvedAddressSchema = z.object({
  family: z.enum(["IPv4", "IPv6"]),
  address: z.string(),
});

export type ResolvedAddress = z.infer<typeof ResolvedAddressSchema>;

export const RedirectStepSchema = z.object({
  url: z.string(),
  statusCode: z.number(),
});

export type RedirectStep = z.infer<typeof RedirectStepSchema>;

export const FetchResultSchema = z.object({
  requestedUrl: z.string(),
  normalizedUrl: z.string(),
  finalUrl: z.string(),
  status: z.number(),
  statusText: z.string(),
  contentType: z.string(),
  byteLength: z.number(),
  html: z.string(),
  redirectChain: z.array(RedirectStepSchema),
  timing: z.object({
    dns: z.number(),
    connect: z.number(),
    tls: z.number(),
    firstByte: z.number(),
    total: z.number(),
  }),
});

export type FetchResult = z.infer<typeof FetchResultSchema>;

export interface HostResolver {
  resolve(hostname: string, options?: { signal?: AbortSignal }): Promise<ResolvedAddress[]>;
}
