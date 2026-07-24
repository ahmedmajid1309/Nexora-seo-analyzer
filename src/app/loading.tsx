export default function Loading() {
  return (
    <div
      className="mx-auto w-full max-w-6xl px-4 py-20 text-center sm:px-6 lg:px-8"
      role="status"
      aria-live="polite"
      aria-label="Loading page"
    >
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -left-32 -top-32 h-[500px] w-[500px] rounded-full bg-brand/5 blur-[120px]" />
        <div className="absolute -right-32 bottom-1/3 h-[400px] w-[400px] rounded-full bg-brand/3 blur-[100px]" />
      </div>
      <div className="mx-auto max-w-lg relative z-10">
        <div className="flex justify-center">
          <svg
            className="h-10 w-10 animate-spin text-brand"
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
        </div>
        <h2 className="mt-6 text-xl font-bold text-text-primary">Loading&hellip;</h2>
        <p className="mt-2 text-sm text-text-secondary">Preparing the page for you.</p>
      </div>
    </div>
  );
}
