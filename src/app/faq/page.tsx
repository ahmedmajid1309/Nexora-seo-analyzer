import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "FAQ — Nexora SEO Analyzer",
  description:
    "Answers about Nexora SEO Analyzer scans, privacy, scoring, storage, and optional infrastructure.",
};

const faqs = [
  [
    "Do I need an account?",
    "No. Quick audits and limited site audits can run without mandatory signup.",
  ],
  [
    "Are scores AI-generated?",
    "No. Scores and findings come from deterministic checks. Optional AI only summarizes verified evidence.",
  ],
  [
    "Why can some checks be unavailable?",
    "Unavailable means a provider or optional worker did not return data. It reduces confidence, not the score.",
  ],
  [
    "Are private networks scanned?",
    "No. The scanner rejects localhost, private IP ranges, metadata endpoints, restricted ports, unsafe schemes, and unsafe redirects.",
  ],
  [
    "Can reports be shared?",
    "Saved reports can use owner or share capabilities. Reports remain noindex and share access can be revoked.",
  ],
];

export default function FaqPage() {
  return (
    <main className="py-28 sm:py-32">
      <Container>
        <div className="mx-auto max-w-4xl space-y-8">
          <div className="space-y-4 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand">FAQ</p>
            <h1 className="font-display text-4xl font-semibold tracking-tight text-text-primary sm:text-5xl">
              Transparent answers before you scan
            </h1>
            <p className="mx-auto max-w-2xl text-base leading-8 text-text-secondary">
              Nexora SEO Analyzer is designed to be useful without signup, honest about unavailable
              optional systems, and strict about security boundaries.
            </p>
          </div>
          <div className="space-y-4">
            {faqs.map(([question, answer]) => (
              <Card key={question} className="p-5 sm:p-6">
                <h2 className="font-display text-xl font-semibold text-text-primary">{question}</h2>
                <p className="mt-3 text-base leading-7 text-text-secondary">{answer}</p>
              </Card>
            ))}
          </div>
        </div>
      </Container>
    </main>
  );
}
