export function isHttps(url: string): boolean {
  return url.startsWith("https://");
}

export function getProtocol(url: string): string {
  try {
    return new URL(url).protocol;
  } catch {
    return "";
  }
}

export function hasTrackingParams(url: string): boolean {
  const tracking = [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_term",
    "utm_content",
    "fbclid",
    "gclid",
    "msclkid",
    "ref",
    "source",
    "mc_cid",
    "mc_eid",
  ];
  try {
    const parsed = new URL(url);
    for (const param of tracking) {
      if (parsed.searchParams.has(param)) return true;
    }
  } catch {
    return false;
  }
  return false;
}

export function hasSessionParams(url: string): boolean {
  const session = ["sid", "session", "sessionid", "phpsessid", "jsessionid", "aspsessionid"];
  try {
    const parsed = new URL(url);
    for (const param of session) {
      if (parsed.searchParams.has(param)) return true;
    }
  } catch {
    return false;
  }
  return false;
}

export function countQueryParams(url: string): number {
  try {
    return Array.from(new URL(url).searchParams.keys()).length;
  } catch {
    return 0;
  }
}

export function getUrlLength(url: string): number {
  return url.length;
}

export function hasUppercaseInPath(url: string): boolean {
  try {
    const path = new URL(url).pathname;
    return /[A-Z]/.test(path);
  } catch {
    return false;
  }
}

export function hasUnderscoreInPath(url: string): boolean {
  try {
    const path = new URL(url).pathname;
    return path.includes("_");
  } catch {
    return false;
  }
}

export function hasRepeatedSeparators(url: string): boolean {
  try {
    const path = new URL(url).pathname;
    return /\/{2,}/.test(path);
  } catch {
    return false;
  }
}

export function hasFragment(url: string): boolean {
  try {
    return new URL(url).hash.length > 1;
  } catch {
    return false;
  }
}

export function hasDefaultPort(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.port) {
      const defaultPorts: Record<string, string> = { "http:": "80", "https:": "443" };
      const protocol = parsed.protocol;
      return parsed.port === defaultPorts[protocol];
    }
  } catch {
    return false;
  }
  return false;
}

export function hasNonAscii(url: string): boolean {
  for (let i = 0; i < url.length; i++) {
    if (url.charCodeAt(i) > 127) return true;
  }
  return false;
}

export function isValidUrl(str: string): boolean {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}

export function resolveUrl(href: string, base: string): string | null {
  try {
    return new URL(href, base).href;
  } catch {
    return null;
  }
}
