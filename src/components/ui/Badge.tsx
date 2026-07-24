type BadgeProps = {
  children: React.ReactNode;
  variant?: "success" | "warning" | "critical" | "info" | "neutral";
  className?: string;
};

export function Badge({ children, variant = "neutral", className }: BadgeProps) {
  const variants = {
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
    critical: "bg-critical/10 text-critical",
    info: "bg-info/10 text-info",
    neutral: "bg-bg-tertiary text-text-secondary",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variants[variant]} ${className ?? ""}`}
    >
      {children}
    </span>
  );
}
