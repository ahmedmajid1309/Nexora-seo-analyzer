import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { createMetadata } from "@/lib/metadata";

export const metadata: Metadata = createMetadata({
  title: "Privacy Policy",
  description:
    "How Nexora SEO Analyzer handles your data. Reports are unlisted and noindex by default.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <Container className="py-16 sm:py-20">
      <article className="mx-auto max-w-3xl">
        <div className="mb-4">
          <Badge variant="warning">Draft &mdash; Requires professional legal review</Badge>
        </div>
        <SectionHeading>Privacy Policy</SectionHeading>

        <Card className="mt-8 space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-text-primary">What we collect</h3>
            <p className="mt-2 text-text-secondary">
              When you submit a URL for analysis, we receive the URL you provide. At this stage, no
              audit is executed and no page content is fetched.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-text-primary">Report privacy</h3>
            <p className="mt-2 text-text-secondary">
              When report functionality is later implemented, all user-generated audit reports will
              be <strong>unlisted</strong> (accessible only via the generated URL, not listed or
              discoverable) and will include a <strong>noindex</strong> robots meta tag. Only
              curated Nexora-created example reports may be indexed and discoverable.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-text-primary">Third-party services</h3>
            <p className="mt-2 text-text-secondary">
              When PageSpeed Insights integration is enabled (via the <code>PAGESPEED_API_KEY</code>{" "}
              environment variable), the URL you submit is sent to the Google PageSpeed Insights API
              v5 for performance analysis. Google may collect the URL and related data in accordance
              with the{" "}
              <a
                href="https://policies.google.com/privacy"
                className="underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Google Privacy Policy
              </a>
              . This feature is optional and does not affect the core static audit functionality.
            </p>
            <p className="mt-3 text-text-secondary">
              Optional AI executive summaries are disabled by default. If enabled with server-side
              Gemini or Groq credentials, Nexora sends a minimized evidence pack containing verified
              audit findings, scores, affected URLs, and remediation summaries to the configured
              provider. Raw HTML is not sent for summaries, provider secrets are never exposed to
              the browser, and AI summaries do not change deterministic scores or findings.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-text-primary">Data retention</h3>
            <p className="mt-2 text-text-secondary">
              Raw HTML snapshots will not be retained by default. Audit results may be stored
              temporarily to enable report sharing. Retention periods will be clearly documented
              when storage is implemented.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-text-primary">Current status</h3>
            <p className="mt-2 text-text-secondary">
              When you submit a URL for analysis, Nexora fetches the page content server-side to
              perform static SEO analysis. If a PageSpeed Insights API key is configured, the URL is
              also sent to the Google PageSpeed Insights API for performance metrics. If optional AI
              summaries are enabled, the verified audit evidence pack may be sent to the configured
              AI provider. No audit data is stored server-side, and no reports are persisted at this
              stage.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-text-primary">Contact</h3>
            <p className="mt-2 text-text-secondary">
              If you have questions about this privacy policy, please contact Nexora Creation.
            </p>
          </div>
        </Card>
      </article>
    </Container>
  );
}
