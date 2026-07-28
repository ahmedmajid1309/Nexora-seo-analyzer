"use client";

import { AuditForm } from "@/components/landing/AuditForm";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal, StaggerGroup, StaggerItem, ScaleIn } from "@/components/ui/AnimatedPrimitives";
import { CategoryTicker } from "@/components/landing/CategoryTicker";
import { PAGE_TOP_OFFSET } from "@/lib/constants";
import { motion } from "motion/react";

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

const faqs = [
  {
    q: "Is the analyzer free?",
    a: "Yes. You can run the Nexora SEO Analyzer without paying or starting a trial.",
  },
  {
    q: "Is signup required?",
    a: "No. A mandatory account is not required to start a free audit.",
  },
  {
    q: "What does it analyze?",
    a: "It validates the URL, fetches the page server-side, extracts signals across 10 audit categories, and checks SEO, accessibility, metadata, links, images, content, structured data, social tags, forms, and URL signals.",
  },
  {
    q: "How are scores calculated?",
    a: "Core SEO checks are deterministic. Category scores use extracted evidence, rule outcomes, confidence, and applicable score caps.",
  },
  {
    q: "Why might Performance be unavailable?",
    a: "Performance diagnostics use optional external PageSpeed data. If that data cannot be returned, the core SEO audit still runs and unavailable does not mean a zero score.",
  },
  {
    q: "What are AEO and GEO readiness?",
    a: "AEO and GEO are readiness outputs that review answer structure, entity clarity, semantic organization, structured data, and topical relationships. They are not ranking guarantees.",
  },
];

