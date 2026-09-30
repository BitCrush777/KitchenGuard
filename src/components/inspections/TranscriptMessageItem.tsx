import React from "react";
import { TranscriptMessage } from "../../types/inspection";
import { AlertTriangle } from "lucide-react";

interface TranscriptMessageItemProps {
  message: TranscriptMessage;
  className?: string;
}

export function TranscriptMessageItem({
  message,
  className = "",
}: TranscriptMessageItemProps) {
  const isWorker = message.speaker === "worker";

  return (
    <div
      className={`flex flex-col gap-1 transition-all ${
        !isWorker
          ? "bg-surface-container-low/50 p-4 rounded-xl border border-surface-container-high/40"
          : "p-2"
      } ${className}`}
    >
      <div className="flex items-center gap-2">
        <span
          className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
            isWorker
              ? "bg-secondary-container text-on-surface"
              : "bg-primary text-on-primary"
          }`}
        >
          {isWorker ? "W" : "K"}
        </span>
        <span
          className={`text-xs font-semibold ${
            isWorker ? "text-secondary" : "text-primary"
          }`}
        >
          {isWorker ? "Chef / Arun (Inspector)" : "KitchenGuard AI"}
        </span>
        <span className="text-secondary text-[11px]">{message.timestamp}</span>

        {message.badge && (
          <span className="ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#fef3e2] text-[#c07a1d] flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            {message.badge}
          </span>
        )}
      </div>

      <p className="text-sm sm:text-base text-on-surface pl-7 leading-relaxed font-normal">
        &ldquo;{message.text}&rdquo;
      </p>
    </div>
  );
}

// Re-export alias to satisfy TranscriptMessage component requirement
export const TranscriptMessageComponent = TranscriptMessageItem;
