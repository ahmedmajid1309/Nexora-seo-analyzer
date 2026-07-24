"use client";

import { AuditForm } from "@/components/landing/AuditForm";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card } from "@/components/ui/Card";
import { Reveal } from "@/components/ui/AnimatedPrimitives";
import { CategoryTicker } from "@/components/landing/CategoryTicker";
import { motion } from "motion/react";

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

const differenceItems = [
  {
    icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
    title: "Evidence-based",
    desc: "Every finding is verified from the actual page response. No fabricated data, no hallucinations, no guesswork.",
  },
  {
    icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
    title: "Deterministic scoring",
    desc: "The same page always gets the same score. Your score is calculated from real checks, not black-box algorithms.",
  },
  {
    icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
    title: "No signup required",
    desc: "Enter a URL and get a full report instantly. No account creation, no email required, no paywalls.",
  },
  {
    icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",
    title: "Actionable remediation",
    desc: "Each finding includes ordered remediation steps, responsible role, effort estimate, and impact explanation.",
  },
];

const howItWorks = [
  {
    step: "1",
    title: "Enter a URL",
    desc: "Type or paste any public website address. Optionally add a target keyword for context.",
  },
  {
    step: "2",
    title: "Deterministic analysis",
    desc: "Our engine fetches the page, extracts all SEO signals, and runs hundreds of evidence-based checks.",
  },
  {
    step: "3",
    title: "Review your report",
    desc: "Get a scored report with clear remediation steps, prioritized by impact and effort.",
  },
];

const recommendations = [
  {
    badge: "Quick Win",
    badgeClass: "bg-success/10 text-success",
    effort: "Low",
    title: "Add meta descriptions to all pages",
    desc: "Improves SERP click-through rate",
  },
  {
    badge: "High Impact",
    badgeClass: "bg-warning/10 text-warning",
    effort: "Medium",
    title: "Fix missing heading hierarchy",
    desc: "Improves content structure and readability",
  },
  {
    badge: "Critical",
    badgeClass: "bg-critical/10 text-critical",
    effort: "High",
    title: "HTTPS not enforced",
    desc: "Security and trust issue",
  },
  {
    badge: "Quick Win",
    badgeClass: "bg-success/10 text-success",
    effort: "Low",
    title: "Image alt text missing",
    desc: "Improves accessibility and image search visibility",
  },
];

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
    a: "Scores are calculated from deterministic checks against the actual page content and response. We do not fabricate data or predict rankings. Confidence is reported alongside each score.",
  },
  {
    q: "What does AEO and GEO readiness mean?",
    a: "AEO (Answer Engine Optimization) assesses how well your content answers direct questions. GEO (Generative Engine Optimization) evaluates structure for AI-powered search platforms.",
  },
  {
    q: "Can I use this for client sites?",
    a: "Yes. The tool is designed to produce professional reports. Each report includes the methodology and a clear explanation of every finding.",
  },
  {
    q: "How is my URL handled?",
    a: "Your URL is fetched server-side, checked against multiple security filters, and the page content is analysed for SEO signals. Raw HTML is never exposed in the report.",
  },
];

function ChevronDown() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

function DiamondIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2L2 12l10 10 10-10L12 2z" />
    </svg>
  );
}

function ShieldCheckIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}

