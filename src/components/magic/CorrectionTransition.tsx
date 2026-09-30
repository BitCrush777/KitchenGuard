"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { History } from "lucide-react";
import { cn } from "../../lib/utils";

interface CorrectionTransitionProps {
  previousValue: string;
  newValue: string;
  unit?: string;
  reason?: string;
  className?: string;
}

export function CorrectionTransition({
  previousValue,
  newValue,
  unit = "",
  reason = "Voice correction",
  className,
}: CorrectionTransitionProps) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <motion.div
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-1.5 text-xs text-[#c07a1d] font-semibold"
      >
        <History className="w-3.5 h-3.5" />
        <span>{reason}</span>
      </motion.div>

      <div className="grid grid-cols-2 gap-4 bg-surface-container-low p-4 rounded-xl border border-surface-container-high/50">
        {/* Previous Value */}
        <div className="flex flex-col">
          <span className="text-[11px] font-bold text-secondary uppercase tracking-wider">
            PREVIOUS LOG
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <motion.span
              initial={{ opacity: 1 }}
              animate={{ opacity: 0.55 }}
              className="line-through text-3xl sm:text-4xl font-bold text-secondary"
            >
              {previousValue}{unit}
            </motion.span>
            <span className="text-xs text-secondary">Initial parse</span>
          </div>
        </div>

        {/* New Corrected Value with precise reveal */}
        <div className="flex flex-col">
          <span className="text-[11px] font-bold text-[#c07a1d] uppercase tracking-wider">
            CORRECTED READING
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <AnimatePresence mode="wait">
              <motion.span
                key={newValue}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="text-3xl sm:text-4xl font-bold text-on-surface"
              >
                {newValue}{unit}
              </motion.span>
            </AnimatePresence>
            <span className="text-xs text-on-surface-variant">Worker re-stated</span>
          </div>
        </div>
      </div>
    </div>
  );
}
