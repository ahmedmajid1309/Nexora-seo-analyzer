type SocialPreviewProps = {
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
  ogUrl: string | null;
  ogType: string | null;
  twitterCard: string | null;
  twitterTitle: string | null;
  twitterDescription: string | null;
  twitterImage: string | null;
};

export function SocialPreview({
  ogTitle,
  ogDescription,
  ogImage,
  ogUrl,
  ogType,
  twitterCard,
  twitterTitle,
  twitterDescription,
  twitterImage,
}: SocialPreviewProps) {
  const resolvedTitle = ogTitle || twitterTitle;
  const resolvedDescription = ogDescription || twitterDescription;
  const resolvedImage = ogImage || twitterImage;
  const hasAny = resolvedTitle || resolvedDescription || resolvedImage || ogUrl || ogType;

  return (
    <div className="h-full space-y-4">
      {/* Open Graph Preview */}
      <div className="h-full rounded-2xl border border-zinc-800 bg-gradient-to-b from-bg-elevated to-bg-card p-5 shadow-md shadow-black/10">
        <p className="mb-4 text-[13px] font-semibold uppercase tracking-wider text-brand">
          Social Preview{" "}
          <span className="font-normal normal-case text-text-tertiary">(Approximation)</span>
        </p>
        {hasAny ? (
          <div className="overflow-hidden rounded-xl border border-zinc-700 bg-black/20">
            <div className="aspect-[1.91/1] w-full overflow-hidden bg-bg-elevated">
              {resolvedImage ? (
                <div className="flex h-full w-full items-center justify-center px-4 text-center">
                  <span className="max-w-full truncate text-[13px] text-text-tertiary">
                    Image: {resolvedImage}
                  </span>
                </div>
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand/15 via-bg-card to-bg-primary px-6 text-center">
                  <div>
                    <p className="text-xl font-bold text-brand">Nexora</p>
                    <p className="mt-1 text-[13px] text-text-secondary">No social image found</p>
                  </div>
                </div>
              )}
            </div>
            <div className="bg-bg-card/80 p-4">
              <p className="line-clamp-1 text-base font-semibold text-text-primary">
                {resolvedTitle || "Missing Open Graph title"}
              </p>
              <p className="mt-1 line-clamp-2 text-[15px] text-text-secondary">
                {resolvedDescription || "No Open Graph description found."}
              </p>
              <div className="mt-3 flex flex-wrap gap-2 text-[13px] text-text-tertiary">
                {ogType && <span>Type: {ogType}</span>}
                {twitterCard && <span>Twitter/X: {twitterCard}</span>}
                {ogUrl && <span className="truncate">URL: {ogUrl}</span>}
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-brand/25 bg-gradient-to-br from-brand/10 via-bg-card to-bg-primary p-6 text-center">
            <p className="text-2xl font-bold text-brand">Nexora</p>
            <p className="mt-3 text-base font-semibold text-text-primary">
              Missing Open Graph metadata
            </p>
            <p className="mt-2 text-[15px] leading-relaxed text-text-secondary">
              Add og:title, og:description, and og:image so shared links have a deliberate preview.
            </p>
          </div>
        )}
        <p className="mt-3 text-[13px] text-text-tertiary">
          How your page appears when shared on social platforms. Actual rendering may vary.
        </p>
      </div>
    </div>
  );
}
