"use client";

import { motion, useReducedMotion, AnimatePresence } from "motion/react";
import { useEffect, useState, useMemo, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";

/* ─────────────────────────────────────────────
   TOKENS
   ───────────────────────────────────────────── */
const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
const BRAND = "#F4CA57";
const COLORS: Record<string, string> = {
  critical: "#F87171",
  high: "#FBBF24",
  medium: "#60A5FA",
  low: "#34D399",
  informational: "#6B7280",
  passed: "#34D399",
  warning: "#FBBF24",
  failed: "#F87171",
  "not-applicable": "#6B7280",
  unavailable: "#4B5563",
};

/* ─────────────────────────────────────────────
   MOCK AUDIT DATA
   ───────────────────────────────────────────── */
const mockFindings = [
  {
    id: "https-enforced",
    state: "failed" as const,
    severity: "critical" as const,
    category: "security-headers",
    summary: "HTTPS is not enforced. All traffic should be served over TLS.",
    impact: "Critical security and trust issue. Affects ranking and user confidence.",
    effort: "high" as const,
    responsible: "developer" as const,
    evidence: "Observed: HTTP 200 response on port 80. Expected: 301 redirect to HTTPS.",
    remediation: "Configure your web server to redirect all HTTP traffic to HTTPS and enable HSTS.",
    steps: [
      "Obtain TLS certificate",
      "Configure 301 redirect on port 80",
      "Set Strict-Transport-Security header",
      "Submit updated sitemap to search engines",
    ],
    scored: true,
  },
  {
    id: "missing-meta-description",
    state: "failed" as const,
    severity: "critical" as const,
    category: "metadata",
    summary: "Meta description is missing. Search engines display a description in SERP.",
    impact: "Poor SERP click-through rate and missing context for search engines.",
    effort: "low" as const,
    responsible: "content" as const,
    evidence:
      "Observed: No <meta name='description'> found in <head>. Expected: 120-158 character description.",
    remediation: "Add a unique meta description between 120-158 characters for each page.",
    steps: [
      "Write compelling 155-character description",
      "Include target keyword naturally",
      "Add <meta name='description' content='...'> to <head>",
    ],
    scored: true,
  },
  {
    id: "missing-heading-hierarchy",
    state: "failed" as const,
    severity: "high" as const,
    category: "on-page-seo",
    summary: "Heading hierarchy is missing or incorrect. Pages should have one H1 followed by H2s.",
    impact: "Poor content structure readability and reduced SEO signal distribution.",
    effort: "medium" as const,
    responsible: "content" as const,
    evidence: "Observed: 3 H1 tags on homepage. Expected: exactly one H1 per page.",
    remediation: "Restructure headings to follow a logical hierarchy with exactly one H1.",
    steps: [
      "Identify primary page topic for H1",
      "Reduce to single H1",
      "Convert excess H1s to H2 or H3",
      "Ensure hierarchy doesn't skip levels",
    ],
    scored: true,
  },
  {
    id: "image-alt-missing",
    state: "failed" as const,
    severity: "high" as const,
    category: "images",
    summary: "12 images are missing alt text. Alt attributes improve accessibility and image SEO.",
    impact: "Poor accessibility for screen reader users and missed image search opportunities.",
    effort: "low" as const,
    responsible: "content" as const,
    evidence: "Observed: 12 of 28 <img> tags have empty or missing alt attributes.",
    remediation: "Add descriptive alt text to every image. Leave decorative images with alt=''.",
    steps: [
      "Identify all images without alt text",
      "Write descriptive alt text for each",
      "Mark decorative images with empty alt",
    ],
    scored: true,
  },
  {
    id: "missing-og-tags",
    state: "warning" as const,
    severity: "medium" as const,
    category: "social-metadata",
    summary: "Open Graph tags are missing. Social platforms will not display rich previews.",
    impact: "Poor social sharing appearance and reduced click-through from social platforms.",
    effort: "low" as const,
    responsible: "developer" as const,
    evidence: "Observed: No og:title, og:description, or og:image tags found.",
    remediation: "Add Open Graph meta tags to control how your page appears when shared.",
    steps: [
      "Add og:title tag",
      "Add og:description (2-4 sentences)",
      "Add og:image (1200x630px recommended)",
      "Add og:url pointing to canonical URL",
    ],
    scored: true,
  },
  {
    id: "slow-ttfb",
    state: "warning" as const,
    severity: "high" as const,
    category: "performance",
    summary: "Time to First Byte is slow (1.8s). Target is under 800ms.",
    impact: "Poor user experience and negative Core Web Vitals assessment.",
    effort: "high" as const,
    responsible: "developer" as const,
    evidence: "Observed: TTFB of 1.8s. Expected: <800ms.",
    remediation: "Optimize server response time through caching, CDN, and backend optimization.",
    steps: [
      "Enable server-side caching",
      "Use CDN for static assets",
      "Optimize database queries",
      "Upgrade hosting if needed",
    ],
    scored: true,
  },
  {
    id: "missing-canonical",
    state: "warning" as const,
    severity: "medium" as const,
    category: "technical-seo",
    summary: "Canonical URL tag is missing. Duplicate content risk without canonicalization.",
    impact: "Search engines may index duplicate versions of your pages, diluting ranking signals.",
    effort: "low" as const,
    responsible: "developer" as const,
    evidence: "Observed: No <link rel='canonical'> found in <head>.",
    remediation: "Add a self-referencing canonical URL tag to every page.",
    steps: [
      "Add <link rel='canonical' href='...'> to every page's <head>",
      "Ensure canonical URLs match the preferred version",
    ],
    scored: true,
  },
  {
    id: "missing-sitemap",
    state: "warning" as const,
    severity: "medium" as const,
    category: "crawlability-indexability",
    summary:
      "XML sitemap is missing or inaccessible. Search engines need sitemaps for efficient crawling.",
    impact: "Reduced crawl efficiency and slower discovery of new or updated content.",
    effort: "low" as const,
    responsible: "developer" as const,
    evidence: "Observed: HTTP 404 on /sitemap.xml. Expected: 200 with valid XML sitemap.",
    remediation: "Generate and submit an XML sitemap to search engines.",
    steps: [
      "Generate XML sitemap with all canonical URLs",
      "Submit to Google Search Console",
      "Add sitemap reference to robots.txt",
    ],
    scored: true,
  },
  {
    id: "missing-robots-txt",
    state: "warning" as const,
    severity: "low" as const,
    category: "crawlability-indexability",
    summary: "robots.txt is missing or empty. Crawlers may access all paths unrestricted.",
    impact: "Minor — but best practice dictates controlling crawler access explicitly.",
    effort: "low" as const,
    responsible: "developer" as const,
    evidence: "Observed: HTTP 404 on /robots.txt. Expected: 200 with valid directives.",
    remediation: "Create a robots.txt file with crawl directives for all known crawlers.",
    steps: [
      "Create robots.txt with allowed/disallowed paths",
      "Point to your XML sitemap",
      "Test with Google's robots.txt tester",
    ],
    scored: true,
  },
  {
    id: "missing-structured-data",
    state: "warning" as const,
    severity: "medium" as const,
    category: "structured-data",
    summary: "No structured data (JSON-LD) found. Rich search features are unavailable.",
    impact: "Missed opportunity for rich snippets, knowledge panels, and enhanced SERP features.",
    effort: "medium" as const,
    responsible: "developer" as const,
    evidence:
      "Observed: No <script type='application/ld+json'> found. Expected: Organization or WebSite schema.",
    remediation: "Add JSON-LD structured data for your organization and content types.",
    steps: [
      "Identify content types (Organization, Article, Product, etc.)",
      "Generate JSON-LD markup",
      "Test with Google's Rich Results Test",
    ],
    scored: true,
  },
  {
    id: "mobile-viewport",
    state: "passed" as const,
    severity: "informational" as const,
    category: "mobile",
    summary: "Mobile viewport meta tag is correctly configured.",
    impact: "Good — page is configured for responsive rendering on mobile devices.",
    effort: "low" as const,
    responsible: "developer" as const,
    evidence: "Observed: <meta name='viewport' content='width=device-width, initial-scale=1'>",
    remediation: "No action needed. Viewport configuration is correct.",
    steps: [],
    scored: true,
  },
  {
    id: "tls-certificate",
    state: "passed" as const,
    severity: "informational" as const,
    category: "security-headers",
    summary: "TLS certificate is valid and properly configured.",
    impact: "Good — secure connection established.",
    effort: "low" as const,
    responsible: "developer" as const,
    evidence: "Observed: Valid TLS 1.3 certificate from Let's Encrypt. Expires in 72 days.",
    remediation: "No action needed. Monitor certificate expiry.",
    steps: [],
    scored: true,
  },
  {
    id: "h1-present",
    state: "passed" as const,
    severity: "informational" as const,
    category: "on-page-seo",
    summary: "Page has exactly one H1 heading.",
    impact: "Good — heading hierarchy starts correctly.",
    effort: "low" as const,
    responsible: "content" as const,
    evidence: "Observed: One H1 tag found: 'Welcome to Example Site'.",
    remediation: "No action needed.",
    steps: [],
    scored: true,
  },
  {
    id: "language-attribute",
    state: "passed" as const,
    severity: "informational" as const,
    category: "technical-seo",
    summary: "HTML lang attribute is correctly set.",
    impact: "Good — search engines and screen readers can identify the page language.",
    effort: "low" as const,
    responsible: "developer" as const,
    evidence: "Observed: <html lang='en'>.",
    remediation: "No action needed.",
    steps: [],
    scored: true,
  },
  {
    id: "aeo-readiness",
    state: "failed" as const,
    severity: "medium" as const,
    category: "aeo-readiness",
    summary: "Content lacks clear question-answer structure for answer engine optimization.",
    impact: "Reduced visibility in voice search and AI-generated answer panels.",
    effort: "medium" as const,
    responsible: "content" as const,
    evidence:
      "Observed: No FAQ or Q&A structured content. Expected: Clear question-answer pairs with schema.",
    remediation: "Add FAQ schema and structure content around anticipated user queries.",
    steps: [
      "Research common questions in your niche",
      "Create dedicated FAQ sections with Q&A markup",
      "Use natural language that mirrors voice search queries",
    ],
    scored: true,
  },
  {
    id: "geo-readiness",
    state: "failed" as const,
    severity: "medium" as const,
    category: "geo-readiness",
    summary:
      "Page structure lacks semantic entity signals needed for generative engine optimization.",
    impact: "Reduced performance in AI-powered search platforms and LLM-generated results.",
    effort: "high" as const,
    responsible: "both" as const,
    evidence:
      "Observed: Minimal entity markup, weak topical clustering. Expected: Clear entity relationships with schema.org markup.",
    remediation: "Improve semantic HTML structure with clear entity signals and topical depth.",
    steps: [
      "Define key entities and their relationships",
      "Add schema.org markup for each entity type",
      "Create topical clusters with internal linking",
      "Use semantic HTML5 elements consistently",
    ],
    scored: true,
  },
];

const mockScoreFamilies = [
  {
    family: "seo-health",
    name: "SEO Health",
    score: 78,
    cappedScore: 78,
    confidence: 92,
    maxScore: 100,
  },
  {
    family: "accessibility",
    name: "Accessibility",
    score: 65,
    cappedScore: 65,
    confidence: 88,
    maxScore: 100,
  },
  {
    family: "security-trust",
    name: "Security & Trust",
    score: 42,
    cappedScore: 42,
    confidence: 95,
    maxScore: 100,
  },
  {
    family: "aeo-readiness",
    name: "AEO Readiness",
    score: 72,
    cappedScore: 72,
    confidence: 70,
    maxScore: 100,
  },
  {
    family: "geo-readiness",
    name: "GEO Readiness",
    score: 45,
    cappedScore: 45,
    confidence: 65,
    maxScore: 100,
  },
];

const mockPerformance = {
  mobile: { score: 58, ttfb: 1800, lcp: 3200, cls: 0.15, tbt: 350, si: 4200 },
  desktop: { score: 86, ttfb: 400, lcp: 1500, cls: 0.05, tbt: 80, si: 1800 },
  status: "completed" as const,
  source: "pagespeed-mobile",
  confidence: 90,
};

/* ─────────────────────────────────────────────
   COMPONENTS
   ───────────────────────────────────────────── */
function FadeUp({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduced = useReducedMotion();
  if (reduced) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

function ScoreRing({
  value,
  label,
  size = "md",
  color = BRAND,
}: {
  value: number;
  label: string;
  size?: "sm" | "md" | "lg";
  color?: string;
}) {
  const r = size === "lg" ? 52 : size === "md" ? 38 : 28;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  const reduced = useReducedMotion();
  const [animatedOffset, setAnimatedOffset] = useState(reduced ? offset : circ);

  useEffect(() => {
    if (reduced) return;
    const t = setTimeout(() => setAnimatedOffset(offset), 200);
    return () => clearTimeout(t);
  }, [offset, reduced]);

  const displayOffset = reduced ? offset : animatedOffset;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: (r + 12) * 2, height: (r + 12) * 2 }}>
        <svg
          className="w-full h-full -rotate-90"
          viewBox={`0 0 ${(r + 12) * 2} ${(r + 12) * 2}`}
          aria-hidden="true"
        >
          <circle
            cx={r + 12}
            cy={r + 12}
            r={r}
            fill="none"
            stroke="currentColor"
            strokeWidth={size === "lg" ? 6 : 5}
            className="text-zinc-800"
          />
          <motion.circle
            cx={r + 12}
            cy={r + 12}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={size === "lg" ? 6 : 5}
            strokeLinecap="round"
            strokeDasharray={circ}
            initial={false}
            animate={{ strokeDashoffset: displayOffset }}
            transition={{ duration: 1.2, ease: EASE }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className={`font-bold tabular-nums tracking-tight ${size === "lg" ? "text-3xl" : size === "md" ? "text-xl" : "text-base"}`}
            style={{ color }}
          >
            {value}
          </span>
        </div>
      </div>
      <p className="mt-1.5 text-xs font-medium text-text-tertiary uppercase tracking-wider text-center">
        {label}
      </p>
    </div>
  );
}

function Badge({ label, color }: { label: string; color: string }) {
  return (
    <span
      className="inline-flex rounded-lg px-2.5 py-1 text-xs font-bold uppercase tracking-wider"
      style={{ backgroundColor: `${color}18`, color }}
    >
      {label}
    </span>
  );
}

function FindingExpansion({ finding }: { finding: (typeof mockFindings)[number] }) {
  const [open, setOpen] = useState(false);
  const color =
    COLORS[
      finding.state === "failed" ? "failed" : finding.state === "warning" ? "warning" : "passed"
    ];

  return (
    <div
      className={`rounded-xl border transition-all duration-300 ${
        open ? "border-zinc-700" : "border-zinc-800/80 hover:border-zinc-700/80"
      }`}
    >
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-3 p-4 text-left min-h-[52px]"
        aria-expanded={open}
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: color }} />
          <div className="min-w-0">
            <p className="text-base font-medium text-text-primary truncate">{finding.summary}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <Badge label={finding.severity} color={COLORS[finding.severity]} />
              <span className="text-xs text-text-tertiary uppercase tracking-wider">
                {finding.category}
              </span>
              <span className="text-xs text-text-tertiary">Effort: {finding.effort}</span>
            </div>
          </div>
        </div>
        <svg
          className={`h-4 w-4 shrink-0 text-text-tertiary transition-transform duration-300 ${open ? "rotate-180" : ""}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="border-t border-zinc-800/60 px-4 pb-5 pt-4 space-y-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-text-tertiary mb-1">
                  Evidence
                </p>
                <p className="text-sm text-text-secondary bg-bg-card/60 rounded-xl p-3 border border-zinc-800/60 font-mono text-xs">
                  {finding.evidence}
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-text-tertiary mb-1">
                  Impact
                </p>
                <p className="text-sm text-text-secondary">{finding.impact}</p>
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-text-tertiary mb-1">
                  Remediation
                </p>
                <p className="text-sm text-text-secondary mb-2">{finding.remediation}</p>
                {finding.steps.length > 0 && (
                  <ol className="list-decimal pl-5 space-y-1">
                    {finding.steps.map((s, i) => (
                      <li key={i} className="text-sm text-text-secondary">
                        {s}
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MetricBar({
  label,
  value,
  max = 100,
  color = BRAND,
  suffix = "",
}: {
  label: string;
  value: number;
  max?: number;
  color?: string;
  suffix?: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm text-text-tertiary">{label}</span>
        <span className="text-sm font-bold tabular-nums" style={{ color }}>
          {value}
          {suffix}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          whileInView={{ width: `${(value / max) * 100}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: EASE }}
        />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN RESULT PAGE
   ───────────────────────────────────────────── */
