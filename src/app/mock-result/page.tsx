"use client";

import { useState, useMemo, useEffect, useCallback, Suspense } from "react";
import { motion } from "motion/react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { ScoreCard } from "@/components/report/ScoreCard";
import { FindingCard } from "@/components/report/FindingCard";
import { FindingFilters } from "@/components/report/FindingFilters";
import { PerformanceSection } from "@/components/report/PerformanceSection";
import { SerpPreview } from "@/components/report/SerpPreview";
import { SocialPreview } from "@/components/report/SocialPreview";
import type { AuditResponseData } from "@/lib/audit/types";

type Section =
  "overview" | "critical" | "quickwins" | "findings" | "performance" | "serp" | "social";

const HEADER_OFFSET = 84;
const NAV_OFFSET = 48;
const SCROLL_MT = HEADER_OFFSET + NAV_OFFSET;

const navSections: { id: Section; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "critical", label: "Critical Issues" },
  { id: "quickwins", label: "Quick Wins" },
  { id: "findings", label: "All Findings" },
  { id: "performance", label: "Performance" },
  { id: "serp", label: "SERP Preview" },
  { id: "social", label: "Social Preview" },
];

const capLabel: Record<string, string> = {
  "keyword-density-index": "Keyword Density Index",
  "entity-topical-depth": "Entity Topical Depth",
};

