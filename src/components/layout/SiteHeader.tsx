"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const pathname = usePathname();
  const reduced = useReducedMotion();

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 60);
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
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Escape") setMenuOpen(false);
  }, []);

  const pillClasses = scrolled
    ? "border border-zinc-700/60 bg-bg-primary/80 backdrop-blur-xl shadow-lg shadow-black/20"
    : "border border-zinc-800/40 bg-bg-primary/60 backdrop-blur-md";

  return (
    <header className="fixed top-0 left-0 right-0 z-50 no-print flex flex-col items-center pointer-events-none">
      {/* Scroll progress bar */}
      <motion.div
        className="pointer-events-auto h-0.5 bg-brand/80 origin-left"
        style={{ scaleX: scrollProgress, position: "fixed", top: 0, left: 0, right: 0, zIndex: 60 }}
        aria-hidden="true"
      />

      <nav
        className={`pointer-events-auto flex items-center justify-between rounded-full px-5 sm:px-6 transition-all duration-300 max-w-5xl w-full ${pillClasses}`}
        style={{ height: "72px", marginTop: "12px" }}
        aria-label="Main navigation"
      >
        <Link href="/" className="flex items-center gap-3 shrink-0">
          <Image
            src="/brand/nexora-creation-logo.svg"
            alt="Nexora Creation — SEO Analyzer"
            width={130}
            height={28}
            className="h-6 sm:h-8 w-auto"
            priority
            style={{ objectFit: "contain", width: "auto", height: "auto" }}
          />
        </Link>

        <div className="hidden md:flex items-center gap-2">
          <Link
            href="/methodology"
            className="rounded-full px-3.5 py-2 text-sm text-text-tertiary hover:text-text-primary hover:bg-white/5 transition-colors"
          >
            Methodology
          </Link>
          <Link
            href="/privacy"
            className="rounded-full px-3.5 py-2 text-sm text-text-tertiary hover:text-text-primary hover:bg-white/5 transition-colors"
          >
            Privacy
          </Link>
          <Link
            href="/"
            className="ml-2 inline-flex items-center gap-1.5 rounded-full bg-brand px-5 py-2 text-sm font-medium text-black hover:bg-brand-hover transition-colors"
          >
            <svg
              width="14"
              height="14"
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
          className="md:hidden flex h-11 w-11 items-center justify-center rounded-full text-text-secondary hover:text-text-primary hover:bg-white/10 transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-expanded={menuOpen}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-controls="mobile-menu"
          type="button"
          style={{ minWidth: "44px", minHeight: "44px" }}
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
            className="md:hidden pointer-events-auto mt-3 mx-4 w-[calc(100%-2rem)] rounded-2xl border border-zinc-700/60 bg-bg-primary/95 backdrop-blur-xl shadow-xl overflow-hidden"
            onKeyDown={handleKeyDown}
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
            initial={reduced ? false : { opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduced ? undefined : { opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.25, ease: EASE_OUT_EXPO }}
          >
            <div className="flex flex-col gap-1 p-3">
              <Link
                href="/methodology"
                className="block rounded-xl px-4 py-3.5 text-sm text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors"
                tabIndex={0}
              >
                Methodology
              </Link>
              <Link
                href="/privacy"
                className="block rounded-xl px-4 py-3.5 text-sm text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors"
                tabIndex={0}
              >
                Privacy
              </Link>
              <Link
                href="/terms"
                className="block rounded-xl px-4 py-3.5 text-sm text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors"
                tabIndex={0}
              >
                Terms
              </Link>
              <hr className="my-1 border-zinc-800" />
              <Link
                href="/"
                className="flex items-center justify-center gap-2 rounded-xl bg-brand px-4 py-3.5 text-sm font-medium text-black hover:bg-brand-hover transition-colors"
                tabIndex={0}
              >
                <svg
                  width="14"
                  height="14"
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
