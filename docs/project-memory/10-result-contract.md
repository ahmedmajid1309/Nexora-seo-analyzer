# Result Contract

## Structured Finding Definition

Every check produces a structured finding with the following schema:

```typescript
interface NexoraFinding {
  // Identity
  checkId: string; // "nexora-core-title-present"
  provenance?: {
    // Only present for ported upstream rules
    upstreamRuleId: string; // "core-title-present"
    upstreamSourcePath: string; // "src/rules/core/title-present.ts"
    upstreamCommitHash: string; // "bbca017b56086a2959382d8260b97021736ca18f"
    disposition: string; // "PORT_AS_IS" | "PORT_WITH_MODIFICATIONS" | etc.
  };

  // Categorisation
  category: string; // "metadata"
  checkName: string; // "Title Tag Present"

  // Status
  state: "passed" | "warning" | "failed" | "not-applicable" | "unavailable";

  // Scoring
  severity: "critical" | "high" | "medium" | "low" | "informational";
  scored: boolean;
  scoreWeight: number; // 0-100 (within category)

  // Impact assessment
  impact: string; // Human-readable: "Missing title tag reduces SERP click-through rate"
  effort: "low" | "medium" | "high"; // Estimated effort to fix

  // Evidence
  evidence: {
    summary: string; // "Page has no <title> tag"
    observedValue: string | number | boolean | null;
    expectedValue: string | number | boolean | null;
    selector?: string; // CSS selector, e.g., "head > title"
    samples?: string[]; // Up to 3 example values, e.g., duplicate titles found
    affectedUrls?: string[]; // For cross-page findings
  };

  // Remediation
  remediation: {
    summary: string; // "Add a descriptive title tag"
    steps: string[]; // Ordered, actionable steps
    developerNotes?: string; // Technical implementation guidance
    contentNotes?: string; // Content writing guidance
    responsible: "developer" | "content" | "both";
  };

  // Confidence
  confidence: number; // 0-100, how confident the system is about this finding
  applicabilityReason?: string; // "Page is a product page — product schema checks apply"
  unavailableReason?: string; // "Rendered DOM not captured — JS rendering check skipped"

  // Sources
  source: "http-response" | "html-parse" | "rendered-dom" | "cross-page-analysis" | "external-api";
}
```

## Category Result

```typescript
interface CategoryResult {
  categoryId: string;
  categoryName: string;
  score: number; // 0-100
  findings: NexoraFinding[];
  passCount: number;
  warningCount: number;
  failCount: number;
  notApplicableCount: number;
  unavailableCount: number;
  confidence: number; // 0-100
}
```

## Audit Result

```typescript
interface AuditResult {
  // Identity
  auditId: string;
  auditType: "quick" | "site";
  url: string;
  canonicalUrl?: string;

  // Scores
  overallScore: number;
  seoHealthScore: number;
  aeoReadinessScore?: number; // Only if applicable
  geoReadinessScore?: number; // Only if applicable
  confidence: number;

  // Details
  categoryResults: CategoryResult[];

  // Page info
  fetchedAt: string; // ISO timestamp
  responseStatus: number;
  responseTime: number;
  pageSize: number; // Bytes
  contentType: string;
  title: string;
  description: string;
  canonical: string;
  robotsDirectives: string[];
  hreflangTags?: string[];

  // Site audit only
  pagesCrawled?: number;
  totalPages?: number;
  crawlDepth?: number;

  // Prose reports
  executiveSummary: string; // Generated from findings
  criticalIssues: NexoraFinding[];
  quickWins: NexoraFinding[]; // Low-effort, medium-high impact

  // Metadata
  timestamp: string;
  auditDurationMs: number;
  theme?: "light" | "dark";

  // Provenance (optional, for branded reports)
  generatedBy: string; // "Nexora SEO Analyzer"
  version: string;
}
```

## SERP Preview

```typescript
interface SerpPreview {
  title: string;
  titleWidth: number; // Estimated pixel width
  titleTruncated: boolean;
  description: string;
  descriptionWidth: number; // Estimated pixel width
  descriptionTruncated: boolean;
  url: string;
  urlDisplay: string; // Truncated, breadcrumb-style URL for display
  date?: string; // Estimated publication date from markup
}
```

## Social Preview

```typescript
interface SocialPreview {
  ogTitle: string;
  ogDescription: string;
  ogImage?: string;
  ogImageDimensions?: { width: number; height: number };
  twitterCard: string;
  previewPlatforms: ("facebook" | "twitter" | "linkedin" | "slack")[];
}
```

## Report Output

The API returns a report object containing:

- `meta`: Audit metadata (id, type, url, timestamp, duration)
- `summary`: Executive summary, critical issues, quick wins
- `scores`: Overall and category scores with confidence
- `categories`: Category results with all findings
- `serpPreview`: SERP preview (if applicable)
- `socialPreview`: Social preview (if applicable)
- `page`: Basic page information (status, timing, size)
- `cta`: Nexora Creation call-to-action (non-blocking)
