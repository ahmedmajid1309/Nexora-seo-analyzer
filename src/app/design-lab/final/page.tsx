"use client";

import { motion, useReducedMotion, AnimatePresence } from "motion/react";
import { type ReactNode, useEffect, useRef, useState, useCallback, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

/* ─────────────────────────────────────────────
   TOKENS & CONSTANTS
   ───────────────────────────────────────────── */
const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
const EASE_BOUNCE: [number, number, number, number] = [0.34, 1.56, 0.64, 1];
const BRAND = "#F4CA57";

/* ─────────────────────────────────────────────
   ANIMATION PRIMITIVES (local, no deps on production)
   ───────────────────────────────────────────── */
function FadeUp({
  children,
  delay = 0,
  y = 28,
  className,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  const reduced = useReducedMotion();
  if (reduced) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.55, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

function StaggerGroup({
  children,
  className,
  stagger = 0.08,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
}) {
  const reduced = useReducedMotion();
  if (reduced) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
      variants={{ visible: { transition: { staggerChildren: stagger, delayChildren: 0.05 } } }}
    >
      {children}
    </motion.div>
  );
}

function StaggerChild({ children, className }: { children: ReactNode; className?: string }) {
  const reduced = useReducedMotion();
  if (reduced) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 16 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } },
      }}
    >
      {children}
    </motion.div>
  );
}

function ScaleIn({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduced = useReducedMotion();
  if (reduced) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, scale: 0.94 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay, ease: EASE_BOUNCE }}
    >
      {children}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   SIGNAL DOT (pulsing indicator)
   ───────────────────────────────────────────── */
function SignalDot({ active = true, color = BRAND }: { active?: boolean; color?: string }) {
  return (
    <span className="relative inline-flex h-2.5 w-2.5">
      <span
        className={`absolute inset-0 rounded-full ${active ? "animate-ping" : ""}`}
        style={{ backgroundColor: color, opacity: 0.3 }}
      />
      <span
        className="relative inline-block h-2.5 w-2.5 rounded-full"
        style={{ backgroundColor: color }}
      />
    </span>
  );
}

/* ─────────────────────────────────────────────
   PROGRESS BAR (scroll-linked)
   ───────────────────────────────────────────── */
function ScrollProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(h > 0 ? Math.min(window.scrollY / h, 1) : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-0.5 bg-zinc-800/60">
      <motion.div
        className="h-full"
        style={{ backgroundColor: BRAND }}
        animate={{ scaleX: progress }}
        initial={{ scaleX: 0 }}
      />
    </div>
  );
}

/* ─────────────────────────────────────────────
   HEADER (design-lab variant, no production deps)
   ───────────────────────────────────────────── */
function PrototypeHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled ? "bg-bg-primary/90 backdrop-blur-xl shadow-lg shadow-black/10" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 items-center justify-between px-5 sm:px-8 lg:px-12 max-w-[1320px]">
        <a href="/design-lab/final" className="flex items-center gap-3 shrink-0">
          <Image
            src="/logo.svg"
            alt="Nexora Creation"
            width={160}
            height={31}
            className="h-7 sm:h-8 w-auto"
            priority
          />
        </a>
        <nav className="hidden sm:flex items-center gap-8" aria-label="Prototype navigation">
          <span className="text-sm font-medium uppercase tracking-[0.12em] text-brand">
            Signal Theatre
          </span>
        </nav>
        <button
          className="sm:hidden flex items-center justify-center min-h-[44px] min-w-[44px] rounded-xl text-text-secondary hover:text-text-primary transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            {menuOpen ? <path d="M18 6L6 18M6 6l12 12" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
          </svg>
        </button>
      </div>
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="sm:hidden border-t border-zinc-800 bg-bg-primary/95 backdrop-blur-xl overflow-hidden"
          >
            <div className="px-5 py-6 space-y-4">
              <span className="block text-sm text-brand font-medium uppercase tracking-wider">
                Signal Theatre
              </span>
              <a
                href="/design-lab/final/loading"
                className="block text-sm text-text-secondary hover:text-text-primary transition-colors"
              >
                Loading Example
              </a>
              <a
                href="/design-lab/final/result"
                className="block text-sm text-text-secondary hover:text-text-primary transition-colors"
              >
                Result Example
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

/* ─────────────────────────────────────────────
   AUDIT FORM (local prototype version)
   ───────────────────────────────────────────── */
function AuditFormPrototype() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [keyword] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      if (!url.trim()) return;
      setLoading(true);
      const params = new URLSearchParams({ url: url.trim() });
      if (keyword.trim()) params.set("keyword", keyword.trim());
      setTimeout(() => {
        router.push(`/design-lab/final/loading?${params.toString()}`);
      }, 400);
    },
    [url, keyword, router],
  );

  return (
    <form onSubmit={handleSubmit} noValidate className="w-full">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </span>
          <input
            ref={inputRef}
            id="dl-url"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            required
            disabled={loading}
            autoComplete="url"
            spellCheck={false}
            className="w-full rounded-2xl border border-zinc-700 bg-bg-card/80 pl-12 pr-5 py-4 text-[17px] text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-brand/50 focus:ring-2 focus:ring-brand/10 transition-all duration-200"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !url.trim()}
          className="inline-flex items-center justify-center gap-2.5 rounded-2xl bg-brand px-8 py-4 text-base font-semibold text-black hover:bg-[#e3b94a] transition-all duration-200 shadow-xl shadow-brand/20 disabled:opacity-40 disabled:cursor-not-allowed min-h-[56px]"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg
                className="h-5 w-5 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="3"
                  className="opacity-30"
                />
                <path
                  d="M12 2a10 10 0 019.95 9"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
              Scanning
            </span>
          ) : (
            <>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                aria-hidden="true"
              >
                <path d="M12 2L2 12l10 10 10-10L12 2z" />
              </svg>
              Scan Website
            </>
          )}
        </button>
      </div>
    </form>
  );
}

