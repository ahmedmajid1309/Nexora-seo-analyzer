export function parseSitemapUrls(xml: string): string[] {
  const urls = new Set<string>();
  const locPattern = /<loc>\s*([^<]+?)\s*<\/loc>/gi;
  let match: RegExpExecArray | null;
  while ((match = locPattern.exec(xml)) !== null) {
    const value = match[1]?.trim();
    if (value) urls.add(value.replace(/&amp;/g, "&"));
  }
  return [...urls];
}
