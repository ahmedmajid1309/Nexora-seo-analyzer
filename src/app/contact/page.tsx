import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "Contact — Nexora SEO Analyzer",
  description:
    "Contact Nexora Creation about technical SEO, product engineering, and verified audit implementation support.",
};

export default function ContactPage() {
  return (
    <main className="py-28 sm:py-32">
      <Container>
        <div className="mx-auto max-w-4xl space-y-8">
          <div className="space-y-4 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand">Contact</p>
            <h1 className="font-display text-4xl font-semibold tracking-tight text-text-primary sm:text-5xl">
              Need help acting on an audit?
            </h1>
            <p className="mx-auto max-w-2xl text-base leading-8 text-text-secondary">
              Nexora Creation can help translate verified findings into implementation work,
              technical SEO fixes, and polished product experiences.
            </p>
          </div>
          <Card className="grid gap-6 p-6 sm:p-8 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <h2 className="font-display text-2xl font-semibold text-text-primary">
                Start with the audit result
              </h2>
              <p className="mt-3 text-base leading-7 text-text-secondary">
                Share the report URL or the request ID when contacting Nexora so the discussion
                stays tied to verified evidence.
              </p>
            </div>
            <Link
              href="https://nexoracreation.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-brand px-6 py-3 text-sm font-medium text-black shadow-lg shadow-brand/20 transition-all hover:bg-brand-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary"
            >
              Visit Nexora Creation
            </Link>
          </Card>
        </div>
      </Container>
    </main>
  );
}
