import type { Metadata } from "next";
import { Space_Grotesk, Manrope, Geist_Mono } from "next/font/google";
import "@/styles/globals.css";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { CinematicBackground } from "@/components/layout/CinematicBackground";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Nexora SEO Analyzer — Free, Evidence-Based SEO Audit Tool",
  description:
    "Free, no-signup SEO audit tool. Enter any URL and receive a detailed, evidence-based forensic report with prioritized, actionable recommendations across 14 categories.",
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/icon.svg",
  },
  openGraph: {
    title: "Nexora SEO Analyzer — Free, No-Signup SEO Audit Tool",
    description:
      "Enter any URL and receive a detailed, evidence-based forensic report with prioritized, actionable recommendations across 14 categories.",
    url: "https://nexora-seo-analyzer.vercel.app",
    siteName: "Nexora SEO Analyzer",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${manrope.variable} ${geistMono.variable}`}
    >
      <body className="flex min-h-screen flex-col bg-bg-primary antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-xl focus:bg-brand focus:px-5 focus:py-3 focus:text-black focus:shadow-2xl focus:font-medium"
        >
          Skip to main content
        </a>
        <SiteHeader />
        <CinematicBackground />
        <main id="main-content" className="flex-1 relative z-10">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
