"use client";

import { motion } from "motion/react";

type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
};

export function Button({
  children,
  onClick,
  type = "button",
  disabled = false,
  variant = "primary",
  className,
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded-lg px-6 py-3 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary disabled:cursor-not-allowed disabled:opacity-50";

  const variants = {
    primary: "bg-brand text-black hover:bg-brand-hover",
    secondary: "border border-zinc-700 bg-transparent text-text-primary hover:bg-bg-tertiary",
    ghost: "bg-transparent text-text-secondary hover:text-text-primary hover:bg-bg-tertiary",
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${className ?? ""}`}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.button>
  );
}
