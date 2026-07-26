export function ScanViewport({ reduced = false }: { reduced?: boolean }) {
  return (
    <div className="relative min-h-[260px] overflow-hidden rounded-3xl border border-brand/20 bg-[radial-gradient(circle_at_top,rgba(254,199,0,0.12),transparent_36%),linear-gradient(135deg,#111,#050505)] p-5">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px)] bg-[size:32px_32px]" />
      {!reduced ? (
        <div className="absolute inset-x-8 top-10 h-24 rounded-full bg-brand/10 blur-2xl motion-safe:animate-pulse" />
      ) : null}
      {!reduced ? (
        <div className="absolute left-0 top-0 h-full w-1/3 bg-gradient-to-r from-transparent via-brand/20 to-transparent motion-safe:animate-[scan-x_2.8s_ease-in-out_infinite]" />
      ) : null}
      <div className="relative z-10 mx-auto mt-8 max-w-md rounded-2xl border border-border-subtle bg-black/45 p-4 shadow-2xl">
        <div className="flex items-center gap-2 border-b border-border-subtle pb-3">
          <span className="h-3 w-3 rounded-full bg-critical/80" />
          <span className="h-3 w-3 rounded-full bg-warning/80" />
          <span className="h-3 w-3 rounded-full bg-success/80" />
          <span className="ml-2 h-3 flex-1 rounded-full bg-white/10" />
        </div>
        <div className="mt-5 space-y-3">
          <div className="h-4 w-3/4 rounded bg-white/12" />
          <div className="h-3 w-full rounded bg-white/8" />
          <div className="h-3 w-5/6 rounded bg-white/8" />
          <div className="grid grid-cols-3 gap-3 pt-3">
            <div className="h-14 rounded-xl border border-brand/20 bg-brand/10" />
            <div className="h-14 rounded-xl border border-white/10 bg-white/5" />
            <div className="h-14 rounded-xl border border-white/10 bg-white/5" />
          </div>
        </div>
      </div>
      <p className="relative z-10 mt-6 text-center text-sm text-text-secondary">
        Scanner viewport is illustrative; stages and counters are driven by observed audit state.
      </p>
    </div>
  );
}
