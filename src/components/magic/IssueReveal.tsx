"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

interface IssueRevealProps {
  children: React.ReactNode;
  severity?: "low" | "medium" | "high" | "critical";
  className?: string;
  delay?: number;
}

export function IssueReveal({
  children,
  severity = "medium",
  className,
  delay = 0,
}: IssueRevealProps) {
  const isHighOrCritical = severity === "high" || severity === "critical";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.99 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{
        duration: 0.35,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={cn(
        "relative rounded-2xl transition-all",
        isHighOrCritical && "ring-1 ring-error/20",
        className
      )}
    >
      {/* Very subtle status accent pulse for critical issues, strictly non-alarm */}
      {isHighOrCritical && (
        <motion.div
          animate={{ opacity: [0.15, 0.35, 0.15] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="pointer-events-none absolute inset-0 rounded-2xl bg-error/5"
          aria-hidden="true"
        />
      )}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
