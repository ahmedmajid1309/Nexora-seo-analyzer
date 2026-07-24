"use client";

import { motion, useReducedMotion, AnimatePresence } from "motion/react";
import { useEffect, useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";

const BRAND = "#F4CA57";

const stages = [
  { id: "dns", label: "Securing the website connection", detail: "DNS resolution & TLS handshake" },
  {
    id: "fetch",
    label: "Fetching page content",
    detail: "Server-side proxy fetch with security validation",
  },
  {
    id: "parse",
    label: "Reading page structure",
    detail: "Parsing HTML, metadata, headings, links, and images",
  },
  {
    id: "extract",
    label: "Extracting signals",
    detail: "Analysing content across 14 SEO dimensions",
  },
  {
    id: "verify",
    label: "Verifying signals",
    detail: "Running hundreds of deterministic evidence checks",
  },
  {
    id: "score",
    label: "Calculating scores",
    detail: "Weighted scoring with confidence indicators",
  },
  {
    id: "performance",
    label: "Requesting performance data",
    detail: "Gathering PageSpeed & Core Web Vitals",
  },
  {
    id: "assembly",
    label: "Preparing your report",
    detail: "Assembling findings and remediation pathways",
  },
];

function StageVisual({
  stage,
  isActive,
  isDone,
}: {
  stage: (typeof stages)[number];
  isActive: boolean;
  isDone: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-4 transition-all duration-500 ${
        isActive ? "opacity-100" : isDone ? "opacity-70" : "opacity-40"
      }`}
    >
      <div
        className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all duration-500 ${
          isDone
            ? "bg-[#34D399]/15 border border-[#34D399]/30"
            : isActive
              ? "bg-brand/15 border border-brand/30 shadow-lg shadow-brand/10"
              : "bg-zinc-800/50 border border-zinc-700/50"
        }`}
      >
        {isDone ? (
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#34D399"
            strokeWidth="2.5"
            aria-hidden="true"
          >
            <path d="M20 6L9 17l-5-5" />
          </svg>
        ) : (
          <span className={`text-xs font-bold ${isActive ? "text-brand" : "text-text-tertiary"}`}>
            {stages.indexOf(stage) + 1}
          </span>
        )}
        {isActive && (
          <span className="absolute -inset-1 rounded-xl border border-brand/20 animate-ping opacity-30" />
        )}
      </div>
      <div className="min-w-0">
        <p
          className={`text-sm font-medium transition-colors duration-300 ${
            isActive ? "text-text-primary" : isDone ? "text-text-secondary" : "text-text-tertiary"
          }`}
        >
          {stage.label}
        </p>
        <p
          className={`text-sm mt-0.5 transition-colors duration-300 ${
            isActive ? "text-text-tertiary" : "text-text-tertiary"
          }`}
        >
          {stage.detail}
        </p>
      </div>
    </div>
  );
}

