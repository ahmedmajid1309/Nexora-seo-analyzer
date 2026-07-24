type CardProps = {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "section" | "article";
  hover?: boolean;
};

export function Card({ children, className, as: Tag = "div", hover = false }: CardProps) {
  return (
    <Tag
      className={`rounded-2xl border border-zinc-800/80 bg-gradient-to-b from-bg-card to-bg-elevated p-5 sm:p-6 shadow-sm ${
        hover
          ? "transition-all duration-[350ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:border-zinc-700 hover:shadow-xl hover:shadow-black/25"
          : ""
      } ${className ?? ""}`}
    >
      {children}
    </Tag>
  );
}
