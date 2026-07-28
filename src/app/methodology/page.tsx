import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card } from "@/components/ui/Card";
import { PAGE_TOP_OFFSET } from "@/lib/constants";
import { createMetadata } from "@/lib/metadata";

export const metadata: Metadata = createMetadata({
  title: "Methodology",
  description:
    "How Nexora SEO Analyzer performs deterministic, evidence-based audits without fabricated data or ranking predictions.",
  path: "/methodology",
});

export default function MethodologyPage() {
  return (
    <Container className="pb-16 sm:pb-20" style={{ paddingTop: `${PAGE_TOP_OFFSET}px` }}>
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
              Optional AI executive summaries can be enabled with server-side Gemini or Groq
              credentials. Deterministic checks and scoring remain authoritative. AI cannot create
              findings, change severity, modify evidence, or adjust scores. When provider keys are
              absent or summaries are disabled, a deterministic fallback summary is used.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-text-primary">
              Exact Affected-Page Attribution
            </h3>
            <p className="mt-2 text-text-secondary">
              Every failed or warning finding includes the requested URL, final URL, pathname, and
              page title when available. The report shows the affected page before impact or fix
              copy so remediation can be tied to a specific document.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-text-primary">
              Observed Evidence and Expected State
            </h3>
            <p className="mt-2 text-text-secondary">
              Findings separate what was observed from what was expected. Observed evidence comes
              from URL analysis, response headers, static HTML, rendered DOM, or optional PageSpeed
              data. Expected state describes the rule target without fabricating values that were
              not collected.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-text-primary">
              Optional Performance Diagnostics
            </h3>
            <p className="mt-2 text-text-secondary">
              Performance diagnostics use PageSpeed only when configured and available. If PageSpeed
              is disabled, rate-limited, or cannot return usable data, the core audit still
              completes from deterministic page evidence.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-text-primary">Unavailable Is Not Zero</h3>
            <p className="mt-2 text-text-secondary">
              Unavailable means the audit could not observe a signal or optional provider result. It
              is displayed explicitly and may lower confidence, but it is never converted into a
              fake zero score.
            </p>
          </div>
        </Card>
      </article>
    </Container>
  );
}
