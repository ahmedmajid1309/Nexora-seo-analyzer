import Link from "next/link";
import Image from "next/image";

export function SiteFooter() {
  return (
    <footer className="border-t border-zinc-800/60 bg-gradient-to-b from-bg-primary to-bg-card no-print">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 md:px-10 lg:px-12">
        <div className="flex flex-col items-center gap-8 sm:flex-row sm:justify-between">
          <Link
            href="/"
            className="inline-flex shrink-0 items-center"
            aria-label="Nexora SEO Analyzer homepage"
          >
            <span className="relative block h-[34px] w-[124px] shrink-0 sm:h-[38px] sm:w-[140px] lg:h-[42px] lg:w-[168px]">
              <Image
                src="/brand/nexora-logo-main.svg"
                alt="Nexora SEO Analyzer"
                fill
                sizes="(max-width: 639px) 124px, (max-width: 1023px) 140px, 168px"
                className="object-contain object-center sm:object-left"
              />
            </span>
          </Link>
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-3">
            <Link
              href="/methodology"
              className="text-sm text-text-tertiary hover:text-text-secondary transition-colors"
            >
              Methodology
            </Link>
            <Link
              href="/privacy"
              className="text-sm text-text-tertiary hover:text-text-secondary transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="text-sm text-text-tertiary hover:text-text-secondary transition-colors"
            >
              Terms
            </Link>
            <a
              href="https://nexoracreation.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-text-tertiary hover:text-text-secondary transition-colors"
            >
              Nexora Creation
            </a>
          </div>
        </div>
        <div className="mt-10 pt-8 border-t border-zinc-800/40 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-text-tertiary">
            &copy; {new Date().getFullYear()} Nexora Creation. All rights reserved.
          </p>
          <p className="text-sm text-text-tertiary">Built with precision. Zero compromises.</p>
        </div>
      </div>
    </footer>
  );
}
