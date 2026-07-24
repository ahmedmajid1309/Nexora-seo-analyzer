"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-bg-primary">
        <div className="mx-auto max-w-md px-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-critical/10">
            <span className="text-2xl text-critical" aria-hidden="true">
              !
            </span>
          </div>
          <h1 className="mt-6 text-2xl font-bold text-text-primary">Critical error</h1>
          <p className="mt-2 text-text-secondary">
            A critical error occurred. Please refresh the page or try again later.
          </p>
          <button
            onClick={reset}
            className="mt-6 inline-flex items-center justify-center rounded-lg bg-brand px-6 py-3 text-sm font-medium text-black hover:bg-brand-hover transition-colors"
          >
            Refresh
          </button>
        </div>
      </body>
    </html>
  );
}
