import React from "react";
import { Checkpoint } from "../../types/inspection";
import { Check, AlertTriangle, HelpCircle, Circle } from "lucide-react";

interface CheckpointItemProps {
  checkpoint: Checkpoint;
  className?: string;
  onClick?: () => void;
}

export function CheckpointItem({
  checkpoint,
  className = "",
  onClick,
}: CheckpointItemProps) {
  const status = checkpoint.status;

  const isVerified = status === "verified";
  const isWarning = status === "warning" || status === "failed";
  const isPending = status === "pending";

  return (
    <div
      onClick={onClick}
      className={`p-3.5 rounded-xl flex items-center gap-3 transition-colors border ${
        isWarning
          ? "bg-[#ffdcbb]/40 border-[#c07a1d]/30"
          : isVerified
          ? "bg-surface-container-low border-surface-container-high/40"
          : "bg-surface-container-low/70 border-surface-container-high/30 opacity-70"
      } ${onClick ? "cursor-pointer hover:bg-surface-container" : ""} ${className}`}
    >
      <span
        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${
          isVerified
            ? "bg-primary-fixed text-on-primary-fixed"
            : isWarning
            ? "bg-[#ffdcbb] text-[#673d00]"
            : "bg-surface-container-highest text-secondary"
        }`}
      >
        {isVerified && <Check className="w-3.5 h-3.5" />}
        {isWarning && <AlertTriangle className="w-3.5 h-3.5" />}
        {isPending && <HelpCircle className="w-3.5 h-3.5" />}
        {status === "skipped" && <Circle className="w-3.5 h-3.5" />}
      </span>

      <div className="flex flex-col min-w-0">
        <span className="text-sm font-semibold text-on-surface truncate">
          {checkpoint.name}
        </span>
        <span
          className={`text-xs font-medium capitalize ${
            isVerified
              ? "text-primary"
              : isWarning
              ? "text-[#c07a1d]"
              : "text-secondary"
          }`}
        >
          {isVerified
            ? checkpoint.currentValue
              ? `Verified (${checkpoint.currentValue})`
              : "Verified"
            : isWarning
            ? "Attention needed"
            : "Pending"}
        </span>
      </div>
    </div>
  );
}
