"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Button } from "@/components/ui/Button";

const formSchema = z.object({
  url: z
    .string()
    .trim()
    .min(1, "Please enter a website URL")
    .max(2048, "URL is too long")
    .transform((val) =>
      val.startsWith("http://") || val.startsWith("https://") ? val : `https://${val}`,
    )
    .pipe(z.string().url("Please enter a valid URL")),
  keyword: z.string().max(500).trim().optional(),
});

export function AuditForm() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [keyword, setKeyword] = useState("");
  const [errors, setErrors] = useState<{ url?: string; keyword?: string }>({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setErrors({});

      const result = formSchema.safeParse({ url, keyword: keyword || undefined });
      if (!result.success) {
        const fieldErrors = result.error.flatten().fieldErrors;
        setErrors({
          url: fieldErrors.url?.[0],
          keyword: fieldErrors.keyword?.[0],
        });
        return;
      }

      setSubmitting(true);
      const params = new URLSearchParams({ url: result.data.url });
      if (result.data.keyword) params.set("keyword", result.data.keyword);
      router.push(`/result?${params.toString()}`);
    },
    [url, keyword, router],
  );

  const inputBase =
    "w-full rounded-xl border bg-bg-card px-4 py-[13px] text-base sm:text-[16px] text-text-primary placeholder:text-text-tertiary transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary disabled:cursor-not-allowed disabled:opacity-50 border-zinc-700 hover:border-zinc-500";

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="url" className="sr-only">
          Website URL
        </label>
        <div className="relative">
          <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
          </div>
          <input
            id="url"
            type="url"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              if (errors.url) setErrors((prev) => ({ ...prev, url: undefined }));
            }}
            placeholder="https://example.com"
            required
            disabled={submitting}
            autoComplete="url"
            spellCheck={false}
            autoFocus
            aria-invalid={errors.url ? "true" : undefined}
            aria-describedby={errors.url ? "url-error" : undefined}
            className={`${inputBase} pl-11`}
          />
        </div>
        {errors.url && (
          <p id="url-error" className="text-xs text-critical" role="alert">
            {errors.url}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="keyword" className="sr-only">
          Target keyword (optional)
        </label>
        <div className="relative">
          <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </div>
          <input
            id="keyword"
            type="text"
            value={keyword}
            onChange={(e) => {
              setKeyword(e.target.value);
              if (errors.keyword) setErrors((prev) => ({ ...prev, keyword: undefined }));
            }}
            placeholder="Target keyword (optional)"
            disabled={submitting}
            autoComplete="off"
            aria-invalid={errors.keyword ? "true" : undefined}
            className={`${inputBase} pl-11`}
          />
        </div>
        {errors.keyword && (
          <p className="text-xs text-critical" role="alert">
            {errors.keyword}
          </p>
        )}
      </div>

      <Button
        type="submit"
        disabled={submitting}
        className="w-full py-[13px] text-base min-h-[48px]"
      >
        {submitting ? (
          <span className="flex items-center gap-2">
            <svg
              className="h-4 w-4 animate-spin"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Starting audit...
          </span>
        ) : (
          "Analyze Website"
        )}
      </Button>
    </form>
  );
}