function SignalPulse() {
  return (
    <div className="flex items-center gap-1">
      {[0, 1, 2, 3].map((i) => (
        <motion.span
          key={i}
          className="h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: BRAND }}
          animate={{ opacity: [0.2, 1, 0.2], scale: [1, 1.3, 1] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

function ScanVisualization() {
  const [activeScan, setActiveScan] = useState(0);
  const scanItems = [
    { label: "DNS", color: BRAND },
    { label: "HTML", color: "#60A5FA" },
    { label: "Meta", color: "#34D399" },
    { label: "Headings", color: "#FBBF24" },
    { label: "Images", color: "#F87171" },
    { label: "Links", color: "#A78BFA" },
    { label: "Schema", color: "#F472B6" },
    { label: "Security", color: "#34D399" },
  ];

  useEffect(() => {
    const t = setInterval(() => {
      setActiveScan((i) => (i + 1) % scanItems.length);
    }, 600);
    return () => clearInterval(t);
  }, [scanItems.length]);

  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {scanItems.map((item, i) => (
        <span
          key={item.label}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
            i === activeScan
              ? "bg-brand/15 text-brand border border-brand/30 shadow-lg"
              : "bg-zinc-800/50 text-text-tertiary border border-zinc-700/50"
          }`}
          style={i === activeScan ? { boxShadow: `0 0 20px ${BRAND}15` } : {}}
        >
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{
              backgroundColor: item.color,
              opacity: i === activeScan ? 1 : 0.3,
              boxShadow: i === activeScan ? `0 0 6px ${item.color}` : "none",
            }}
          />
          {item.label}
        </span>
      ))}
    </div>
  );
}

export default function LoadingPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const url = searchParams.get("url") ?? "example.com";
  const reduced = useReducedMotion();

  const [stageIdx, setStageIdx] = useState(0);
  const [ready, setReady] = useState(false);

  // Advance through stages
  useEffect(() => {
    if (stageIdx >= stages.length - 1) {
      const t = setTimeout(() => setReady(true), 1200);
      return () => clearTimeout(t);
    }
    const delay = 800 + Math.random() * 1200;
    const t = setTimeout(() => setStageIdx((i) => i + 1), delay);
    return () => clearTimeout(t);
  }, [stageIdx]);

  // Transition to result
  useEffect(() => {
    if (!ready) return;
    const t = setTimeout(() => {
      router.push(`/design-lab/final/result?url=${encodeURIComponent(url)}`);
    }, 600);
    return () => clearTimeout(t);
  }, [ready, url, router]);

  const progress = useMemo(() => ((stageIdx + 1) / stages.length) * 100, [stageIdx]);

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      {/* Minimal header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-bg-primary/80 backdrop-blur-xl border-b border-zinc-800/60">
        <div className="mx-auto flex h-16 items-center justify-between px-5 sm:px-8 lg:px-12 max-w-[1200px]">
          <a href="/design-lab/final" className="flex items-center gap-3">
            <Image
              src="/logo.svg"
              alt="Nexora Creation"
              width={140}
              height={27}
              className="h-6 sm:h-7 w-auto"
            />
          </a>
          <div className="flex items-center gap-3">
            <SignalPulse />
            <span className="text-xs font-semibold uppercase tracking-wider text-brand/80">
              Scanning
            </span>
          </div>
        </div>
      </header>

      {/* Main loading area */}
      <div className="flex-1 flex items-center justify-center pt-16">
        <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-brand/[0.02] blur-[160px]" />
        </div>

        <div className="w-full max-w-2xl mx-auto px-5 sm:px-8 py-16 relative z-10">
          {/* URL being scanned */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-3">
              <motion.div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: BRAND }}
                animate={reduced ? {} : { scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              />
              <h1 className="text-lg sm:text-xl font-bold text-text-primary">
                Analysing your website
              </h1>
            </div>
            <p className="text-sm text-text-secondary font-mono break-all bg-bg-card/60 inline-block px-4 py-2 rounded-xl border border-zinc-800/60">
              {url}
            </p>
          </div>

          {/* Scan visualization */}
          <div className="mb-12">
            <ScanVisualization />
          </div>

          {/* Progress bar */}
          <div className="mb-10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-text-tertiary">Progress</span>
              <span className="text-sm font-bold text-brand tabular-nums">
                {stageIdx + 1} / {stages.length}
              </span>
            </div>
            <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: BRAND }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              />
            </div>
          </div>

          {/* Stage list */}
          <div className="space-y-4">
            {stages.map((stage, i) => {
              const isActive = i === stageIdx;
              const isDone = i < stageIdx;
              return (
                <AnimatePresence key={stage.id}>
                  <StageVisual stage={stage} isActive={isActive} isDone={isDone} />
                </AnimatePresence>
              );
            })}
          </div>

          {/* Ready state */}
          <AnimatePresence>
            {ready && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-12 text-center"
              >
                <div className="inline-flex items-center gap-3 rounded-2xl bg-[#34D399]/10 border border-[#34D399]/20 px-6 py-4">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#34D399"
                    strokeWidth="2.5"
                    aria-hidden="true"
                  >
                    <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                    <path d="M22 4L12 14.01l-3-3" />
                  </svg>
                  <span className="text-sm font-semibold text-[#34D399]">
                    Report ready &mdash; loading results...
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <p className="mt-8 text-center text-sm text-text-tertiary">
            No fake percentages &middot; Real lifecycle stages
          </p>
        </div>
      </div>

      {/* Bottom edge gradient */}
      <div className="h-1 bg-gradient-to-r from-transparent via-brand/20 to-transparent" />
    </div>
  );
}
