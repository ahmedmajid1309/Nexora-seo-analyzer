"use client";

import { motion } from "motion/react";

type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
  size?: "md" | "lg";
};

export function Button({
  children,
  onClick,
  type = "button",
  disabled = false,
  variant = "primary",
  className,
  size = "md",
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded-xl font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary disabled:cursor-not-allowed disabled:opacity-50";

  const sizes = {
    md: "px-6 py-3 text-sm",
    lg: "px-8 py-4 text-base sm:text-[16px]",
  };

  const variants = {
    primary: "bg-brand text-black hover:bg-brand-hover shadow-lg shadow-brand/20",
    secondary: "border border-zinc-700 bg-transparent text-text-primary hover:bg-bg-tertiary",
    ghost: "bg-transparent text-text-secondary hover:text-text-primary hover:bg-bg-tertiary",
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${sizes[size]} ${variants[variant]} ${className ?? ""}`}
      whileHover={disabled ? {} : { scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.97 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.button>
  );
}
