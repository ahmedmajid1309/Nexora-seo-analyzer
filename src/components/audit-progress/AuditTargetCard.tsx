function sanitizeTarget(rawUrl: string): { host: string; pathname: string; secure: boolean } {
  try {
    const url = new URL(rawUrl);
    return {
      host: url.hostname,
      pathname: url.pathname === "/" ? "/" : url.pathname.slice(0, 80),
      secure: url.protocol === "https:",
    };
  } catch {
    return { host: rawUrl.slice(0, 80), pathname: "/", secure: false };
  }
}

export function AuditTargetCard({ url, mode }: { url: string; mode: "quick" | "site" }) {
  const target = sanitizeTarget(url);
  return (
    <section className="rounded-3xl border border-border-subtle bg-bg-card/90 p-5 shadow-2xl shadow-black/30 sm:p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand">
        {mode === "site" ? "Site Audit Target" : "Page Audit Target"}
      </p>
      <h1 className="mt-3 break-all font-display text-2xl font-semibold text-text-primary sm:text-3xl">
        {target.host}
      </h1>
      <p className="mt-2 break-all font-mono text-sm text-text-secondary">{target.pathname}</p>
      <div className="mt-5 flex flex-wrap gap-2 text-sm">
        <span className="rounded-full border border-success/25 bg-success/10 px-3 py-1.5 text-success">
          {target.secure ? "Secure HTTPS target" : "HTTP target verified before fetch"}
        </span>
        <span className="rounded-full border border-border-subtle bg-bg-secondary px-3 py-1.5 text-text-secondary">
          Query strings hidden from progress UI
        </span>
      </div>
    </section>
  );
}
