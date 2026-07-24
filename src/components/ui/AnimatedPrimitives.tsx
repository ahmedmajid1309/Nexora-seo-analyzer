"use client";

import { motion, useReducedMotion } from "motion/react";
import { type ReactNode } from "react";

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "span" | "section" | "h1" | "h2" | "h3" | "p";
};

export function Reveal({ children, className, delay = 0, as }: RevealProps) {
  const reduced = useReducedMotion();
  const Component = as ? motion[as] : motion.div;
  if (reduced) {
    return <div className={className}>{children}</div>;
  }
  return (
    <Component
      className={className}
      initial={{ opacity: 1, y: 0 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, delay, ease: EASE_OUT_EXPO }}
    >
      {children}
    </Component>
  );
}

type StaggerGroupProps = {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
};

export function StaggerGroup({ children, className, staggerDelay = 0.08 }: StaggerGroupProps) {
  const reduced = useReducedMotion();
  if (reduced) {
    return <div className={className}>{children}</div>;
  }
  return (
    <motion.div
      className={className}
      initial="visible"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={{
        visible: { transition: { staggerChildren: staggerDelay } },
      }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  const reduced = useReducedMotion();
  if (reduced) {
    return <div className={className}>{children}</div>;
  }
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 1, y: 0 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE_OUT_EXPO } },
      }}
    >
      {children}
    </motion.div>
  );
}

type AnimatedNumberProps = {
  value: number;
  className?: string;
};

export function AnimatedNumber({ value, className }: AnimatedNumberProps) {
  const reduced = useReducedMotion();
  if (reduced) {
    return <span className={className}>{value}</span>;
  }
  return (
    <motion.span
      className={className}
      initial={{ opacity: 1 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
    >
      <motion.span
        initial={{ opacity: 1 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.01 }}
      >
        {value}
      </motion.span>
    </motion.span>
  );
}

type CollapsibleMotionProps = {
  isOpen: boolean;
  children: ReactNode;
  className?: string;
};

export function CollapsibleMotion({ isOpen, children, className }: CollapsibleMotionProps) {
  const reduced = useReducedMotion();
  if (reduced) {
    return <div className={`${className ?? ""} ${isOpen ? "" : "hidden"}`}>{children}</div>;
  }
  return (
    <motion.div
      className={className}
      initial={false}
      animate={{
        height: isOpen ? "auto" : 0,
        opacity: isOpen ? 1 : 0,
      }}
      transition={{ duration: 0.2, ease: EASE_OUT_EXPO }}
      style={{ overflow: "hidden" }}
    >
      {children}
    </motion.div>
  );
}
