"use client";

import React from "react";
import { motion } from "framer-motion";
import { Checkpoint } from "../../types/inspection";
import { CheckpointList } from "./CheckpointList";
import { NumberTicker } from "../magic/NumberTicker";

interface InspectionProgressProps {
  completedCount?: number;
  totalCount?: number;
  checkpoints: Checkpoint[];
  estimatedRemaining?: string;
  className?: string;
  onSelectCheckpoint?: (chk: Checkpoint) => void;
}

export function InspectionProgress({
  completedCount = 5,
  totalCount = 8,
  checkpoints,
  estimatedRemaining = "Est. 3 mins remaining",
  className = "",
  onSelectCheckpoint,
}: InspectionProgressProps) {
  const percentage = Math.round((completedCount / totalCount) * 100);

  return (
    <section
      className={`w-full bg-surface-container-lowest rounded-2xl shadow-sm p-6 sm:p-7 flex flex-col gap-6 border border-surface-container-high/60 ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-on-surface tracking-tight">
            Inspection progress
          </h3>
          <p className="text-xs sm:text-sm text-secondary mt-0.5">
            {completedCount} of {totalCount} operational requirements completed
          </p>
        </div>

        {/* Clean Visual Progress Track with Framer Motion */}
        <div className="w-full sm:w-64 flex flex-col gap-2">
          <div className="w-full bg-surface-container-high h-2.5 rounded-full overflow-hidden">
            <motion.div
              className="bg-primary h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
          <div className="flex justify-between text-xs font-semibold text-secondary">
            <span>
              <NumberTicker value={percentage} delay={0.1} />% Done
            </span>
            <span>{estimatedRemaining}</span>
          </div>
        </div>
      </div>

      {/* Checklist Badges Grid */}
      <CheckpointList
        checkpoints={checkpoints}
        onSelectCheckpoint={onSelectCheckpoint}
      />
    </section>
  );
}
