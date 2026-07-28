"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";

export default function SiteAuditPage() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [pageLimit, setPageLimit] = useState(10);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams({ url, pageLimit: String(pageLimit) });
    router.push(`/site-result?${params.toString()}`);
  }

  return (
    <main className="py-28 sm:py-32">
      <Container>
        <div className="mx-auto max-w-4xl space-y-8">
          <div className="space-y-4 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand">
              Limited Site Audit
            </p>
            <h1 className="font-display text-4xl font-semibold tracking-tight text-text-primary sm:text-5xl">
              Crawl up to 25 pages and find site-wide SEO patterns
            </h1>
            <p className="mx-auto max-w-2xl text-base leading-8 text-text-secondary">
              Phase 11 audits one public origin with bounded crawling, same-origin enforcement,
              cross-page checks, coverage, and transparent aggregate scoring. No signup required.
            </p>
          </div>

          <Card className="p-5 sm:p-7">
            <form className="grid gap-4 md:grid-cols-[1fr_160px_auto]" onSubmit={submit}>
              <Input
                id="site-url"
                label="Starting URL"
                required
                type="url"
                placeholder="https://example.com"
                value={url}
                onChange={setUrl}
              />
              <div>
                <label
                  htmlFor="page-limit"
                  className="mb-2 block text-sm font-medium text-text-primary"
                >
                  Page limit
                </label>
                <input
                  id="page-limit"
                  type="number"
                  min={1}
                  max={25}
                  value={pageLimit}
                  onChange={(event) => setPageLimit(Number(event.target.value))}
                  className="w-full rounded-lg border border-zinc-700 bg-bg-secondary px-4 py-3 text-sm text-text-primary transition-colors hover:border-zinc-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary"
                />
              </div>
              <div className="flex items-end">
                <Button type="submit" className="w-full md:w-auto">
                  Run Site Audit
                </Button>
              </div>
            </form>
          </Card>

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              ["25 pages max", "No unlimited crawl option."],
              ["Same-origin only", "External origins are excluded."],
              ["Secure gateway", "Every URL uses pinned-IP safe fetching."],
            ].map(([title, text]) => (
              <Card key={title} className="p-5">
                <h2 className="font-display text-lg font-semibold text-text-primary">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-text-secondary">{text}</p>
              </Card>
            ))}
          </div>
        </div>
      </Container>
    </main>
  );
}
