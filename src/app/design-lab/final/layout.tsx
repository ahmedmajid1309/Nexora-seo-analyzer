import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nexora Signal Theatre — Design Prototype",
  description:
    "Flagship design prototype for the Nexora SEO Analyzer. Premium scroll narrative and result workspace.",
  robots: { index: false, follow: false },
};

export default function FinalDesignLabLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
