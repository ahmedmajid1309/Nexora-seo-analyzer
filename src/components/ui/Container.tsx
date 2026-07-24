type ContainerProps = {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "section" | "article" | "main";
};

export function Container({ children, className, as: Tag = "div" }: ContainerProps) {
  return (
    <Tag className={`mx-auto w-full max-w-7xl px-5 sm:px-6 md:px-10 lg:px-12 ${className ?? ""}`}>
      {children}
    </Tag>
  );
}
