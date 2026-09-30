"use client";

import React from "react";
import { motion } from "framer-motion";
import { Observation } from "../../types/inspection";
import { AlertTriangle, Check } from "lucide-react";
import { CorrectionTransition } from "../magic/CorrectionTransition";

interface ObservationCardProps {
  observation: Observation;
  onAccept?: () => void;
  onKeepPrevious?: () => void;
  className?: string;
}

export function ObservationCard({
  observation,
  onAccept,
  onKeepPrevious,
  className = "",
}: ObservationCardProps) {
  const hasCorrection = Boolean(observation.previousValue);
  const isAttention = observation.status === "attention" || observation.status === "critical";

  return (
    <div
      className={`w-full bg-surface-container-lowest rounded-2xl shadow-md p-6 relative overflow-hidden border border-surface-container-high/60 ${className}`}
    >
      {/* State accent ribbon */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-1.5 ${
          isAttention ? "bg-[#c07a1d]" : "bg-primary"
        }`}
      />

      <div className="flex flex-col gap-5 pl-2">
        <div className="flex items-start justify-between flex-wrap gap-2">
          <div>
            <h3 className="text-xl font-bold text-on-surface tracking-tight">
              {observation.item}
            </h3>
          </div>

          {isAttention && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-error-container text-on-error-container text-xs font-semibold">
              <AlertTriangle className="w-4 h-4" />
              <span>Exceeds 5°C threshold</span>
            </span>
          )}
        </div>

        {/* Dual Comparison or Single Reading with Magic UI Transition */}
        {hasCorrection ? (
          <CorrectionTransition
            previousValue={observation.previousValue || "4°C"}
            newValue={observation.value}
            reason="Voice correction detected"
          />
        ) : (
          <div className="bg-surface-container-low p-4 rounded-xl border border-surface-container-high/50 flex flex-col">
            <span className="text-[11px] font-bold text-secondary uppercase tracking-wider">
              RECORDED READING
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl sm:text-4xl font-bold text-on-surface">
                {observation.value}
              </span>
              <span className="text-xs text-on-surface-variant">Live voice parse</span>
            </div>
          </div>
        )}

        {/* Actions with Spring Feedback */}
        <div className="flex items-center justify-end gap-3 pt-1">
          {onKeepPrevious && (
            <motion.button
              type="button"
              onClick={onKeepPrevious}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="h-[48px] px-5 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-semibold text-xs transition-colors cursor-pointer"
            >
              Keep {observation.previousValue || "4°C"}
            </motion.button>
          )}

          {onAccept && (
            <motion.button
              type="button"
              onClick={onAccept}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="h-[48px] px-6 rounded-xl bg-primary-container hover:bg-primary text-on-primary font-semibold text-xs transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Accept {observation.value}</span>
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
}
