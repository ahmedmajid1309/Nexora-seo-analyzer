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
    if (options.signal?.aborted) {
      reject(new Error("DNS resolution aborted for " + hostname));
      return;
    }

    const timer = setTimeout(() => {
      reject(new Error("DNS " + rrtype + " record resolution timed out for " + hostname));
    }, options.timeout ?? DNS_TIMEOUT_MS);

    const onAbort = () => {
      cleanup();
      reject(new Error("DNS resolution aborted for " + hostname));
    };

    const cleanup = () => {
      clearTimeout(timer);
      options.signal?.removeEventListener("abort", onAbort);
    };

    options.signal?.addEventListener("abort", onAbort, { once: true });

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

async function lookupWithTimeout(
  hostname: string,
  options: ResolveOptions,
): Promise<ResolvedAddress[]> {
  return new Promise((resolve, reject) => {
    if (options.signal?.aborted) {
      reject(new Error("DNS resolution aborted for " + hostname));
      return;
    }

    const timer = setTimeout(() => {
      reject(new Error("DNS lookup timed out for " + hostname));
    }, options.timeout ?? DNS_TIMEOUT_MS);

    const onAbort = () => {
      clearTimeout(timer);
      reject(new Error("DNS resolution aborted for " + hostname));
    };

    options.signal?.addEventListener("abort", onAbort, { once: true });

    dns
      .lookup(hostname, { all: true, verbatim: true })
      .then((result) => {
        clearTimeout(timer);
        options.signal?.removeEventListener("abort", onAbort);
        resolve(
          result.map((entry) => ({
            family: entry.family === 6 ? "IPv6" : "IPv4",
            address: entry.address,
          })),
        );
      })
      .catch((err) => {
        clearTimeout(timer);
        options.signal?.removeEventListener("abort", onAbort);
        reject(err);
      });
  });
}

function uniqueAddresses(addresses: ResolvedAddress[]): ResolvedAddress[] {
  const seen = new Set<string>();
  const unique: ResolvedAddress[] = [];
  for (const address of addresses) {
    const key = `${address.family}:${address.address}`;
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(address);
  }
  return unique;
}

export async function resolveHost(
  hostname: string,
  options: ResolveOptions = {},
): Promise<ResolvedAddress[]> {
  if (options.signal?.aborted) {
    throw new Error("DNS resolution aborted for " + hostname);
  }

  const results = await Promise.allSettled([
    resolveWithTimeout(hostname, "A", options).catch(() => [] as string[]),
    resolveWithTimeout(hostname, "AAAA", options).catch(() => [] as string[]),
  ]);

  const aRecords = results[0].status === "fulfilled" ? results[0].value : [];
  const aaaaRecords = results[1].status === "fulfilled" ? results[1].value : [];

  let resolved: ResolvedAddress[] = [];

  for (const addr of aRecords) {
    resolved.push({ family: "IPv4", address: addr });
  }
  for (const addr of aaaaRecords) {
    resolved.push({ family: "IPv6", address: addr });
  }

  if (resolved.length === 0) {
    resolved = await lookupWithTimeout(hostname, options).catch((err) => {
      if ((err as Error).message.includes("timed out")) throw err;
      if ((err as Error).message.includes("aborted")) throw err;
      return [];
    });
  }

  resolved = uniqueAddresses(resolved);

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
