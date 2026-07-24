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

  const orbSize = intensity === "full" ? "h-[500px] w-[500px]" : "h-[300px] w-[300px]";
  const blur = intensity === "full" ? "blur-[120px]" : "blur-[80px]";
  const opacity = intensity === "full" ? "bg-brand/5" : "bg-brand/3";

  if (reduced || !hydrated) {
    return (
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
        <div className={`absolute -left-32 -top-32 ${orbSize} rounded-full ${opacity} ${blur}`} />
        <div
          className={`absolute -right-32 bottom-1/3 ${orbSize} rounded-full bg-brand/3 ${blur}`}
        />
        {intensity === "full" && (
          <>
            <div className="absolute left-1/3 top-1/4 h-[600px] w-[600px] rounded-full bg-white/[0.02] blur-[150px]" />
            <div
              className="absolute inset-0 opacity-[0.015]"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
                backgroundSize: "60px 60px",
              }}
            />
          </>
        )}
      </div>
    );
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      <motion.div
        className={`absolute -left-32 -top-32 ${orbSize} rounded-full ${opacity} ${blur}`}
        animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className={`absolute -right-32 bottom-1/3 ${orbSize} rounded-full bg-brand/3 ${blur}`}
        animate={{ x: [0, -30, 0], y: [0, 20, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
      />
      {intensity === "full" && (
        <>
          <motion.div
            className="absolute left-1/3 top-1/4 h-[600px] w-[600px] rounded-full bg-white/[0.02] blur-[150px]"
            animate={{ x: [0, -40, 0], y: [0, 30, 0] }}
            transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
          />
          <div
            className="absolute inset-0 opacity-[0.015]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />
        </>
      )}
    </div>
  );
}
