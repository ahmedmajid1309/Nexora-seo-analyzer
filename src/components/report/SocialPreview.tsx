import Image from "next/image";
import { useState } from "react";

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
  const [imageFailed, setImageFailed] = useState(false);
  const hasAny = resolvedTitle || resolvedDescription || resolvedImage || ogUrl || ogType;
  const showImage = Boolean(resolvedImage) && !imageFailed;
  const imageSrc = showImage ? resolvedImage : null;

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
              {imageSrc ? (
                // The image URL is extracted from the audited page; keep it visually bounded.
                <Image
                  src={imageSrc}
                  alt="Extracted social preview image"
                  width={1200}
                  height={630}
                  className="h-full w-full object-cover"
                  unoptimized
                  onError={() => setImageFailed(true)}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_top_left,rgba(254,199,0,0.28),transparent_34%),linear-gradient(135deg,#151515,#050505)] px-6 text-center">
                  <div className="rounded-2xl border border-brand/30 bg-black/35 px-6 py-5 shadow-2xl shadow-brand/10">
                    <p className="text-3xl font-black tracking-tight text-brand">Nexora</p>
                    <p className="mt-1 text-sm font-semibold text-text-primary">SEO Analyzer</p>
                    <p className="mt-2 text-[13px] text-text-secondary">
                      {resolvedImage
                        ? "Social image could not be rendered"
                        : "No social image found"}
                    </p>
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
