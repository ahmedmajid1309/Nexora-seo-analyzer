import Link from "next/link";
import Image from "next/image";

export function SiteFooter() {
  return (
    <footer className="border-t border-zinc-800/60 bg-gradient-to-b from-bg-primary to-bg-card no-print">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 md:px-10 lg:px-12">
        <div className="flex flex-col items-center gap-8 sm:flex-row sm:justify-between">
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <Image
              src="/brand/nexora-logo-main.svg"
              alt="Nexora SEO Analyzer"
              width={160}
              height={44}
              className="h-9 w-auto"
              style={{ objectFit: "contain", width: "auto", height: "auto" }}
            />
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
              href="https://nexora.de"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-text-tertiary hover:text-text-secondary transition-colors"
            >
              Nexora.de
            </a>
          </div>
        </div>
        <div className="mt-10 pt-8 border-t border-zinc-800/40 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-text-tertiary">
            &copy; {new Date().getFullYear()} Nexora Creation. All rights reserved.
          </p>
          <p className="text-xs text-text-tertiary/40">Built with precision. Zero compromises.</p>
        </div>
      </div>
    </footer>
  );
}
