import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const siteName = "Nexora SEO Analyzer";

export function createMetadata(overrides: {
  title: string;
  description: string;
  path: string;
  noindex?: boolean;
}): Metadata {
  const url = `${siteUrl}${overrides.path}`;

  return {
    title: `${overrides.title} | ${siteName}`,
    description: overrides.description,
    alternates: { canonical: url },
    openGraph: {
      title: `${overrides.title} | ${siteName}`,
      description: overrides.description,
      url,
      siteName,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${overrides.title} | ${siteName}`,
      description: overrides.description,
    },
    robots: overrides.noindex ? { index: false, follow: true } : undefined,
  };
}
