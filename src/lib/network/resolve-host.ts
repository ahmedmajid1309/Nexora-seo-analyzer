import * as dns from "dns/promises";
import { DNS_TIMEOUT_MS, MAX_DNS_ANSWERS } from "./constants";
import type { ResolvedAddress } from "./types";

export interface ResolveOptions {
  timeout?: number;
  signal?: AbortSignal;
}

async function resolveWithTimeout(
  hostname: string,
  rrtype: string,
  options: ResolveOptions,
): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error("DNS " + rrtype + " record resolution timed out for " + hostname));
    }, options.timeout ?? DNS_TIMEOUT_MS);

    const cleanup = () => {
      clearTimeout(timer);
    };

    (dns.resolve as (hostname: string, rrtype: string) => Promise<string[]>)(hostname, rrtype)
      .then((result) => {
        cleanup();
        resolve(result);
      })
      .catch((err) => {
        cleanup();
        reject(err);
      });
  });
}

export async function resolveHost(
  hostname: string,
  options: ResolveOptions = {},
): Promise<ResolvedAddress[]> {
  const resolved: ResolvedAddress[] = [];

  const results = await Promise.allSettled([
    resolveWithTimeout(hostname, "A", options).catch(() => [] as string[]),
    resolveWithTimeout(hostname, "AAAA", options).catch(() => [] as string[]),
  ]);

  const aRecords = results[0].status === "fulfilled" ? results[0].value : [];
  const aaaaRecords = results[1].status === "fulfilled" ? results[1].value : [];

  for (const addr of aRecords) {
    resolved.push({ family: "IPv4", address: addr });
  }
  for (const addr of aaaaRecords) {
    resolved.push({ family: "IPv6", address: addr });
  }

  if (resolved.length === 0) {
    throw new Error("DNS resolution failed for " + hostname + ": no records found");
  }

  if (resolved.length > MAX_DNS_ANSWERS) {
    resolved.splice(MAX_DNS_ANSWERS);
  }

  return resolved;
}

export interface HostResolver {
  resolve(hostname: string, options?: ResolveOptions): Promise<ResolvedAddress[]>;
}

export const defaultResolver: HostResolver = {
  async resolve(hostname, options) {
    return resolveHost(hostname, options);
  },
};