const mockData: AuditResponseData = {
  requestId: "mock-req-001",
  requestedUrl: "https://example-nexora-site.com",
  finalUrl: "https://www.example-nexora-site.com",
  responseStatus: 200,
  contentType: "text/html; charset=utf-8",
  byteLength: 84321,
  durationMs: 4723,
  totalRules: 62,
  stateCounts: { passed: 28, failed: 12, warning: 8, "not-applicable": 9, unavailable: 5 },
  confidence: 82,
  findingsTruncated: false,
  partialStage: null,
  unavailableStage: null,
  performanceScore: 64,
  performanceStatus: "available",
  performanceSource: "pagespeed-mobile",
  performanceConfidence: 78,
  performanceExplanation: "Based on Lighthouse simulation and CrUX field data.",
  serpPreview: {
    title: "Nexora SEO Analyzer — Technical SEO Audit Tool",
    description:
      "Get a comprehensive technical SEO audit with actionable recommendations. Analyze meta tags, performance, accessibility, structured data, and more — powered by Nexora Creation.",
    canonicalUrl: "https://www.example-nexora-site.com",
    displayUrl: "https://www.example-nexora-site.com",
  },
  socialPreview: {
    ogTitle: "Nexora SEO Analyzer — Technical SEO Audit Tool",
    ogDescription:
      "Get a comprehensive technical SEO audit with actionable recommendations for your website. Analyze meta tags, performance, accessibility, structured data, and more.",
    ogImage: "https://nexoracreation.com/og-image.jpg",
    ogUrl: "https://www.example-nexora-site.com",
    ogType: "website",
    twitterCard: "summary_large_image",
    twitterTitle: "Nexora SEO Analyzer — Technical SEO Audit Tool",
    twitterDescription:
      "Get a comprehensive technical SEO audit with actionable recommendations for your website.",
    twitterImage: "https://nexoracreation.com/twitter-image.jpg",
  },
  calculationVersion: "2026-07-v3",
  snapshotSchemaVersion: "2026-07-v3",
  scoreFamilies: [
    { family: "seo-health", name: "SEO Health", rawScore: 48, cappedScore: 45, confidence: 82 },
    {
      family: "accessibility",
      name: "Accessibility",
      rawScore: 75,
      cappedScore: 72,
      confidence: 79,
    },
    {
      family: "security-trust",
      name: "Security & Trust",
      rawScore: 91,
      cappedScore: 88,
      confidence: 90,
    },
    {
      family: "aeo-readiness",
      name: "AEO Readiness",
      rawScore: 38,
      cappedScore: 34,
      confidence: 65,
    },
    {
      family: "geo-readiness",
      name: "GEO Readiness",
      rawScore: 31,
      cappedScore: 28,
      confidence: 58,
    },
  ],
  appliedCaps: [
    {
      capId: "keyword-density-index",
      reason:
        "Keyword density index capped due to insufficient content length for reliable measurement.",
      maxScore: 60,
      applied: true,
    },
    {
      capId: "entity-topical-depth",
      reason: "Entity topical depth capped because fewer than 3 relevant entities were extracted.",
      maxScore: 50,
      applied: true,
    },
  ],
  extractionWarnings: [
    "Open Graph image could not be resolved — the URL returned a 4xx status.",
    "Structured data extraction yielded no valid JSON-LD or Microdata blocks.",
  ],

  // ── Findings ──────────────────────────────────────────────
  findings: [
    // CRITICAL FAILED (3)
    {
      checkId: "meta-title-missing",
      state: "failed",
      category: "on-page-seo",
      severity: "critical",
      scored: true,
      summary: "Meta title is missing or empty",
      impact:
        "Search engines cannot determine the page topic, severely reducing click-through rates and ranking potential.",
      effort: "low",
      remediationSummary: "Add a unique, descriptive title tag between 50–60 characters.",
      remediationSteps: [
        "Open your site's <head> section in the HTML template or CMS.",
        "Add a <title> tag with your primary keyword near the beginning.",
        "Keep the title between 50–60 characters to avoid truncation in SERPs.",
        "Ensure each page has a unique title — never duplicate across pages.",
      ],
      responsible: "Content / SEO Manager",
      confidence: 95,
    },
    {
      checkId: "h1-multiple",
      state: "failed",
      category: "structure",
      severity: "critical",
      scored: true,
      summary: "Page contains 4 H1 headings; only one is allowed",
      impact:
        "Multiple H1s confuse screen readers and dilute semantic structure, harming both accessibility and SEO.",
      effort: "medium",
      remediationSummary: "Consolidate to a single H1 and demote extra H1s to H2/H3.",
      remediationSteps: [
        "Audit all H1 elements on the page using the browser inspector.",
        "Keep only the primary page heading as H1.",
        "Change additional H1s to H2 or H3 depending on their hierarchy level.",
        "Verify heading order: H1 → H2 → H3 (never skip levels).",
      ],
      responsible: "Developer",
      confidence: 98,
    },
    {
      checkId: "canonical-missing",
      state: "failed",
      category: "technical-seo",
      severity: "critical",
      scored: true,
      summary: "Canonical tag is missing from the page",
      impact:
        "Duplicate content issues may arise, splitting ranking signals across multiple URL variants.",
      effort: "low",
      remediationSummary: "Add a self-referencing canonical link tag in the <head>.",
      remediationSteps: [
        "Identify the preferred (canonical) URL for this page.",
        "Add <link rel='canonical' href='https://www.example.com/your-page/' /> to the <head>.",
        "Ensure the canonical URL matches the final rendered URL of the page.",
        "Repeat for every page on the site.",
      ],
      responsible: "Developer / SEO Tech Lead",
      confidence: 96,
    },

    // HIGH FAILED (2)
    {
      checkId: "meta-description-missing",
      state: "failed",
      category: "on-page-seo",
      severity: "high",
      scored: true,
      summary: "Meta description is missing or empty",
      impact: "SERP snippets will show auto-generated text, reducing CTR and user engagement.",
      effort: "low",
      remediationSummary: "Add a compelling meta description between 150–160 characters.",
      remediationSteps: [
        "Craft a summary that includes the primary keyword and a clear value proposition.",
        "Keep descriptions between 150–160 characters to avoid truncation.",
        "Add <meta name='description' content='...' /> to the page <head>.",
        "Write unique descriptions for each page — never reuse the same text.",
      ],
      responsible: "Content / SEO Manager",
      confidence: 93,
    },
    {
      checkId: "image-alt-missing",
      state: "failed",
      category: "accessibility",
      severity: "high",
      scored: true,
      summary: "12 images are missing alt text",
      impact:
        "Screen readers cannot describe images to visually impaired users; missing alt text also reduces image SEO ranking.",
      effort: "medium",
      remediationSummary: "Add descriptive alt text to all images that convey meaning.",
      remediationSteps: [
        "Run an inventory of all <img> tags on the page.",
        "For each decorative image, add alt='' (empty string).",
        "For each informative image, add a concise description as alt text.",
        "Include relevant keywords naturally where appropriate but prioritize accurate description.",
      ],
      responsible: "Content Editor / Developer",
      confidence: 91,
    },

    // MEDIUM FAILED (2)
    {
      checkId: "heading-order",
      state: "failed",
      category: "structure",
      severity: "medium",
      scored: true,
      summary: "Heading hierarchy is broken: H3 appears before H2",
      impact:
        "Screen readers and search engine crawlers rely on proper heading order to understand content structure.",
      effort: "low",
      remediationSummary: "Reorder headings to maintain a logical hierarchy (no skipped levels).",
      remediationSteps: [
        "Review the full page heading structure using the browser's accessibility tree.",
        "Ensure H1 is followed by H2, H2 by H3 — never skip a level.",
        "Use CSS for visual styling adjustments rather than semantic heading misuse.",
        "Validate with a heading outline tool before deployment.",
      ],
      responsible: "Developer",
      confidence: 89,
    },
    {
      checkId: "font-preload",
      state: "failed",
      category: "performance",
      severity: "medium",
      scored: true,
      summary: "Key web fonts are not preloaded, causing render-blocking requests",
      impact:
        "Users experience a flash of invisible text (FOIT) while fonts load, degrading perceived performance.",
      effort: "low",
      remediationSummary: "Add <link rel='preload'> tags for primary fonts in the <head>.",
      remediationSteps: [
        "Identify the WOFF2 font files used above the fold.",
        "Add <link rel='preload' href='/fonts/primary.woff2' as='font' type='font/woff2' crossorigin> to the <head>.",
        "Ensure font-display: swap is set in your @font-face declarations.",
        "Test with a throttled connection to confirm FOIT is eliminated.",
      ],
      responsible: "Developer",
      confidence: 87,
    },

    // WARNINGS (4)
    {
      checkId: "social-meta-preview",
      state: "warning",
      category: "social",
      severity: "medium",
      scored: true,
      summary: "Open Graph description is under 50 characters",
      impact:
        "Social platforms may show truncated or auto-generated descriptions, reducing engagement when shared.",
      effort: "low",
      remediationSummary: "Expand OG description to at least 50 characters (ideally 120–160).",
      remediationSteps: [
        "Review the current og:description content in your <head>.",
        "Write a compelling 120–160 character summary of the page.",
        "Update the <meta property='og:description'> tag.",
        "Test with the Facebook Sharing Debugger or LinkedIn Post Inspector.",
      ],
      responsible: "Content / SEO Manager",
      confidence: 80,
    },
    {
      checkId: "structured-data-org",
      state: "warning",
      category: "structured-data",
      severity: "low",
      scored: true,
      summary: "Organization structured data is missing recommended fields",
      impact:
        "Rich results may not display the organization logo, contact info, or social profiles in search.",
      effort: "medium",
      remediationSummary:
        "Add recommended fields to your Organization schema (logo, sameAs, contactPoint).",
      remediationSteps: [
        "Locate your Organization JSON-LD block in the page <head> or via Google Tag Manager.",
        "Add the 'logo' field with the URL of your brand logo.",
        "Add the 'sameAs' array with links to your LinkedIn, Twitter, Facebook profiles.",
        "Optionally add 'contactPoint' for phone and email exposure in knowledge panels.",
      ],
      responsible: "Developer / SEO Tech Lead",
      confidence: 76,
    },
    {
      checkId: "compression-gzip",
      state: "warning",
      category: "performance",
      severity: "low",
      scored: true,
      summary: "Text compression is not fully enabled (Brotli not detected)",
      impact:
        "Uncompressed resources increase page weight by up to 70%, slowing load times on slower networks.",
      effort: "medium",
      remediationSummary:
        "Enable Brotli compression at the server/CDN level for all text-type resources.",
      remediationSteps: [
        "Check if your CDN or origin server supports Brotli (br) encoding.",
        "Configure your web server (nginx, Apache, Cloudflare) to prefer Brotli over gzip.",
        "Verify with curl -H 'Accept-Encoding: br' https://yourdomain.com/.",
        "Fall back to gzip for clients that do not support Brotli.",
      ],
      responsible: "DevOps / Hosting Admin",
      confidence: 82,
    },
    {
      checkId: "viewport-meta",
      state: "warning",
      category: "mobile",
      severity: "high",
      scored: true,
      summary: "Viewport meta tag is missing width=device-width",
      impact:
        "Mobile devices may render the page at a desktop width, requiring pinch-zoom and causing poor UX.",
      effort: "low",
      remediationSummary:
        "Add <meta name='viewport' content='width=device-width, initial-scale=1'> to the <head>.",
      remediationSteps: [
        "Open your HTML template or CMS header section.",
        "Add <meta name='viewport' content='width=device-width, initial-scale=1'>.",
        "Verify on a real mobile device or Chrome DevTools device emulation.",
        "Ensure no other viewport meta tags conflict with this one.",
      ],
      responsible: "Developer",
      confidence: 95,
    },

    // PASSED (2 sample)
    {
      checkId: "https-redirect",
      state: "passed",
      category: "security",
      severity: "critical",
      scored: true,
      summary: "HTTPS is properly enforced with a 301 redirect from HTTP",
      impact: "",
      effort: "",
      remediationSummary: "",
      remediationSteps: [],
      responsible: "",
      confidence: 99,
    },
    {
      checkId: "robots-txt",
      state: "passed",
      category: "technical-seo",
      severity: "high",
      scored: true,
      summary: "robots.txt is present and allows crawling of key sections",
      impact: "",
      effort: "",
      remediationSummary: "",
      remediationSteps: [],
      responsible: "",
      confidence: 97,
    },

    // NOT-APPLICABLE (1)
    {
      checkId: "video-captions",
      state: "not-applicable",
      category: "accessibility",
      severity: "medium",
      scored: true,
      summary: "No video elements found on the page — captions check skipped",
      impact: "",
      effort: "",
      remediationSummary: "",
      remediationSteps: [],
      responsible: "",
      confidence: 100,
      applicabilityReason:
        "No <video> or <iframe> elements with video sources detected in the DOM.",
    },

    // UNAVAILABLE (2)
    {
      checkId: "core-web-vitals-field",
      state: "unavailable",
      category: "performance",
      severity: "high",
      scored: false,
      summary: "CrUX field data is unavailable — insufficient real-user traffic",
      impact: "",
      effort: "",
      remediationSummary:
        "Field data becomes available once the page receives sufficient Chrome user traffic (approx. 1,000+ impressions in the 28-day window).",
      remediationSteps: [],
      responsible: "",
      confidence: 100,
      unavailableReason:
        "The page URL does not have sufficient Chrome User Experience Report data. This typically requires 1,000+ real-user page views over 28 days.",
    },
    {
      checkId: "lighthouse-seo",
      state: "unavailable",
      category: "performance",
      severity: "medium",
      scored: false,
      summary: "Lighthouse SEO score was not computed — internal error",
      impact: "",
      effort: "",
      remediationSummary:
        "Re-run the audit; if the issue persists, the Lighthouse API may be experiencing a transient failure.",
      remediationSteps: [],
      responsible: "",
      confidence: 100,
      unavailableReason:
        "Lighthouse encountered an internal error while computing the SEO category. This is typically transient.",
    },
  ],

  // ── Category Breakdowns ───────────────────────────────────
  categoryBreakdowns: [
    {
      category: "on-page-seo",
      rawScore: 38,
      cappedScore: 35,
      passed: 2,
      warning: 1,
      failed: 3,
      notApplicable: 0,
      unavailable: 0,
      informational: 0,
    },
    {
      category: "technical-seo",
      rawScore: 65,
      cappedScore: 62,
      passed: 4,
      warning: 1,
      failed: 1,
      notApplicable: 1,
      unavailable: 0,
      informational: 1,
    },
    {
      category: "structure",
      rawScore: 40,
      cappedScore: 38,
      passed: 1,
      warning: 0,
      failed: 2,
      notApplicable: 0,
      unavailable: 0,
      informational: 0,
    },
    {
      category: "accessibility",
      rawScore: 71,
      cappedScore: 68,
      passed: 5,
      warning: 2,
      failed: 1,
      notApplicable: 1,
      unavailable: 0,
      informational: 1,
    },
    {
      category: "performance",
      rawScore: 55,
      cappedScore: 50,
      passed: 3,
      warning: 2,
      failed: 1,
      notApplicable: 0,
      unavailable: 2,
      informational: 0,
    },
    {
      category: "security",
      rawScore: 92,
      cappedScore: 88,
      passed: 6,
      warning: 0,
      failed: 0,
      notApplicable: 1,
      unavailable: 0,
      informational: 0,
    },
    {
      category: "mobile",
      rawScore: 58,
      cappedScore: 55,
      passed: 2,
      warning: 1,
      failed: 1,
      notApplicable: 0,
      unavailable: 0,
      informational: 0,
    },
    {
      category: "social",
      rawScore: 45,
      cappedScore: 42,
      passed: 1,
      warning: 1,
      failed: 0,
      notApplicable: 0,
      unavailable: 0,
      informational: 0,
    },
    {
      category: "structured-data",
      rawScore: 30,
      cappedScore: 28,
      passed: 1,
      warning: 1,
      failed: 1,
      notApplicable: 0,
      unavailable: 1,
      informational: 0,
    },
  ],

  // ── Performance Mobile ────────────────────────────────────
  performanceMobile: {
    labMetrics: {
      lcp: { value: 3200, score: 35 },
      cls: { value: 0.15, score: 65 },
      tbt: { value: 420, score: 48 },
      si: { value: 5100, score: 42 },
      fcp: { value: 2400, score: 55 },
      performanceScore: 64,
      lighthouseAccessibilityScore: 78,
      lighthouseSeoScore: 58,
      lighthouseBestPracticesScore: 82,
    },
    fieldData: {
      lcp: { p75Ms: 3800, category: "needs-improvement" },
      cls: { p75: 0.18, category: "needs-improvement" },
      inp: { p75Ms: 280, category: "good" },
      fcp: { p75Ms: 2900, category: "needs-improvement" },
      overallCategory: "needs-improvement",
    },
    opportunities: [
      {
        id: "opt-1",
        title: "Eliminate render-blocking resources",
        description: "3 resources are blocking first paint.",
        score: 28,
        estimatedSavingsMs: 680,
        details: ["style.css (hosted)", "font-awesome.css", "analytics.js"],
      },
      {
        id: "opt-2",
        title: "Defer offscreen images",
        description: "4 images are loading above the fold but not visible initially.",
        score: 42,
        estimatedSavingsMs: 350,
        details: ["hero-bg.webp", "logo@2x.png"],
      },
      {
        id: "opt-3",
        title: "Reduce unused JavaScript",
        description: "210 KB of unused JS across 8 modules.",
        score: 35,
        estimatedSavingsMs: 520,
        details: ["vendor.chunk.js (142 KB unused)", "analytics.bundle.js (38 KB unused)"],
      },
      {
        id: "opt-4",
        title: "Preconnect to required origins",
        description: "3 third-party origins are not using preconnect.",
        score: 55,
        estimatedSavingsMs: 180,
        details: ["fonts.googleapis.com", "www.google-analytics.com", "cdn.example.com"],
      },
    ],
  },

  // ── Performance Desktop ────────────────────────────────────
  performanceDesktop: {
    labMetrics: {
      lcp: { value: 1800, score: 78 },
      cls: { value: 0.08, score: 82 },
      tbt: { value: 180, score: 75 },
      si: { value: 2800, score: 72 },
      fcp: { value: 1200, score: 85 },
      performanceScore: 76,
      lighthouseAccessibilityScore: 80,
      lighthouseSeoScore: 60,
      lighthouseBestPracticesScore: 84,
    },
    fieldData: null,
    opportunities: [
      {
        id: "d-opt-1",
        title: "Serve images in next-gen formats",
        description: "JPEG images could be converted to WebP/AVIF for faster load.",
        score: 48,
        estimatedSavingsMs: 420,
        details: [
          "header-banner.jpg → WebP (saves ~180 KB)",
          "product-thumb.jpg → AVIF (saves ~95 KB)",
        ],
      },
      {
        id: "d-opt-2",
        title: "Enable text compression",
        description: "HTML, CSS, and JS files are not Brotli-compressed.",
        score: 38,
        estimatedSavingsMs: 310,
        details: [
          "index.html (118 KB → ~38 KB with Brotli)",
          "main.css (62 KB → ~16 KB with Brotli)",
        ],
      },
    ],
  },
};

