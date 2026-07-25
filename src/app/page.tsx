"use client";

import { AuditForm } from "@/components/landing/AuditForm";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card } from "@/components/ui/Card";
import { Reveal, StaggerGroup, StaggerItem, ScaleIn } from "@/components/ui/AnimatedPrimitives";
import { CategoryTicker } from "@/components/landing/CategoryTicker";
import { motion } from "motion/react";

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

const priorityCards = [
  {
    badge: "Critical",
    badgeClass: "bg-critical/15 text-critical border-l-critical",
    title: "HTTPS not enforced",
    desc: "Security and trust issue affecting user confidence and search ranking.",
    effort: "High",
  },
  {
    badge: "High Impact",
    badgeClass: "bg-warning/15 text-warning border-l-warning",
    title: "Missing heading hierarchy",
    desc: "Improves content structure, readability, and SEO signal distribution.",
    effort: "Medium",
  },
  {
    badge: "Quick Win",
    badgeClass: "bg-success/15 text-success border-l-success",
    title: "Add meta descriptions",
    desc: "Improves SERP click-through rate with minimal development effort.",
    effort: "Low",
  },
  {
    badge: "Quick Win",
    badgeClass: "bg-success/15 text-success border-l-success",
    title: "Image alt text missing",
    desc: "Improves accessibility and image search visibility for all users.",
    effort: "Low",
  },
];

const metricsData = [
  { label: "Performance", value: 92, color: "text-success", barColor: "bg-success" },
  { label: "SEO Health", value: 78, color: "text-brand", barColor: "bg-brand" },
  { label: "Accessibility", value: 65, color: "text-warning", barColor: "bg-warning" },
  { label: "Security", value: 42, color: "text-critical", barColor: "bg-critical" },
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
    a: "Scores are calculated from deterministic checks against the actual page content and response. We do not fabricate data or predict rankings.",
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
    a: "Your URL is fetched server-side, checked against multiple security filters, and the page content is analysed for SEO signals.",
  },
];

