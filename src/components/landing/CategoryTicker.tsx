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
  const items = [...categories, ...categories, ...categories];

  return (
    <div
      className="relative overflow-hidden py-10 sm:py-12"
      role="region"
      aria-label="Audit categories"
    >
      <div className="absolute inset-y-0 left-0 z-10 w-16 sm:w-24 bg-gradient-to-r from-bg-primary to-transparent pointer-events-none" />
      <div className="absolute inset-y-0 right-0 z-10 w-16 sm:w-24 bg-gradient-to-l from-bg-primary to-transparent pointer-events-none" />
      <div
        className="flex gap-4 w-max animate-marquee md:animate-marquee-desktop"
        aria-hidden="true"
      >
        {items.map((cat, i) => (
          <span
            key={`${cat}-${i}`}
            className="inline-flex items-center gap-3 rounded-full border border-zinc-800/60 bg-gradient-to-r from-bg-card/50 to-bg-elevated/50 px-5 py-2.5 text-sm sm:text-[15px] text-text-tertiary whitespace-nowrap shadow-sm"
          >
            <span className="h-2 w-2 rounded-full bg-brand/60" />
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