function MockResultContent() {
  const [activeSection, setActiveSection] = useState<Section>("overview");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  // Check URL params for instant mode (skip loading simulation)
  const hasInstant =
    typeof window !== "undefined" && new URLSearchParams(window.location.search).has("instant");
  const [showLoading, setShowLoading] = useState(!hasInstant);
  const [stageIdx, setStageIdx] = useState(0);
  const loadStages = [
    "Securing the website connection",
    "Reading the page structure",
    "Running verified SEO checks",
    "Calculating scores",
    "Requesting performance diagnostics",
  ];
  const [filters, setFilters] = useState({
    state: "all",
    category: "all",
    severity: "all",
    effort: "all",
    search: "",
    sort: "priority",
  });

  const data = mockData;

  const findings = useMemo(() => {
    let list = [...data.findings];
    if (filters.state !== "all") list = list.filter((f) => f.state === filters.state);
    if (filters.category !== "all") list = list.filter((f) => f.category === filters.category);
    if (filters.severity !== "all") list = list.filter((f) => f.severity === filters.severity);
    if (filters.effort !== "all") list = list.filter((f) => f.effort === filters.effort);
    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (f) => f.checkId.toLowerCase().includes(q) || f.summary.toLowerCase().includes(q),
      );
    }
    const sevRank: Record<string, number> = {
      critical: 0,
      high: 1,
      medium: 2,
      low: 3,
      informational: 4,
    };
    const stateRank: Record<string, number> = {
      failed: 0,
      warning: 1,
      passed: 2,
      "not-applicable": 3,
      unavailable: 4,
    };
    const effortRank: Record<string, number> = { low: 0, medium: 1, high: 2 };
    list.sort((a, b) => {
      if (filters.sort === "severity")
        return (sevRank[a.severity] ?? 5) - (sevRank[b.severity] ?? 5);
      if (filters.sort === "impact") return (stateRank[a.state] ?? 5) - (stateRank[b.state] ?? 5);
      if (filters.sort === "effort")
        return (effortRank[a.effort] ?? 3) - (effortRank[b.effort] ?? 3);
      if (filters.sort === "category") return a.category.localeCompare(b.category);
      return (sevRank[a.severity] ?? 5) - (sevRank[b.severity] ?? 5);
    });
    return list;
  }, [data, filters]);

  const categories = useMemo(() => {
    return [...new Set(data.findings.map((f) => f.category))].sort();
  }, [data]);

  const quickWins = useMemo(() => {
    return data.findings.filter(
      (f) => (f.state === "failed" || f.state === "warning") && f.effort === "low",
    );
  }, [data]);

  const criticalIssues = useMemo(() => {
    return data.findings.filter((f) => f.state === "failed" && f.severity === "critical");
  }, [data]);

  const seo = data.scoreFamilies.find((f) => f.family === "seo-health");
  const a11y = data.scoreFamilies.find((f) => f.family === "accessibility");
  const security = data.scoreFamilies.find((f) => f.family === "security-trust");
  const aeo = data.scoreFamilies.find((f) => f.family === "aeo-readiness");
  const geo = data.scoreFamilies.find((f) => f.family === "geo-readiness");

  const strongest = [seo, a11y, security, aeo, geo]
    .filter(Boolean)
    .sort((a, b) => (b?.cappedScore ?? 0) - (a?.cappedScore ?? 0))[0];
  const weakest = [seo, a11y, security, aeo, geo]
    .filter(Boolean)
    .sort((a, b) => (a?.cappedScore ?? 0) - (b?.cappedScore ?? 0))[0];

  const scrollTo = useCallback((sectionId: Section) => {
    const el = document.getElementById(`section-${sectionId}`);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - SCROLL_MT;
      window.scrollTo({ top, behavior: "smooth" });
      setActiveSection(sectionId);
    }
    setMobileNavOpen(false);
  }, []);

  useEffect(() => {
    const sectionIds: Section[] = [
      "overview",
      "critical",
      "quickwins",
      "findings",
      "performance",
      "serp",
      "social",
    ];
    const observers: IntersectionObserver[] = [];
    sectionIds.forEach((id) => {
      const el = document.getElementById(`section-${id}`);
      if (!el) return;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveSection(id);
        },
        { rootMargin: `-${SCROLL_MT + 40}px 0px -60% 0px`, threshold: 0 },
      );
      observer.observe(el);
      observers.push(observer);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  useEffect(() => {
    const t = setInterval(() => setStageIdx((i) => Math.min(i + 1, loadStages.length - 1)), 3000);
    const done = setTimeout(() => setShowLoading(false), 16000);
    return () => {
      clearInterval(t);
      clearTimeout(done);
    };
  }, [loadStages.length]);

  if (showLoading) {
    return (
      <div
        className="mx-auto w-full max-w-6xl px-4 py-20 text-center sm:px-6 lg:px-8"
        role="status"
        aria-live="polite"
        aria-label="Audit in progress"
        style={{ paddingTop: `${HEADER_OFFSET + 80}px` }}
      >
        <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute -left-32 -top-32 h-[500px] w-[500px] rounded-full bg-brand/5 blur-[120px]" />
          <div className="absolute -right-32 bottom-1/3 h-[400px] w-[400px] rounded-full bg-brand/3 blur-[100px]" />
        </div>
        <div className="mx-auto max-w-lg relative z-10">
          <div className="flex justify-center">
            <div className="relative h-16 w-16">
              <svg className="h-16 w-16 -rotate-90" viewBox="0 0 64 64" aria-hidden="true">
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  className="text-zinc-800"
                />
                <motion.circle
                  cx="32"
                  cy="32"
                  r="28"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  className="text-brand"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 28}
                  animate={{ strokeDashoffset: [2 * Math.PI * 28 * 0.75, 2 * Math.PI * 28 * 0.25] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                />
              </svg>
            </div>
          </div>
          <h1 className="mt-6 text-2xl font-bold text-text-primary">Analyzing your website</h1>
          <p className="mt-2 text-sm text-text-secondary break-all">{data.finalUrl}</p>
          <div className="mt-8 space-y-3 text-left max-w-sm mx-auto">
            {loadStages.map((stage, i) => {
              const isActive = i === stageIdx;
              const isDone = i < stageIdx;
              return (
                <div
                  key={stage}
                  className={`flex items-center gap-3 transition-all duration-300 ${
                    isActive ? "opacity-100" : isDone ? "opacity-60" : "opacity-30"
                  }`}
                >
                  <div
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-colors duration-300 ${
                      isDone
                        ? "bg-success/20 text-success"
                        : isActive
                          ? "bg-brand/20 text-brand"
                          : "bg-zinc-800 text-text-tertiary"
                    }`}
                  >
                    {isDone ? (
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        aria-hidden="true"
                      >
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    ) : (
                      <span className="text-[10px] font-bold">{i + 1}</span>
                    )}
                  </div>
                  <span
                    className={`text-sm ${isActive ? "text-text-primary font-medium" : "text-text-tertiary"}`}
                  >
                    {stage}
                  </span>
                </div>
              );
            })}
          </div>
          <p className="mt-8 text-xs text-text-tertiary">This usually takes a few seconds</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <meta name="robots" content="noindex" />
      <nav
        className="sticky z-30 border-b border-zinc-800 bg-bg-primary/95 backdrop-blur-sm no-print"
        style={{ top: `${HEADER_OFFSET}px` }}
        aria-label="Report sections"
      >
        <Container>
          <div className="flex h-12 items-center justify-between">
            <button
              className="sm:hidden flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-hover/50 transition-colors min-h-[44px]"
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              aria-expanded={mobileNavOpen}
              aria-label="Toggle report navigation"
            >
              {navSections.find((s) => s.id === activeSection)?.label ?? "Navigate"}
              <svg
                className={`h-4 w-4 transition-transform duration-200 ${mobileNavOpen ? "rotate-180" : ""}`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
            <div className="hidden sm:flex sm:gap-1 overflow-x-auto">
              {navSections.map((s) => (
                <button
                  key={s.id}
                  onClick={() => scrollTo(s.id)}
                  className={`whitespace-nowrap rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                    activeSection === s.id
                      ? "bg-brand/15 text-brand"
                      : "text-text-tertiary hover:text-text-primary"
                  }`}
                  aria-current={activeSection === s.id ? "true" : undefined}
                >
                  {s.label}
                </button>
              ))}
            </div>
            <Button
              className="shrink-0 text-xs py-1"
              variant="ghost"
              onClick={() => window.location.reload()}
            >
              Rescan
            </Button>
          </div>
          {mobileNavOpen && (
            <div className="border-t border-zinc-800 bg-bg-primary pb-3 sm:hidden">
              {navSections.map((s) => (
                <button
                  key={s.id}
                  onClick={() => scrollTo(s.id)}
                  className={`flex w-full items-center px-4 py-2.5 text-left text-sm min-h-[44px] ${
                    activeSection === s.id
                      ? "text-brand bg-brand/5 font-medium"
                      : "text-text-tertiary hover:text-text-primary hover:bg-bg-hover/30"
                  } transition-colors`}
                >
                  {s.id === "critical" && (
                    <svg
                      className="mr-2 h-4 w-4 text-critical shrink-0"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      aria-hidden="true"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 8v4M12 16h.01" />
                    </svg>
                  )}
                  {s.id === "quickwins" && (
                    <svg
                      className="mr-2 h-4 w-4 text-success shrink-0"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      aria-hidden="true"
                    >
                      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                    </svg>
                  )}
                  {s.label}
                  {activeSection === s.id && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-brand" />
                  )}
                </button>
              ))}
            </div>
          )}
        </Container>
      </nav>

      <Container className="py-6 sm:py-8 lg:py-12">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-text-primary sm:text-2xl">Audit Results</h1>
            <p className="mt-1 text-sm text-text-secondary break-all">{data.finalUrl}</p>
            <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-text-tertiary">
              <span>Completed</span>
              <span>{data.durationMs}ms</span>
              <span>Confidence: {data.confidence}%</span>
              {data.performanceSource && (
                <span className="text-brand">
                  {data.performanceSource === "pagespeed-mobile"
                    ? "Mobile-primary performance"
                    : "Desktop-fallback performance"}
                </span>
              )}
            </div>
          </div>
          <Button className="shrink-0 no-print" variant="secondary">
            New audit
          </Button>
        </div>

        {/* Overview */}
        <section
          id="section-overview"
          style={{ scrollMarginTop: `${SCROLL_MT}px` }}
          className="mt-6 sm:mt-8"
        >
          {strongest && weakest && (
            <div className="rounded-lg border border-brand/20 bg-brand/[0.03] p-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="text-brand"
                  aria-hidden="true"
                >
                  <path d="M12 2L2 12l10 10 10-10L12 2z" />
                </svg>
                <p className="text-xs font-semibold text-brand uppercase tracking-wider">
                  Executive Verdict
                </p>
              </div>
              <p className="text-sm text-text-secondary">
                Your site scores{" "}
                <span className="font-semibold text-text-primary">{seo?.cappedScore ?? 0}</span> on
                SEO health.{" "}
                {strongest.cappedScore >= 70
                  ? `Notable strength in ${strongest.name} (${strongest.cappedScore}). `
                  : `${strongest.name} (${strongest.cappedScore}) is the strongest area but needs improvement. `}
                {weakest.cappedScore < 50
                  ? `${weakest.name} (${weakest.cappedScore}) requires immediate attention.`
                  : `${weakest.name} (${weakest.cappedScore}) has room for improvement.`}
                {criticalIssues.length > 0 &&
                  ` ${criticalIssues.length} critical issue${criticalIssues.length > 1 ? "s" : ""} detected.`}
              </p>
              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-text-secondary">
                <span>
                  <span className="text-critical font-medium">{criticalIssues.length}</span>{" "}
                  critical issue{criticalIssues.length !== 1 ? "s" : ""}
                </span>
                <span>
                  <span className="text-success font-medium">{quickWins.length}</span> quick win
                  {quickWins.length !== 1 ? "s" : ""}
                </span>
                <span>
                  <span className="text-text-primary font-medium">{data.findings.length}</span>{" "}
                  total findings
                </span>
              </div>
              {data.appliedCaps.filter((c) => c.applied).length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {data.appliedCaps
                    .filter((c) => c.applied)
                    .map((cap) => (
                      <span
                        key={cap.capId}
                        className="rounded bg-warning/10 px-2 py-0.5 text-[11px] font-medium text-warning"
                        title={cap.reason}
                      >
                        {capLabel[cap.capId] ?? cap.capId}
                      </span>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* Score grid — compact, Performance separate */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            <ScoreCard
              label="SEO Health"
              score={seo?.cappedScore ?? 0}
              confidence={data.confidence}
            />
            <ScoreCard
              label="Accessibility"
              score={a11y?.cappedScore ?? 0}
              confidence={a11y?.confidence ?? null}
            />
            <ScoreCard
              label="Security & Trust"
              score={security?.cappedScore ?? 0}
              confidence={security?.confidence ?? null}
            />
            <ScoreCard
              label="AEO Readiness"
              score={aeo?.cappedScore ?? 0}
              confidence={aeo?.confidence ?? null}
              info
            />
            <ScoreCard
              label="GEO Readiness"
              score={geo?.cappedScore ?? 0}
              confidence={geo?.confidence ?? null}
              info
            />
          </div>

          {/* Performance as separate briefing panel */}
          <div className="mt-4">
            <PerformanceSection
              mobile={data.performanceMobile}
              desktop={data.performanceDesktop}
              score={data.performanceScore}
              status={data.performanceStatus}
              source={data.performanceSource}
              explanation={data.performanceExplanation}
              performanceConfidence={data.performanceConfidence ?? null}
            />
          </div>

          {data.confidence < 100 && (
            <div className="mt-4 rounded-lg border border-zinc-800 bg-bg-card p-4">
              <p className="text-sm text-text-secondary">
                Audit confidence: {data.confidence}% &mdash; based on available data.
                {data.partialStage && " Some rules could not be evaluated."}
              </p>
            </div>
          )}

          {data.appliedCaps.filter((c) => c.applied).length > 0 && (
            <div className="mt-4 rounded-lg border border-warning/30 bg-warning/5 p-4">
              <h3 className="text-sm font-semibold text-warning">Score Caps Applied</h3>
              {data.appliedCaps
                .filter((c) => c.applied)
                .map((cap) => {
                  const displayName = capLabel[cap.capId] ?? cap.capId;
                  return (
                    <div key={cap.capId} className="mt-1">
                      <p className="text-sm text-warning/90">
                        <span className="font-medium">{displayName}</span> — {cap.reason}
                      </p>
                      <p className="text-xs text-warning/60">Maximum score: {cap.maxScore}</p>
                    </div>
                  );
                })}
            </div>
          )}

          {data.extractionWarnings.length > 0 && (
            <div className="mt-4 rounded-lg border border-zinc-800 bg-bg-card p-4">
              <h3 className="text-sm font-semibold text-text-primary">Extraction Notes</h3>
              <ul className="mt-2 list-disc pl-5 text-sm text-text-secondary">
                {data.extractionWarnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          )}
        </section>

        {/* Critical Issues */}
        <section
          id="section-critical"
          style={{ scrollMarginTop: `${SCROLL_MT}px` }}
          className="mt-8 sm:mt-10 lg:mt-14"
        >
          <h2 className="text-base font-bold text-text-primary sm:text-lg">
            Critical Issues
            <span className="ml-2 rounded bg-critical/15 px-2 py-0.5 text-xs font-medium text-critical">
              {criticalIssues.length}
            </span>
          </h2>
          <div className="mt-4 space-y-3 print-break-inside">
            {criticalIssues.map((f) => (
              <FindingCard
                key={f.checkId}
                state={f.state}
                severity={f.severity}
                checkId={f.checkId}
                category={f.category}
                summary={f.summary}
                impact={f.impact}
                remediationSummary={f.remediationSummary}
                remediationSteps={f.remediationSteps}
                responsible={f.responsible}
                effort={f.effort}
                evidenceValue={null}
                scored={f.scored}
              />
            ))}
          </div>
        </section>

        {/* Quick Wins */}
        <section
          id="section-quickwins"
          style={{ scrollMarginTop: `${SCROLL_MT}px` }}
          className="mt-8 sm:mt-10 lg:mt-14"
        >
          <h2 className="text-base font-bold text-text-primary sm:text-lg">
            Quick Wins
            <span className="ml-2 rounded bg-success/15 px-2 py-0.5 text-xs font-medium text-success">
              {quickWins.length}
            </span>
          </h2>
          <p className="mt-1 text-sm text-text-secondary">
            Low-effort, meaningful-impact findings you can fix quickly.
          </p>
          <div className="mt-4 space-y-3 print-break-inside">
            {quickWins.map((f) => (
              <FindingCard
                key={f.checkId}
                state={f.state}
                severity={f.severity}
                checkId={f.checkId}
                category={f.category}
                summary={f.summary}
                impact={f.impact}
                remediationSummary={f.remediationSummary}
                remediationSteps={f.remediationSteps}
                responsible={f.responsible}
                effort={f.effort}
                evidenceValue={null}
                scored={f.scored}
              />
            ))}
          </div>
        </section>

        {/* All Findings */}
        <section
          id="section-findings"
          style={{ scrollMarginTop: `${SCROLL_MT}px` }}
          className="mt-8 sm:mt-10 lg:mt-14"
        >
          <h2 className="text-base font-bold text-text-primary sm:text-lg">All Findings</h2>
          <div className="mt-4 no-print">
            <FindingFilters
              filters={filters}
              onChange={setFilters}
              categories={categories}
              totalCount={data.findings.length}
              filteredCount={findings.length}
            />
          </div>
          <div className="mt-4 space-y-3">
            {findings.map((f) => (
              <FindingCard
                key={f.checkId}
                state={f.state}
                severity={f.severity}
                checkId={f.checkId}
                category={f.category}
                summary={f.summary}
                impact={f.impact}
                remediationSummary={f.remediationSummary}
                remediationSteps={f.remediationSteps}
                responsible={f.responsible}
                effort={f.effort}
                evidenceValue={null}
                scored={f.scored}
              />
            ))}
          </div>
        </section>

        {/* Performance */}
        <section
          id="section-performance"
          style={{ scrollMarginTop: `${SCROLL_MT}px` }}
          className="mt-8 sm:mt-10 lg:mt-14"
        >
          <h2 className="text-base font-bold text-text-primary sm:text-lg">Performance</h2>
          <div className="mt-4">
            <PerformanceSection
              mobile={data.performanceMobile}
              desktop={data.performanceDesktop}
              score={data.performanceScore}
              status={data.performanceStatus}
              source={data.performanceSource}
              explanation={data.performanceExplanation}
              performanceConfidence={data.performanceConfidence ?? null}
            />
          </div>
        </section>

        {/* SERP Preview */}
        <section
          id="section-serp"
          style={{ scrollMarginTop: `${SCROLL_MT}px` }}
          className="mt-8 sm:mt-10 lg:mt-14"
        >
          <h2 className="text-base font-bold text-text-primary sm:text-lg">SERP Preview</h2>
          <div className="mt-4 max-w-xl">
            <SerpPreview
              title={data.serpPreview.title}
              description={data.serpPreview.description}
              canonicalUrl={data.serpPreview.canonicalUrl}
              displayUrl={data.serpPreview.displayUrl}
            />
          </div>
        </section>

        {/* Social Preview */}
        <section
          id="section-social"
          style={{ scrollMarginTop: `${SCROLL_MT}px` }}
          className="mt-8 sm:mt-10 lg:mt-14"
        >
          <h2 className="text-base font-bold text-text-primary sm:text-lg">Social Preview</h2>
          <div className="mt-4 max-w-xl">
            <SocialPreview
              ogTitle={data.socialPreview.ogTitle}
              ogDescription={data.socialPreview.ogDescription}
              ogImage={data.socialPreview.ogImage}
              ogUrl={data.socialPreview.ogUrl}
              ogType={data.socialPreview.ogType}
              twitterCard={data.socialPreview.twitterCard}
              twitterTitle={data.socialPreview.twitterTitle}
              twitterDescription={data.socialPreview.twitterDescription}
              twitterImage={data.socialPreview.twitterImage}
            />
          </div>
        </section>

        {/* Nexora CTA */}
        <section className="mt-8 rounded-xl border border-zinc-800 bg-bg-card p-6 text-center no-print print-break-before sm:mt-10 lg:mt-14 sm:p-8">
          <p className="text-lg font-semibold text-text-primary">Need help fixing these issues?</p>
          <p className="mt-2 text-sm text-text-secondary">
            Nexora Creation provides hands-on SEO technical services. Let us help you implement the
            improvements your site needs.
          </p>
          <a
            href={`https://nexoracreation.com/?ref=nexora-seo-audit&url=${encodeURIComponent(data.finalUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 rounded-lg border border-zinc-700 px-6 py-3 text-sm font-medium text-text-primary hover:bg-bg-hover transition-colors"
          >
            Talk to Nexora Creation
          </a>
          <p className="mt-4 text-xs text-text-tertiary">
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
              className="inline-block text-brand mr-1 -mt-0.5"
            >
              <path d="M12 2L2 12l10 10 10-10L12 2z" />
            </svg>
            Powered by{" "}
            <a
              href="https://nexoracreation.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand hover:underline"
            >
              Nexora Creation
            </a>
            <span className="mx-1">&middot;</span>
            <a href="/methodology" className="text-brand hover:underline">
              Methodology
            </a>
          </p>
        </section>
      </Container>
    </>
  );
}

export default function MockResultPage() {
  return (
    <Suspense
      fallback={
        <Container className="py-20 text-center">
          <p className="text-text-secondary">Loading...</p>
        </Container>
      }
    >
      <MockResultContent />
    </Suspense>
  );
}
