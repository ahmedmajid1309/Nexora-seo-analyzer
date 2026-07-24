"use client";

import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import { useSyncExternalStore } from "react";

type Intensity = "full" | "restrained" | "minimal";

function getIntensity(pathname: string): Intensity {
  if (pathname === "/") return "full";
  if (pathname.startsWith("/result")) return "restrained";
  return "minimal";
}

function useHydrated() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export function CinematicBackground() {
  const pathname = usePathname();
  const intensity = getIntensity(pathname);
  const reduced = useReducedMotion();
  const hydrated = useHydrated();

  if (intensity === "minimal") return null;

  const isFull = intensity === "full";

  const staticRender = (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      <div className="absolute -left-48 -top-48 h-[600px] w-[600px] rounded-full bg-brand/[0.04] blur-[150px]" />
      <div className="absolute -right-48 top-1/3 h-[500px] w-[500px] rounded-full bg-brand/[0.03] blur-[120px]" />
      {isFull && (
        <>
          <div className="absolute left-1/4 top-1/5 h-[700px] w-[700px] rounded-full bg-white/[0.015] blur-[180px]" />
          <div
            className="absolute inset-0 opacity-[0.012]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)",
              backgroundSize: "80px 80px",
            }}
          />
        </>
      )}
    </div>
  );

  if (reduced || !hydrated) return staticRender;

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      <motion.div
        className="absolute -left-48 -top-48 h-[600px] w-[600px] rounded-full bg-brand/[0.04] blur-[150px]"
        animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -right-48 top-1/3 h-[500px] w-[500px] rounded-full bg-brand/[0.03] blur-[120px]"
        animate={{ x: [0, -40, 0], y: [0, 30, 0] }}
        transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
      />
      {isFull && (
        <>
          <motion.div
            className="absolute left-1/4 top-1/5 h-[700px] w-[700px] rounded-full bg-white/[0.015] blur-[180px]"
            animate={{ x: [0, -50, 0], y: [0, 40, 0] }}
            transition={{ duration: 35, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute inset-0 opacity-[0.012]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)",
              backgroundSize: "80px 80px",
            }}
            animate={{ opacity: [0.008, 0.018, 0.008] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
        </>
      )}
    </div>
  );
}