export default function HomePage() {
  return (
    <>
      {/* ── SECTION 1: HERO ── */}
      <section
        className="relative overflow-hidden pb-12 sm:pb-20 lg:pb-28"
        style={{ paddingTop: `${PAGE_TOP_OFFSET + 24}px` }}
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
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:items-end">
              <div>
                <Reveal>
                  <span className="inline-block text-[13px] font-semibold uppercase tracking-[0.15em] text-brand mb-4">
                    Priority pathway
                  </span>
                </Reveal>
                <Reveal delay={0.1}>
                  <SectionHeading>Turn findings into a repair order</SectionHeading>
                </Reveal>
                <Reveal delay={0.15}>
                  <p className="mt-5 text-[17px] text-text-secondary leading-relaxed">
                    Nexora separates urgent risk from efficient improvements so the report reads
                    like a prioritized remediation queue, not a flat checklist.
                  </p>
                </Reveal>
              </div>
              <Reveal delay={0.2}>
                <div className="rounded-3xl border border-brand/20 bg-gradient-to-br from-brand/[0.10] via-bg-card to-bg-elevated p-6 shadow-2xl shadow-brand/5">
                  <p className="text-[13px] font-semibold uppercase tracking-[0.16em] text-brand">
                    Demonstration data
                  </p>
                  <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="max-w-xl text-lg font-semibold leading-snug text-text-primary">
                      Critical Issues demand ownership. Quick Wins create visible progress.
                    </p>
                    <a
                      href="/methodology"
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-brand/30 px-4 py-2 text-base font-semibold text-brand transition-colors hover:bg-brand/10 focus:outline-none focus:ring-2 focus:ring-brand/60"
                    >
                      Methodology
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
                  </div>
                </div>
              </Reveal>
            </div>

            <div className="mt-12 grid gap-6 lg:grid-cols-[1fr_auto_1fr] lg:items-stretch">
              <div className="rounded-3xl border border-critical/25 bg-gradient-to-b from-critical/[0.10] to-bg-card p-5 sm:p-6">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-xl font-bold text-text-primary">Critical Issues</h3>
                  <span className="rounded-full border border-critical/30 bg-critical/15 px-3 py-1 text-[13px] font-semibold uppercase tracking-[0.14em] text-critical">
                    Fix first
                  </span>
                </div>
                <div className="mt-6 space-y-4">
                  {[
                    {
                      title: "Indexing blocked by robots directive",
                      desc: "Search engines may be prevented from discovering important page content.",
                      role: "SEO / Dev",
                      effort: "Medium",
                      action: "Review robots policy and canonical intent",
                    },
                    {
                      title: "Missing accessible form labels",
                      desc: "Form controls can become unclear for assistive technology and keyboard users.",
                      role: "Frontend",
                      effort: "Low-Medium",
                      action: "Connect labels or accessible names",
                    },
                  ].map((item, i) => (
                    <Reveal key={item.title} delay={i * 0.08}>
                      <div className="rounded-2xl border border-critical/20 bg-bg-primary/70 p-5">
                        <p className="text-base font-bold text-text-primary">{item.title}</p>
                        <p className="mt-2 text-base leading-relaxed text-text-secondary">
                          {item.desc}
                        </p>
                        <div className="mt-4 grid gap-2 text-[13px] font-semibold uppercase tracking-[0.12em] text-text-secondary sm:grid-cols-3">
                          <span>Role: {item.role}</span>
                          <span>Effort: {item.effort}</span>
                          <span>First: {item.action}</span>
                        </div>
                      </div>
                    </Reveal>
                  ))}
                </div>
              </div>

              <div
                className="hidden w-16 flex-col items-center justify-center lg:flex"
                aria-hidden="true"
              >
                <motion.div
                  className="h-full w-px origin-top bg-gradient-to-b from-critical/50 via-brand to-success/50 motion-safe:scale-y-0 motion-reduce:scale-y-100"
                  whileInView={{ scaleY: 1 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.9, ease: EASE_OUT_EXPO }}
                />
                <div className="my-4 flex h-12 w-12 items-center justify-center rounded-full border border-brand/30 bg-brand text-black shadow-[0_0_24px_rgba(254,199,0,0.22)]">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
                <motion.div
                  className="h-full w-px origin-top bg-gradient-to-b from-brand to-success/50 motion-safe:scale-y-0 motion-reduce:scale-y-100"
                  whileInView={{ scaleY: 1 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.9, delay: 0.15, ease: EASE_OUT_EXPO }}
                />
              </div>

              <div className="rounded-3xl border border-success/25 bg-gradient-to-b from-success/[0.10] to-bg-card p-5 sm:p-6">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-xl font-bold text-text-primary">Quick Wins</h3>
                  <span className="rounded-full border border-success/30 bg-success/15 px-3 py-1 text-[13px] font-semibold uppercase tracking-[0.14em] text-success">
                    Improve next
                  </span>
                </div>
                <div className="mt-6 space-y-4">
                  {[
                    {
                      title: "Add missing meta descriptions",
                      desc: "Clear snippets can improve how pages communicate their purpose in search results.",
                      step: "Write unique descriptions for priority pages",
                      outcome: "Sharper SERP messaging",
                    },
                    {
                      title: "Complete image alt text",
                      desc: "Descriptive alternatives improve accessibility and image understanding.",
                      step: "Add concise alt text to meaningful images",
                      outcome: "Better accessible context",
                    },
                  ].map((item, i) => (
                    <Reveal key={item.title} delay={i * 0.08}>
                      <div className="rounded-2xl border border-success/20 bg-bg-primary/70 p-5">
                        <p className="text-base font-bold text-text-primary">{item.title}</p>
                        <p className="mt-2 text-base leading-relaxed text-text-secondary">
                          {item.desc}
                        </p>
                        <div className="mt-4 flex flex-col gap-2 text-[13px] font-semibold uppercase tracking-[0.12em] text-text-secondary sm:flex-row sm:items-center sm:justify-between">
                          <span>Step: {item.step}</span>
                          <span className="text-success">Outcome: {item.outcome}</span>
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

      {/* ── SECTION 6: PERFORMANCE INTELLIGENCE ── */}
      <section className="border-t border-zinc-800/60 py-20 sm:py-28" id="performance">
        <Container>
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
              <div>
                <Reveal>
                  <span className="inline-block text-[13px] font-semibold uppercase tracking-[0.15em] text-brand mb-4">
                    Optional diagnostics
                  </span>
                </Reveal>
                <Reveal delay={0.1}>
                  <SectionHeading>
                    Performance intelligence without replacing the SEO audit
                  </SectionHeading>
                </Reveal>
                <Reveal delay={0.15}>
                  <p className="mt-5 text-[17px] text-text-secondary leading-relaxed">
                    When PageSpeed data is available, Nexora adds mobile and desktop diagnostics to
                    the report. If the external data is unavailable, the core SEO audit still runs
                    and unavailable does not mean score zero.
                  </p>
                </Reveal>
                <Reveal delay={0.2}>
                  <div className="mt-6 rounded-2xl border border-zinc-800 bg-bg-card p-5 text-base leading-relaxed text-text-secondary">
                    Example metrics below are demonstration content, not the visitor&apos;s live
                    audit.
                  </div>
                </Reveal>
              </div>

              <ScaleIn delay={0.2}>
                <div className="rounded-3xl border border-zinc-800 bg-gradient-to-b from-bg-card to-bg-elevated p-5 shadow-2xl shadow-black/30 sm:p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-[13px] font-semibold uppercase tracking-[0.16em] text-brand">
                        Example PageSpeed layer
                      </p>
                      <h3 className="mt-2 text-xl font-bold text-text-primary">
                        Mobile vs desktop
                      </h3>
                    </div>
                    <span className="rounded-full border border-brand/25 bg-brand/10 px-3 py-1 text-[13px] font-semibold uppercase tracking-[0.14em] text-brand">
                      Optional external data
                    </span>
                  </div>

                  <div className="mt-7 grid gap-4 sm:grid-cols-2">
                    {[
                      {
                        label: "Mobile",
                        value: 78,
                        color: "text-warning",
                        ring: "border-warning/35",
                      },
                      {
                        label: "Desktop",
                        value: 92,
                        color: "text-success",
                        ring: "border-success/35",
                      },
                    ].map((score, i) => (
                      <Reveal key={score.label} delay={i * 0.08}>
                        <div className={`rounded-2xl border ${score.ring} bg-bg-primary/70 p-5`}>
                          <p className="text-base font-semibold text-text-secondary">
                            {score.label}
                          </p>
                          <div className="mt-4 flex items-end gap-3">
                            <p
                              className={`text-6xl font-bold leading-none tabular-nums ${score.color}`}
                            >
                              {score.value}
                            </p>
                            <p className="pb-2 text-base text-text-secondary">performance score</p>
                          </div>
                        </div>
                      </Reveal>
                    ))}
                  </div>

                  <div className="mt-7 space-y-4">
                    {[
                      { label: "Largest Contentful Paint", value: 72 },
                      { label: "Total Blocking Time", value: 84 },
                      { label: "Cumulative Layout Shift", value: 90 },
                    ].map((metric, i) => (
                      <div key={metric.label}>
                        <div className="flex items-center justify-between gap-4 text-base">
                          <span className="font-medium text-text-primary">{metric.label}</span>
                          <span className="font-semibold tabular-nums text-brand">
                            {metric.value}
                          </span>
                        </div>
                        <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-zinc-800">
                          <motion.div
                            className="h-full rounded-full bg-brand"
                            initial={{ width: 0 }}
                            whileInView={{ width: `${metric.value}%` }}
                            viewport={{ once: true }}
                            transition={{
                              duration: 0.85,
                              delay: 0.15 + i * 0.08,
                              ease: EASE_OUT_EXPO,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </ScaleIn>
            </div>
          </div>
        </Container>
      </section>

      {/* ── SECTION 7: AEO/GEO READINESS ── */}
      <section
        className="border-t border-zinc-800/60 bg-gradient-to-b from-bg-card/30 to-bg-primary py-20 sm:py-28"
        id="aeo-geo"
      >
        <Container>
          <div className="mx-auto max-w-6xl">
            <div className="max-w-3xl">
              <Reveal>
                <span className="inline-block text-[13px] font-semibold uppercase tracking-[0.15em] text-brand mb-4">
                  Readiness outputs
                </span>
              </Reveal>
              <Reveal delay={0.1}>
                <SectionHeading>
                  AEO and GEO are readiness signals, not ranking promises
                </SectionHeading>
              </Reveal>
              <Reveal delay={0.15}>
                <p className="mt-5 text-[17px] text-text-secondary leading-relaxed">
                  Nexora reviews whether the page is structured for answer-oriented and AI-assisted
                  discovery. These outputs do not count as RuleCategory values and do not guarantee
                  rankings, citations, or visibility.
                </p>
              </Reveal>
            </div>

            <div className="mt-12 rounded-3xl border border-zinc-800 bg-gradient-to-br from-bg-card via-bg-primary to-bg-elevated p-5 shadow-2xl shadow-black/25 sm:p-7">
              <div className="grid gap-6 lg:grid-cols-[1fr_auto_1fr] lg:items-stretch">
                <Reveal delay={0.1}>
                  <div className="h-full rounded-2xl border border-brand/20 bg-brand/[0.04] p-5">
                    <div className="flex items-center gap-3">
                      <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-brand/25 bg-brand/10 text-2xl font-bold text-brand">
                        A
                      </span>
                      <h3 className="text-xl font-bold text-text-primary">AEO Readiness</h3>
                    </div>
                    <ul className="mt-6 space-y-4 text-base leading-relaxed text-text-secondary">
                      <li>Question-oriented content that maps to real user intent.</li>
                      <li>Direct answers near relevant headings and page sections.</li>
                      <li>Structured FAQ signals where the content genuinely supports them.</li>
                    </ul>
                  </div>
                </Reveal>

                <div
                  className="hidden w-px bg-gradient-to-b from-transparent via-brand/40 to-transparent lg:block"
                  aria-hidden="true"
                />

                <Reveal delay={0.2}>
                  <div className="h-full rounded-2xl border border-blue-400/20 bg-blue-400/[0.04] p-5">
                    <div className="flex items-center gap-3">
                      <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-400/25 bg-blue-400/10 text-2xl font-bold text-blue-400">
                        G
                      </span>
                      <h3 className="text-xl font-bold text-text-primary">GEO Readiness</h3>
                    </div>
                    <ul className="mt-6 space-y-4 text-base leading-relaxed text-text-secondary">
                      <li>Entity clarity across headings, copy, and metadata.</li>
                      <li>Semantic organization with structured data and topical relationships.</li>
                      <li>Consistent page meaning that machines can parse without guessing.</li>
                    </ul>
                  </div>
                </Reveal>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ── SECTION 8: PRIVACY & SECURITY ── */}
      <section className="border-t border-zinc-800/60 py-20 sm:py-28" id="privacy">
        <Container>
          <div className="mx-auto max-w-6xl">
            <div className="text-center max-w-3xl mx-auto">
              <Reveal>
                <span className="inline-block text-[13px] font-semibold uppercase tracking-[0.15em] text-brand mb-4">
                  Trust architecture
                </span>
              </Reveal>
              <Reveal delay={0.1}>
                <SectionHeading>Protected fetching before analysis begins</SectionHeading>
              </Reveal>
              <Reveal delay={0.15}>
                <p className="mt-5 text-[17px] text-text-secondary leading-relaxed">
                  Submitted URLs are fetched server-side with validation layers around destination,
                  redirects, response type, and request bounds. No mandatory account is required to
                  start an audit.
                </p>
              </Reveal>
            </div>

            <div className="relative mt-14 rounded-3xl border border-zinc-800 bg-gradient-to-b from-bg-card to-bg-elevated p-5 shadow-2xl shadow-black/25 sm:p-8">
              <div
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(254,199,0,0.06),transparent_55%)]"
                aria-hidden="true"
              />
              <div className="relative grid gap-6 lg:grid-cols-[1fr_280px_1fr] lg:items-center">
                <div className="space-y-4">
                  {[
                    [
                      "DNS and redirect validation",
                      "Destination checks help avoid unsafe or unexpected fetch targets.",
                    ],
                    [
                      "SSRF protections",
                      "Network policy blocks private, loopback, and restricted destinations.",
                    ],
                  ].map(([title, desc], i) => (
                    <Reveal key={title} delay={i * 0.08}>
                      <div className="rounded-2xl border border-zinc-800 bg-bg-primary/70 p-5">
                        <p className="text-base font-bold text-text-primary">{title}</p>
                        <p className="mt-2 text-base leading-relaxed text-text-secondary">{desc}</p>
                      </div>
                    </Reveal>
                  ))}
                </div>

                <ScaleIn delay={0.2}>
                  <div className="relative mx-auto flex h-[240px] w-full max-w-[280px] items-center justify-center rounded-3xl border border-brand/25 bg-brand/[0.06] shadow-[0_0_42px_rgba(254,199,0,0.10)]">
                    <motion.div
                      className="absolute inset-x-8 top-1/2 h-1 origin-left rounded-full bg-brand motion-safe:scale-x-0 motion-reduce:scale-x-100"
                      aria-hidden="true"
                      whileInView={{ scaleX: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, ease: EASE_OUT_EXPO }}
                    />
                    <div className="relative z-10 rounded-2xl border border-brand/30 bg-bg-primary px-5 py-4 text-center">
                      <p className="text-[13px] font-semibold uppercase tracking-[0.16em] text-brand">
                        Protected request
                      </p>
                      <p className="mt-2 text-xl font-bold text-text-primary">Server-side fetch</p>
                    </div>
                  </div>
                </ScaleIn>

                <div className="space-y-4">
                  {[
                    [
                      "Bounded request size/time",
                      "Fetches are constrained so analysis remains controlled and failure states are honest.",
                    ],
                    [
                      "Unavailable states",
                      "If external data cannot be returned, the report can still show the core SEO findings.",
                    ],
                  ].map(([title, desc], i) => (
                    <Reveal key={title} delay={0.16 + i * 0.08}>
                      <div className="rounded-2xl border border-zinc-800 bg-bg-primary/70 p-5">
                        <p className="text-base font-bold text-text-primary">{title}</p>
                        <p className="mt-2 text-base leading-relaxed text-text-secondary">{desc}</p>
                      </div>
                    </Reveal>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ── FAQ ── */}
      <section className="border-t border-zinc-800/60 py-20 sm:py-28" id="faq">
        <Container>
          <div className="mx-auto max-w-4xl">
            <div className="text-center mb-12">
              <Reveal>
                <span className="inline-block text-[13px] font-semibold uppercase tracking-[0.15em] text-brand mb-4">
                  Questions?
                </span>
              </Reveal>
              <Reveal delay={0.1}>
                <SectionHeading>Frequently asked questions</SectionHeading>
              </Reveal>
            </div>
            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <Reveal key={faq.q} delay={i * 0.04}>
                  <details className="group overflow-hidden rounded-2xl border border-zinc-800/80 bg-gradient-to-r from-bg-card to-bg-elevated transition-all duration-200 open:border-brand/35 hover:border-zinc-700/80 focus-within:border-brand/50">
                    <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-base font-semibold text-text-primary outline-none transition-colors marker:hidden focus-visible:ring-2 focus-visible:ring-brand/60 sm:px-6">
                      {faq.q}
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-zinc-700 text-text-secondary transition-transform duration-300 group-open:rotate-180 group-open:border-brand/40 group-open:text-brand">
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
                    <div className="border-t border-zinc-800/60 px-5 pb-5 pt-4 sm:px-6">
                      <p className="text-base leading-relaxed text-text-secondary">{faq.a}</p>
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
          <Reveal>
            <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl border border-brand/20 bg-gradient-to-br from-brand/[0.10] via-bg-card to-bg-primary p-6 text-center shadow-2xl shadow-brand/5 sm:p-10">
              <div
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(254,199,0,0.08),transparent_58%)]"
                aria-hidden="true"
              />
              <div className="relative z-10 mx-auto max-w-3xl">
                <span className="inline-flex rounded-full border border-brand/30 bg-brand/10 px-3 py-1 text-[13px] font-semibold uppercase tracking-[0.16em] text-brand">
                  No mandatory signup
                </span>
                <h2 className="mt-5 text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
                  Run the next evidence-led audit
                </h2>
                <p className="mt-4 text-[17px] leading-relaxed text-text-secondary">
                  Start another free audit and turn extracted page evidence into prioritized SEO,
                  accessibility, and readiness findings.
                </p>
                <div className="mt-8 flex flex-col items-stretch justify-center gap-4 sm:flex-row">
                  <a
                    href="#hero"
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-brand px-7 py-3 text-base font-bold text-black shadow-xl shadow-brand/20 transition-colors hover:bg-brand-hover focus:outline-none focus:ring-2 focus:ring-brand/70 focus:ring-offset-2 focus:ring-offset-bg-primary"
                  >
                    Start free audit
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      aria-hidden="true"
                    >
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </a>
                  <a
                    href="https://nexoracreation.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-zinc-700 bg-bg-primary/50 px-7 py-3 text-base font-semibold text-text-primary transition-colors hover:bg-bg-tertiary focus:outline-none focus:ring-2 focus:ring-brand/60"
                  >
                    Talk to Nexora Creation
                  </a>
                </div>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
