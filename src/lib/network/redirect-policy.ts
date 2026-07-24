import { normalizeUrl, type NormalizedOutput } from "./normalize-url";
import { validateUrl } from "./validate-url";
import { MAX_REDIRECTS } from "./constants";
import type { RedirectStep } from "./types";

export interface RedirectResult {
  shouldFollow: boolean;
  destination?: NormalizedOutput;
  error?: string;
  isLoop: boolean;
}

function normalizedUrlKey(n: NormalizedOutput): string {
  const protocol = n.protocol;
  const hostname = n.hostname.replace(/\.$/, "").toLowerCase();
  const port = n.port || (protocol === "https:" ? "443" : "80");
  const path = n.pathname.replace(/\/+$/, "") || "/";
  return protocol + "//" + hostname + ":" + port + path + n.search;
}

export function checkRedirect(
  location: string | null,
  statusCode: number,
  previousDestinations: RedirectStep[],
): RedirectResult {
  if (!location) {
    return { shouldFollow: false, error: "Missing Location header", isLoop: false };
  }

  let normalized: NormalizedOutput;
  try {
    normalized = normalizeUrl(location);
  } catch {
    return { shouldFollow: false, error: "Invalid redirect Location", isLoop: false };
  }

  if (statusCode < 300 || statusCode >= 400) {
    return { shouldFollow: false, error: "Not a redirect status code", isLoop: false };
  }

  const validation = validateUrl(normalized);
  if (!validation.valid) {
    return { shouldFollow: false, error: validation.error, isLoop: false };
  }

  if (normalized.username || normalized.password) {
    return { shouldFollow: false, error: "Redirect contains credentials", isLoop: false };
  }

  if (normalized.protocol === "http:" && previousDestinations.length > 0) {
    const lastStep = previousDestinations[previousDestinations.length - 1];
    if (lastStep.url.startsWith("https://")) {
      return { shouldFollow: false, error: "HTTPS to HTTP downgrade not allowed", isLoop: false };
    }
  }

  if (previousDestinations.length >= MAX_REDIRECTS) {
    return { shouldFollow: false, error: "Redirect limit exceeded", isLoop: false };
  }

  const key = normalizedUrlKey(normalized);
  const loopDetected = previousDestinations.some((step) => {
    const stepUrl = step.url;
    try {
      const stepNorm = normalizeUrl(stepUrl);
      return normalizedUrlKey(stepNorm) === key;
    } catch {
      return false;
    }
  });

  if (loopDetected) {
    return { shouldFollow: false, error: "Redirect loop detected", isLoop: true };
  }

  return { shouldFollow: true, destination: normalized, isLoop: false };
}

export function allowsDowngrade(fromProtocol: string, toProtocol: string): boolean {
  if (fromProtocol === "https:" && toProtocol === "http:") return false;
  return true;
}
