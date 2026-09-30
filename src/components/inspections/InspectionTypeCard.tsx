"use client";

import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Clock } from "lucide-react";

export interface InspectionTypeOption {
  id: "opening" | "closing" | "deep-clean" | "custom-voice";
  protocol: string;
  title: string;
  description: string;
  duration: string;
  checkpointsCount: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface InspectionTypeCardProps {
  option: InspectionTypeOption;
  selected: boolean;
  onSelect: (id: InspectionTypeOption["id"]) => void;
}

export function InspectionTypeCard({
  option,
  selected,
  onSelect,
}: InspectionTypeCardProps) {
  const Icon = option.icon;

  return (
    <motion.div
      onClick={() => onSelect(option.id)}
      whileHover={{ scale: 1.012, y: -2 }}
      whileTap={{ scale: 0.985 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={`relative flex flex-col justify-between p-6 sm:p-7 rounded-2xl cursor-pointer transition-all duration-300 border ${
        selected
          ? "bg-gradient-to-br from-primary-fixed/20 via-surface-container-lowest to-surface-container-lowest shadow-md border-primary/40 ring-1 ring-primary/30"
          : "bg-surface-container-lowest shadow-sm border-surface-container-high/60 hover:shadow-md hover:bg-surface-container-low/40"
      }`}
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
              selected
                ? "bg-primary text-on-primary shadow-sm"
                : "bg-surface-container text-primary"
            }`}
          >
            <Icon className="w-6 h-6" />
          </div>

          {selected && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 25 }}
              className="px-3 py-1 rounded-full bg-primary text-on-primary text-xs font-semibold flex items-center gap-1.5 shadow-sm"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Selected</span>
            </motion.div>
          )}
        </div>

        <div>
          <span className="text-[11px] font-semibold text-secondary uppercase tracking-wider">
            {option.protocol}
          </span>
          <h3 className="text-xl font-bold text-on-surface tracking-tight mt-0.5">
            {option.title}
          </h3>
          <p className="text-sm text-on-surface-variant mt-2 leading-relaxed">
            {option.description}
          </p>
        </div>
      </div>

      <div className="mt-6 pt-3 bg-surface-container-low/60 rounded-xl p-3.5 flex items-center justify-between border border-surface-container-high/40">
        <div className="flex items-center gap-1.5 text-on-surface text-xs font-semibold">
          <Clock className="w-4 h-4 text-primary" />
          <span>{option.duration}</span>
        </div>
        <span className="text-[11px] font-medium text-secondary bg-surface-container px-2 py-0.5 rounded">
          {option.checkpointsCount}
        </span>
      </div>
    </motion.div>
  );
}
