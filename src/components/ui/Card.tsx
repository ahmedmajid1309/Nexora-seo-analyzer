type CardProps = {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "section" | "article";
  hover?: boolean;
};

export function Card({ children, className, as: Tag = "div", hover = false }: CardProps) {
  return (
    <Tag
      className={`rounded-xl border border-zinc-800 bg-bg-card p-4 shadow-sm sm:p-5 lg:p-6 ${hover ? "transition-all duration-[250ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 hover:border-zinc-700 hover:shadow-lg hover:shadow-black/20" : ""} ${className ?? ""}`}
    >
      {children}
    </Tag>
  );
}
