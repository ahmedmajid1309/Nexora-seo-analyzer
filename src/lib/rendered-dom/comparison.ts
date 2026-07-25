import type { PageSnapshot } from "@/lib/extraction/types";
import type { RenderedDomAnalysis, RenderedDomFinding, RenderedDomSnapshot } from "./contracts";
import { RENDERED_DOM_CONTRACT_VERSION } from "./contracts";

const TITLE_MATERIAL_RATIO = 0.35;
const CONTENT_MATERIAL_RATIO = 0.3;
const LINK_MATERIAL_RATIO = 0.5;
const BLANK_TEXT_LENGTH = 80;
const CONSOLE_ERROR_THRESHOLD = 3;
const FAILED_RESOURCE_THRESHOLD = 3;

function firstMeta(snapshot: PageSnapshot, name: string): string | null {
  return (
    snapshot.metadata
      .find((entry) => entry.name.toLowerCase() === name.toLowerCase())
      ?.normalizedValue?.trim() || null
  );
}

function normalizedText(value: string | null | undefined): string | null {
  const normalized = value?.trim().replace(/\s+/g, " ").toLowerCase() ?? "";
  return normalized || null;
}

function normalizedUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  try {
    const parsed = new URL(value);
    parsed.hash = "";
    return parsed.toString().toLowerCase();
  } catch {
    return normalizedText(value);
  }
}

function relativeDelta(staticValue: number, renderedValue: number): number {
  const denominator = Math.max(staticValue, renderedValue, 1);
  return Math.abs(renderedValue - staticValue) / denominator;
}

function materiallyDifferent(
  a: string | null,
  b: string | null,
  threshold = TITLE_MATERIAL_RATIO,
): boolean {
  if (a === b) return false;
  if (!a || !b) return Boolean(a || b);
  const aWords = new Set(a.split(/\s+/).filter(Boolean));
  const bWords = new Set(b.split(/\s+/).filter(Boolean));
  const shared = [...aWords].filter((word) => bWords.has(word)).length;
  const similarity = shared / Math.max(aWords.size, bWords.size, 1);
  return 1 - similarity >= threshold;
}

function finding(input: RenderedDomFinding): RenderedDomFinding {
  return input;
}

function staticInternalLinks(snapshot: PageSnapshot): number {
  return snapshot.links.filter((link) => link.isSameOrigin && link.resolvedUrl).length;
}

function staticStructuredDataTypes(snapshot: PageSnapshot): string[] {
  return [...new Set(snapshot.structuredData.flatMap((block) => block.parsedTypes))].sort();
}

function state(condition: boolean): "passed" | "warning" {
  return condition ? "warning" : "passed";
}

