const CONTROL_CHARS = /[\0-\x1F\x7F-\x9F\u2028\u2029]/;
const HEADER_INJECTION = /[\r\n]/;

export interface NormalizedOutput {
  href: string;
  protocol: string;
  hostname: string;
  port: string;
  pathname: string;
  search: string;
  hash: string;
  username: string;
  password: string;
}

export function normalizeUrl(input: string): NormalizedOutput {
  if (input.length > 2048) {
    throw new Error("URL exceeds maximum length");
  }

  if (CONTROL_CHARS.test(input) || HEADER_INJECTION.test(input)) {
    throw new Error("URL contains disallowed characters");
  }

  let raw = input.trim();

  const schemeMatch = raw.match(/^([a-zA-Z][a-zA-Z0-9+\-.]*):\/\//);
  if (schemeMatch) {
    const scheme = schemeMatch[1].toLowerCase() + ":";
    if (scheme !== "http:" && scheme !== "https:") {
      throw new Error("Only http and https schemes are allowed");
    }
    raw = scheme + "//" + raw.slice(schemeMatch[0].length);
  } else {
    raw = "https://" + raw;
  }

  const rawHostMatch = raw.match(/^https?:\/\/([^\/?#]+)/);
  if (rawHostMatch && rawHostMatch[1].includes("%")) {
    throw new Error("Percent-encoded hostnames are not allowed");
  }

  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    throw new Error("URL parsing failed");
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("Only http and https schemes are allowed");
  }

  if (parsed.username || parsed.password) {
    throw new Error("URL must not contain embedded credentials");
  }

  const hostname = parsed.hostname.toLowerCase();

  const normalized = new URL(parsed.href);
  normalized.hostname = hostname;
  normalized.hash = "";

  if (
    (normalized.protocol === "http:" && normalized.port === "80") ||
    (normalized.protocol === "https:" && normalized.port === "443")
  ) {
    normalized.port = "";
  }

  let finalHostname = normalized.hostname;
  if (finalHostname.endsWith(".")) {
    finalHostname = finalHostname.slice(0, -1);
    normalized.hostname = finalHostname;
  }

  return {
    href: normalized.href,
    protocol: normalized.protocol,
    hostname: finalHostname.toLowerCase(),
    port: normalized.port,
    pathname: normalized.pathname,
    search: normalized.search,
    hash: normalized.hash,
    username: parsed.username,
    password: parsed.password,
  };
}
