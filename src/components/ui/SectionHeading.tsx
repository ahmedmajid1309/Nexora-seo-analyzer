type SectionHeadingProps = {
  tag?: "h2" | "h3" | "h4";
  children: React.ReactNode;
  className?: string;
};

export function SectionHeading({ tag: Tag = "h2", children, className }: SectionHeadingProps) {
  return (
    <Tag
      className={`text-xl font-bold tracking-tight text-text-primary sm:text-2xl lg:text-3xl ${className ?? ""}`}
    >
      {children}
    </Tag>
  );
}
