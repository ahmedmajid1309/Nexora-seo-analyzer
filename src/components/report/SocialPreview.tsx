type SocialPreviewProps = {
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
  twitterCard: string | null;
};

export function SocialPreview({
  ogTitle,
  ogDescription,
  ogImage,
  twitterCard,
}: SocialPreviewProps) {
  const hasAny = ogTitle || ogDescription || ogImage;
  const hasTwitter = twitterCard && twitterCard !== "summary_large_image";

  return (
    <div className="space-y-4">
      {/* Open Graph Preview */}
      <div className="rounded-xl border border-zinc-800 bg-gradient-to-b from-bg-elevated to-bg-card p-4 shadow-md shadow-black/10">
        <p className="mb-3 text-[13px] font-medium uppercase tracking-wider text-text-tertiary">
          Open Graph Preview <span className="font-normal normal-case">(Approximation)</span>
        </p>
        {hasAny ? (
          <div className="overflow-hidden rounded-lg border border-zinc-700 bg-black/20">
            {ogImage && (
              <div className="aspect-[1.91/1] w-full bg-bg-elevated flex items-center justify-center overflow-hidden">
                <span className="max-w-full truncate px-2 text-xs text-text-tertiary">
                  OG Image: {ogImage}
                </span>
              </div>
            )}
            <div className="p-3 bg-bg-card/80">
              <p className="text-sm font-medium text-text-primary line-clamp-1">
                {ogTitle || "[No og:title]"}
              </p>
              <p className="mt-1 text-xs text-text-tertiary line-clamp-2">
                {ogDescription || "[No og:description]"}
              </p>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-zinc-700 bg-bg-card/30 p-6 text-center">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="mx-auto text-text-tertiary"
              aria-hidden="true"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
            <p className="mt-2 text-sm text-text-tertiary italic">No Open Graph metadata found</p>
          </div>
        )}
        <p className="mt-3 text-[13px] text-text-tertiary">
          How your page appears when shared on social platforms. Actual rendering may vary.
        </p>
      </div>

      {/* Twitter/X Preview */}
      {hasTwitter && (
        <div className="rounded-xl border border-zinc-800 bg-gradient-to-b from-bg-elevated to-bg-card p-4 shadow-md shadow-black/10">
          <p className="mb-3 text-[13px] font-medium uppercase tracking-wider text-text-tertiary">
            Twitter/X Preview <span className="font-normal normal-case">(Approximation)</span>
          </p>
          <div className="rounded-lg bg-bg-card/50 p-3">
            <p className="text-sm text-text-tertiary">
              Card type: <span className="technical-value text-text-primary">{twitterCard}</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
