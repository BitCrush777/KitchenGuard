"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "../../lib/utils";

interface AnimatedButtonProps extends HTMLMotionProps<"button"> {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "subtle";
  className?: string;
  showSheen?: boolean;
}

export function AnimatedButton({
  children,
  variant = "primary",
  className,
  showSheen = false,
  ...props
}: AnimatedButtonProps) {
  const baseClasses = {
    primary:
      "bg-primary text-on-primary hover:bg-primary-container shadow-md font-semibold text-sm",
    secondary:
      "bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-semibold text-xs sm:text-sm",
    subtle:
      "bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold text-xs",
  }[variant];

  return (
    <motion.button
      whileHover={{ scale: 1.015, y: -1 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={cn(
        "relative overflow-hidden inline-flex items-center justify-center gap-2 rounded-xl transition-colors cursor-pointer select-none",
        baseClasses,
        className
      )}
      {...props}
    >
      {showSheen && (
        <span
          className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 hover:translate-x-full"
          aria-hidden="true"
        />
      )}
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </motion.button>
  );
}
