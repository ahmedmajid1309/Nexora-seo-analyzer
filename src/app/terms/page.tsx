import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { createMetadata } from "@/lib/metadata";

export const metadata: Metadata = createMetadata({
  title: "Terms of Service",
  description: "Terms of service for using Nexora SEO Analyzer.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <Container className="py-16 sm:py-20">
      <article className="mx-auto max-w-3xl">
        <div className="mb-4">
          <Badge variant="warning">Draft &mdash; Requires professional legal review</Badge>
        </div>
        <SectionHeading>Terms of Service</SectionHeading>

        <Card className="mt-8 space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-text-primary">Use of service</h3>
            <p className="mt-2 text-text-secondary">
              Nexora SEO Analyzer is a free, public SEO auditing tool. You may use it to analyse any
              website you have the legal right to audit. You may not use this service to attack,
              overwhelm, or probe the infrastructure of third-party websites.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-text-primary">No warranty</h3>
            <p className="mt-2 text-text-secondary">
              This tool is provided &quot;as is&quot; without warranty of any kind. Audit results
              are for informational purposes only and do not guarantee specific search engine
              rankings or performance outcomes.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-text-primary">Limitation of liability</h3>
            <p className="mt-2 text-text-secondary">
              Nexora Creation shall not be liable for any damages arising from the use or inability
              to use this tool.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-text-primary">Changes</h3>
            <p className="mt-2 text-text-secondary">
              These terms may be updated at any time. Continued use of the tool after changes
              constitutes acceptance of the new terms.
            </p>
          </div>
        </Card>
      </article>
    </Container>
  );
}
