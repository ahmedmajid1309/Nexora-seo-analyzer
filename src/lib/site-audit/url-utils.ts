const TRACKING_PARAMS = new Set([
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "fbclid",
  "gclid",
  "msclkid",
  "ref",
]);

const UNSUPPORTED_EXTENSIONS =
  /\.(?:pdf|zip|gz|rar|7z|jpg|jpeg|png|gif|webp|svg|mp4|mp3|mov|avi|doc|docx|xls|xlsx|ppt|pptx)(?:$|[?#])/i;
const DESTRUCTIVE_PATH =
  /(?:logout|signout|delete|remove|cart|checkout|add-to-cart|wp-login|admin|session|token)/i;

export function normalizeCrawlUrl(raw: string, baseUrl?: string): string | null {
  try {
    const url = new URL(raw, baseUrl);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    url.hash = "";
    url.hostname = url.hostname.toLowerCase();
    if (
      (url.protocol === "https:" && url.port === "443") ||
      (url.protocol === "http:" && url.port === "80")
    ) {
      url.port = "";
    }
    const params = [...url.searchParams.entries()]
      .filter(([key]) => !TRACKING_PARAMS.has(key.toLowerCase()))
      .sort(([a], [b]) => a.localeCompare(b));
    url.search = "";
    for (const [key, value] of params) url.searchParams.append(key, value);
    if (url.pathname !== "/" && url.pathname.endsWith("/"))
      url.pathname = url.pathname.slice(0, -1);
    return url.toString();
  } catch {
    return null;
  }
}

export function isSameOrigin(url: string, origin: string): boolean {
  try {
    return new URL(url).origin === origin;
  } catch {
    return false;
  }
}

export function getSkipReason(url: string): string | null {
  if (UNSUPPORTED_EXTENSIONS.test(url)) return "Unsupported file or download URL";
  if (DESTRUCTIVE_PATH.test(new URL(url).pathname)) return "Destructive or mutation-looking URL";
  return null;
}

export function sanitizedPathname(url: string): string | null {
  try {
    const parsed = new URL(url);
    return parsed.pathname || "/";
  } catch {
    return null;
  }
}
