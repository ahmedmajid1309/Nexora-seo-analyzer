type SectionHeadingProps = {
  tag?: "h2" | "h3" | "h4";
  children: React.ReactNode;
  className?: string;
};

export function SectionHeading({ tag: Tag = "h2", children, className }: SectionHeadingProps) {
  return (
    <Tag
      className={`text-[clamp(1.75rem,4vw,3rem)] font-bold tracking-tight text-text-primary leading-[1.1] ${className ?? ""}`}
    >
      {children}
    </Tag>
  );
}