export function compareRenderedDom(input: {
  staticSnapshot: PageSnapshot;
  renderedSnapshot: RenderedDomSnapshot;
}): RenderedDomAnalysis {
  const staticSnapshot = input.staticSnapshot;
  const rendered = input.renderedSnapshot;
  const staticTitle = normalizedText(staticSnapshot.document.title);
  const renderedTitle = normalizedText(rendered.document.title);
  const staticDescription = normalizedText(firstMeta(staticSnapshot, "description"));
  const renderedDescription = normalizedText(rendered.document.metaDescription);
  const staticCanonical = normalizedUrl(firstMeta(staticSnapshot, "canonical"));
  const renderedCanonical = normalizedUrl(rendered.document.canonical);
  const staticRobots = normalizedText(firstMeta(staticSnapshot, "robots"));
  const renderedRobots = normalizedText(rendered.document.robots);
  const staticH1 = staticSnapshot.headings
    .filter((h) => h.level === 1)
    .map((h) => normalizedText(h.text))
    .filter(Boolean)
    .join(" | ");
  const renderedH1 = rendered.document.h1Texts
    .map((h) => normalizedText(h))
    .filter(Boolean)
    .join(" | ");
  const staticContentLength = staticSnapshot.content.totalChars;
  const staticLinks = staticInternalLinks(staticSnapshot);
  const staticJsonLdCount = staticSnapshot.structuredData.length;
  const staticTypes = staticStructuredDataTypes(staticSnapshot);
  const clientRedirected =
    normalizedUrl(staticSnapshot.finalUrl) !== normalizedUrl(rendered.finalUrl);

  const findings: RenderedDomFinding[] = [
    finding({
      checkId: "JS-001",
      state: !staticTitle && Boolean(renderedTitle) ? "warning" : "passed",
      severity: "medium",
      summary:
        !staticTitle && renderedTitle
          ? "Title appears only after JavaScript rendering."
          : "Static HTML includes the page title.",
      evidence: `Static title: ${staticTitle ?? "missing"}; rendered title: ${renderedTitle ?? "missing"}`,
      impact: "Search engines and previews may miss the title if they rely on initial HTML.",
      remediation: "Render the primary title in the server HTML before client JavaScript runs.",
      responsible: "developer",
      effort: "medium",
      applicability: "Applies to all indexable HTML pages with a document title.",
      staticValue: staticTitle,
      renderedValue: renderedTitle,
      confidence: 94,
    }),
    finding({
      checkId: "JS-002",
      state: state(
        Boolean(staticTitle && renderedTitle && materiallyDifferent(staticTitle, renderedTitle)),
      ),
      severity: "medium",
      summary: "Rendered title differs materially from static title.",
      evidence: `Static title: ${staticTitle ?? "missing"}; rendered title: ${renderedTitle ?? "missing"}; threshold: ${TITLE_MATERIAL_RATIO}`,
      impact:
        "Different static and rendered titles can create inconsistent search snippets and debugging noise.",
      remediation:
        "Keep title generation consistent between server-rendered HTML and client-rendered state.",
      responsible: "developer",
      effort: "medium",
      applicability: "Applies when both static and rendered titles are present.",
      staticValue: staticTitle,
      renderedValue: renderedTitle,
      confidence: 90,
    }),
    finding({
      checkId: "JS-003",
      state: state(staticDescription !== renderedDescription),
      severity: "medium",
      summary: "Meta description appears or changes after rendering.",
      evidence: `Static description: ${staticDescription ?? "missing"}; rendered description: ${renderedDescription ?? "missing"}`,
      impact: "Bots that consume initial HTML may see a missing or different description.",
      remediation:
        "Emit the canonical meta description in static HTML and avoid client-only replacement.",
      responsible: "developer",
      effort: "medium",
      applicability: "Applies to pages expected to expose a meta description.",
      staticValue: staticDescription,
      renderedValue: renderedDescription,
      confidence: 90,
    }),
    finding({
      checkId: "JS-004",
      state: state(staticCanonical !== renderedCanonical),
      severity: "high",
      summary: "Canonical appears or changes after rendering.",
      evidence: `Static canonical: ${staticCanonical ?? "missing"}; rendered canonical: ${renderedCanonical ?? "missing"}`,
      impact: "Changing canonical tags after load can create conflicting canonicalization signals.",
      remediation: "Render the canonical link in initial HTML and keep it stable after hydration.",
      responsible: "developer",
      effort: "medium",
      applicability: "Applies to canonicalized HTML pages.",
      staticValue: staticCanonical,
      renderedValue: renderedCanonical,
      confidence: 91,
    }),
    finding({
      checkId: "JS-005",
      state: state(staticRobots !== renderedRobots),
      severity: "high",
      summary: "Meta robots or indexability changes after rendering.",
      evidence: `Static robots: ${staticRobots ?? "missing"}; rendered robots: ${renderedRobots ?? "missing"}`,
      impact: "Late indexability changes may be ignored or interpreted inconsistently by crawlers.",
      remediation: "Serve final robots directives in the initial HTML response.",
      responsible: "developer",
      effort: "medium",
      applicability: "Applies when robots directives are used or expected.",
      staticValue: staticRobots,
      renderedValue: renderedRobots,
      confidence: 91,
    }),
    finding({
      checkId: "JS-006",
      state: state(materiallyDifferent(staticH1 || null, renderedH1 || null)),
      severity: "medium",
      summary: "Primary H1 appears, disappears or materially changes.",
      evidence: `Static H1: ${staticH1 || "missing"}; rendered H1: ${renderedH1 || "missing"}`,
      impact: "Client-only or changed primary headings can weaken content consistency.",
      remediation:
        "Render the primary H1 in initial HTML and keep hydration output semantically equivalent.",
      responsible: "developer",
      effort: "medium",
      applicability: "Applies to pages with primary content headings.",
      staticValue: staticH1 || null,
      renderedValue: renderedH1 || null,
      confidence: 88,
    }),
    finding({
      checkId: "JS-007",
      state: state(
        relativeDelta(staticContentLength, rendered.document.meaningfulTextLength) >=
          CONTENT_MATERIAL_RATIO,
      ),
      severity: "medium",
      summary: "Substantial rendered-content difference.",
      evidence: `Static text length: ${staticContentLength}; rendered meaningful text length: ${rendered.document.meaningfulTextLength}; threshold: ${CONTENT_MATERIAL_RATIO}`,
      impact: "Substantial client-only content can make static crawl results incomplete.",
      remediation: "Server-render important content or provide crawlable fallback HTML.",
      responsible: "developer",
      effort: "high",
      applicability: "Applies to content pages where visible copy is SEO-relevant.",
      staticValue: staticContentLength,
      renderedValue: rendered.document.meaningfulTextLength,
      confidence: 84,
    }),
    finding({
      checkId: "JS-008",
      state: state(
        relativeDelta(staticLinks, rendered.document.internalLinkCount) >= LINK_MATERIAL_RATIO,
      ),
      severity: "medium",
      summary: "Substantial internal-link count difference.",
      evidence: `Static internal links: ${staticLinks}; rendered internal links: ${rendered.document.internalLinkCount}; threshold: ${LINK_MATERIAL_RATIO}`,
      impact:
        "Client-only links may reduce discoverability for crawlers that rely on initial HTML.",
      remediation: "Include important internal navigation links in server-rendered HTML.",
      responsible: "developer",
      effort: "medium",
      applicability: "Applies to pages with internal navigation or crawl paths.",
      staticValue: staticLinks,
      renderedValue: rendered.document.internalLinkCount,
      confidence: 84,
    }),
    finding({
      checkId: "JS-009",
      state:
        staticJsonLdCount === 0 && rendered.document.structuredDataCount > 0 ? "warning" : "passed",
      severity: "low",
      summary: "Structured data is injected only after rendering.",
      evidence: `Static JSON-LD count: ${staticJsonLdCount}; rendered JSON-LD count: ${rendered.document.structuredDataCount}; rendered types: ${rendered.document.structuredDataTypes.join(", ") || "none"}`,
      impact: "Client-injected structured data can be less reliable than server-rendered JSON-LD.",
      remediation: "Emit critical JSON-LD in static HTML where possible.",
      responsible: "developer",
      effort: "medium",
      applicability: "Applies to pages using structured data.",
      staticValue: staticTypes.join(", ") || staticJsonLdCount,
      renderedValue:
        rendered.document.structuredDataTypes.join(", ") || rendered.document.structuredDataCount,
      confidence: 80,
    }),
    finding({
      checkId: "JS-010",
      state: rendered.document.meaningfulTextLength < BLANK_TEXT_LENGTH ? "failed" : "passed",
      severity: "high",
      summary: "Rendered page is blank or nearly blank.",
      evidence: `Rendered meaningful text length: ${rendered.document.meaningfulTextLength}; threshold: ${BLANK_TEXT_LENGTH}`,
      impact:
        "A blank rendered page can indicate hydration failure or blocked content for users and crawlers.",
      remediation:
        "Fix client rendering failures and ensure meaningful fallback content is present.",
      responsible: "developer",
      effort: "high",
      applicability: "Applies to pages expected to show meaningful body content.",
      staticValue: staticContentLength,
      renderedValue: rendered.document.meaningfulTextLength,
      confidence: 86,
    }),
    finding({
      checkId: "JS-011",
      state:
        rendered.javascript.consoleErrorCount >= CONSOLE_ERROR_THRESHOLD ? "warning" : "passed",
      severity: "low",
      summary: "Significant browser console errors.",
      evidence: `Console errors: ${rendered.javascript.consoleErrorCount}; samples: ${rendered.javascript.consoleErrors.join(" | ") || "none"}`,
      impact:
        "Console errors can indicate broken client behavior that affects rendered SEO signals.",
      remediation: "Resolve runtime errors in production bundles and third-party integrations.",
      responsible: "developer",
      effort: "medium",
      applicability: "Applies to pages with JavaScript execution.",
      staticValue: null,
      renderedValue: rendered.javascript.consoleErrorCount,
      confidence: 78,
    }),
    finding({
      checkId: "JS-012",
      state:
        rendered.javascript.requestFailedCount >= FAILED_RESOURCE_THRESHOLD ? "warning" : "passed",
      severity: "low",
      summary: "Important resources fail during rendering.",
      evidence: `Failed resources: ${rendered.javascript.requestFailedCount}; samples: ${rendered.javascript.failedResources.map((r) => `${r.resourceType}:${r.url}`).join(" | ") || "none"}`,
      impact:
        "Failed scripts, styles, images, or data requests can change the rendered page and user experience.",
      remediation: "Fix failed production resources and ensure critical assets load reliably.",
      responsible: "developer",
      effort: "medium",
      applicability: "Applies to rendered pages with network subresources.",
      staticValue: null,
      renderedValue: rendered.javascript.requestFailedCount,
      confidence: 78,
    }),
    finding({
      checkId: "JS-013",
      state: clientRedirected ? "warning" : "passed",
      severity: "medium",
      summary: "Client-side redirect changes final URL.",
      evidence: `Static final URL: ${staticSnapshot.finalUrl}; rendered final URL: ${rendered.finalUrl}`,
      impact: "Client-side redirects can create crawl ambiguity and delay canonical URL discovery.",
      remediation:
        "Prefer HTTP redirects for canonical URL moves and keep client redirects non-critical.",
      responsible: "developer",
      effort: "medium",
      applicability: "Applies when rendered browser navigation ends on a different URL.",
      staticValue: staticSnapshot.finalUrl,
      renderedValue: rendered.finalUrl,
      confidence: 87,
    }),
    finding({
      checkId: "JS-014",
      state: "passed",
      severity: "informational",
      summary: "Rendered DOM analysis available.",
      evidence: `Worker returned schema ${rendered.schemaVersion} for ${rendered.finalUrl}.`,
      impact:
        "Rendered diagnostics are available for comparison and did not affect SEO Health scoring.",
      remediation: "No remediation needed.",
      responsible: "developer",
      effort: "low",
      applicability: "Applies when the render worker returns a valid snapshot.",
      staticValue: null,
      renderedValue: rendered.durationMs,
      confidence: 100,
    }),
  ];

  return {
    status: "available",
    workerStatus: "healthy",
    renderedUrl: rendered.finalUrl,
    durationMs: rendered.durationMs,
    domNodeDelta: rendered.document.approxDomNodeCount - staticSnapshot.document.approxDomNodeCount,
    visibleTextDelta: rendered.document.visibleTextLength - staticSnapshot.content.totalChars,
    consoleErrorCount: rendered.javascript.consoleErrorCount,
    requestFailedCount: rendered.javascript.requestFailedCount,
    lab: rendered.lab,
    findings,
    unavailableReason: null,
    schemaVersion: RENDERED_DOM_CONTRACT_VERSION,
  };
}
