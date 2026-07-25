import { isNexoraError } from "@/lib/errors";
import { runQuickAudit } from "@/lib/audit/quick-audit";
import { safeFetch } from "@/lib/network";
import { analyzeCrossPage } from "./cross-page";
import { calculateSiteAggregate } from "./aggregate-scoring";
import { parseRobotsTxt, isBlockedByRobots, type RobotsPolicy } from "./robots";
import { parseSitemapUrls } from "./sitemap";
import {
  SITE_AUDIT_DEADLINE_MS,
  SITE_AUDIT_DEFAULT_CONCURRENCY,
  SITE_AUDIT_MAX_PAGES,
  type CrawlUrlDecision,
  type SiteAuditProgress,
  type SiteAuditProgressState,
  type SiteAuditResponseData,
  type SitePageResult,
} from "./types";
import { getSkipReason, isSameOrigin, normalizeCrawlUrl, sanitizedPathname } from "./url-utils";

interface QueueItem {
  url: string;
  depth: number;
  source: CrawlUrlDecision["source"];
  fromUrl?: string;
}

interface RunSiteAuditInput {
  requestId: string;
  url: string;
  pageLimit: number;
  crawlMode: SiteAuditResponseData["crawlMode"];
  signal?: AbortSignal;
  concurrency?: number;
  deadlineMs?: number;
}

function reasonFromError(err: unknown): string {
  if (isNexoraError(err)) return err.toPublicResponse().error.message;
  if (err instanceof DOMException && err.name === "AbortError") return "Crawl deadline reached";
  return err instanceof Error ? err.message : "Unknown crawl failure";
}

function pushProgress(
  progress: SiteAuditProgress[],
  state: SiteAuditProgressState,
  startedAt: number,
  counts: Omit<SiteAuditProgress, "state" | "elapsedMs">,
): void {
  progress.push({ state, elapsedMs: Math.round(performance.now() - startedAt), ...counts });
}

function toPageResult(
  input: Awaited<ReturnType<typeof runQuickAudit>> & { requestedUrl: string; depth: number },
): SitePageResult {
  const description = input.data.serpPreview.description;
  const canonical = input.data.serpPreview.canonicalUrl;
  const h1 = input.snapshot.headings
    .filter((h) => h.level === 1)
    .map((h) => h.text)
    .slice(0, 5);
  const internal = input.snapshot.links.filter((l) => l.isSameOrigin && l.resolvedUrl).length;
  const external = input.snapshot.links.filter((l) => !l.isSameOrigin && l.resolvedUrl).length;
  return {
    requestedUrl: input.requestedUrl,
    finalUrl: input.snapshot.finalUrl,
    status: "audited",
    responseStatus: input.snapshot.response.status,
    title: input.snapshot.document.title,
    description,
    canonical,
    depth: input.depth,
    headings: {
      h1,
      h2Count: input.snapshot.headings.filter((h) => h.level === 2).length,
      total: input.snapshot.headings.length,
    },
    links: { internal, external, brokenInternal: [] },
    findings: input.data.findings,
    ruleResults: input.results,
    scoreFamilies: input.data.scoreFamilies,
    criticalIssueCount: input.data.findings.filter(
      (f) => f.state === "failed" && f.severity === "critical",
    ).length,
    warningCount: input.data.findings.filter((f) => f.state === "warning").length,
    crawlState: input.snapshot.response.redirectChain.length ? "redirected" : "selected",
    failureReason: null,
    redirectChain: input.snapshot.response.redirectChain,
    renderedDom: input.data.renderedDom,
  };
}

function failedPage(
  url: string,
  depth: number,
  status: SitePageResult["status"],
  reason: string,
): SitePageResult {
  return {
    requestedUrl: url,
    finalUrl: null,
    status,
    responseStatus: null,
    title: null,
    description: null,
    canonical: null,
    depth,
    headings: { h1: [], h2Count: 0, total: 0 },
    links: { internal: 0, external: 0, brokenInternal: [] },
    findings: [],
    ruleResults: [],
    scoreFamilies: [],
    criticalIssueCount: 0,
    warningCount: 0,
    crawlState: status === "failed" ? "failed" : status === "blocked" ? "blocked" : "skipped",
    failureReason: reason,
    redirectChain: [],
    renderedDom: null,
  };
}

