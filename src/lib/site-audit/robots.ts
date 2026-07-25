export interface RobotsPolicy {
  sitemaps: string[];
  disallow: string[];
  fetched: boolean;
}

export function parseRobotsTxt(text: string): RobotsPolicy {
  const sitemaps: string[] = [];
  const disallow: string[] = [];
  let applies = false;

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.split("#")[0]?.trim() ?? "";
    if (!line) continue;
    const [fieldRaw, ...valueParts] = line.split(":");
    const field = fieldRaw?.trim().toLowerCase();
    const value = valueParts.join(":").trim();
    if (field === "sitemap" && value) sitemaps.push(value);
    if (field === "user-agent") applies = value === "*";
    if (applies && field === "disallow" && value) disallow.push(value);
  }

  return { sitemaps, disallow, fetched: true };
}

export function isBlockedByRobots(url: string, policy: RobotsPolicy | null): boolean {
  if (!policy) return false;
  const pathname = new URL(url).pathname || "/";
  return policy.disallow.some((rule) => (rule !== "/" ? pathname.startsWith(rule) : true));
}
