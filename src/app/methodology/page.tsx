import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card } from "@/components/ui/Card";
import { createMetadata } from "@/lib/metadata";

export const metadata: Metadata = createMetadata({
  title: "Methodology",
  description:
    "How Nexora SEO Analyzer performs deterministic, evidence-based audits without fabricated data or ranking predictions.",
  path: "/methodology",
});

export default function MethodologyPage() {
  return (
    <Container className="py-16 sm:py-20">
      <article className="mx-auto max-w-3xl">
        <SectionHeading>Methodology</SectionHeading>

        <Card className="mt-8 space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-text-primary">Deterministic Checks</h3>
            <p className="mt-2 text-text-secondary">
              Every finding in a Nexora SEO audit is the result of a deterministic check against the
              actual page content or HTTP response. Our engine does not guess, estimate, or use
              statistical models to produce findings. Each check has a clear pass/fail/warning
              criterion defined in code.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-text-primary">Contextual Applicability</h3>
            <p className="mt-2 text-text-secondary">
              Not every check applies to every page. Our applicability model classifies the page
              type (homepage, article, product page, etc.) and only runs checks that are relevant.
              Irrelevant checks return <strong>not-applicable</strong> and do not affect the score.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-text-primary">
              Not-Applicable and Unavailable States
            </h3>
            <p className="mt-2 text-text-secondary">
              Checks can return <strong>not-applicable</strong> when the page type does not require
              them (e.g., FAQ schema on a non-FAQ page). They can return{" "}
              <strong>unavailable</strong> when required data could not be collected (e.g., rendered
              DOM not captured for JavaScript analysis). Neither state penalises the overall score.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-text-primary">Transparent Scoring</h3>
            <p className="mt-2 text-text-secondary">
              Each category is weighted by its impact on SEO health. The overall score is a weighted
              average of category scores. Critical issues cap the maximum score to ensure that
              severe problems are not buried by passing checks. Every score is traceable to the
              individual findings that produced it.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-text-primary">AEO and GEO Readiness</h3>
            <p className="mt-2 text-text-secondary">
              We include checks for answer engine optimisation (AEO) and generative engine
              optimisation (GEO) readiness. These are emerging fields and our checks indicate
              structural readiness only. They do not guarantee visibility in AI-powered search
              results or answers.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-text-primary">AI Is Not in Control</h3>
            <p className="mt-2 text-text-secondary">
              Artificial intelligence (Gemini or Groq) may optionally be used in a future phase to
              generate natural-language executive summaries. AI will never invent findings, change
              scores, or fabricate evidence. The deterministic engine is the single source of truth
              for all findings and scores.
            </p>
          </div>
        </Card>
      </article>
    </Container>
  );
}