export default function HomePage() {
  return (
    <>
      {/* ── HERO ── */}
      <section
        className="relative overflow-hidden pt-20 pb-10 sm:pt-28 sm:pb-16 lg:pt-36 lg:pb-20"
        id="hero"
      >
        <Container>
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 items-center">
            <div className="text-center lg:text-left">
              {/* Trust badges — reduced from 4 to 3 */}
              <motion.div
                initial={{ opacity: 1, y: 0 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1, ease: EASE_OUT_EXPO }}
                className="flex flex-wrap justify-center lg:justify-start gap-2 mb-5"
              >
                <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-800 bg-bg-card/60 px-3 py-1 text-[11px] font-medium text-text-tertiary">
                  <ShieldCheckIcon />
                  Evidence-Based
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-800 bg-bg-card/60 px-3 py-1 text-[11px] font-medium text-text-tertiary">
                  <SearchIcon />
                  14 Categories
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-800 bg-bg-card/60 px-3 py-1 text-[11px] font-medium text-text-tertiary">
                  <DiamondIcon />
                  Free Forever
                </span>
              </motion.div>

              <h1 className="text-[clamp(2rem,5.5vw,4.5rem)] font-bold tracking-tight text-text-primary leading-[1.05]">
                <motion.span
                  initial={{ opacity: 1, y: 0 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2, ease: EASE_OUT_EXPO }}
                  className="block"
                >
                  The Evidence-Backed
                </motion.span>
                <motion.span
                  initial={{ opacity: 1, y: 0 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.35, ease: EASE_OUT_EXPO }}
                  className="block mt-1"
                >
                  <span className="text-brand">Verdict</span> on Your SEO
                </motion.span>
              </h1>

              <motion.p
                initial={{ opacity: 1, y: 0 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5, ease: EASE_OUT_EXPO }}
                className="mt-4 text-base sm:text-lg text-text-secondary leading-relaxed max-w-lg mx-auto lg:mx-0"
              >
                A comprehensive forensic audit of your website&apos;s technical health, performance,
                and search readiness. Every finding is verified from the actual page response.
              </motion.p>

              <motion.div
                initial={{ opacity: 1, y: 0 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6, ease: EASE_OUT_EXPO }}
                className="mt-8"
              >
                <AuditForm />
              </motion.div>

              <motion.p
                initial={{ opacity: 1 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.8, ease: EASE_OUT_EXPO }}
                className="mt-3 text-sm text-text-tertiary"
              >
                Free &middot; No signup &middot; Actionable results
              </motion.p>
            </div>

            {/* Sample Report — enlarged ~20% */}
            <motion.div
              initial={{ opacity: 1, x: 0 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5, ease: EASE_OUT_EXPO }}
              className="lg:scale-110 origin-left"
            >
              <div className="rounded-xl border border-zinc-800 bg-gradient-to-b from-bg-card to-bg-elevated overflow-hidden shadow-xl shadow-black/30">
                <div className="border-b border-zinc-800 bg-bg-elevated/80 px-4 py-2.5 sm:px-5 sm:py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-full bg-critical/60" />
                        <span className="h-2.5 w-2.5 rounded-full bg-warning/60" />
                        <span className="h-2.5 w-2.5 rounded-full bg-success/60" />
                      </div>
                      <span className="text-[10px] font-medium uppercase tracking-wider text-text-tertiary">
                        Briefing Preview
                      </span>
                    </div>
                    <span className="rounded bg-brand-muted px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand">
                      Demo data
                    </span>
                  </div>
                </div>
                <div className="space-y-4 p-4 sm:p-5">
                  <div className="rounded-lg border border-brand/20 bg-brand/5 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <DiamondIcon />
                      <p className="text-xs font-semibold text-brand uppercase tracking-wider">
                        Executive Verdict
                      </p>
                    </div>
                    <p className="mt-1 text-sm text-text-secondary">
                      Your site has moderate SEO health with strong performance but critical
                      accessibility gaps requiring attention.
                    </p>
                  </div>

                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-medium text-text-tertiary uppercase tracking-wider">
                        SEO Health Score
                      </p>
                      <p className="text-3xl sm:text-4xl font-bold text-brand tabular-nums">78</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-medium text-text-tertiary uppercase tracking-wider">
                        Status
                      </p>
                      <p className="text-sm text-text-secondary">
                        18 passed &middot; 4 warnings &middot; 2 failed
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="rounded-lg border border-zinc-800 bg-bg-card/60 p-3">
                      <p className="text-[10px] text-text-tertiary uppercase tracking-wider">
                        Performance
                      </p>
                      <p className="text-xl font-bold text-success tabular-nums">92</p>
                    </div>
                    <div className="rounded-lg border border-zinc-800 bg-bg-card/60 p-3">
                      <p className="text-[10px] text-text-tertiary uppercase tracking-wider">
                        Accessibility
                      </p>
                      <p className="text-xl font-bold text-warning tabular-nums">65</p>
                    </div>
                    <div className="rounded-lg border border-zinc-800 bg-bg-card/60 p-3">
                      <p className="text-[10px] text-text-tertiary uppercase tracking-wider">
                        Security
                      </p>
                      <p className="text-xl font-bold text-critical tabular-nums">42</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <div className="rounded-lg border border-l-4 border-l-critical border-zinc-800 bg-bg-card/60 p-3">
                      <span className="rounded bg-critical/15 px-1.5 py-0.5 text-[10px] font-medium uppercase text-critical">
                        Critical
                      </span>
                      <p className="mt-1.5 text-sm font-medium text-text-primary">
                        Missing meta description
                      </p>
                      <p className="mt-0.5 text-xs text-text-tertiary">
                        Impact: Poor SERP visibility &middot; Effort: Low
                      </p>
                    </div>
                    <div className="rounded-lg border border-l-4 border-l-success border-zinc-800 bg-bg-card/60 p-3">
                      <span className="rounded bg-success/15 px-1.5 py-0.5 text-[10px] font-medium uppercase text-success">
                        Quick Win
                      </span>
                      <p className="mt-1.5 text-sm font-medium text-text-primary">
                        Image alt text missing
                      </p>
                      <p className="mt-0.5 text-xs text-text-tertiary">
                        Impact: Accessibility &middot; Effort: Low
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </Container>
      </section>

      {/* ── Category Ticker ── */}
      <CategoryTicker />

      {/* ── Asymmetric evidence section ── */}
      <section className="border-t border-zinc-800 py-16 sm:py-20" id="features">
        <Container>
          <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-5 lg:gap-12 items-center">
            <div className="lg:col-span-3">
              <Reveal>
                <SectionHeading>14 categories. Hundreds of checks.</SectionHeading>
              </Reveal>
              <Reveal delay={0.1}>
                <p className="mt-4 text-text-secondary leading-relaxed">
                  From technical infrastructure to emerging search readiness — every check is
                  deterministic, evidence-based, and fully transparent. No black boxes, no AI
                  hallucinations, just real data from your actual page response.
                </p>
              </Reveal>
              <Reveal delay={0.2}>
                <ul className="mt-6 space-y-3">
                  {[
                    "On-page SEO — titles, meta, headings, content",
                    "Technical SEO — canonical, robots, sitemaps, redirects",
                    "Performance — PageSpeed, Core Web Vitals, opportunities",
                    "Accessibility — alt text, ARIA, contrast, landmarks",
                    "Security & Trust — HTTPS, certificates, safe browsing",
                    "AEO & GEO — answer engine and generative engine readiness",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm text-text-secondary">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="mt-0.5 shrink-0 text-brand"
                        aria-hidden="true"
                      >
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </Reveal>
            </div>
            <div className="lg:col-span-2">
              <Reveal delay={0.3}>
                <div className="rounded-xl border border-zinc-800 bg-bg-card p-6 text-center">
                  <p className="text-5xl font-bold text-brand tabular-nums">85+</p>
                  <p className="mt-1 text-sm text-text-secondary">Evidence-based checks</p>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-left">
                    <div>
                      <p className="text-lg font-bold text-success tabular-nums">14</p>
                      <p className="text-xs text-text-tertiary">Categories</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-warning tabular-nums">5</p>
                      <p className="text-xs text-text-tertiary">Score caps</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </Container>
      </section>

      {/* ── Full-width report demonstration ── */}
      <section className="border-t border-zinc-800 bg-bg-card/50 py-16 sm:py-20" id="demo">
        <Container>
          <Reveal>
            <SectionHeading className="text-center">What you get in every report</SectionHeading>
          </Reveal>
          <Reveal delay={0.1} className="mx-auto mt-8 max-w-5xl">
            <Card className="overflow-hidden p-0 shadow-xl shadow-black/20">
              <div className="border-b border-zinc-800 bg-bg-elevated px-5 py-3 sm:px-6">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-critical/60" />
                    <span className="h-2.5 w-2.5 rounded-full bg-warning/60" />
                    <span className="h-2.5 w-2.5 rounded-full bg-success/60" />
                  </div>
                  <span className="ml-2 text-[10px] font-medium uppercase tracking-wider text-text-tertiary">
                    Sample &mdash; Example Report
                  </span>
                </div>
              </div>
              <div className="space-y-5 p-5 sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-medium text-text-tertiary uppercase tracking-wider">
                      SEO Health Score
                    </p>
                    <p className="text-4xl font-bold text-brand tabular-nums">78</p>
                  </div>
                  <div className="sm:text-right">
                    <p className="text-xs font-medium text-text-tertiary uppercase tracking-wider">
                      Status
                    </p>
                    <p className="text-sm text-text-secondary">
                      18 checks passed, 4 warnings, 2 failed
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="rounded-lg border border-zinc-800 bg-bg-card p-4">
                    <p className="text-xs text-text-tertiary uppercase tracking-wider">
                      Performance
                    </p>
                    <p className="text-2xl font-bold text-success tabular-nums">92</p>
                    <p className="mt-0.5 text-[10px] text-text-tertiary">Excellent</p>
                  </div>
                  <div className="rounded-lg border border-zinc-800 bg-bg-card p-4">
                    <p className="text-xs text-text-tertiary uppercase tracking-wider">
                      Accessibility
                    </p>
                    <p className="text-2xl font-bold text-warning tabular-nums">65</p>
                    <p className="mt-0.5 text-[10px] text-text-tertiary">Needs Work</p>
                  </div>
                  <div className="rounded-lg border border-zinc-800 bg-bg-card p-4">
                    <p className="text-xs text-text-tertiary uppercase tracking-wider">Security</p>
                    <p className="text-2xl font-bold text-critical tabular-nums">42</p>
                    <p className="mt-0.5 text-[10px] text-text-tertiary">Poor</p>
                  </div>
                </div>
              </div>
            </Card>
          </Reveal>
        </Container>
      </section>

      {/* ── Timeline / Step sequence ── */}
      <section className="border-t border-zinc-800 py-16 sm:py-20" id="how-it-works">
        <Container>
          <Reveal>
            <SectionHeading className="text-center">How the audit works</SectionHeading>
          </Reveal>
          <div className="mx-auto mt-8 max-w-4xl">
            <div className="hidden sm:grid sm:grid-cols-3 sm:gap-0 sm:relative">
              <div className="absolute left-0 right-0 top-8 h-0.5 bg-zinc-800" />
              {howItWorks.map((item, i) => (
                <Reveal
                  key={item.step}
                  delay={i * 0.15}
                  className="relative flex flex-col items-center text-center px-4"
                >
                  <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full bg-brand-muted text-xl font-bold text-brand border-2 border-brand-muted">
                    {item.step}
                  </div>
                  <h3 className="mt-5 font-semibold text-text-primary">{item.title}</h3>
                  <p className="mt-2 text-sm text-text-secondary">{item.desc}</p>
                </Reveal>
              ))}
            </div>
            <div className="sm:hidden space-y-6">
              {howItWorks.map((item, i) => (
                <Reveal key={item.step} delay={i * 0.15}>
                  <div className="flex gap-4 items-start">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-muted text-base font-bold text-brand">
                      {item.step}
                    </div>
                    <div className="min-w-0 pt-1">
                      <h3 className="font-semibold text-text-primary">{item.title}</h3>
                      <p className="mt-1 text-sm text-text-secondary">{item.desc}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* ── Why different (asymmetric grid) ── */}
      <section className="border-t border-zinc-800 bg-bg-card/50 py-16 sm:py-20" id="why">
        <Container>
          <Reveal>
            <SectionHeading className="text-center">Why this audit is different</SectionHeading>
          </Reveal>
          <div className="mx-auto mt-8 grid max-w-5xl gap-4 sm:grid-cols-2">
            {differenceItems.map((item, i) => (
              <Reveal key={item.title} delay={i * 0.08}>
                <Card className="h-full" hover>
                  <div className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-muted">
                      <svg
                        width="20"
                        height="20"
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
                    <div className="min-w-0">
                      <h3 className="font-semibold text-text-primary">{item.title}</h3>
                      <p className="mt-1.5 text-sm text-text-secondary">{item.desc}</p>
                    </div>
                  </div>
                </Card>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* ── Split methodology + recommendations board ── */}
      <section className="border-t border-zinc-800 py-16 sm:py-20" id="methodology">
        <Container>
          <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-2 lg:gap-12">
            <div>
              <Reveal>
                <SectionHeading>Accuracy &amp; methodology</SectionHeading>
              </Reveal>
              <Reveal delay={0.1}>
                <p className="mt-4 text-text-secondary leading-relaxed">
                  Our audits use deterministic, open checks that verify each finding from the actual
                  page content or response. We never fabricate data, hallucinate issues, or predict
                  search rankings. Every result includes a transparency note explaining how the
                  score was calculated.
                </p>
              </Reveal>
              <Reveal delay={0.2}>
                <a
                  href="/methodology"
                  className="mt-4 inline-flex items-center gap-1.5 text-brand hover:text-brand-hover underline font-medium"
                >
                  Read full methodology
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </a>
              </Reveal>
            </div>
            <div>
              <Reveal delay={0.15}>
                <SectionHeading>Prioritized recommendations</SectionHeading>
              </Reveal>
              <div className="mt-4 space-y-2">
                {recommendations.map((r) => (
                  <Reveal key={r.title} delay={0.1}>
                    <Card hover>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`rounded px-1.5 py-0.5 text-[10px] font-medium uppercase ${r.badgeClass}`}
                        >
                          {r.badge}
                        </span>
                        <span className="text-xs text-text-tertiary">Effort: {r.effort}</span>
                      </div>
                      <p className="mt-1.5 text-sm font-medium text-text-primary">{r.title}</p>
                      <p className="mt-0.5 text-xs text-text-secondary">{r.desc}</p>
                    </Card>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ── AEO/GEO ── */}
      <section className="border-t border-zinc-800 bg-bg-card/50 py-16 sm:py-20" id="aeo-geo">
        <Container>
          <Reveal>
            <SectionHeading className="text-center">
              AEO &amp; GEO readiness explained
            </SectionHeading>
          </Reveal>
          <div className="mx-auto mt-8 grid max-w-4xl gap-6 sm:grid-cols-2">
            <Reveal delay={0.1}>
              <Card className="h-full" hover>
                <h3 className="font-semibold text-text-primary">
                  <span className="text-brand mr-2">A</span>AEO Readiness
                </h3>
                <p className="mt-2 text-sm text-text-secondary leading-relaxed">
                  Answer Engine Optimization assesses how well your content answers direct
                  questions. Pages with clear, structured answers are more likely to appear in voice
                  search results and AI-generated summaries.
                </p>
              </Card>
            </Reveal>
            <Reveal delay={0.2}>
              <Card className="h-full" hover>
                <h3 className="font-semibold text-text-primary">
                  <span className="text-brand mr-2">G</span>GEO Readiness
                </h3>
                <p className="mt-2 text-sm text-text-secondary leading-relaxed">
                  Generative Engine Optimization evaluates how well your page is structured for
                  AI-powered search platforms. This includes semantic HTML, clear entity signals,
                  and consistent schema markup.
                </p>
              </Card>
            </Reveal>
          </div>
          <Reveal delay={0.3}>
            <p className="mx-auto mt-6 max-w-xl text-center text-sm text-text-tertiary">
              Both scores are informational and not ranking predictors. They help you prepare for
              emerging search paradigms.
            </p>
          </Reveal>
        </Container>
      </section>

      {/* ── Calmer privacy section ── */}
      <section className="border-t border-zinc-800 py-16 sm:py-20" id="privacy">
        <Container>
          <div className="mx-auto max-w-3xl">
            <Reveal>
              <SectionHeading className="text-center">Privacy &amp; security</SectionHeading>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-4 text-text-secondary leading-relaxed text-center">
                Your audit data stays private. We never store, share, or sell the URLs you submit.
                Results are delivered directly to your browser with no server-side persistence.
              </p>
            </Reveal>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                {
                  title: "No storage",
                  desc: "URLs and results are never persisted. Your data stays yours.",
                },
                {
                  title: "SSRF protection",
                  desc: "All fetched content is checked against DNS rebinding and SSRF protections.",
                },
                {
                  title: "Transparent scoring",
                  desc: "Every score includes a methodology note explaining how it was calculated.",
                },
              ].map((item) => (
                <Reveal key={item.title} delay={0.1}>
                  <div className="rounded-lg border border-zinc-800 bg-bg-card p-4 text-center">
                    <p className="text-sm font-medium text-text-primary">{item.title}</p>
                    <p className="mt-1 text-xs text-text-tertiary">{item.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
            <Reveal delay={0.2}>
              <p className="mt-6 text-center">
                <a
                  href="/privacy"
                  className="text-brand hover:text-brand-hover underline font-medium"
                >
                  Read privacy policy
                </a>
              </p>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* ── Stronger branded closing CTA ── */}
      <section className="border-t border-zinc-800 py-16 sm:py-24" id="about">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <Reveal>
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-muted mb-6">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="text-brand"
                  aria-hidden="true"
                >
                  <path d="M12 2L2 12l10 10 10-10L12 2z" />
                </svg>
              </div>
              <SectionHeading>Built by Nexora Creation</SectionHeading>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-4 text-text-secondary leading-relaxed">
                We build premium digital products. This free SEO tool is our way of demonstrating
                what careful engineering and thoughtful design can achieve.
              </p>
            </Reveal>
            <Reveal delay={0.2}>
              <a
                href="https://nexora.de"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex items-center gap-2 rounded-lg bg-brand px-6 py-3 text-sm font-medium text-black hover:bg-brand-hover transition-colors"
              >
                Visit Nexora Creation
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path d="M7 17l9.2-9.2M17 17V7H7" />
                </svg>
              </a>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* ── FAQ ── */}
      <section className="border-t border-zinc-800 bg-bg-card/50 py-16 sm:py-20" id="faq">
        <Container>
          <Reveal>
            <SectionHeading className="text-center">Frequently asked questions</SectionHeading>
          </Reveal>
          <div className="mx-auto mt-8 max-w-3xl space-y-2">
            {faqs.map((faq, i) => (
              <Reveal key={faq.q} delay={i * 0.05}>
                <details className="group rounded-lg border border-zinc-800 bg-bg-card transition-colors open:border-zinc-600 hover:border-zinc-700">
                  <summary className="flex cursor-pointer items-center justify-between px-4 py-3.5 text-sm font-medium text-text-primary">
                    {faq.q}
                    <span className="ml-2 shrink-0 text-text-tertiary transition-transform duration-200 group-open:rotate-180">
                      <ChevronDown />
                    </span>
                  </summary>
                  <div className="border-t border-zinc-800 px-4 pb-3.5 pt-2.5">
                    <p className="text-sm text-text-secondary leading-relaxed">{faq.a}</p>
                  </div>
                </details>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* ── Footer CTA ── */}
      <section className="border-t border-zinc-800 py-16 sm:py-20" id="cta">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <Reveal>
              <p className="text-xl font-semibold text-text-primary">
                Need help fixing these issues?
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-3 text-text-secondary leading-relaxed">
                Nexora Creation provides hands-on SEO technical services. Let us help you implement
                the improvements your site needs.
              </p>
            </Reveal>
            <Reveal delay={0.2}>
              <a
                href="https://nexora.de"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center gap-2 rounded-lg border border-zinc-700 px-6 py-3 text-sm font-medium text-text-primary hover:bg-bg-hover transition-colors"
              >
                Talk to Nexora Creation
              </a>
            </Reveal>
          </div>
        </Container>
      </section>
    </>
  );
}
