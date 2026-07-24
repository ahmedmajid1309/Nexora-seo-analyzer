import {
  BLOCKED_HOSTNAME_PATTERNS,
  METADATA_HOSTNAMES,
  MAX_HOSTNAME_LENGTH,
  MAX_LABEL_LENGTH,
  SINGLE_LABEL_DOMAINS,
} from "./constants";

export interface HostValidation {
  valid: boolean;
  error?: string;
  hostname: string;
}

const LABEL_PATTERN = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/;

export function parseAndValidateHost(hostname: string): HostValidation {
  const normalized = hostname.toLowerCase().replace(/\.$/, "");

  if (!normalized) {
    return { valid: false, error: "Hostname is empty", hostname: normalized };
  }

  if (normalized.length > MAX_HOSTNAME_LENGTH) {
    return { valid: false, error: "Hostname exceeds maximum length", hostname: normalized };
  }

  if (normalized.startsWith(".") || normalized.endsWith("-") || normalized.includes("..")) {
    return { valid: false, error: "Hostname has invalid format", hostname: normalized };
  }

  for (const pattern of BLOCKED_HOSTNAME_PATTERNS) {
    if (pattern.test(normalized)) {
      return { valid: false, error: `Hostname '${normalized}' is blocked`, hostname: normalized };
    }
  }

  if (METADATA_HOSTNAMES.has(normalized)) {
    return { valid: false, error: "Hostname is a known metadata endpoint", hostname: normalized };
  }

  const labels = normalized.split(".");
  if (labels.length < 1) {
    return { valid: false, error: "Hostname has no labels", hostname: normalized };
  }

  if (labels.length === 1 && !SINGLE_LABEL_DOMAINS.has(normalized)) {
    return { valid: false, error: "Single-label hostnames are not allowed", hostname: normalized };
  }

  if (SINGLE_LABEL_DOMAINS.has(normalized) && labels.length === 1) {
    return { valid: false, error: `Hostname '${normalized}' is blocked`, hostname: normalized };
  }

  for (const label of labels) {
    if (label.length > MAX_LABEL_LENGTH) {
      return { valid: false, error: "Hostname label exceeds maximum length", hostname: normalized };
    }
    if (!LABEL_PATTERN.test(label)) {
      return { valid: false, error: "Hostname contains invalid characters", hostname: normalized };
    }
  }

  if (
    normalized.includes("metadata") &&
    (normalized.endsWith(".google.internal") || normalized.endsWith(".init.internal"))
  ) {
    return { valid: false, error: "Hostname is a known metadata endpoint", hostname: normalized };
  }

  return { valid: true, hostname: normalized };
}

export function isBracketedIpv6(hostname: string): boolean {
  return hostname.startsWith("[") && hostname.endsWith("]");
}
