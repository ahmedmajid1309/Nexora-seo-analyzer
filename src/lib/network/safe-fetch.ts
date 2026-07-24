import * as http from "http";
import { normalizeUrl, type NormalizedOutput } from "./normalize-url";
import { validateUrl } from "./validate-url";
import { checkUrlPolicy, checkResolvedAddresses, checkSingleAddress } from "./network-policy";
import { defaultResolver, type HostResolver } from "./resolve-host";
import { classifyAddress } from "./ip-address";
import { checkRedirect } from "./redirect-policy";
import { classifyContentType, sniffIsHtml } from "./content-type";
import { TOTAL_DEADLINE_MS, isPrivateIpAllowed } from "./constants";
import { networkError } from "./types";
import type { FetchResult, ResolvedAddress, RedirectStep } from "./types";
import { fetchUrl } from "./fetch-url";

export interface SafeFetchOptions {
  resolver?: HostResolver;
  signal?: AbortSignal;
  deadline?: number;
}

function measure(): { start: number; elapsed(): number } {
  const start = performance.now();
  return {
    start,
    elapsed: () => performance.now() - start,
  };
}

export async function safeFetch(
  rawUrl: string,
  options: SafeFetchOptions = {},
): Promise<FetchResult> {
  const timer = measure();
  const deadline = options.deadline ?? TOTAL_DEADLINE_MS;
  const resolver = options.resolver ?? defaultResolver;
  const redirectChain: RedirectStep[] = [];

  let normalized: NormalizedOutput;
  try {
    normalized = normalizeUrl(rawUrl);
  } catch (err) {
    throw networkError("INVALID_URL", (err as Error).message);
  }

  const validation = validateUrl(normalized);
  if (!validation.valid) {
    throw networkError("INVALID_URL", validation.error);
  }

  const isLiteralIp = classifyAddress(normalized.hostname).category !== "invalid";

  if (!isLiteralIp) {
    const policy = checkUrlPolicy(normalized);
    if (!policy.allowed) {
      if (policy.error?.includes("credentials")) throw networkError("CREDENTIALS_NOT_ALLOWED");
      throw networkError("HOSTNAME_NOT_ALLOWED", policy.error);
    }
  }

  async function resolveAndFetch(norm: NormalizedOutput): Promise<{
    buffer: Buffer;
    statusCode: number;
    statusMessage: string;
    headers: http.IncomingHttpHeaders;
    resolvedAddress: ResolvedAddress;
  }> {
    const hostname = norm.hostname;

    const hostCls = classifyAddress(hostname);

    if (hostCls.category !== "invalid") {
      if (!hostCls.isPublic && !isPrivateIpAllowed()) {
        throw networkError(
          "IP_ADDRESS_NOT_ALLOWED",
          `Address ${hostname} is in a blocked range (${hostCls.category})`,
        );
      }
      const urlObj = new URL(norm.href);
      if (timer.elapsed() > deadline) {
        throw networkError("FETCH_TIMEOUT");
      }
      const result = await fetchUrl(urlObj, hostname, options);
      return { ...result, resolvedAddress: { family: hostCls.family, address: hostname } };
    }

    let addresses: ResolvedAddress[];
    try {
      addresses = await resolver.resolve(hostname, { signal: options.signal });
    } catch (err) {
      const msg = (err as Error).message;
      if (msg.includes("timed out")) throw networkError("DNS_TIMEOUT");
      throw networkError("DNS_RESOLUTION_FAILED", msg);
    }

    if (!isPrivateIpAllowed()) {
      const addrPolicy = checkResolvedAddresses(addresses);
      if (!addrPolicy.allowed) {
        if (addrPolicy.error?.includes("Mixed public and private"))
          throw networkError("DNS_MIXED_PUBLIC_PRIVATE");
        throw networkError("IP_ADDRESS_NOT_ALLOWED", addrPolicy.error);
      }

      const publicAddr = addresses.find((a) => {
        const cls = classifyAddress(a.address);
        return cls.isPublic;
      })!;

      const singleCheck = checkSingleAddress(publicAddr.address);
      if (!singleCheck.allowed) {
        throw networkError("IP_ADDRESS_NOT_ALLOWED", singleCheck.error);
      }

      const urlObj = new URL(norm.href);

      if (timer.elapsed() > deadline) {
        throw networkError("FETCH_TIMEOUT");
      }

      const result = await fetchUrl(urlObj, publicAddr.address, options);

      return { ...result, resolvedAddress: publicAddr };
    }

    const allAddrs = addresses;
    if (allAddrs.length === 0) {
      throw networkError("DNS_RESOLUTION_FAILED", "No addresses resolved");
    }

    const urlObj = new URL(norm.href);

    if (timer.elapsed() > deadline) {
      throw networkError("FETCH_TIMEOUT");
    }

    const result = await fetchUrl(urlObj, allAddrs[0].address, options);

    return { ...result, resolvedAddress: allAddrs[0] };
  }

  async function followRedirects(
    norm: NormalizedOutput,
    depth: number,
  ): Promise<{
    buffer: Buffer;
    statusCode: number;
    statusMessage: string;
    headers: http.IncomingHttpHeaders;
    finalUrl: string;
  }> {
    if (depth > 3) {
      throw networkError("REDIRECT_LIMIT_EXCEEDED");
    }

    const result = await resolveAndFetch(norm);

    if (result.statusCode >= 300 && result.statusCode < 400) {
      const location = result.headers["location"] ?? null;
      const locationStr = Array.isArray(location) ? location[0] : location;

      let resolvedLocation = locationStr;
      try {
        resolvedLocation = new URL(locationStr, norm.href).href;
      } catch {
        throw networkError("REDIRECT_NOT_ALLOWED", "Invalid redirect Location");
      }
      const redirectCheck = checkRedirect(resolvedLocation, result.statusCode, redirectChain);

      if (redirectCheck.isLoop) {
        throw networkError("REDIRECT_LOOP");
      }

      if (!redirectCheck.shouldFollow) {
        throw networkError("REDIRECT_NOT_ALLOWED", redirectCheck.error);
      }

      redirectChain.push({
        url: redirectCheck.destination!.href,
        statusCode: result.statusCode,
      });

      return followRedirects(redirectCheck.destination!, depth + 1);
    }

    return {
      ...result,
      finalUrl: norm.href,
    };
  }

  const finalResult = await followRedirects(normalized, 0);

  const elapsed = timer.elapsed();
  if (elapsed > deadline) {
    throw networkError("FETCH_TIMEOUT");
  }

  const contentType =
    (Array.isArray(finalResult.headers["content-type"])
      ? finalResult.headers["content-type"][0]
      : finalResult.headers["content-type"]) ?? "";

  const contentCheck = classifyContentType(contentType);
  if (!contentCheck.isAllowed) {
    const buffer = finalResult.buffer;
    if (buffer.length > 0 && sniffIsHtml(buffer)) {
    } else {
      throw networkError(
        "UNSUPPORTED_CONTENT_TYPE",
        `Content type '${contentCheck.detectedType}' is not supported`,
      );
    }
  }

  const html = finalResult.buffer.toString("utf-8");

  return {
    requestedUrl: rawUrl,
    normalizedUrl: normalized.href,
    finalUrl: finalResult.finalUrl,
    status: finalResult.statusCode,
    statusText: finalResult.statusMessage,
    contentType,
    byteLength: finalResult.buffer.length,
    html,
    redirectChain,
    timing: {
      dns: 0,
      connect: 0,
      tls: 0,
      firstByte: 0,
      total: Math.round(elapsed),
    },
  };
}