async function fetchRobots(origin: string, signal?: AbortSignal): Promise<RobotsPolicy | null> {
  try {
    const result = await safeFetch(`${origin}/robots.txt`, {
      signal,
      deadline: 8_000,
      additionalAllowedContentTypes: ["text/plain"],
    });
    return parseRobotsTxt(result.html);
  } catch {
    return null;
  }
}

async function fetchSitemapUrls(
  urls: string[],
  origin: string,
  signal?: AbortSignal,
): Promise<string[]> {
  const discovered = new Set<string>();
  for (const url of urls.slice(0, 3).sort()) {
    if (!isSameOrigin(url, origin)) continue;
    try {
      const result = await safeFetch(url, {
        signal,
        deadline: 10_000,
        additionalAllowedContentTypes: ["text/plain", "application/xml", "text/xml"],
      });
      for (const loc of parseSitemapUrls(result.html)) discovered.add(loc);
    } catch {
      // Sitemap discovery is opportunistic; crawl continues with HTML links.
    }
  }
  return [...discovered].sort();
}

export async function runSiteAudit(input: RunSiteAuditInput): Promise<SiteAuditResponseData> {
  const startedAtIso = new Date().toISOString();
  const startedAt = performance.now();
  const pageLimit = Math.min(input.pageLimit, SITE_AUDIT_MAX_PAGES);
  const concurrency = Math.max(1, Math.min(input.concurrency ?? SITE_AUDIT_DEFAULT_CONCURRENCY, 5));
  const deadlineMs = input.deadlineMs ?? SITE_AUDIT_DEADLINE_MS;
  const abortController = new AbortController();
  const timeout = setTimeout(() => abortController.abort(), deadlineMs);
  const signal = input.signal ?? abortController.signal;
  const normalizedStart = normalizeCrawlUrl(input.url);
  if (!normalizedStart) throw new Error("Invalid starting URL");
  const origin = new URL(normalizedStart).origin;

  const progress: SiteAuditProgress[] = [];
  const decisions: CrawlUrlDecision[] = [];
  const pages: SitePageResult[] = [];
  const queue: QueueItem[] = [{ url: normalizedStart, depth: 0, source: "entry" }];
  const queued = new Set<string>([normalizedStart]);
  const auditedCanonical = new Set<string>();
  const discovered = new Set<string>([normalizedStart]);
  let robots: RobotsPolicy | null = null;
  let lastFetchAt = 0;
  let renderedSlots = 0;

  const counts = (currentUrl: string | null = null) => ({
    discoveredPageCount: discovered.size,
    selectedPageCount: pages.length + queue.length,
    completedPageCount: pages.filter((p) => p.status === "audited").length,
    failedPageCount: pages.filter((p) => p.status === "failed").length,
    currentPathname: currentUrl ? sanitizedPathname(currentUrl) : null,
  });

  pushProgress(progress, "validating-domain", startedAt, counts(normalizedStart));
  decisions.push({
    url: normalizedStart,
    state: "selected",
    reason: "Starting URL selected",
    source: "entry",
  });

  try {
    robots = await fetchRobots(origin, signal);
    pushProgress(progress, "discovering-sitemap", startedAt, counts(`${origin}/robots.txt`));

    if (input.crawlMode !== "links-only") {
      const sitemapCandidates = robots?.sitemaps.length
        ? robots.sitemaps
        : [`${origin}/sitemap.xml`];
      for (const raw of await fetchSitemapUrls(sitemapCandidates, origin, signal)) {
        const normalized = normalizeCrawlUrl(raw);
        if (!normalized || !isSameOrigin(normalized, origin)) continue;
        discovered.add(normalized);
        if (!queued.has(normalized) && queue.length + pages.length < pageLimit) {
          queue.push({ url: normalized, depth: 1, source: "sitemap" });
          queued.add(normalized);
          decisions.push({
            url: normalized,
            state: "selected",
            reason: "Selected from sitemap",
            source: "sitemap",
          });
        }
      }
    }

    while (
      queue.length > 0 &&
      pages.length < pageLimit &&
      performance.now() - startedAt < deadlineMs
    ) {
      const batch = queue.splice(0, Math.min(concurrency, pageLimit - pages.length));
      pushProgress(progress, "crawling-pages", startedAt, counts(batch[0]?.url ?? null));

      const settled = await Promise.all(
        batch.map(async (item) => {
          const skipReason = getSkipReason(item.url);
          if (skipReason) {
            decisions.push({
              url: item.url,
              state: "skipped",
              reason: skipReason,
              source: item.source,
              fromUrl: item.fromUrl,
            });
            return failedPage(item.url, item.depth, "skipped", skipReason);
          }
          if (isBlockedByRobots(item.url, robots)) {
            decisions.push({
              url: item.url,
              state: "blocked",
              reason: "Blocked by robots.txt",
              source: item.source,
              fromUrl: item.fromUrl,
            });
            return failedPage(item.url, item.depth, "blocked", "Blocked by robots.txt");
          }

          const waitMs = Math.max(0, 100 - (Date.now() - lastFetchAt));
          if (waitMs) await new Promise((resolve) => setTimeout(resolve, waitMs));
          lastFetchAt = Date.now();

          try {
            const shouldAnalyzeRenderedDom = renderedSlots < 3;
            if (shouldAnalyzeRenderedDom) renderedSlots += 1;
            if (item.depth === 0) {
              pushProgress(progress, "fetching-entry-page", startedAt, counts(item.url));
            }
            pushProgress(progress, "running-page-checks", startedAt, counts(item.url));
            const quick = await runQuickAudit({
              url: item.url,
              requestId: input.requestId,
              signal,
              pagespeed: item.url === normalizedStart,
              renderedDom: shouldAnalyzeRenderedDom,
            });
            const finalNormalized =
              normalizeCrawlUrl(quick.snapshot.finalUrl) ?? quick.snapshot.finalUrl;
            if (!isSameOrigin(finalNormalized, origin)) {
              decisions.push({
                url: item.url,
                state: "blocked",
                reason: "Redirected outside starting origin",
                source: "redirect",
              });
              return failedPage(
                item.url,
                item.depth,
                "blocked",
                "Redirected outside starting origin",
              );
            }
            const canonicalKey = quick.data.serpPreview.canonicalUrl ?? finalNormalized;
            if (auditedCanonical.has(canonicalKey)) {
              decisions.push({
                url: item.url,
                state: "skipped",
                reason: "Canonical page already audited",
                source: item.source,
                fromUrl: item.fromUrl,
              });
              return failedPage(item.url, item.depth, "skipped", "Canonical page already audited");
            }
            auditedCanonical.add(canonicalKey);

            pushProgress(progress, "discovering-links", startedAt, counts(item.url));
            for (const link of quick.snapshot.links) {
              if (!link.resolvedUrl) continue;
              if (!link.isSameOrigin) {
                decisions.push({
                  url: link.resolvedUrl,
                  state: "skipped",
                  reason: "External origin excluded from site crawl",
                  source: "link",
                  fromUrl: quick.snapshot.finalUrl,
                });
                continue;
              }
              const normalized = normalizeCrawlUrl(link.resolvedUrl);
              if (!normalized || !isSameOrigin(normalized, origin)) continue;
              discovered.add(normalized);
              if (!queued.has(normalized) && pages.length + queue.length < pageLimit) {
                queue.push({
                  url: normalized,
                  depth: item.depth + 1,
                  source: "link",
                  fromUrl: quick.snapshot.finalUrl,
                });
                queued.add(normalized);
                decisions.push({
                  url: normalized,
                  state: "selected",
                  reason: "Selected from internal HTML link",
                  source: "link",
                  fromUrl: quick.snapshot.finalUrl,
                });
              }
            }

            return toPageResult({ ...quick, requestedUrl: item.url, depth: item.depth });
          } catch (err) {
            const reason = reasonFromError(err);
            decisions.push({
              url: item.url,
              state: "failed",
              reason,
              source: item.source,
              fromUrl: item.fromUrl,
            });
            if (!String(reason).toLowerCase().includes("timeout")) {
              try {
                const quick = await runQuickAudit({
                  url: item.url,
                  requestId: input.requestId,
                  signal,
                  pagespeed: false,
                });
                return toPageResult({ ...quick, requestedUrl: item.url, depth: item.depth });
              } catch {
                // One controlled retry only; preserve original failure reason.
              }
            }
            return failedPage(item.url, item.depth, "failed", reason);
          }
        }),
      );
      pages.push(...settled);
    }

    const failedTargets = new Set(
      pages.filter((page) => page.status === "failed").map((page) => page.requestedUrl),
    );
    for (const page of pages) {
      if (!page.finalUrl) continue;
      page.links.brokenInternal = [
        ...new Set(
          decisions
            .filter(
              (decision) => decision.fromUrl === page.finalUrl && failedTargets.has(decision.url),
            )
            .map((decision) => decision.url),
        ),
      ];
    }

    pushProgress(progress, "running-cross-page-checks", startedAt, counts());
    const siteFindings = analyzeCrossPage(pages, [...discovered].sort());
    pushProgress(progress, "running-rendered-dom-checks", startedAt, counts());
    const renderedCandidates = pages
      .filter((page) => page.status === "audited" && page.renderedDom)
      .slice(0, 3);
    const renderedDom = {
      status: renderedCandidates.some((page) => page.renderedDom?.status === "available")
        ? ("available" as const)
        : renderedCandidates.some((page) => page.renderedDom?.status === "unavailable")
          ? ("unavailable" as const)
          : ("disabled" as const),
      analyzedPageCount: renderedCandidates.filter(
        (page) => page.renderedDom?.status === "available",
      ).length,
      unavailablePageCount: renderedCandidates.filter(
        (page) => page.renderedDom?.status === "unavailable",
      ).length,
      selectedPages: renderedCandidates.map((page) => ({
        url: page.finalUrl ?? page.requestedUrl,
        selectionReason:
          page.depth === 0
            ? "Entry page render sample"
            : "Early crawl representative render sample",
        renderedStatus: page.renderedDom?.status ?? "disabled",
        findings: (page.renderedDom?.findings ?? []).map((finding) => ({
          checkId: finding.checkId,
          summary: finding.summary,
          state: finding.state,
        })),
        unavailableReason: page.renderedDom?.unavailableReason ?? null,
      })),
      findings: renderedCandidates.flatMap((page) =>
        (page.renderedDom?.findings ?? [])
          .filter((finding) => finding.state !== "passed")
          .map((finding) => ({
            url: page.finalUrl ?? page.requestedUrl,
            checkId: finding.checkId,
            summary: finding.summary,
            state: finding.state,
          })),
      ),
    };
    pushProgress(progress, "calculating-site-score", startedAt, counts());
    const aggregate = calculateSiteAggregate({
      pages,
      findings: siteFindings,
      discoveredCount: discovered.size,
      selectedCount: pages.length,
    });
    pushProgress(progress, "preparing-report", startedAt, counts());
    pushProgress(
      progress,
      pages.some((p) => p.status === "failed") ? "partial" : "complete",
      startedAt,
      counts(),
    );

    return {
      requestId: input.requestId,
      auditType: "site",
      requestedUrl: input.url,
      normalizedOrigin: origin,
      startedAt: startedAtIso,
      completedAt: new Date().toISOString(),
      durationMs: Math.round(performance.now() - startedAt),
      pageLimit,
      crawlMode: input.crawlMode,
      progress,
      decisions,
      pages,
      siteFindings,
      aggregate,
      repeatedTemplateIssues: siteFindings.filter((f) => f.checkId.startsWith("SITE-013")),
      duplicateMetadataGroups: siteFindings.filter(
        (f) => f.checkId.startsWith("SITE-001") || f.checkId.startsWith("SITE-003"),
      ),
      internalLinkFindings: siteFindings.filter(
        (f) => f.checkId === "SITE-009" || f.checkId === "SITE-011",
      ),
      redirectFindings: siteFindings.filter((f) => f.checkId === "SITE-008"),
      orphanCandidates: siteFindings.filter((f) => f.checkId === "SITE-010"),
      renderedDom,
    };
  } catch (err) {
    pushProgress(progress, "failed", startedAt, counts());
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}