/* ─────────────────────────────────────────────
   CATEGORY SIGNAL MAP DATA
   ───────────────────────────────────────────── */
const signalCategories = [
  { name: "On-page SEO", count: 12, status: "active" as const, color: BRAND },
  { name: "Technical SEO", count: 9, status: "active" as const, color: "#60A5FA" },
  { name: "Performance", count: 8, status: "active" as const, color: "#34D399" },
  { name: "Accessibility", count: 11, status: "warning" as const, color: "#FBBF24" },
  { name: "Security", count: 6, status: "active" as const, color: "#F87171" },
  { name: "AEO Readiness", count: 5, status: "new" as const, color: "#A78BFA" },
  { name: "GEO Readiness", count: 5, status: "new" as const, color: "#F472B6" },
  { name: "Content", count: 10, status: "active" as const, color: "#34D399" },
  { name: "Images", count: 7, status: "active" as const, color: "#60A5FA" },
  { name: "Links", count: 8, status: "warning" as const, color: "#FBBF24" },
  { name: "Structured Data", count: 6, status: "active" as const, color: BRAND },
  { name: "Mobile", count: 7, status: "warning" as const, color: "#F87171" },
  { name: "Social Meta", count: 4, status: "active" as const, color: "#A78BFA" },
  { name: "Trust & Legal", count: 5, status: "active" as const, color: "#34D399" },
];

/* ─────────────────────────────────────────────
   TIMELINE STAGES
   ───────────────────────────────────────────── */
const timelineStages = [
  {
    step: "01",
    title: "Fetch & Verify",
    desc: "Server-side proxy fetch with DNS, TLS, and response integrity verification.",
    dur: "~2s",
  },
  {
    step: "02",
    title: "Extract Signals",
    desc: "Page parsed across 14 dimensions: metadata, content, headings, links, images, forms, social tags, and structured data.",
    dur: "~4s",
  },
  {
    step: "03",
    title: "Run Evidence Checks",
    desc: "Hundreds of deterministic rules evaluate each signal against best-practice criteria. Every finding is traceable.",
    dur: "~3s",
  },
  {
    step: "04",
    title: "Score & Prioritize",
    desc: "Category scores calculated from pass/fail ratios with weighted caps. Results organized by impact and effort.",
    dur: "~1s",
  },
];

/* ─────────────────────────────────────────────
   PRIORITY CARDS
   ───────────────────────────────────────────── */
const priorityIssues = [
  {
    badge: "Critical",
    color: "#F87171",
    title: "HTTPS not enforced",
    desc: "Security and trust issue affecting user confidence and search ranking.",
    effort: "High",
  },
  {
    badge: "High Impact",
    color: "#FBBF24",
    title: "Missing heading hierarchy",
    desc: "Improves content structure, readability, and SEO signal distribution.",
    effort: "Medium",
  },
  {
    badge: "Quick Win",
    color: "#34D399",
    title: "Add meta descriptions",
    desc: "Improves SERP click-through rate with minimal development effort.",
    effort: "Low",
  },
  {
    badge: "Quick Win",
    color: "#34D399",
    title: "Image alt text missing",
    desc: "Improves accessibility and image search visibility.",
    effort: "Low",
  },
];

/* ─────────────────────────────────────────────
   METRICS DATA
   ───────────────────────────────────────────── */
const metrics = [
  { label: "Performance", value: 92, status: "Excellent", color: "#34D399" },
  { label: "SEO Health", value: 78, status: "Good", color: BRAND },
  { label: "Accessibility", value: 65, status: "Needs Work", color: "#FBBF24" },
  { label: "Security", value: 42, status: "Poor", color: "#F87171" },
];

/* ─────────────────────────────────────────────
   FAQ DATA
   ───────────────────────────────────────────── */
const faqs = [
  {
    q: "Is this really free?",
    a: "Yes. The Nexora SEO Analyzer is completely free. There are no hidden limits, no trial periods, and no credit card required.",
  },
  {
    q: "Do you store my audit results?",
    a: "No. Audit results are generated live and returned directly to your browser. We do not persist or share your audit data.",
  },
  {
    q: "How accurate are the scores?",
    a: "Scores are calculated from deterministic checks against the actual page content and response. We do not fabricate data or predict rankings.",
  },
  {
    q: "What does AEO and GEO readiness mean?",
    a: "AEO assesses how well your content answers direct questions. GEO evaluates structure for AI-powered search platforms.",
  },
  {
    q: "How is my URL handled?",
    a: "Your URL is fetched server-side, checked against multiple security filters, and the page content is analysed for SEO signals.",
  },
];

