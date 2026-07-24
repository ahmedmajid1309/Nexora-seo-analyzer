import Link from "next/link";
import Image from "next/image";

export function SiteFooter() {
  return (
    <footer className="border-t border-zinc-800 bg-bg-primary no-print">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-5 md:px-8 lg:px-12">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <Image
              src="/brand/nexora-creation-logo.svg"
              alt="Nexora Creation — SEO Analyzer"
              width={150}
              height={32}
              className="h-8 w-auto"
              style={{ objectFit: "contain", width: "auto", height: "auto" }}
            />
          </Link>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
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
        <p className="mt-8 text-center text-xs text-text-tertiary/60">
          &copy; {new Date().getFullYear()} Nexora Creation. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
