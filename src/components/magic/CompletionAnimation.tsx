"use client";

import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { cn } from "../../lib/utils";

interface CompletionAnimationProps {
  className?: string;
  size?: number;
}

export function CompletionAnimation({
  className,
  size = 40,
}: CompletionAnimationProps) {
  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      {/* Restrained subtle breathing halo */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute w-24 h-24 rounded-full bg-primary-fixed/40 pointer-events-none"
      />

      {/* Check Icon with soft spring entrance */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 20,
          delay: 0.1,
        }}
        className="relative z-10 w-20 h-20 rounded-full bg-primary-fixed flex items-center justify-center text-primary shadow-sm"
      >
        <CheckCircle2 style={{ width: size, height: size }} />
      </motion.div>
    </div>
  );
}
