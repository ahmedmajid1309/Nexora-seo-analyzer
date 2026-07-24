"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { HEADER_HEIGHT, HEADER_MARGIN_TOP } from "@/lib/constants";

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const pathname = usePathname();
  const reduced = useReducedMotion();

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40);
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(docHeight > 0 ? Math.min(scrollTop / docHeight, 1) : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const prevPathname = useRef(pathname);
  useEffect(() => {
    if (prevPathname.current !== pathname) {
      setMenuOpen(false);
      prevPathname.current = pathname;
    }
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Escape") setMenuOpen(false);
  }, []);

  const pillClasses = scrolled
    ? "border border-zinc-700/50 bg-bg-primary/85 backdrop-blur-2xl shadow-2xl shadow-black/30"
    : "border border-zinc-800/30 bg-bg-primary/50 backdrop-blur-lg";

  return (
    <header className="fixed top-0 left-0 right-0 z-50 no-print flex flex-col items-center pointer-events-none">
      <motion.div
        className="scroll-progress pointer-events-none"
        style={{ scaleX: scrollProgress }}
        aria-hidden="true"
      />

      <nav
        className={`pointer-events-auto flex items-center justify-between rounded-2xl px-5 sm:px-6 transition-all duration-[400ms] max-w-[1320px] w-full mx-4 ${pillClasses}`}
        style={{ height: `${HEADER_HEIGHT}px`, marginTop: `${HEADER_MARGIN_TOP}px` }}
        aria-label="Main navigation"
      >
        <Link href="/" className="flex items-center gap-3 shrink-0">
          <Image
            src="/brand/nexora-logo-main.svg"
            alt="Nexora SEO Analyzer"
            width={160}
            height={44}
            className="h-8 sm:h-10 w-auto"
            priority
            style={{ objectFit: "contain", width: "auto", height: "auto" }}
          />
        </Link>

        <div className="hidden md:flex items-center gap-1">
          <Link
            href="/methodology"
            className="rounded-xl px-4 py-2.5 text-[15px] text-text-tertiary hover:text-text-primary hover:bg-white/[0.04] transition-all duration-200"
          >
            Methodology
          </Link>
          <Link
            href="/privacy"
            className="rounded-xl px-4 py-2.5 text-[15px] text-text-tertiary hover:text-text-primary hover:bg-white/[0.04] transition-all duration-200"
          >
            Privacy
          </Link>
          <Link
            href="/"
            className="ml-2 inline-flex items-center gap-2 rounded-xl bg-brand px-6 py-2.5 text-[15px] font-semibold text-black hover:bg-brand-hover transition-all duration-200 shadow-lg shadow-brand/20"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            Analyze
          </Link>
        </div>

        <button
          className="md:hidden flex h-11 w-11 items-center justify-center rounded-xl text-text-secondary hover:text-text-primary hover:bg-white/[0.06] transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-expanded={menuOpen}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-controls="mobile-menu"
          type="button"
          style={{ minWidth: "44px", minHeight: "44px" }}
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
            {menuOpen ? (
              <path d="M18 6L6 18M6 6l12 12" />
            ) : (
              <>
                <path d="M4 6h16M4 12h16M4 18h16" />
              </>
            )}
          </svg>
        </button>
      </nav>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="mobile-menu"
            className="md:hidden pointer-events-auto mt-3 mx-4 w-[calc(100%-2rem)] max-w-[500px] rounded-2xl border border-zinc-700/50 bg-bg-primary/95 backdrop-blur-2xl shadow-2xl overflow-hidden"
            onKeyDown={handleKeyDown}
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
            initial={reduced ? false : { opacity: 0, y: -12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduced ? undefined : { opacity: 0, y: -12, scale: 0.97 }}
            transition={{ duration: 0.25, ease: EASE_OUT_EXPO }}
          >
            <div className="flex flex-col gap-1.5 p-4">
              <Link
                href="/methodology"
                className="block rounded-xl px-4 py-4 text-base text-text-secondary hover:text-text-primary hover:bg-white/[0.04] transition-colors"
                tabIndex={0}
              >
                Methodology
              </Link>
              <Link
                href="/privacy"
                className="block rounded-xl px-4 py-4 text-base text-text-secondary hover:text-text-primary hover:bg-white/[0.04] transition-colors"
                tabIndex={0}
              >
                Privacy
              </Link>
              <Link
                href="/terms"
                className="block rounded-xl px-4 py-4 text-base text-text-secondary hover:text-text-primary hover:bg-white/[0.04] transition-colors"
                tabIndex={0}
              >
                Terms
              </Link>
              <hr className="my-2 border-zinc-800" />
              <Link
                href="/"
                className="flex items-center justify-center gap-2 rounded-xl bg-brand px-4 py-4 text-base font-semibold text-black hover:bg-brand-hover transition-colors"
                tabIndex={0}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  aria-hidden="true"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
                Analyze Website
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
