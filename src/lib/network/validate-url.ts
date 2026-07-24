import type { NormalizedOutput } from "./normalize-url";
import { ALLOWED_SCHEMES, MAX_URL_LENGTH, isPortAllowed, RESTRICTED_PORTS } from "./constants";

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validateUrl(normalized: NormalizedOutput): ValidationResult {
  if (normalized.href.length > MAX_URL_LENGTH) {
    return { valid: false, error: "URL exceeds maximum length" };
  }

  if (!ALLOWED_SCHEMES.has(normalized.protocol)) {
    return { valid: false, error: "Only http and https schemes are allowed" };
  }

  if (normalized.hash) {
    return { valid: false, error: "URL fragments are not allowed" };
  }

  if (normalized.port) {
    const portNum = parseInt(normalized.port, 10);
    if (RESTRICTED_PORTS.has(portNum)) {
      return { valid: false, error: `Port ${portNum} is restricted` };
    }
    if (!isPortAllowed(portNum)) {
      return { valid: false, error: `Port ${portNum} is not allowed` };
    }
  }

  if (!normalized.hostname) {
    return { valid: false, error: "Hostname is required" };
  }

  return { valid: true };
}
