import type { NormalizedOutput } from "./normalize-url";
import { parseAndValidateHost } from "./parse-host";
import { classifyAddress } from "./ip-address";
import { isPortAllowed, RESTRICTED_PORTS, CLOUD_METADATA_IPS } from "./constants";
import type { ResolvedAddress } from "./types";

export interface PolicyResult {
  allowed: boolean;
  error?: string;
}

export function checkUrlPolicy(normalized: NormalizedOutput): PolicyResult {
  const hostCheck = parseAndValidateHost(normalized.hostname);
  if (!hostCheck.valid) {
    return { allowed: false, error: hostCheck.error };
  }

  if (normalized.port) {
    const portNum = parseInt(normalized.port, 10);
    if (RESTRICTED_PORTS.has(portNum)) {
      return { allowed: false, error: `Port ${portNum} is restricted` };
    }
    if (!isPortAllowed(portNum)) {
      return { allowed: false, error: `Port ${portNum} is not allowed` };
    }
  }

  return { allowed: true };
}

export function checkResolvedAddresses(addresses: ResolvedAddress[]): PolicyResult {
  if (addresses.length === 0) {
    return { allowed: false, error: "No addresses resolved" };
  }

  let hasPublic = false;
  let hasBlocked = false;

  for (const addr of addresses) {
    const classification = classifyAddress(addr.address);

    if (CLOUD_METADATA_IPS.includes(addr.address)) {
      return { allowed: false, error: "Cloud metadata endpoint blocked" };
    }

    if (classification.isPublic) {
      hasPublic = true;
    } else {
      hasBlocked = true;
    }
  }

  if (hasPublic && hasBlocked) {
    return { allowed: false, error: "Mixed public and private addresses" };
  }

  if (!hasPublic) {
    return { allowed: false, error: "No public addresses resolved" };
  }

  return { allowed: true };
}

export function checkSingleAddress(address: string): PolicyResult {
  if (CLOUD_METADATA_IPS.includes(address)) {
    return { allowed: false, error: "Cloud metadata endpoint blocked" };
  }

  const classification = classifyAddress(address);
  if (!classification.isPublic) {
    return {
      allowed: false,
      error: `Address ${address} is in a blocked range (${classification.category})`,
    };
  }

  return { allowed: true };
}
