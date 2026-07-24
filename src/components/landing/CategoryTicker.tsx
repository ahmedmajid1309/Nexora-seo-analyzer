"use client";

const categories = [
  "Technical SEO",
  "Metadata & SERP",
  "Content Structure",
  "Performance",
  "Security Headers",
  "Accessibility",
  "Structured Data",
  "Mobile Readiness",
  "Links & URLs",
  "Images & Media",
  "Social Metadata",
  "E-E-A-T Signals",
  "AEO Readiness",
  "GEO Readiness",
];

export function CategoryTicker() {
  const items = [...categories, ...categories];

  return (
    <div className="relative overflow-hidden py-8" role="region" aria-label="Audit categories">
      <div className="absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-bg-primary to-transparent pointer-events-none" />
      <div className="absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-bg-primary to-transparent pointer-events-none" />
      <div
        className="flex gap-3 w-max animate-marquee md:animate-marquee-desktop"
        aria-hidden="true"
      >
        {items.map((cat, i) => (
          <span
            key={`${cat}-${i}`}
            className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-bg-card/50 px-4 py-2 text-xs text-text-tertiary whitespace-nowrap"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-brand/60" />
            {cat}
          </span>
        ))}
      </div>
      <ul className="sr-only">
        {categories.map((cat) => (
          <li key={cat}>{cat}</li>
        ))}
      </ul>
    </div>
  );
}
