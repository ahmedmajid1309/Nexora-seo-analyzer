import type { SiteLevelFinding, SitePageResult } from "./types";

function finding(
  input: Omit<SiteLevelFinding, "applicability" | "confidence"> &
    Partial<Pick<SiteLevelFinding, "applicability" | "confidence">>,
): SiteLevelFinding {
  return {
    applicability: input.applicability ?? "Limited website audit with at least two audited pages.",
    confidence: input.confidence ?? 90,
    ...input,
  };
}

function groupByValue(pages: SitePageResult[], valueFor: (page: SitePageResult) => string | null) {
  const groups = new Map<string, string[]>();
  for (const page of pages) {
    const value = valueFor(page)?.trim().toLowerCase();
    if (!value) continue;
    groups.set(value, [...(groups.get(value) ?? []), page.finalUrl ?? page.requestedUrl]);
  }
  return [...groups.entries()].filter(([, urls]) => urls.length > 1);
}

export function analyzeCrossPage(
  pages: SitePageResult[],
  discoveredUrls: string[],
): SiteLevelFinding[] {
  const audited = pages.filter((p) => p.status === "audited");
  if (audited.length < 2) {
    return [
      finding({
        checkId: "SITE-000",
        title: "Cross-page checks need at least two audited pages",
        state: "not-applicable",
        severity: "informational",
        affectedPageUrls: [],
        evidence: `${audited.length} page audited.`,
        impact: "Duplicate, orphan, and architecture checks need multiple pages.",
        remediation:
          "Run the site audit with a higher page limit when more eligible URLs are available.",
        responsibleRole: "seo",
        effort: "low",
        confidence: 100,
      }),
    ];
  }

  const findings: SiteLevelFinding[] = [];
  const auditedUrls = new Set(audited.map((p) => p.finalUrl ?? p.requestedUrl));

  const duplicateTitles = groupByValue(audited, (p) => p.title);
  findings.push(
    ...duplicateTitles.map(([title, urls], index) =>
      finding({
        checkId: `SITE-001-${index + 1}`,
        title: "Duplicate page titles",
        state: "failed",
        severity: "high",
        affectedPageUrls: urls,
        evidence: `Title "${title}" appears on ${urls.length} audited pages.`,
        impact: "Duplicate titles make pages harder to distinguish in search results.",
        remediation: "Write unique, descriptive titles for each affected page.",
        responsibleRole: "content-editor",
        effort: "medium",
      }),
    ),
  );

  const missingTitles = audited.filter((p) => !p.title);
  if (missingTitles.length) {
    findings.push(
      finding({
        checkId: "SITE-002",
        title: "Missing page titles across pages",
        state: "failed",
        severity: "high",
        affectedPageUrls: missingTitles.map((p) => p.finalUrl ?? p.requestedUrl),
        evidence: `${missingTitles.length} audited page(s) have no title text.`,
        impact: "Pages without titles lose a critical SERP and relevance signal.",
        remediation: "Add a concise, unique title element to every affected page.",
        responsibleRole: "content-editor",
        effort: "low",
      }),
    );
  }

  const duplicateDescriptions = groupByValue(audited, (p) => p.description);
  findings.push(
    ...duplicateDescriptions.map(([description, urls], index) =>
      finding({
        checkId: `SITE-003-${index + 1}`,
        title: "Duplicate meta descriptions",
        state: "warning",
        severity: "medium",
        affectedPageUrls: urls,
        evidence: `Description "${description.slice(0, 120)}" appears on ${urls.length} audited pages.`,
        impact: "Repeated descriptions reduce SERP differentiation and click intent matching.",
        remediation: "Write page-specific descriptions for duplicate groups.",
        responsibleRole: "content-editor",
        effort: "medium",
      }),
    ),
  );

  const missingDescriptions = audited.filter((p) => !p.description);
  if (missingDescriptions.length) {
    findings.push(
      finding({
        checkId: "SITE-004",
        title: "Missing meta descriptions",
        state: "warning",
        severity: "medium",
        affectedPageUrls: missingDescriptions.map((p) => p.finalUrl ?? p.requestedUrl),
        evidence: `${missingDescriptions.length} audited page(s) have no meta description.`,
        impact: "Search engines may generate snippets that are less aligned with page intent.",
        remediation: "Add concise page-specific meta descriptions where snippet control matters.",
        responsibleRole: "content-editor",
        effort: "low",
      }),
    );
  }

  const duplicateH1s = groupByValue(audited, (p) => p.headings.h1[0] ?? null);
  findings.push(
    ...duplicateH1s.map(([h1, urls], index) =>
      finding({
        checkId: `SITE-005-${index + 1}`,
        title: "Duplicate H1 patterns",
        state: "warning",
        severity: "medium",
        affectedPageUrls: urls,
        evidence: `Primary H1 "${h1}" appears on ${urls.length} audited pages.`,
        impact: "Repeated H1s can indicate template duplication or unclear page purpose.",
        remediation: "Make each page's primary heading match its unique intent.",
        responsibleRole: "content-editor",
        effort: "medium",
      }),
    ),
  );

  const canonicalTargets = groupByValue(audited, (p) => p.canonical);
  findings.push(
    ...canonicalTargets.map(([canonical, urls], index) =>
      finding({
        checkId: `SITE-006-${index + 1}`,
        title: "Multiple pages share one canonical target",
        state: "warning",
        severity: "high",
        affectedPageUrls: urls,
        evidence: `${urls.length} audited pages canonicalize to ${canonical}.`,
        impact:
          "Conflicting canonicalization can cause important pages to be treated as duplicates.",
        remediation: "Confirm only true duplicate pages canonicalize to the same preferred URL.",
        responsibleRole: "seo",
        effort: "medium",
      }),
    ),
  );

  const outsideCanonicals = audited.filter((p) => p.canonical && !auditedUrls.has(p.canonical));
  if (outsideCanonicals.length) {
    findings.push(
      finding({
        checkId: "SITE-007",
        title: "Canonical targets outside audited crawl set",
        state: "warning",
        severity: "medium",
        affectedPageUrls: outsideCanonicals.map((p) => p.finalUrl ?? p.requestedUrl),
        evidence: `${outsideCanonicals.length} page(s) point to canonical URLs that were not audited in this limited crawl.`,
        impact:
          "The canonical target may be valid, but it is outside the verified 25-page evidence set.",
        remediation:
          "Review canonical targets and include them in a deeper crawl if they are important.",
        responsibleRole: "seo",
        effort: "low",
        confidence: 75,
      }),
    );
  }

  const redirectPages = audited.filter((p) => p.redirectChain.length > 0);
  if (redirectPages.length) {
    findings.push(
      finding({
        checkId: "SITE-008",
        title: "Redirect chains detected",
        state: "warning",
        severity: "medium",
        affectedPageUrls: redirectPages.map((p) => p.requestedUrl),
        evidence: `${redirectPages.length} selected URL(s) redirected before final audit.`,
        impact: "Redirect chains consume crawl budget and add latency.",
        remediation: "Update internal links and sitemap entries to point directly at final URLs.",
        responsibleRole: "developer",
        effort: "medium",
      }),
    );
  }

  const brokenLinks = audited.filter((p) => p.links.brokenInternal.length > 0);
  if (brokenLinks.length) {
    findings.push(
      finding({
        checkId: "SITE-009",
        title: "Broken internal links with response evidence",
        state: "failed",
        severity: "high",
        affectedPageUrls: brokenLinks.map((p) => p.finalUrl ?? p.requestedUrl),
        evidence: `${brokenLinks.reduce((sum, p) => sum + p.links.brokenInternal.length, 0)} internal link target(s) returned a failure during the crawl.`,
        impact:
          "Broken internal links block users and search crawlers from reaching intended content.",
        remediation: "Fix or remove the listed internal links and update navigation/templates.",
        responsibleRole: "developer",
        effort: "medium",
      }),
    );
  }

  const orphanUrls = discoveredUrls.filter(
    (url) => !audited.some((p) => p.requestedUrl === url || p.finalUrl === url),
  );
  if (orphanUrls.length) {
    findings.push(
      finding({
        checkId: "SITE-010",
        title: "Orphan candidates from sitemap/link evidence",
        state: "warning",
        severity: "medium",
        affectedPageUrls: orphanUrls.slice(0, 25),
        evidence: `${orphanUrls.length} discovered URL(s) were not reached as audited pages in this limited crawl.`,
        impact:
          "These are candidates, not confirmed orphans, because the crawl is intentionally limited.",
        remediation:
          "Review sitemap-only or low-link pages and add internal links where appropriate.",
        responsibleRole: "seo",
        effort: "medium",
        confidence: 60,
      }),
    );
  }

  const deepPages = audited.filter((p) => p.depth > 3);
  if (deepPages.length) {
    findings.push(
      finding({
        checkId: "SITE-011",
        title: "Pages reachable through excessive internal-link depth",
        state: "warning",
        severity: "medium",
        affectedPageUrls: deepPages.map((p) => p.finalUrl ?? p.requestedUrl),
        evidence: `${deepPages.length} page(s) were discovered deeper than 3 clicks from the entry page.`,
        impact:
          "Important pages buried deep in the crawl path may receive weaker internal-link signals.",
        remediation:
          "Link important pages from primary navigation, hubs, or relevant parent pages.",
        responsibleRole: "seo",
        effort: "medium",
      }),
    );
  }

  const variantMap = new Map<string, string[]>();
  for (const page of audited) {
    const url = new URL(page.finalUrl ?? page.requestedUrl);
    const key = `${url.hostname.replace(/^www\./, "")}${url.pathname.toLowerCase()}`;
    variantMap.set(key, [...(variantMap.get(key) ?? []), url.toString()]);
  }
  for (const [key, urls] of variantMap) {
    const origins = new Set(urls.map((url) => new URL(url).origin));
    if (origins.size > 1) {
      findings.push(
        finding({
          checkId: `SITE-012-${key.slice(0, 24)}`,
          title: "Inconsistent URL variants evidenced",
          state: "warning",
          severity: "medium",
          affectedPageUrls: urls,
          evidence: `Equivalent path appeared across ${origins.size} protocol/www origin variants.`,
          impact:
            "Mixed URL variants can split signals if canonicalization and redirects are inconsistent.",
          remediation:
            "Choose one HTTPS/www policy and enforce redirects plus canonical tags consistently.",
          responsibleRole: "developer",
          effort: "medium",
        }),
      );
    }
  }

  const failedByCheck = new Map<string, string[]>();
  for (const page of audited) {
    for (const result of page.ruleResults) {
      if (result.state === "failed") {
        failedByCheck.set(result.checkId, [
          ...(failedByCheck.get(result.checkId) ?? []),
          page.finalUrl ?? page.requestedUrl,
        ]);
      }
    }
  }
  for (const [checkId, urls] of failedByCheck) {
    if (urls.length > audited.length / 2) {
      findings.push(
        finding({
          checkId: `SITE-013-${checkId}`,
          title: "Repeated template-level failure",
          state: "failed",
          severity: "high",
          affectedPageUrls: urls,
          evidence: `${checkId} failed on ${urls.length}/${audited.length} audited pages.`,
          impact:
            "A repeated failure likely comes from a shared template and affects many pages at once.",
          remediation: "Fix the shared template or component once, then rerun the audit.",
          responsibleRole: "developer",
          effort: "medium",
        }),
      );
    }
  }

  const noindexPages = audited.filter((p) =>
    p.ruleResults.some((r) => r.checkId === "META-011" && r.state !== "passed"),
  );
  if (noindexPages.length && noindexPages.length < audited.length) {
    findings.push(
      finding({
        checkId: "SITE-014",
        title: "Indexability inconsistencies",
        state: "warning",
        severity: "high",
        affectedPageUrls: noindexPages.map((p) => p.finalUrl ?? p.requestedUrl),
        evidence: `${noindexPages.length}/${audited.length} pages show indexability restrictions while others do not.`,
        impact:
          "Mixed indexability may be intentional, but accidental noindex directives can remove pages from search.",
        remediation:
          "Verify which templates or page types should be indexable and align robots directives.",
        responsibleRole: "seo",
        effort: "medium",
      }),
    );
  }

  if (findings.length === 0) {
    findings.push(
      finding({
        checkId: "SITE-099",
        title: "No verified site-wide issues detected",
        state: "passed",
        severity: "informational",
        affectedPageUrls: audited.map((p) => p.finalUrl ?? p.requestedUrl),
        evidence: `${audited.length} pages audited with no duplicate metadata, canonical, redirect, or template-level site finding generated.`,
        impact: "The limited crawl did not find cross-page defects in the verified evidence set.",
        remediation: "Keep core templates consistent and rerun after significant content changes.",
        responsibleRole: "seo",
        effort: "low",
        confidence: 85,
      }),
    );
  }

  return findings;
}
