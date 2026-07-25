type SerpPreviewProps = {
  title: string | null;
  description: string | null;
  canonicalUrl: string | null;
  displayUrl: string;
  titleWidth?: number;
  titleTruncated?: boolean;
  descriptionWidth?: number;
  descriptionTruncated?: boolean;
};

export function SerpPreview({ title, description, canonicalUrl, displayUrl }: SerpPreviewProps) {
  const visibleUrl = displayUrl
    .replace(/^https?:\/\//, "")
    .replace(/\/$/, "")
    .split("/")
    .map((p, i) => (i === 0 ? p : ` › ${p}`))
    .join("");

  return (
    <div className="h-full max-w-full overflow-hidden rounded-2xl border border-zinc-800 bg-gradient-to-b from-bg-elevated to-bg-card p-5 shadow-md shadow-black/10">
      <p className="mb-4 text-[13px] font-semibold uppercase tracking-wider text-brand">
        Google SERP Preview{" "}
        <span className="font-normal normal-case text-text-tertiary">(Approximation)</span>
      </p>
      <div className="space-y-2 rounded-xl bg-white p-4 shadow-inner">
        <div className="flex items-center gap-1 text-[13px] text-gray-600">
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
            className="text-gray-400"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
          </svg>
          <span className="truncate">{visibleUrl}</span>
        </div>
        <p className="text-base font-medium leading-tight text-blue-800">
          {title || "Missing title tag"}
        </p>
        {description ? (
          <p className="line-clamp-2 text-[15px] leading-snug text-gray-700">{description}</p>
        ) : (
          <p className="text-[15px] leading-snug text-gray-500">
            No meta description found. Add a concise description so search snippets have a clear
            fallback.
          </p>
        )}
      </div>
      <div className="mt-4 space-y-1 text-[13px] text-text-tertiary">
        <p>Audited display URL: {visibleUrl}</p>
        {canonicalUrl && <p>Canonical: {canonicalUrl}</p>}
      </div>
      <p className="mt-3 text-[13px] text-text-tertiary">
        This is an approximation. Actual search snippets may differ.
      </p>
    </div>
  );
}