/* ─────────────────────────────────────────────
   MAIN PAGE COMPONENT
   ───────────────────────────────────────────── */
export default function SignalTheatreHome() {
  return (
    <>
      <ScrollProgress />
      <PrototypeHeader />

      {/* ─── HERO ─── */}
      <section className="relative min-h-[85svh] overflow-hidden pt-24 pb-16 sm:pt-32 sm:pb-24 lg:pt-40 lg:pb-32">
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute -top-48 -left-48 h-[600px] w-[600px] rounded-full bg-brand/[0.03] blur-[160px]" />
          <div className="absolute -bottom-48 -right-48 h-[500px] w-[500px] rounded-full bg-blue-500/[0.02] blur-[140px]" />
        </div>

        <div className="mx-auto px-5 sm:px-8 lg:px-12 max-w-[1320px]">
          <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:gap-16 items-center">
            {/* Left: Copy + Form */}
            <div>
              <StaggerGroup stagger={0.1}>
                <StaggerChild>
                  <div className="flex items-center gap-3 mb-6">
                    <SignalDot color={BRAND} />
                    <span className="text-sm font-semibold uppercase tracking-[0.15em] text-brand">
                      Signal Theatre
                    </span>
                  </div>
                </StaggerChild>
                <StaggerChild>
                  <h1 className="text-[clamp(2.8rem,7vw,5.5rem)] font-bold tracking-tight text-text-primary leading-[0.98]">
                    <span className="block">The Evidence</span>
                    <span className="block text-brand mt-1">Theatre</span>
                    <span className="block text-2xl sm:text-3xl lg:text-4xl font-normal text-text-tertiary mt-3 tracking-normal">
                      Forensic SEO intelligence platform
                    </span>
                  </h1>
                </StaggerChild>
                <StaggerChild>
                  <p className="mt-5 text-[17px] text-text-secondary leading-relaxed max-w-lg">
                    Enter any URL and watch as our diagnostic engine scans, verifies, and scores
                    your website across 14 critical categories. Every finding is evidence-backed
                    from the actual page response.
                  </p>
                </StaggerChild>
                <StaggerChild>
                  <div className="mt-8 max-w-xl">
                    <AuditFormPrototype />
                  </div>
                </StaggerChild>
                <StaggerChild>
                  <div className="mt-5 flex flex-wrap items-center gap-5 text-base text-text-tertiary">
                    <span className="flex items-center gap-1.5">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        aria-hidden="true"
                      >
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      </svg>
                      No signup
                    </span>
                    <span className="flex items-center gap-1.5">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        aria-hidden="true"
                      >
                        <circle cx="11" cy="11" r="8" />
                        <path d="m21 21-4.35-4.35" />
                      </svg>
                      14 categories
                    </span>
                    <span className="flex items-center gap-1.5">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        aria-hidden="true"
                      >
                        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                      </svg>
                      ~10s audit
                    </span>
                  </div>
                </StaggerChild>
              </StaggerGroup>
            </div>

            {/* Right: Signal Dashboard */}
            <ScaleIn delay={0.3}>
              <div className="relative">
                <div
                  className="absolute -inset-6 rounded-3xl bg-brand/[0.02] blur-3xl"
                  aria-hidden="true"
                />
                <div className="relative rounded-2xl border border-zinc-700/50 bg-gradient-to-b from-bg-card/90 to-bg-elevated/60 overflow-hidden shadow-2xl shadow-black/40">
                  {/* Dashboard header */}
                  <div className="border-b border-zinc-800 bg-bg-elevated/80 px-5 py-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-full bg-[#F87171]/60" />
                        <span className="h-2.5 w-2.5 rounded-full bg-[#FBBF24]/60" />
                        <span className="h-2.5 w-2.5 rounded-full bg-[#34D399]/60" />
                      </div>
                      <span className="text-xs font-semibold uppercase tracking-widest text-text-tertiary">
                        Signal Monitor
                      </span>
                    </div>
                    <span className="flex items-center gap-2 rounded-lg bg-brand/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand border border-brand/20">
                      <SignalDot color={BRAND} /> Live
                    </span>
                  </div>

                  {/* Dashboard body */}
                  <div className="p-5 sm:p-6 space-y-5">
                    {/* Mini signal grid */}
                    <div className="grid grid-cols-3 gap-2">
                      {signalCategories.slice(0, 6).map((cat) => (
                        <div
                          key={cat.name}
                          className="rounded-xl border border-zinc-800/80 bg-bg-card/40 p-3 text-center transition-all duration-200 hover:border-zinc-700/80"
                        >
                          <span
                            className="inline-block h-1.5 w-1.5 rounded-full mb-1.5"
                            style={{ backgroundColor: cat.color }}
                          />
                          <p className="text-xs font-medium text-text-tertiary truncate">
                            {cat.name}
                          </p>
                          <p
                            className="text-lg font-bold tabular-nums text-text-primary"
                            style={{ color: cat.color }}
                          >
                            {cat.count}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Score strip */}
                    <div className="flex items-center justify-between rounded-xl border border-brand/20 bg-gradient-to-r from-brand/[0.05] to-transparent px-4 py-3">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wider text-brand">
                          SEO Health Score
                        </p>
                        <p className="text-3xl font-bold text-brand tabular-nums tracking-tight">
                          78
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-medium uppercase tracking-wider text-text-tertiary">
                          Status
                        </p>
                        <p className="text-sm text-text-secondary">18 passed &middot; 4 warnings</p>
                      </div>
                    </div>

                    {/* Activity feed */}
                    <div className="space-y-2">
                      {[
                        { label: "DNS resolution", status: "passed" as const },
                        { label: "TLS handshake", status: "passed" as const },
                        { label: "Meta tags extraction", status: "passed" as const },
                        { label: "Heading structure", status: "warning" as const },
                        { label: "Image alt attributes", status: "failed" as const },
                      ].map((item) => (
                        <div key={item.label} className="flex items-center justify-between py-1">
                          <div className="flex items-center gap-2.5">
                            <span
                              className={`h-2 w-2 rounded-full ${
                                item.status === "passed"
                                  ? "bg-[#34D399]"
                                  : item.status === "warning"
                                    ? "bg-[#FBBF24]"
                                    : "bg-[#F87171]"
                              }`}
                              style={
                                item.status === "passed"
                                  ? { boxShadow: "0 0 6px rgba(52,211,153,0.5)" }
                                  : item.status === "warning"
                                    ? { boxShadow: "0 0 6px rgba(251,191,36,0.5)" }
                                    : { boxShadow: "0 0 6px rgba(248,113,113,0.5)" }
                              }
                            />
                            <span className="text-sm text-text-secondary">{item.label}</span>
                          </div>
                          <span
                            className={`text-xs font-medium uppercase ${
                              item.status === "passed"
                                ? "text-[#34D399]"
                                : item.status === "warning"
                                  ? "text-[#FBBF24]"
                                  : "text-[#F87171]"
                            }`}
                          >
                            {item.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Floating badge */}
                <div className="absolute -bottom-3 -right-3 rounded-xl bg-bg-elevated border border-zinc-700/50 px-4 py-2 shadow-xl">
                  <p className="text-xs font-semibold uppercase tracking-wider text-text-tertiary">
                    Confidence
                  </p>
                  <p className="text-xl font-bold text-[#34D399] tabular-nums">94%</p>
                </div>
              </div>
            </ScaleIn>
          </div>
        </div>
      </section>

      {/* ─── SECTION 2: SIGNAL MAP (bento grid) ─── */}
      <section className="border-t border-zinc-800/60 py-16 sm:py-20 lg:py-24">
        <div className="mx-auto px-5 sm:px-8 lg:px-12 max-w-[1320px]">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <FadeUp>
              <span className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-brand">
                <span className="h-px w-6 bg-brand/40" />
                Signal Map
                <span className="h-px w-6 bg-brand/40" />
              </span>
            </FadeUp>
            <FadeUp delay={0.1}>
              <h2 className="mt-4 text-[clamp(1.75rem,4vw,3rem)] font-bold tracking-tight text-text-primary leading-[1.05]">
                14 categories. One unified diagnosis.
              </h2>
            </FadeUp>
            <FadeUp delay={0.15}>
              <p className="mt-4 text-[17px] text-text-secondary leading-relaxed max-w-xl mx-auto">
                Every category is scanned by deterministic rules. Each finding references real data
                from your page response. No black boxes.
              </p>
            </FadeUp>
          </div>

          {/* Asymmetric bento grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            {/* Hero tile — spans 2 cols */}
            <ScaleIn className="col-span-2 sm:col-span-2 lg:col-span-2 row-span-2">
              <div className="h-full rounded-2xl border border-brand/20 bg-gradient-to-br from-brand/[0.06] to-transparent p-6 sm:p-8 flex flex-col justify-between">
                <div>
                  <span className="inline-flex items-center gap-2 rounded-lg bg-brand/10 px-3 py-1 text-xs font-bold uppercase text-brand">
                    85+ Checks
                  </span>
                  <p className="mt-4 text-5xl sm:text-6xl lg:text-7xl font-bold text-brand tabular-nums tracking-tight">
                    85+
                  </p>
                  <p className="mt-2 text-base text-text-secondary">
                    Deterministic evidence checks
                  </p>
                </div>
                <div className="mt-6 grid grid-cols-2 gap-3">
                  {[
                    { label: "Categories", value: "14", color: BRAND },
                    { label: "Score Caps", value: "5", color: "#FBBF24" },
                    { label: "Confidence", value: "94%", color: "#34D399" },
                    { label: "Avg. Duration", value: "10s", color: "#60A5FA" },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-xl bg-bg-card/60 border border-zinc-800/60 p-3 sm:p-4"
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
              </div>
            </ScaleIn>

            {/* Category tiles */}
            {signalCategories.map((cat, i) => (
              <ScaleIn key={cat.name} delay={0.04 * i}>
                <div className="h-full rounded-2xl border border-zinc-800/80 bg-gradient-to-b from-bg-card to-bg-elevated p-5 transition-all duration-200 hover:border-zinc-700/80 hover:shadow-lg group">
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className="inline-block h-2 w-2 rounded-full"
                      style={{ backgroundColor: cat.color, boxShadow: `0 0 8px ${cat.color}40` }}
                    />
                    <span
                      className={`text-xs font-semibold uppercase tracking-wider ${
                        cat.status === "new"
                          ? "text-brand"
                          : cat.status === "warning"
                            ? "text-[#FBBF24]"
                            : "text-[#34D399]"
                      }`}
                    >
                      {cat.status === "new"
                        ? "New"
                        : cat.status === "warning"
                          ? "Attention"
                          : "Active"}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-text-primary group-hover:text-text-bright transition-colors">
                    {cat.name}
                  </p>
                  <p className="mt-1 text-2xl font-bold tabular-nums text-text-secondary">
                    {cat.count}
                  </p>
                  <p className="text-xs text-text-tertiary mt-0.5">checks</p>
                </div>
              </ScaleIn>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SECTION 3: EVIDENCE ENGINE (timeline) ─── */}
      <section className="border-t border-zinc-800/60 bg-gradient-to-b from-bg-card/20 to-bg-primary py-16 sm:py-20 lg:py-24">
        <div className="mx-auto px-5 sm:px-8 lg:px-12 max-w-[1200px]">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <FadeUp>
              <span className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-brand">
                <span className="h-px w-6 bg-brand/40" />
                Evidence Engine
                <span className="h-px w-6 bg-brand/40" />
              </span>
            </FadeUp>
            <FadeUp delay={0.1}>
              <h2 className="mt-4 text-[clamp(1.75rem,4vw,3rem)] font-bold tracking-tight text-text-primary leading-[1.05]">
                How your audit comes together
              </h2>
            </FadeUp>
            <FadeUp delay={0.15}>
              <p className="mt-4 text-[17px] text-text-secondary leading-relaxed max-w-xl mx-auto">
                From URL submission to complete report in under 10 seconds. Every step is
                transparent and traceable.
              </p>
            </FadeUp>
          </div>

          {/* Desktop timeline */}
          <div className="hidden lg:block relative">
            <svg
              className="absolute top-12 left-[calc(12.5%+2rem)] right-[calc(12.5%+2rem)] h-0.5 overflow-visible"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="timeline-grad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#F4CA57" stopOpacity="0.3" />
                  <stop offset="50%" stopColor="#F4CA57" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#F4CA57" stopOpacity="0.3" />
                </linearGradient>
              </defs>
              <line
                x1="0"
                y1="0"
                x2="100%"
                y2="0"
                stroke="url(#timeline-grad)"
                strokeWidth="2"
                strokeDasharray="8 4"
              />
            </svg>
            <div className="grid grid-cols-4 gap-8">
              {timelineStages.map((stage, i) => (
                <FadeUp key={stage.step} delay={i * 0.12}>
                  <div className="flex flex-col items-center text-center">
                    <div className="relative z-10 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-muted to-brand/[0.05] text-xl font-bold text-brand border border-brand/20 shadow-lg shadow-brand/5">
                      {stage.step}
                    </div>
                    <span className="mt-2 text-xs font-semibold uppercase tracking-wider text-brand">
                      {stage.dur}
                    </span>
                    <h3 className="mt-3 text-lg font-semibold text-text-primary">{stage.title}</h3>
                    <p className="mt-2 text-base text-text-secondary leading-relaxed">
                      {stage.desc}
                    </p>
                  </div>
                </FadeUp>
              ))}
            </div>
          </div>

          {/* Mobile timeline */}
          <div className="lg:hidden space-y-8">
            {timelineStages.map((stage, i) => (
              <FadeUp key={stage.step} delay={i * 0.08}>
                <div className="flex gap-5 items-start">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-muted text-lg font-bold text-brand border border-brand/20">
                    {stage.step}
                  </div>
                  <div className="min-w-0 pt-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-base font-semibold text-text-primary">{stage.title}</h3>
                      <span className="text-sm text-brand">{stage.dur}</span>
                    </div>
                    <p className="mt-1.5 text-base text-text-secondary">{stage.desc}</p>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SECTION 4: DIAGNOSIS (split: critical vs quick wins) ─── */}
      <section className="border-t border-zinc-800/60 py-16 sm:py-20 lg:py-24">
        <div className="mx-auto px-5 sm:px-8 lg:px-12 max-w-[1320px]">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <FadeUp>
              <span className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-brand">
                <span className="h-px w-6 bg-brand/40" />
                Diagnosis
                <span className="h-px w-6 bg-brand/40" />
              </span>
            </FadeUp>
            <FadeUp delay={0.1}>
              <h2 className="mt-4 text-[clamp(1.75rem,4vw,3rem)] font-bold tracking-tight text-text-primary leading-[1.05]">
                From critical issues to quick wins
              </h2>
            </FadeUp>
            <FadeUp delay={0.15}>
              <p className="mt-4 text-[17px] text-text-secondary leading-relaxed max-w-xl mx-auto">
                Every finding is categorized by severity and effort so you know exactly where to
                start and what will have the most impact.
              </p>
            </FadeUp>
          </div>

          <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
            {/* Critical Issues */}
            <ScaleIn>
              <div className="rounded-2xl border border-zinc-800/80 bg-gradient-to-b from-bg-card to-bg-elevated overflow-hidden">
                <div className="border-b border-zinc-800 bg-[#F87171]/5 px-6 py-4">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F87171]/10">
                      <svg
                        width="16"
                        height="16"
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
                      <p className="text-sm font-semibold text-[#F87171]">Critical Issues</p>
                      <p className="text-xs text-text-tertiary">Requires immediate attention</p>
                    </div>
                    <span className="ml-auto rounded-lg bg-[#F87171]/15 px-3 py-1 text-sm font-bold text-[#F87171]">
                      2
                    </span>
                  </div>
                </div>
                <div className="p-5 space-y-3">
                  {priorityIssues
                    .filter((p) => p.badge === "Critical" || p.badge === "High Impact")
                    .map((issue) => (
                      <div
                        key={issue.title}
                        className="rounded-xl border border-l-4 bg-bg-card/60 p-4 transition-all duration-200 hover:border-zinc-700 hover:shadow-lg"
                        style={{ borderLeftColor: issue.color }}
                      >
                        <span
                          className="inline-flex rounded-lg px-2.5 py-1 text-xs font-bold uppercase tracking-wider"
                          style={{ backgroundColor: `${issue.color}18`, color: issue.color }}
                        >
                          {issue.badge}
                        </span>
                        <p className="mt-2 text-sm font-semibold text-text-primary">
                          {issue.title}
                        </p>
                        <p className="mt-1 text-sm text-text-secondary">{issue.desc}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-xs font-medium uppercase tracking-wider text-text-tertiary">
                            Effort: {issue.effort}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </ScaleIn>

            {/* Quick Wins */}
            <ScaleIn delay={0.15}>
              <div className="rounded-2xl border border-zinc-800/80 bg-gradient-to-b from-bg-card to-bg-elevated overflow-hidden">
                <div className="border-b border-zinc-800 bg-[#34D399]/5 px-6 py-4">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#34D399]/10">
                      <svg
                        width="16"
                        height="16"
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
                      <p className="text-sm font-semibold text-[#34D399]">Quick Wins</p>
                      <p className="text-xs text-text-tertiary">Low effort, high impact</p>
                    </div>
                    <span className="ml-auto rounded-lg bg-[#34D399]/15 px-3 py-1 text-sm font-bold text-[#34D399]">
                      2
                    </span>
                  </div>
                </div>
                <div className="p-5 space-y-3">
                  {priorityIssues
                    .filter((p) => p.badge === "Quick Win")
                    .map((issue) => (
                      <div
                        key={issue.title}
                        className="rounded-xl border border-l-4 bg-bg-card/60 p-4 transition-all duration-200 hover:border-zinc-700 hover:shadow-lg"
                        style={{ borderLeftColor: issue.color }}
                      >
                        <span
                          className="inline-flex rounded-lg px-2.5 py-1 text-xs font-bold uppercase tracking-wider"
                          style={{ backgroundColor: `${issue.color}18`, color: issue.color }}
                        >
                          {issue.badge}
                        </span>
                        <p className="mt-2 text-sm font-semibold text-text-primary">
                          {issue.title}
                        </p>
                        <p className="mt-1 text-sm text-text-secondary">{issue.desc}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-xs font-medium uppercase tracking-wider text-text-tertiary">
                            Effort: {issue.effort}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </ScaleIn>
          </div>
        </div>
      </section>

      {/* ─── SECTION 5: PERFORMANCE INTELLIGENCE ─── */}
      <section className="border-t border-zinc-800/60 bg-gradient-to-b from-bg-card/20 to-bg-primary py-16 sm:py-20 lg:py-24">
        <div className="mx-auto px-5 sm:px-8 lg:px-12 max-w-[1200px]">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <FadeUp>
              <span className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-brand">
                <span className="h-px w-6 bg-brand/40" />
                Performance Intelligence
                <span className="h-px w-6 bg-brand/40" />
              </span>
            </FadeUp>
            <FadeUp delay={0.1}>
              <h2 className="mt-4 text-[clamp(1.75rem,4vw,3rem)] font-bold tracking-tight text-text-primary leading-[1.05]">
                Metrics that matter
              </h2>
            </FadeUp>
          </div>

          {/* Large score bars */}
          <div className="space-y-5">
            {metrics.map((m, i) => (
              <FadeUp key={m.label} delay={i * 0.1}>
                <div className="rounded-2xl border border-zinc-800/80 bg-gradient-to-r from-bg-card to-bg-elevated p-5 sm:p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="h-3 w-3 rounded-full" style={{ backgroundColor: m.color }} />
                      <p className="text-sm font-semibold text-text-primary">{m.label}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <p
                        className="text-3xl sm:text-4xl font-bold tabular-nums tracking-tight"
                        style={{ color: m.color }}
                      >
                        {m.value}
                      </p>
                      <span
                        className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg"
                        style={{
                          backgroundColor: `${m.color}15`,
                          color: m.color,
                        }}
                      >
                        {m.status}
                      </span>
                    </div>
                  </div>
                  <div className="h-2.5 rounded-full bg-zinc-800 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: m.color }}
                      initial={{ width: 0 }}
                      whileInView={{ width: `${m.value}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.2, delay: 0.3 + i * 0.15, ease: EASE }}
                    />
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>

          {/* Performance comparison */}
          <FadeUp delay={0.5}>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-zinc-800/80 bg-bg-card/60 p-6 text-center">
                <p className="text-xs font-semibold uppercase tracking-wider text-text-tertiary">
                  Mobile
                </p>
                <p className="text-5xl sm:text-6xl font-bold text-[#FBBF24] tabular-nums mt-2">
                  58
                </p>
                <div className="mt-3 h-2 rounded-full bg-zinc-800 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-[#FBBF24]"
                    initial={{ width: 0 }}
                    whileInView={{ width: "58%" }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.8, ease: EASE }}
                  />
                </div>
                <p className="mt-2 text-sm text-text-tertiary">Needs improvement</p>
              </div>
              <div className="rounded-2xl border border-zinc-800/80 bg-bg-card/60 p-6 text-center">
                <p className="text-xs font-semibold uppercase tracking-wider text-text-tertiary">
                  Desktop
                </p>
                <p className="text-5xl sm:text-6xl font-bold text-[#34D399] tabular-nums mt-2">
                  86
                </p>
                <div className="mt-3 h-2 rounded-full bg-zinc-800 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-[#34D399]"
                    initial={{ width: 0 }}
                    whileInView={{ width: "86%" }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.9, ease: EASE }}
                  />
                </div>
                <p className="mt-2 text-sm text-text-tertiary">Good performance</p>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ─── SECTION 6: AEO/GEO READINESS ─── */}
      <section className="border-t border-zinc-800/60 py-16 sm:py-20 lg:py-24">
        <div className="mx-auto px-5 sm:px-8 lg:px-12 max-w-[1200px]">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <FadeUp>
              <span className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-brand">
                <span className="h-px w-6 bg-brand/40" />
                Future-Ready
                <span className="h-px w-6 bg-brand/40" />
              </span>
            </FadeUp>
            <FadeUp delay={0.1}>
              <h2 className="mt-4 text-[clamp(1.75rem,4vw,3rem)] font-bold tracking-tight text-text-primary leading-[1.05]">
                AEO &amp; GEO Readiness
              </h2>
            </FadeUp>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <ScaleIn>
              <div className="rounded-2xl border border-zinc-800/80 bg-gradient-to-br from-bg-card to-bg-elevated p-8 h-full flex flex-col">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-muted border border-brand/10 mb-5">
                  <span className="text-2xl font-bold text-brand">A</span>
                </div>
                <h3 className="text-xl font-semibold text-text-primary">AEO Readiness</h3>
                <div className="mt-3 flex items-center gap-3">
                  <span className="text-4xl font-bold text-brand tabular-nums">72</span>
                  <span className="text-sm font-medium px-2 py-1 rounded-lg bg-brand/10 text-brand">
                    Moderate
                  </span>
                </div>
                <p className="mt-4 text-base text-text-secondary leading-relaxed flex-1">
                  Answer Engine Optimization assesses how well your content answers direct
                  questions. Pages with clear, structured answers are more likely to appear in voice
                  search results and AI-generated summaries.
                </p>
                <div className="mt-6 h-2 rounded-full bg-zinc-800 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-brand"
                    initial={{ width: 0 }}
                    whileInView={{ width: "72%" }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, ease: EASE }}
                  />
                </div>
              </div>
            </ScaleIn>
            <ScaleIn delay={0.15}>
              <div className="rounded-2xl border border-zinc-800/80 bg-gradient-to-br from-bg-card to-bg-elevated p-8 h-full flex flex-col">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-muted border border-brand/10 mb-5">
                  <span className="text-2xl font-bold text-brand">G</span>
                </div>
                <h3 className="text-xl font-semibold text-text-primary">GEO Readiness</h3>
                <div className="mt-3 flex items-center gap-3">
                  <span className="text-4xl font-bold text-brand tabular-nums">45</span>
                  <span className="text-sm font-medium px-2 py-1 rounded-lg bg-warning/10 text-warning">
                    Needs Work
                  </span>
                </div>
                <p className="mt-4 text-base text-text-secondary leading-relaxed flex-1">
                  Generative Engine Optimization evaluates how well your page is structured for
                  AI-powered search platforms. This includes semantic HTML, clear entity signals,
                  and consistent schema markup.
                </p>
                <div className="mt-6 h-2 rounded-full bg-zinc-800 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-[#FBBF24]"
                    initial={{ width: 0 }}
                    whileInView={{ width: "45%" }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, ease: EASE }}
                  />
                </div>
              </div>
            </ScaleIn>
          </div>
          <FadeUp delay={0.3}>
            <p className="mt-8 text-center text-base text-text-tertiary max-w-xl mx-auto">
              Both scores are informational and not ranking predictors. They help you prepare for
              emerging search paradigms.
            </p>
          </FadeUp>
        </div>
      </section>

      {/* ─── SECTION 7: PRIVACY & SECURITY ─── */}
      <section className="border-t border-zinc-800/60 bg-gradient-to-b from-bg-card/20 to-bg-primary py-16 sm:py-20">
        <div className="mx-auto px-5 sm:px-8 lg:px-12 max-w-[1200px]">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <FadeUp>
              <span className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-brand">
                <span className="h-px w-6 bg-brand/40" />
                Trust
                <span className="h-px w-6 bg-brand/40" />
              </span>
            </FadeUp>
            <FadeUp delay={0.1}>
              <h2 className="mt-4 text-[clamp(1.75rem,4vw,3rem)] font-bold tracking-tight text-text-primary leading-[1.05]">
                Privacy &amp; security built in
              </h2>
            </FadeUp>
            <FadeUp delay={0.15}>
              <p className="mt-4 text-[17px] text-text-secondary leading-relaxed max-w-xl mx-auto">
                Your audit data stays private. We never store, share, or sell the URLs you submit.
              </p>
            </FadeUp>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                icon: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
                title: "No storage",
                desc: "URLs and results are never persisted. Your data stays yours.",
              },
              {
                icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
                title: "SSRF protection",
                desc: "All fetched content is checked against DNS rebinding and SSRF protections.",
              },
              {
                icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
                title: "Transparent scoring",
                desc: "Every score includes a methodology note explaining how it was calculated.",
              },
            ].map((item) => (
              <ScaleIn key={item.title}>
                <div className="rounded-2xl border border-zinc-800/80 bg-gradient-to-b from-bg-card to-bg-elevated p-6 text-center h-full transition-all duration-200 hover:border-zinc-700/80 hover:shadow-lg">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-brand-muted border border-brand/10 mb-4">
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      className="text-brand"
                      aria-hidden="true"
                    >
                      <path d={item.icon} />
                    </svg>
                  </div>
                  <p className="text-base font-semibold text-text-primary">{item.title}</p>
                  <p className="mt-2 text-base text-text-secondary">{item.desc}</p>
                </div>
              </ScaleIn>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SECTION 8: FAQ ─── */}
      <section className="border-t border-zinc-800/60 py-16 sm:py-20">
        <div className="mx-auto px-5 sm:px-8 lg:px-12 max-w-[800px]">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <FadeUp>
              <span className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-brand">
                <span className="h-px w-6 bg-brand/40" />
                Questions?
                <span className="h-px w-6 bg-brand/40" />
              </span>
            </FadeUp>
            <FadeUp delay={0.1}>
              <h2 className="mt-4 text-[clamp(1.75rem,4vw,2.5rem)] font-bold tracking-tight text-text-primary">
                Frequently asked questions
              </h2>
            </FadeUp>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <FadeUp key={faq.q} delay={i * 0.04}>
                <details className="group rounded-2xl border border-zinc-800/80 bg-gradient-to-r from-bg-card to-bg-elevated transition-all duration-200 open:border-zinc-700 hover:border-zinc-700/80 overflow-hidden">
                  <summary className="flex cursor-pointer items-center justify-between px-6 py-4 sm:py-5 text-base font-medium text-text-primary">
                    {faq.q}
                    <span className="ml-3 shrink-0 text-text-tertiary transition-transform duration-300 group-open:rotate-180">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        aria-hidden="true"
                      >
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </span>
                  </summary>
                  <div className="border-t border-zinc-800/60 px-6 pb-5 pt-3">
                    <p className="text-base text-text-secondary leading-relaxed">{faq.a}</p>
                  </div>
                </details>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SECTION 9: FINAL CTA ─── */}
      <section className="border-t border-zinc-800/60 bg-gradient-to-b from-bg-card/20 to-bg-primary py-16 sm:py-20 lg:py-24">
        <div className="mx-auto px-5 sm:px-8 lg:px-12 max-w-[900px] text-center">
          <FadeUp>
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-muted to-brand/[0.05] border border-brand/20 mb-8 shadow-lg shadow-brand/5">
              <svg
                width="36"
                height="36"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="text-brand"
                aria-hidden="true"
              >
                <path d="M12 2L2 12l10 10 10-10L12 2z" />
              </svg>
            </div>
          </FadeUp>
          <FadeUp delay={0.1}>
            <span className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-brand">
              <span className="h-px w-6 bg-brand/40" />
              Built by Nexora Creation
              <span className="h-px w-6 bg-brand/40" />
            </span>
          </FadeUp>
          <FadeUp delay={0.15}>
            <h2 className="mt-4 text-[clamp(1.75rem,4vw,3rem)] font-bold tracking-tight text-text-primary leading-[1.05]">
              Expert support when you need it
            </h2>
          </FadeUp>
          <FadeUp delay={0.2}>
            <p className="mt-4 text-[17px] text-text-secondary leading-relaxed max-w-xl mx-auto">
              We build premium digital products. This free SEO tool is our way of demonstrating what
              careful engineering and thoughtful design can achieve.
            </p>
          </FadeUp>
          <FadeUp delay={0.25}>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <a
                href="https://nexora.de"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 rounded-2xl bg-brand px-8 py-4 text-base font-semibold text-black hover:bg-[#e3b94a] transition-all duration-200 shadow-xl shadow-brand/25"
              >
                Visit Nexora Creation
                <svg
                  width="16"
                  height="16"
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
                className="inline-flex items-center gap-2.5 rounded-2xl border border-zinc-700 bg-transparent px-8 py-4 text-base font-medium text-text-primary hover:bg-bg-tertiary transition-all duration-200"
              >
                View Methodology
              </a>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800/60 py-8">
        <div className="mx-auto px-5 sm:px-8 lg:px-12 max-w-[1320px] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.svg"
              alt="Nexora Creation"
              width={120}
              height={23}
              className="h-5 w-auto"
            />
            <span className="text-sm text-text-tertiary">
              Signal Theatre &middot; Design Prototype
            </span>
          </div>
          <p className="text-sm text-text-tertiary">Built with precision by Nexora Creation</p>
        </div>
      </footer>
    </>
  );
}
