"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useReducedMotion } from "motion/react";

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

type ScoreCardProps = {
  label: string;
  score: number | null;
  confidence: number | null;
  source?: string | null;
  info?: boolean;
  className?: string;
};

function getScoreColor(score: number | null): string {
  if (score === null) return "text-text-tertiary";
  if (score >= 90) return "text-success";
  if (score >= 70) return "text-success";
  if (score >= 50) return "text-warning";
  if (score >= 30) return "text-warning";
  return "text-critical";
}

function getScoreLabel(score: number | null): string {
  if (score === null) return "Unavailable";
  if (score >= 90) return "Excellent";
  if (score >= 70) return "Good";
  if (score >= 50) return "Needs Work";
  if (score >= 30) return "Poor";
  return "Critical";
}

function getGaugeColor(score: number | null): string {
  if (score === null) return "#888";
  if (score >= 70) return "#22c55e";
  if (score >= 50) return "#e99a35";
  return "#ef4444";
}

export function ScoreCard({ label, score, confidence, source, info, className }: ScoreCardProps) {
  const [animatedScore, setAnimatedScore] = useState<number | null>(score !== null ? 0 : null);
  const [revealed, setRevealed] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (score === null) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !revealed) {
          setRevealed(true);
        }
      },
      { threshold: 0.3 },
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [score, revealed]);

  useEffect(() => {
    if (!revealed || score === null) return;

    if (reduced) {
      const id = setTimeout(() => setAnimatedScore(score), 0);
      return () => clearTimeout(id);
    }

    const duration = 600;
    const start = performance.now();
    let frameId: number;

    function animate(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(Math.round(eased * score!));

      if (progress < 1) {
        frameId = requestAnimationFrame(animate);
      }
    }

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [revealed, score, reduced]);

  const displayScore = animatedScore !== null ? animatedScore : score;
  const colorClass = getScoreColor(score);
  const labelText = getScoreLabel(score);
  const gaugeColor = getGaugeColor(score);
  const circumference = 2 * Math.PI * 36;
  const progress = score !== null ? Math.min(score / 100, 1) : 0;

  return (
    <div
      ref={ref}
      className={`rounded-xl border border-zinc-800 bg-bg-card overflow-hidden p-4 transition-all duration-[250ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 hover:border-zinc-700 hover:shadow-lg hover:shadow-black/20 sm:p-5 ${className ?? ""}`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-wider text-text-tertiary">
          {label}
          {info && (
            <span className="ml-1 text-warning" title="Informational score">
              &#9432;
            </span>
          )}
        </p>
        {source && (
          <span className="shrink-0 rounded bg-brand-muted px-1.5 py-0.5 text-[13px] font-medium uppercase tracking-wider text-brand">
            {source === "pagespeed-mobile"
              ? "Mobile"
              : source === "pagespeed-desktop-fallback"
                ? "Desktop*"
                : source}
          </span>
        )}
      </div>

      {/* Gauge + Score */}
      <div className="mt-3 flex items-center gap-4">
        {/* Circular gauge */}
        <div className="relative h-[72px] w-[72px] shrink-0">
          <svg className="h-full w-full -rotate-90" viewBox="0 0 80 80" aria-hidden="true">
            <circle
              cx="40"
              cy="40"
              r="36"
              fill="none"
              stroke="currentColor"
              strokeWidth="5"
              className="text-zinc-800"
            />
            <motion.circle
              cx="40"
              cy="40"
              r="36"
              fill="none"
              stroke={gaugeColor}
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={reduced ? false : { strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: circumference * (1 - progress) }}
              transition={{ duration: 0.8, delay: 0.2, ease: EASE_OUT_EXPO }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-lg font-bold tabular-nums ${colorClass}`}>
              {score !== null ? (displayScore ?? 0) : "\u2014"}
            </span>
          </div>
        </div>

        <div className="min-w-0">
          {score !== null && <span className="text-xs text-text-secondary">{labelText}</span>}
          <div className="mt-1 flex flex-wrap gap-2 text-xs text-text-tertiary">
            {confidence !== null && confidence !== undefined && (
              <span>Confidence: {confidence}%</span>
            )}
            {score === null && <span>Not available</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