const navItems = [
  { id: "overview", label: "Signal Overview" },
  { id: "critical", label: "Critical" },
  { id: "findings", label: "All Findings" },
  { id: "performance", label: "Performance" },
  { id: "navigation", label: "Navigation" },
] as const;

type NavId = (typeof navItems)[number]["id"];

export default function ResultPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const url = searchParams.get("url") ?? "example.com";

  const [activeSection, setActiveSection] = useState<NavId>("overview");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [filter, setFilter] = useState<string>("all");
  const [severityFilter, setSeverityFilter] = useState<string>("all");

  const scrollTo = useCallback((id: NavId) => {
    const el = document.getElementById(`sec-${id}`);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top, behavior: "smooth" });
      setActiveSection(id);
    }
    setMobileOpen(false);
  }, []);

  useEffect(() => {
    const ids: NavId[] = ["overview", "critical", "findings", "performance", "navigation"];
    const observers: IntersectionObserver[] = [];
    ids.forEach((id) => {
      const el = document.getElementById(`sec-${id}`);
      if (!el) return;
      const o = new IntersectionObserver(
        ([e]) => {
          if (e.isIntersecting) setActiveSection(id);
        },
        { rootMargin: "-100px 0px -60% 0px", threshold: 0 },
      );
      o.observe(el);
      observers.push(o);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  const criticalFindings = useMemo(
    () => mockFindings.filter((f) => f.severity === "critical" && f.state === "failed"),
    [],
  );
  const quickWins = useMemo(
    () => mockFindings.filter((f) => f.effort === "low" && f.state !== "passed"),
    [],
  );

  const filteredFindings = useMemo(() => {
    let list = [...mockFindings];
    if (filter !== "all") list = list.filter((f) => f.category === filter);
    if (severityFilter !== "all") list = list.filter((f) => f.severity === severityFilter);
    return list;
  }, [filter, severityFilter]);

  const categories = useMemo(() => [...new Set(mockFindings.map((f) => f.category))].sort(), []);

  const strongest = [...mockScoreFamilies].sort((a, b) => b.cappedScore - a.cappedScore)[0];
  const weakest = [...mockScoreFamilies].sort((a, b) => a.cappedScore - b.cappedScore)[0];

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-bg-primary/95 backdrop-blur-xl border-b border-zinc-800/60">
        <div className="mx-auto flex h-16 items-center justify-between px-5 sm:px-8 lg:px-12 max-w-[1400px]">
          <a href="/design-lab/final" className="flex items-center gap-3">
            <Image
              src="/logo.svg"
              alt="Nexora Creation"
              width={140}
              height={27}
              className="h-6 sm:h-7 w-auto"
            />
          </a>
          <div className="hidden sm:flex items-center gap-1 overflow-x-auto">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className={`whitespace-nowrap rounded-lg px-3.5 py-2 text-sm font-medium transition-all duration-200 ${
                  activeSection === item.id
                    ? "bg-brand/10 text-brand"
                    : "text-text-tertiary hover:text-text-primary hover:bg-bg-hover/30"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => router.push("/design-lab/final")}
            className="rounded-xl border border-zinc-700 px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary hover:border-zinc-600 transition-all duration-200"
          >
            New Scan
          </button>
          <button
            className="sm:hidden flex items-center justify-center min-h-[44px] min-w-[44px] rounded-xl text-text-secondary"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle navigation"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: "auto" }}
              exit={{ height: 0 }}
              className="sm:hidden border-t border-zinc-800 bg-bg-primary overflow-hidden"
            >
              <div className="px-5 py-4 space-y-1">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollTo(item.id)}
                    className={`block w-full text-left px-4 py-3 rounded-xl text-sm min-h-[44px] transition-all ${
                      activeSection === item.id
                        ? "bg-brand/10 text-brand font-medium"
                        : "text-text-tertiary"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Backdrop glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-48 -left-48 h-[500px] w-[500px] rounded-full bg-brand/[0.03] blur-[160px]" />
        <div className="absolute -bottom-48 right-1/4 h-[400px] w-[400px] rounded-full bg-blue-500/[0.02] blur-[120px]" />
      </div>

      <div className="relative z-10 pt-20 pb-16">
        <div className="mx-auto px-5 sm:px-8 lg:px-12 max-w-[1400px]">
          {/* ─── SECTION: OVERVIEW ─── */}
          <section id="sec-overview" style={{ scrollMarginTop: 100 }}>
            {/* Report header */}
            <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-text-primary">
                  SEO Intelligence Report
                </h1>
                <p className="mt-1 text-sm text-text-secondary break-all font-mono">{url}</p>
                <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-sm text-text-tertiary">
                  <span className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#34D399]" />
                    Completed
                  </span>
                  <span>8.4s duration</span>
                  <span className="flex items-center gap-1">
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      aria-hidden="true"
                    >
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                    Confidence: 92%
                  </span>
                </div>
              </div>
            </div>

            {/* Executive verdict */}
            <FadeUp>
              <div className="rounded-2xl border border-brand/20 bg-gradient-to-r from-brand/[0.04] to-transparent p-5 sm:p-6 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="text-brand"
                    aria-hidden="true"
                  >
                    <path d="M12 2L2 12l10 10 10-10L12 2z" />
                  </svg>
                  <span className="text-xs font-bold uppercase tracking-wider text-brand">
                    Executive Verdict
                  </span>
                </div>
                <p className="text-base text-text-secondary leading-relaxed">
                  Your site scores{" "}
                  <span className="font-semibold text-text-primary">
                    {mockScoreFamilies[0].cappedScore}
                  </span>{" "}
                  on SEO health. Notable strength in{" "}
                  <span className="text-brand font-medium">{strongest.name}</span> (
                  {strongest.cappedScore}).
                  <span className="text-[#F87171]"> {weakest.name}</span> ({weakest.cappedScore})
                  requires immediate attention.
                  {criticalFindings.length} critical issue{criticalFindings.length > 1 ? "s" : ""}{" "}
                  detected.
                </p>
                <div className="mt-3 flex flex-wrap gap-4 text-sm text-text-secondary">
                  <span>
                    <span className="text-[#F87171] font-semibold">{criticalFindings.length}</span>{" "}
                    critical
                  </span>
                  <span>
                    <span className="text-[#34D399] font-semibold">{quickWins.length}</span> quick
                    wins
                  </span>
                  <span>
                    <span className="text-text-primary font-semibold">{mockFindings.length}</span>{" "}
                    total findings
                  </span>
                </div>
              </div>
            </FadeUp>

            {/* Score family rings */}
            <FadeUp delay={0.1}>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-4 sm:gap-6 mb-6">
                {mockScoreFamilies.map((f) => {
                  const colorMap: Record<string, string> = {
                    "SEO Health": BRAND,
                    Accessibility: "#FBBF24",
                    "Security & Trust": "#F87171",
                    "AEO Readiness": "#A78BFA",
                    "GEO Readiness": "#F472B6",
                  };
                  return (
                    <ScoreRing
                      key={f.family}
                      value={f.cappedScore}
                      label={f.name}
                      size="sm"
                      color={colorMap[f.name] ?? BRAND}
                    />
                  );
                })}
              </div>
            </FadeUp>

            {/* First recommended action */}
            {criticalFindings.length > 0 && (
              <FadeUp delay={0.15}>
                <div className="rounded-2xl border border-l-4 border-l-[#F87171] border-zinc-800/80 bg-bg-card/80 p-5 mb-6">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#F87171]">
                    First recommended action
                  </p>
                  <p className="mt-1 text-base font-semibold text-text-primary">
                    {criticalFindings[0].summary}
                  </p>
                  <p className="mt-1 text-sm text-text-secondary">{criticalFindings[0].impact}</p>
                  <div className="mt-2 flex items-center gap-3">
                    <span className="text-xs font-medium uppercase tracking-wider text-text-tertiary">
                      Effort: {criticalFindings[0].effort}
                    </span>
                    <span className="text-xs font-medium uppercase tracking-wider text-text-tertiary">
                      Responsible: {criticalFindings[0].responsible}
                    </span>
                  </div>
                </div>
              </FadeUp>
            )}

            {/* Quick stats */}
            <FadeUp delay={0.2}>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                {[
                  { label: "Total Checks", value: "85+", color: BRAND },
                  { label: "Passed", value: "18", color: "#34D399" },
                  { label: "Warnings", value: "4", color: "#FBBF24" },
                  { label: "Failed", value: "2", color: "#F87171" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-xl border border-zinc-800/80 bg-bg-card/60 p-4 text-center"
                  >
                    <p
                      className="text-2xl sm:text-3xl font-bold tabular-nums"
                      style={{ color: stat.color }}
                    >
                      {stat.value}
                    </p>
                    <p className="text-xs text-text-tertiary mt-0.5">{stat.label}</p>
                  </div>
                ))}
              </div>
            </FadeUp>
          </section>

          {/* ─── SECTION: CRITICAL ─── */}
          <section id="sec-critical" style={{ scrollMarginTop: 100 }} className="mt-8 sm:mt-10">
            <FadeUp>
              <div className="flex items-center gap-3 mb-6">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F87171]/10">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#F87171"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 8v4M12 16h.01" />
                  </svg>
                </span>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-text-primary">
                    Critical Issues
                  </h2>
                  <p className="text-sm text-text-tertiary">Requires immediate attention</p>
                </div>
                <span className="ml-auto rounded-lg bg-[#F87171]/15 px-3 py-1.5 text-sm font-bold text-[#F87171]">
                  {criticalFindings.length}
                </span>
              </div>
            </FadeUp>

            <div className="space-y-3">
              {criticalFindings.map((f, i) => (
                <FadeUp key={f.id} delay={i * 0.08}>
                  <FindingExpansion finding={f} />
                </FadeUp>
              ))}
              {criticalFindings.length === 0 && (
                <div className="rounded-2xl border border-zinc-800/80 bg-bg-card/60 p-8 text-center">
                  <p className="text-sm text-text-tertiary">No critical issues detected.</p>
                </div>
              )}
            </div>

            {/* Quick Wins (inline after critical) */}
            <FadeUp delay={0.2}>
              <div className="mt-10">
                <div className="flex items-center gap-3 mb-6">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#34D399]/10">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#34D399"
                      strokeWidth="2"
                      aria-hidden="true"
                    >
                      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                    </svg>
                  </span>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-text-primary">Quick Wins</h2>
                    <p className="text-sm text-text-tertiary">Low effort, high impact</p>
                  </div>
                  <span className="ml-auto rounded-lg bg-[#34D399]/15 px-3 py-1.5 text-sm font-bold text-[#34D399]">
                    {quickWins.length}
                  </span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {quickWins.map((f, i) => (
                    <FadeUp key={f.id} delay={i * 0.06}>
                      <div className="rounded-xl border border-l-4 border-l-[#34D399] border-zinc-800/80 bg-gradient-to-r from-bg-card to-bg-elevated p-4">
                        <Badge label={f.severity} color="#34D399" />
                        <p className="mt-2 text-sm font-semibold text-text-primary">{f.summary}</p>
                        <p className="mt-1 text-sm text-text-secondary">{f.impact}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-xs font-medium uppercase tracking-wider text-text-tertiary">
                            {f.category}
                          </span>
                          <span className="text-xs font-medium uppercase tracking-wider text-text-tertiary">
                            Effort: {f.effort}
                          </span>
                        </div>
                      </div>
                    </FadeUp>
                  ))}
                </div>
              </div>
            </FadeUp>
          </section>

          {/* ─── SECTION: ALL FINDINGS ─── */}
          <section id="sec-findings" style={{ scrollMarginTop: 100 }} className="mt-8 sm:mt-10">
            <FadeUp>
              <h2 className="text-lg sm:text-xl font-bold text-text-primary mb-5">All Findings</h2>
            </FadeUp>

            {/* Filters */}
            <FadeUp delay={0.05}>
              <div className="flex flex-wrap gap-2 mb-5">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="rounded-xl border border-zinc-700 bg-bg-card/80 px-3.5 py-2.5 text-sm text-text-primary font-medium focus:outline-none focus:border-brand/40"
                  aria-label="Filter by category"
                >
                  <option value="all">All categories</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <select
                  value={severityFilter}
                  onChange={(e) => setSeverityFilter(e.target.value)}
                  className="rounded-xl border border-zinc-700 bg-bg-card/80 px-3.5 py-2.5 text-sm text-text-primary font-medium focus:outline-none focus:border-brand/40"
                  aria-label="Filter by severity"
                >
                  <option value="all">All severities</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                  <option value="informational">Informational</option>
                </select>
                <span className="text-sm text-text-tertiary self-center ml-auto">
                  {filteredFindings.length} of {mockFindings.length}
                </span>
              </div>
            </FadeUp>

            <div className="space-y-2">
              {filteredFindings.map((f, i) => (
                <FadeUp key={f.id} delay={i * 0.03}>
                  <FindingExpansion finding={f} />
                </FadeUp>
              ))}
            </div>
          </section>

          {/* ─── SECTION: PERFORMANCE ─── */}
          <section id="sec-performance" style={{ scrollMarginTop: 100 }} className="mt-8 sm:mt-10">
            <FadeUp>
              <div className="flex items-center gap-3 mb-6">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#60A5FA]/10">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#60A5FA"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                  </svg>
                </span>
                <h2 className="text-lg sm:text-xl font-bold text-text-primary">
                  Performance Intelligence
                </h2>
              </div>
            </FadeUp>

            {/* Mobile vs Desktop comparison */}
            <div className="grid gap-6 sm:grid-cols-2 mb-6">
              <FadeUp>
                <div className="rounded-2xl border border-zinc-800/80 bg-gradient-to-b from-bg-card to-bg-elevated p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="text-text-tertiary"
                        aria-hidden="true"
                      >
                        <rect x="4" y="2" width="16" height="20" rx="2" />
                        <path d="M12 18h.01" />
                      </svg>
                      <h3 className="text-base font-semibold text-text-primary">Mobile</h3>
                    </div>
                    <span className="text-3xl font-bold text-[#FBBF24] tabular-nums">
                      {mockPerformance.mobile.score}
                    </span>
                  </div>
                  <div className="h-2.5 rounded-full bg-zinc-800 overflow-hidden mb-5">
                    <motion.div
                      className="h-full rounded-full bg-[#FBBF24]"
                      initial={{ width: 0 }}
                      whileInView={{ width: `${mockPerformance.mobile.score}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, ease: EASE }}
                    />
                  </div>
                  <div className="space-y-2.5">
                    <MetricBar
                      label="TTFB"
                      value={mockPerformance.mobile.ttfb}
                      max={3000}
                      color="#FBBF24"
                      suffix="ms"
                    />
                    <MetricBar
                      label="LCP"
                      value={mockPerformance.mobile.lcp}
                      max={4000}
                      color="#F87171"
                      suffix="ms"
                    />
                    <MetricBar
                      label="CLS"
                      value={Math.round(mockPerformance.mobile.cls * 100)}
                      max={100}
                      color="#60A5FA"
                    />
                    <MetricBar
                      label="TBT"
                      value={mockPerformance.mobile.tbt}
                      max={600}
                      color="#FBBF24"
                      suffix="ms"
                    />
                    <MetricBar
                      label="SI"
                      value={mockPerformance.mobile.si}
                      max={6000}
                      color="#FBBF24"
                      suffix="ms"
                    />
                  </div>
                </div>
              </FadeUp>
              <FadeUp delay={0.1}>
                <div className="rounded-2xl border border-zinc-800/80 bg-gradient-to-b from-bg-card to-bg-elevated p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="text-text-tertiary"
                        aria-hidden="true"
                      >
                        <rect x="3" y="3" width="18" height="14" rx="2" />
                        <path d="M8 21h8M12 17v4" />
                      </svg>
                      <h3 className="text-base font-semibold text-text-primary">Desktop</h3>
                    </div>
                    <span className="text-3xl font-bold text-[#34D399] tabular-nums">
                      {mockPerformance.desktop.score}
                    </span>
                  </div>
                  <div className="h-2.5 rounded-full bg-zinc-800 overflow-hidden mb-5">
                    <motion.div
                      className="h-full rounded-full bg-[#34D399]"
                      initial={{ width: 0 }}
                      whileInView={{ width: `${mockPerformance.desktop.score}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, ease: EASE }}
                    />
                  </div>
                  <div className="space-y-2.5">
                    <MetricBar
                      label="TTFB"
                      value={mockPerformance.desktop.ttfb}
                      max={3000}
                      color="#34D399"
                      suffix="ms"
                    />
                    <MetricBar
                      label="LCP"
                      value={mockPerformance.desktop.lcp}
                      max={4000}
                      color="#34D399"
                      suffix="ms"
                    />
                    <MetricBar
                      label="CLS"
                      value={Math.round(mockPerformance.desktop.cls * 100)}
                      max={100}
                      color="#60A5FA"
                    />
                    <MetricBar
                      label="TBT"
                      value={mockPerformance.desktop.tbt}
                      max={600}
                      color="#34D399"
                      suffix="ms"
                    />
                    <MetricBar
                      label="SI"
                      value={mockPerformance.desktop.si}
                      max={6000}
                      color="#34D399"
                      suffix="ms"
                    />
                  </div>
                </div>
              </FadeUp>
            </div>

            {/* Performance note */}
            <FadeUp delay={0.2}>
              <div className="rounded-xl border border-zinc-800/80 bg-bg-card/60 p-4">
                <p className="text-sm text-text-tertiary">
                  Performance data sourced from PageSpeed Insights. Mobile is the primary
                  measurement. Confidence: {mockPerformance.confidence}%.
                </p>
              </div>
            </FadeUp>
          </section>

          {/* ─── SECTION: NAVIGATION (SERP + SOCIAL) ─── */}
          <section id="sec-navigation" style={{ scrollMarginTop: 100 }} className="mt-8 sm:mt-10">
            <FadeUp>
              <h2 className="text-lg sm:text-xl font-bold text-text-primary mb-6">
                Search &amp; Social Preview
              </h2>
            </FadeUp>

            <div className="grid gap-6 sm:grid-cols-2">
              {/* SERP Preview */}
              <FadeUp>
                <div className="rounded-2xl border border-zinc-800/80 bg-white overflow-hidden">
                  <div className="bg-zinc-50 px-4 py-2 border-b border-zinc-200">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-[#F87171]" />
                      <span className="h-2 w-2 rounded-full bg-[#FBBF24]" />
                      <span className="h-2 w-2 rounded-full bg-[#34D399]" />
                      <span className="ml-2 text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
                        Google SERP Preview
                      </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <p className="text-sm text-green-700 font-medium truncate">{url}</p>
                    <p className="text-xl text-[#1A0DAB] font-semibold leading-tight mt-1 hover:underline cursor-pointer line-clamp-2">
                      Example Site — Premium Digital Products
                    </p>
                    <p className="text-sm text-zinc-600 mt-1 leading-relaxed line-clamp-2">
                      We build premium digital products. SEO intelligence, web development, and
                      thoughtful design for modern businesses.
                    </p>
                  </div>
                </div>
              </FadeUp>

              {/* Social Preview (Twitter/X) */}
              <FadeUp delay={0.1}>
                <div className="rounded-2xl border border-zinc-800/80 bg-bg-card/80 overflow-hidden">
                  <div className="border-b border-zinc-800 px-4 py-2.5 flex items-center gap-2">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="text-text-tertiary"
                      aria-hidden="true"
                    >
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                    <span className="text-sm font-medium text-text-tertiary">Social Preview</span>
                  </div>
                  <div className="p-0">
                    <div className="aspect-[16/9] bg-gradient-to-br from-brand/[0.08] via-bg-card to-brand/[0.04] flex items-center justify-center border-b border-zinc-800/60">
                      <div className="text-center">
                        <svg
                          width="36"
                          height="36"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="text-brand/40 mx-auto"
                          aria-hidden="true"
                        >
                          <path d="M12 2L2 12l10 10 10-10L12 2z" />
                        </svg>
                        <p className="text-xs text-text-tertiary mt-2">Nexora Creation</p>
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="text-sm text-text-tertiary truncate">{url}</p>
                      <p className="text-base font-semibold text-text-primary mt-0.5">
                        Example Site
                      </p>
                      <p className="text-sm text-text-tertiary mt-0.5 line-clamp-2">
                        Premium digital products by Nexora Creation.
                      </p>
                    </div>
                  </div>
                </div>
              </FadeUp>
            </div>
          </section>

          {/* ─── NEXORA CTA ─── */}
          <section className="mt-8 sm:mt-10 rounded-2xl border border-zinc-800/80 bg-gradient-to-b from-bg-card to-bg-elevated p-6 sm:p-8 text-center">
            <p className="text-lg sm:text-xl font-bold text-text-primary">
              Need help fixing these issues?
            </p>
            <p className="mt-2 text-sm text-text-secondary max-w-lg mx-auto">
              Nexora Creation provides hands-on SEO technical services. Let us help you implement
              the improvements your site needs.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <a
                href="https://nexoracreation.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 rounded-2xl bg-brand px-6 py-3.5 text-sm font-semibold text-black hover:bg-[#e3b94a] transition-all duration-200 shadow-lg shadow-brand/20"
              >
                Talk to Nexora Creation
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  aria-hidden="true"
                >
                  <path d="M7 17l9.2-9.2M17 17V7H7" />
                </svg>
              </a>
              <a
                href="/methodology"
                className="inline-flex items-center gap-2 rounded-2xl border border-zinc-700 px-6 py-3.5 text-sm font-medium text-text-primary hover:bg-bg-tertiary transition-all duration-200"
              >
                View Methodology
              </a>
            </div>
            <p className="mt-4 text-sm text-text-tertiary">
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
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