export default function HomePage() {
  return (
    <>
      {/* ── SECTION 1: HERO ── */}
      <section
        className="relative overflow-hidden pt-28 pb-12 sm:pt-36 sm:pb-20 lg:pt-44 lg:pb-28"
        id="hero"
      >
        {/* Background accents */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute -top-48 -left-48 h-[600px] w-[600px] rounded-full bg-brand/[0.03] blur-[160px]" />
          <div className="absolute -bottom-48 -right-48 h-[500px] w-[500px] rounded-full bg-brand/[0.02] blur-[140px]" />
        </div>

        <Container>
          <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:gap-16 items-center">
            {/* Left: Copy + Form */}
            <div>
              <StaggerGroup>
                <StaggerItem>
                  <div className="flex items-center gap-3 mb-6">
                    <span className="relative inline-flex h-2.5 w-2.5">
                      <span className="absolute inset-0 rounded-full bg-brand animate-ping opacity-30" />
                      <span className="relative inline-block h-2.5 w-2.5 rounded-full bg-brand" />
                    </span>
                    <span className="text-sm font-semibold uppercase tracking-[0.15em] text-brand">
                      Evidence-Based SEO Audit
                    </span>
                  </div>
                </StaggerItem>

                <StaggerItem>
                  <h1 className="text-[clamp(2.5rem,6vw,4.5rem)] font-bold tracking-tight text-text-primary leading-[1.02]">
                    <span className="block">The Evidence-Backed</span>
                    <span className="block mt-2">
                      <span className="text-brand">Verdict</span> on Your SEO
                    </span>
                  </h1>
                </StaggerItem>

                <StaggerItem>
                  <p className="mt-5 text-[17px] sm:text-[18px] text-text-secondary leading-relaxed max-w-lg">
                    A comprehensive forensic audit of your website&apos;s technical health,
                    performance, and search readiness. Every finding is verified from the actual
                    page response.
                  </p>
                </StaggerItem>

                <StaggerItem>
                  <div className="mt-8 max-w-lg">
                    <AuditForm />
                  </div>
                </StaggerItem>

                <StaggerItem>
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
                        <path d="M9 12l2 2 4-4" />
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
                      10 audit categories
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
                      Results typically arrive in seconds
                    </span>
                  </div>
                </StaggerItem>
              </StaggerGroup>
            </div>

            {/* Right: Example Report Preview */}
            <ScaleIn delay={0.3}>
              <div className="relative">
                <div
                  className="absolute -inset-6 rounded-3xl bg-brand/[0.02] blur-3xl"
                  aria-hidden="true"
                />
                <div className="relative rounded-2xl border border-zinc-700/50 bg-gradient-to-b from-bg-card/90 to-bg-elevated/60 overflow-hidden shadow-2xl shadow-black/40">
                  {/* Preview header */}
                  <div className="border-b border-zinc-800 bg-bg-elevated/80 px-5 py-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-full bg-critical/60" />
                        <span className="h-2.5 w-2.5 rounded-full bg-warning/60" />
                        <span className="h-2.5 w-2.5 rounded-full bg-success/60" />
                      </div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-text-tertiary">
                        Audit Report Preview
                      </span>
                    </div>
                    <span className="rounded-lg bg-brand-muted px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand border border-brand/20">
                      Example
                    </span>
                  </div>

                  {/* Preview body */}
                  <div className="space-y-5 p-5 sm:p-6">
                    {/* Verdict banner */}
                    <div className="rounded-xl border border-brand/20 bg-gradient-to-br from-brand/[0.06] to-transparent px-5 py-4">
                      <div className="flex items-center gap-2.5 mb-2">
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="text-brand"
                          aria-hidden="true"
                        >
                          <path d="M12 2L2 12l10 10 10-10L12 2z" />
                        </svg>
                        <p className="text-sm font-semibold text-brand uppercase tracking-wider">
                          Executive Verdict
                        </p>
                      </div>
                      <p className="text-base text-text-secondary leading-relaxed">
                        Your site has moderate SEO health with strong performance but critical
                        accessibility gaps requiring attention.
                      </p>
                    </div>

                    {/* Score row */}
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wider text-text-tertiary">
                          SEO Health Score
                        </p>
                        <p className="text-4xl sm:text-5xl font-bold text-brand tabular-nums tracking-tight">
                          78
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs font-medium uppercase tracking-wider text-text-tertiary">
                          Status
                        </p>
                        <p className="text-sm text-text-secondary">
                          18 passed &middot; 4 warnings &middot; 2 failed
                        </p>
                      </div>
                    </div>

                    {/* Mini score grid */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="rounded-xl border border-zinc-800 bg-bg-card/60 p-4">
                        <p className="text-[13px] text-text-tertiary uppercase tracking-wider">
                          Performance
                        </p>
                        <p className="text-2xl font-bold text-success tabular-nums">92</p>
                      </div>
                      <div className="rounded-xl border border-zinc-800 bg-bg-card/60 p-4">
                        <p className="text-[13px] text-text-tertiary uppercase tracking-wider">
                          Accessibility
                        </p>
                        <p className="text-2xl font-bold text-warning tabular-nums">65</p>
                      </div>
                      <div className="rounded-xl border border-zinc-800 bg-bg-card/60 p-4">
                        <p className="text-[13px] text-text-tertiary uppercase tracking-wider">
                          Security
                        </p>
                        <p className="text-2xl font-bold text-critical tabular-nums">42</p>
                      </div>
                    </div>

                    {/* Findings */}
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div className="rounded-xl border border-l-4 border-l-critical border-zinc-800 bg-bg-card/60 p-4">
                        <span className="rounded-md bg-critical/15 px-2.5 py-1 text-[13px] font-semibold uppercase text-critical">
                          Critical
                        </span>
                        <p className="mt-2 text-sm font-semibold text-text-primary">
                          Missing meta description
                        </p>
                        <p className="mt-1 text-[13px] text-text-tertiary">
                          Impact: Poor SERP visibility &middot; Effort: Low
                        </p>
                      </div>
                      <div className="rounded-xl border border-l-4 border-l-success border-zinc-800 bg-bg-card/60 p-4">
                        <span className="rounded-md bg-success/15 px-2.5 py-1 text-[13px] font-semibold uppercase text-success">
                          Quick Win
                        </span>
                        <p className="mt-2 text-sm font-semibold text-text-primary">
                          Image alt text missing
                        </p>
                        <p className="mt-1 text-[13px] text-text-tertiary">
                          Impact: Accessibility &middot; Effort: Low
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ScaleIn>
          </div>
        </Container>
      </section>

      {/* ── SECTION 1b: CATEGORY TICKER ── */}
      <CategoryTicker />

      {/* ── SECTION 2: UNIFIED SEO SIGNAL MAP ── */}
      <section
        className="border-t border-zinc-800/60 py-20 sm:py-28 overflow-hidden"
        id="signal-map"
      >
        <Container>
          <div className="text-center max-w-3xl mx-auto">
            <Reveal>
              <span className="inline-block text-xs font-semibold uppercase tracking-[0.15em] text-brand mb-4">
                360° diagnosis
              </span>
            </Reveal>
            <Reveal delay={0.1}>
              <SectionHeading>Every signal, one unified verdict</SectionHeading>
            </Reveal>
            <Reveal delay={0.15}>
              <p className="mt-5 text-[17px] text-text-secondary leading-relaxed">
                Multiple website signals combine into one verified audit report. Each category is
                checked against real page data — not guesswork.
              </p>
            </Reveal>
          </div>

          <div className="relative mt-16">
            {/* Desktop connector bar */}
            <div
              className="hidden lg:block absolute top-1/2 left-0 right-[380px] h-px bg-gradient-to-r from-zinc-800 via-brand/10 to-transparent -translate-y-1/2"
              aria-hidden="true"
            />

            <div className="grid gap-10 lg:grid-cols-[1fr_360px] lg:gap-16 items-start">
              {/* Signal groups */}
              <StaggerGroup>
                {[
                  { name: "Metadata", desc: "Titles, descriptions, social tags", dot: "bg-brand" },
                  { name: "Headings", desc: "Structure and hierarchy", dot: "bg-success" },
                  { name: "Content", desc: "Quality, relevance, and structure", dot: "bg-brand" },
                  { name: "Links", desc: "Internal and external integrity", dot: "bg-success" },
                  {
                    name: "Images",
                    desc: "Alt text, formats, and optimization",
                    dot: "bg-blue-400",
                  },
                  {
                    name: "Structured Data",
                    desc: "Schema, JSON-LD, validation",
                    dot: "bg-blue-400",
                  },
                  { name: "Social", desc: "Open Graph, Twitter Cards, meta", dot: "bg-brand" },
                  { name: "Accessibility", desc: "ARIA, contrast, landmarks", dot: "bg-warning" },
                  { name: "URL", desc: "Canonical, redirects, sitemaps", dot: "bg-critical" },
                  { name: "Forms", desc: "Labels, actions, security", dot: "bg-success" },
                ].map((s) => (
                  <StaggerItem key={s.name}>
                    <div className="flex items-start gap-3.5 py-2">
                      <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${s.dot}`} />
                      <div className="min-w-0">
                        <p className="text-[15px] font-semibold text-text-primary">{s.name}</p>
                        <p className="mt-0.5 text-[15px] text-text-tertiary">{s.desc}</p>
                      </div>
                    </div>
                  </StaggerItem>
                ))}
              </StaggerGroup>

              {/* Central verdict panel */}
              <ScaleIn delay={0.3}>
                <div className="relative">
                  <div
                    className="absolute -inset-6 rounded-3xl bg-brand/[0.02] blur-3xl"
                    aria-hidden="true"
                  />
                  <div className="relative rounded-2xl border border-brand/20 bg-gradient-to-b from-bg-card to-bg-elevated p-7 shadow-2xl shadow-brand/5">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-muted border border-brand/20">
                      <svg
                        width="28"
                        height="28"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        className="text-brand"
                        aria-hidden="true"
                      >
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        <path d="M9 12l2 2 4-4" />
                      </svg>
                    </div>
                    <p className="mt-5 text-xl font-bold text-brand text-center">Verified Audit</p>
                    <p className="mt-1 text-[15px] text-text-tertiary text-center">
                      10 audit categories
                    </p>
                    <div className="mt-6 space-y-3">
                      <div className="flex items-center justify-between text-[15px]">
                        <span className="text-text-tertiary">Checks executed</span>
                        <span className="text-text-primary font-semibold tabular-nums">85+</span>
                      </div>
                      <div className="h-px bg-zinc-800" />
                      <div className="flex items-center justify-between text-[15px]">
                        <span className="text-text-tertiary">Categories</span>
                        <span className="text-text-primary font-semibold tabular-nums">10</span>
                      </div>
                      <div className="h-px bg-zinc-800" />
                      <div className="flex items-center justify-between text-[15px]">
                        <span className="text-text-tertiary">Analysis</span>
                        <span className="text-text-primary font-semibold tabular-nums">Live</span>
                      </div>
                    </div>
                    <div className="mt-6 flex items-center justify-center gap-2 text-[14px] text-text-tertiary">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="text-success"
                        aria-hidden="true"
                      >
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <path d="M22 4L12 14.01l-3-3" />
                      </svg>
                      Core SEO checks are deterministic
                    </div>
                  </div>
                </div>
              </ScaleIn>
            </div>
          </div>
        </Container>
      </section>

      {/* ── SECTION 3: EVIDENCE ENGINE ── */}
      <section
        className="border-t border-zinc-800/60 bg-gradient-to-b from-bg-card/30 to-bg-primary py-20 sm:py-28"
        id="evidence"
      >
        <Container>
          <div className="text-center max-w-3xl mx-auto">
            <Reveal>
              <span className="inline-block text-xs font-semibold uppercase tracking-[0.15em] text-brand mb-4">
                How it works
              </span>
            </Reveal>
            <Reveal delay={0.1}>
              <SectionHeading>The evidence engine behind every audit</SectionHeading>
            </Reveal>
            <Reveal delay={0.15}>
              <p className="mt-5 text-[17px] text-text-secondary leading-relaxed">
                Every report is built from real page data, verified through our deterministic
                analysis pipeline. No guesswork, no AI hallucinations.
              </p>
            </Reveal>
          </div>
          <div className="mx-auto mt-14 grid max-w-5xl gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: "M21 21l-5.2-5.2",
                title: "Fetch",
                desc: "Server-side proxy fetch with security validation",
              },
              {
                icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
                title: "Extract",
                desc: "Parse across 14 SEO dimensions simultaneously",
              },
              {
                icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
                title: "Verify",
                desc: "Run hundreds of deterministic checks against real data",
              },
              {
                icon: "M13 10V3L4 14h7v7l9-11h-7z",
                title: "Score",
                desc: "Weighted scoring with transparent methodology",
              },
            ].map((item, i) => (
              <Reveal key={item.title} delay={0.1 * i}>
                <Card hover className="text-center h-full">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-muted border border-brand/10">
                    <svg
                      width="24"
                      height="24"
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
                  <h3 className="mt-5 text-lg font-semibold text-text-primary">{item.title}</h3>
                  <p className="mt-2 text-sm text-text-secondary">{item.desc}</p>
                </Card>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* ── SECTION 4: AUDIT LIFECYCLE ── */}
      <section
        className="border-t border-zinc-800/60 bg-gradient-to-b from-bg-card/30 to-bg-primary py-20 sm:py-28"
        id="lifecycle"
      >
        <Container>
          <div className="text-center max-w-3xl mx-auto">
            <Reveal>
              <span className="inline-block text-xs font-semibold uppercase tracking-[0.15em] text-brand mb-4">
                The process
              </span>
            </Reveal>
            <Reveal delay={0.1}>
              <SectionHeading>How your audit comes together</SectionHeading>
            </Reveal>
            <Reveal delay={0.15}>
              <p className="mt-5 text-[17px] text-text-secondary leading-relaxed">
                From secure URL validation to a prioritized report, every stage is visible and
                evidence-led.
              </p>
            </Reveal>
          </div>

          <div className="mt-16">
            <div className="hidden xl:block">
              <div className="relative mx-auto max-w-7xl px-2 pb-2 pt-3">
                <div
                  className="absolute left-[7%] right-[7%] top-[39px] h-1 rounded-full bg-zinc-800"
                  aria-hidden="true"
                />
                <motion.div
                  className="absolute left-[7%] right-[7%] top-[39px] h-1 origin-left rounded-full bg-brand shadow-[0_0_24px_rgba(254,199,0,0.28)] motion-safe:scale-x-0 motion-reduce:scale-x-100"
                  aria-hidden="true"
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true, margin: "-120px" }}
                  transition={{ duration: 1.4, ease: EASE_OUT_EXPO }}
                />

                <div className="grid grid-cols-6 gap-5">
                  {[
                    {
                      step: "01",
                      title: "Secure & Validate",
                      desc: "Validate the URL, DNS destination, redirects, TLS, response type and request bounds.",
                      status: "Protected intake",
                    },
                    {
                      step: "02",
                      title: "Fetch & Extract",
                      desc: "Fetch the page securely and extract signals across 10 audit categories.",
                      status: "Signal capture",
                    },
                    {
                      step: "03",
                      title: "Run Verified Checks",
                      desc: "Evaluate extracted signals through 85+ evidence-based SEO checks.",
                      status: "Rule engine",
                    },
                    {
                      step: "04",
                      title: "Calculate Scores",
                      desc: "Calculate category scores, confidence and applicable score caps.",
                      status: "Score model",
                    },
                    {
                      step: "05",
                      title: "Request Performance Data",
                      desc: "Request optional PageSpeed diagnostics without blocking the core SEO audit.",
                      status: "Optional enrich",
                    },
                    {
                      step: "06",
                      title: "Assemble Your Report",
                      desc: "Organize critical issues, quick wins, evidence and remediation into one prioritized report.",
                      status: "Report Ready",
                      final: true,
                    },
                  ].map((stage, i) => (
                    <Reveal key={stage.step} delay={i * 0.08}>
                      <div className="relative flex h-full flex-col items-center text-center">
                        <motion.div
                          className={`relative z-10 flex h-[56px] w-[56px] items-center justify-center rounded-full border text-base font-bold ${
                            stage.final
                              ? "border-brand bg-brand text-black shadow-[0_0_34px_rgba(254,199,0,0.38)]"
                              : "border-brand/30 bg-bg-elevated text-brand shadow-lg shadow-brand/10"
                          }`}
                          initial={{ scale: 0.92 }}
                          whileInView={{ scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.35, delay: i * 0.04, ease: EASE_OUT_EXPO }}
                        >
                          {stage.step}
                        </motion.div>
                        <span
                          className={`mt-5 rounded-full border px-3 py-1 text-[13px] font-semibold uppercase tracking-[0.14em] ${
                            stage.final
                              ? "border-brand/35 bg-brand/10 text-brand"
                              : "border-zinc-800 bg-bg-card text-text-secondary"
                          }`}
                        >
                          {stage.status}
                        </span>
                        <h3 className="mt-3 text-base font-bold leading-snug text-text-primary">
                          {stage.title}
                        </h3>
                        <p className="mt-2 text-base leading-relaxed text-text-secondary">
                          {stage.desc}
                        </p>
                      </div>
                    </Reveal>
                  ))}
                </div>
              </div>
            </div>

            <div className="hidden md:block xl:hidden">
              <div className="relative mx-auto max-w-5xl px-2 py-3">
                <div
                  className="absolute left-[12%] right-[12%] top-[39px] h-1 rounded-full bg-zinc-800"
                  aria-hidden="true"
                />
                <motion.div
                  className="absolute left-[12%] right-[12%] top-[39px] h-1 origin-left rounded-full bg-brand shadow-[0_0_22px_rgba(254,199,0,0.24)] motion-safe:scale-x-0 motion-reduce:scale-x-100"
                  aria-hidden="true"
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.95, ease: EASE_OUT_EXPO }}
                />
                <div
                  className="absolute right-[12%] top-[39px] h-[238px] w-1 rounded-full bg-zinc-800"
                  aria-hidden="true"
                />
                <motion.div
                  className="absolute right-[12%] top-[39px] h-[238px] w-1 origin-top rounded-full bg-brand shadow-[0_0_22px_rgba(254,199,0,0.22)] motion-safe:scale-y-0 motion-reduce:scale-y-100"
                  aria-hidden="true"
                  whileInView={{ scaleY: 1 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.55, delay: 0.75, ease: EASE_OUT_EXPO }}
                />
                <div
                  className="absolute left-[12%] right-[12%] top-[277px] h-1 rounded-full bg-zinc-800"
                  aria-hidden="true"
                />
                <motion.div
                  className="absolute left-[12%] right-[12%] top-[277px] h-1 origin-left rounded-full bg-brand shadow-[0_0_22px_rgba(254,199,0,0.24)] motion-safe:scale-x-0 motion-reduce:scale-x-100"
                  aria-hidden="true"
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.95, delay: 1.05, ease: EASE_OUT_EXPO }}
                />

                <div className="grid grid-cols-3 gap-x-8 gap-y-14">
                  {[
                    {
                      step: "01",
                      title: "Secure & Validate",
                      desc: "Validate the URL, DNS destination, redirects, TLS, response type and request bounds.",
                    },
                    {
                      step: "02",
                      title: "Fetch & Extract",
                      desc: "Fetch the page securely and extract signals across 10 audit categories.",
                    },
                    {
                      step: "03",
                      title: "Run Verified Checks",
                      desc: "Evaluate extracted signals through 85+ evidence-based SEO checks.",
                    },
                    {
                      step: "04",
                      title: "Calculate Scores",
                      desc: "Calculate category scores, confidence and applicable score caps.",
                    },
                    {
                      step: "05",
                      title: "Request Performance Data",
                      desc: "Request optional PageSpeed diagnostics without blocking the core SEO audit.",
                    },
                    {
                      step: "06",
                      title: "Assemble Your Report",
                      desc: "Organize critical issues, quick wins, evidence and remediation into one prioritized report.",
                      final: true,
                    },
                  ].map((stage, i) => (
                    <Reveal key={stage.step} delay={i * 0.08}>
                      <div className="relative flex h-full flex-col items-center text-center">
                        <motion.div
                          className={`relative z-10 flex h-[56px] w-[56px] items-center justify-center rounded-full border text-base font-bold ${
                            stage.final
                              ? "border-brand bg-brand text-black shadow-[0_0_32px_rgba(254,199,0,0.36)]"
                              : "border-brand/30 bg-bg-elevated text-brand shadow-lg shadow-brand/10"
                          }`}
                          initial={{ scale: 0.92 }}
                          whileInView={{ scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.35, delay: i * 0.04, ease: EASE_OUT_EXPO }}
                        >
                          {stage.step}
                        </motion.div>
                        <h3 className="mt-4 text-base font-bold leading-snug text-text-primary">
                          {stage.title}
                        </h3>
                        <p className="mt-2 text-base leading-relaxed text-text-secondary">
                          {stage.desc}
                        </p>
                      </div>
                    </Reveal>
                  ))}
                </div>
              </div>
            </div>

            <div className="md:hidden">
              <div className="relative">
                <div className="absolute left-[27px] top-0 bottom-0 w-1 rounded-full bg-zinc-800" />
                <motion.div
                  className="absolute left-[27px] top-0 w-1 origin-top rounded-full bg-brand shadow-[0_0_22px_rgba(254,199,0,0.24)] motion-safe:scale-y-0 motion-reduce:scale-y-100"
                  aria-hidden="true"
                  whileInView={{ scaleY: 1 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 1.2, ease: EASE_OUT_EXPO }}
                  style={{ height: "100%" }}
                />
                <div className="space-y-10">
                  {[
                    {
                      step: "01",
                      title: "Secure & Validate",
                      desc: "Validate the URL, DNS destination, redirects, TLS, response type and request bounds.",
                    },
                    {
                      step: "02",
                      title: "Fetch & Extract",
                      desc: "Fetch the page securely and extract signals across 10 audit categories.",
                    },
                    {
                      step: "03",
                      title: "Run Verified Checks",
                      desc: "Evaluate extracted signals through 85+ evidence-based SEO checks.",
                    },
                    {
                      step: "04",
                      title: "Calculate Scores",
                      desc: "Calculate category scores, confidence and applicable score caps.",
                    },
                    {
                      step: "05",
                      title: "Request Performance Data",
                      desc: "Request optional PageSpeed diagnostics without blocking the core SEO audit.",
                    },
                    {
                      step: "06",
                      title: "Assemble Your Report",
                      desc: "Organize critical issues, quick wins, evidence and remediation into one prioritized report.",
                      final: true,
                    },
                  ].map((stage, i) => (
                    <Reveal key={stage.step} delay={i * 0.08}>
                      <div className="relative flex gap-5">
                        <motion.div
                          className={`relative z-10 flex h-[58px] w-[58px] shrink-0 items-center justify-center rounded-full border text-base font-bold ${
                            stage.final
                              ? "border-brand bg-brand text-black shadow-[0_0_32px_rgba(254,199,0,0.36)]"
                              : "border-brand/30 bg-bg-elevated text-brand shadow-lg shadow-brand/10"
                          }`}
                          initial={{ scale: 0.92 }}
                          whileInView={{ scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.35, delay: i * 0.04, ease: EASE_OUT_EXPO }}
                        >
                          {stage.step}
                        </motion.div>
                        <div className="min-w-0 pt-1.5">
                          {stage.final && (
                            <span className="mb-2 inline-flex rounded-full border border-brand/35 bg-brand/10 px-3 py-1 text-[13px] font-semibold uppercase tracking-[0.14em] text-brand">
                              Report Ready
                            </span>
                          )}
                          <h3 className="text-base font-bold leading-snug text-text-primary">
                            {stage.title}
                          </h3>
                          <p className="mt-2 text-base leading-relaxed text-text-secondary">
                            {stage.desc}
                          </p>
                        </div>
                      </div>
                    </Reveal>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ── SECTION 5: PRIORITY PATHWAY ── */}
      <section
        className="border-t border-zinc-800/60 bg-gradient-to-b from-bg-card/30 to-bg-primary py-20 sm:py-28"
        id="priorities"
      >
        <Container>
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <Reveal>
                <span className="inline-block text-xs font-semibold uppercase tracking-[0.15em] text-brand mb-4">
                  Priority pathway
                </span>
              </Reveal>
              <Reveal delay={0.1}>
                <SectionHeading>From critical issues to quick wins</SectionHeading>
              </Reveal>
              <Reveal delay={0.15}>
                <p className="mt-5 text-[17px] text-text-secondary leading-relaxed">
                  Every finding is categorized by severity and effort, so you know exactly where to
                  start and what will have the most impact.
                </p>
              </Reveal>
              <Reveal delay={0.2}>
                <a
                  href="/methodology"
                  className="mt-6 inline-flex items-center gap-2 text-brand hover:text-brand-hover font-medium transition-colors"
                >
                  Read full methodology
                  <svg
                    width="16"
                    height="16"
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
            <div className="space-y-3">
              {priorityCards.map((r, i) => (
                <Reveal key={r.title} delay={0.1 * i}>
                  <div
                    className="rounded-2xl border border-zinc-800/80 bg-gradient-to-r from-bg-card to-bg-elevated p-5 border-l-4 transition-all duration-300 hover:border-zinc-700 hover:shadow-lg"
                    style={{ borderLeftColor: "inherit" }}
                  >
                    <div
                      className={`${r.badgeClass} inline-flex rounded-lg px-2.5 py-1 text-[13px] font-semibold uppercase`}
                    >
                      {r.badge}
                    </div>
                    <div className="mt-3 flex items-start justify-between gap-3">
                      <p className="text-base font-semibold text-text-primary">{r.title}</p>
                      <span className="shrink-0 text-xs text-text-tertiary">
                        Effort: {r.effort}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-text-secondary">{r.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* ── SECTION 6: PERFORMANCE INTELLIGENCE ── */}
      <section className="border-t border-zinc-800/60 py-20 sm:py-28" id="performance">
        <Container>
          <div className="text-center max-w-3xl mx-auto">
            <Reveal>
              <span className="inline-block text-xs font-semibold uppercase tracking-[0.15em] text-brand mb-4">
                Metrics that matter
              </span>
            </Reveal>
            <Reveal delay={0.1}>
              <SectionHeading>Performance intelligence at a glance</SectionHeading>
            </Reveal>
            <Reveal delay={0.15}>
              <p className="mt-5 text-[17px] text-text-secondary leading-relaxed">
                Category scores with confidence indicators, powered by real PageSpeed data and
                deterministic rule checks.
              </p>
            </Reveal>
          </div>
          <div className="mx-auto mt-14 max-w-4xl grid gap-5 sm:grid-cols-2">
            {metricsData.map((m, i) => (
              <Reveal key={m.label} delay={0.1 * i}>
                <Card hover>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-medium text-text-tertiary uppercase tracking-wider">
                      {m.label}
                    </p>
                    <p className={`text-3xl font-bold tabular-nums ${m.color}`}>{m.value}</p>
                  </div>
                  <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${m.barColor}`}
                      initial={{ width: 0 }}
                      whileInView={{ width: `${m.value}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: 0.3 + i * 0.1, ease: EASE_OUT_EXPO }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-text-tertiary">
                    {m.value >= 90
                      ? "Excellent"
                      : m.value >= 70
                        ? "Good"
                        : m.value >= 50
                          ? "Needs Work"
                          : "Poor"}
                  </p>
                </Card>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* ── SECTION 7: AEO/GEO READINESS ── */}
      <section
        className="border-t border-zinc-800/60 bg-gradient-to-b from-bg-card/30 to-bg-primary py-20 sm:py-28"
        id="aeo-geo"
      >
        <Container>
          <div className="mx-auto max-w-5xl">
            <div className="text-center max-w-3xl mx-auto">
              <Reveal>
                <span className="inline-block text-xs font-semibold uppercase tracking-[0.15em] text-brand mb-4">
                  Future-ready
                </span>
              </Reveal>
              <Reveal delay={0.1}>
                <SectionHeading>Preparing for the next era of search</SectionHeading>
              </Reveal>
            </div>
            <div className="mt-12 grid gap-6 sm:grid-cols-2">
              <ScaleIn delay={0.1}>
                <Card hover className="h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-muted border border-brand/10">
                      <span className="text-2xl font-bold text-brand">A</span>
                    </div>
                    <h3 className="text-xl font-semibold text-text-primary">AEO Readiness</h3>
                  </div>
                  <p className="text-[15px] text-text-secondary leading-relaxed">
                    Answer Engine Optimization assesses how well your content answers direct
                    questions. Pages with clear, structured answers are more likely to appear in
                    voice search results and AI-generated summaries.
                  </p>
                </Card>
              </ScaleIn>
              <ScaleIn delay={0.2}>
                <Card hover className="h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-muted border border-brand/10">
                      <span className="text-2xl font-bold text-brand">G</span>
                    </div>
                    <h3 className="text-xl font-semibold text-text-primary">GEO Readiness</h3>
                  </div>
                  <p className="text-[15px] text-text-secondary leading-relaxed">
                    Generative Engine Optimization evaluates how well your page is structured for
                    AI-powered search platforms. This includes semantic HTML, clear entity signals,
                    and consistent schema markup.
                  </p>
                </Card>
              </ScaleIn>
            </div>
            <Reveal delay={0.3}>
              <p className="mx-auto mt-8 max-w-2xl text-center text-sm text-text-tertiary">
                Both scores are informational and not ranking predictors. They help you prepare for
                emerging search paradigms.
              </p>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* ── SECTION 8: PRIVACY & SECURITY ── */}
      <section className="border-t border-zinc-800/60 py-20 sm:py-28" id="privacy">
        <Container>
          <div className="mx-auto max-w-4xl">
            <div className="text-center max-w-3xl mx-auto">
              <Reveal>
                <span className="inline-block text-xs font-semibold uppercase tracking-[0.15em] text-brand mb-4">
                  Trust
                </span>
              </Reveal>
              <Reveal delay={0.1}>
                <SectionHeading>Privacy &amp; security built in</SectionHeading>
              </Reveal>
              <Reveal delay={0.15}>
                <p className="mt-5 text-[17px] text-text-secondary leading-relaxed">
                  Your audit data stays private. We never store, share, or sell the URLs you submit.
                  Results are delivered directly to your browser with no server-side persistence.
                </p>
              </Reveal>
            </div>
            <StaggerGroup className="mt-12 grid gap-5 sm:grid-cols-3">
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
                <StaggerItem key={item.title}>
                  <Card className="h-full text-center">
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
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      </svg>
                    </div>
                    <p className="text-base font-semibold text-text-primary">{item.title}</p>
                    <p className="mt-2 text-sm text-text-secondary">{item.desc}</p>
                  </Card>
                </StaggerItem>
              ))}
            </StaggerGroup>
            <Reveal delay={0.2}>
              <p className="mt-8 text-center">
                <a
                  href="/privacy"
                  className="text-brand hover:text-brand-hover font-medium transition-colors"
                >
                  Read privacy policy
                </a>
              </p>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* ── SECTION 9: NEXORA EXPERT SUPPORT ── */}
      <section
        className="border-t border-zinc-800/60 bg-gradient-to-b from-bg-card/30 to-bg-primary py-20 sm:py-28"
        id="about"
      >
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <Reveal>
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
            </Reveal>
            <Reveal delay={0.1}>
              <span className="inline-block text-xs font-semibold uppercase tracking-[0.15em] text-brand mb-4">
                Built by Nexora Creation
              </span>
            </Reveal>
            <Reveal delay={0.15}>
              <SectionHeading>Expert support when you need it</SectionHeading>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="mt-5 text-[17px] text-text-secondary leading-relaxed max-w-2xl mx-auto">
                We build premium digital products. This free SEO tool is our way of demonstrating
                what careful engineering and thoughtful design can achieve.
              </p>
            </Reveal>
            <Reveal delay={0.25}>
              <div className="mt-10 flex flex-wrap justify-center gap-4">
                <a
                  href="https://nexora.de"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 rounded-2xl bg-brand px-8 py-4 text-base font-semibold text-black hover:bg-brand-hover transition-all duration-200 shadow-xl shadow-brand/25"
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
            </Reveal>
          </div>
        </Container>
      </section>

      {/* ── FAQ ── */}
      <section className="border-t border-zinc-800/60 py-20 sm:py-28" id="faq">
        <Container>
          <div className="mx-auto max-w-3xl">
            <div className="text-center mb-12">
              <Reveal>
                <span className="inline-block text-xs font-semibold uppercase tracking-[0.15em] text-brand mb-4">
                  Questions?
                </span>
              </Reveal>
              <Reveal delay={0.1}>
                <SectionHeading>Frequently asked questions</SectionHeading>
              </Reveal>
            </div>
            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <Reveal key={faq.q} delay={i * 0.04}>
                  <details className="group rounded-2xl border border-zinc-800/80 bg-gradient-to-r from-bg-card to-bg-elevated transition-all duration-200 open:border-zinc-700 hover:border-zinc-700/80 overflow-hidden">
                    <summary className="flex cursor-pointer items-center justify-between px-6 py-4 sm:py-5 text-[15px] sm:text-base font-medium text-text-primary">
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
                      <p className="text-[15px] text-text-secondary leading-relaxed">{faq.a}</p>
                    </div>
                  </details>
                </Reveal>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="border-t border-zinc-800/60 py-20 sm:py-28" id="cta">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <Reveal>
              <p className="text-2xl sm:text-3xl font-bold text-text-primary">
                Need help fixing these issues?
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-4 text-[17px] text-text-secondary leading-relaxed max-w-xl mx-auto">
                Nexora Creation provides hands-on SEO technical services. Let us help you implement
                the improvements your site needs.
              </p>
            </Reveal>
            <Reveal delay={0.2}>
              <a
                href="https://nexora.de"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex items-center gap-2.5 rounded-2xl border border-zinc-700 bg-transparent px-8 py-4 text-base font-medium text-text-primary hover:bg-bg-tertiary transition-all duration-200"
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
