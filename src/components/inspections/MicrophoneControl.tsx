"use client";

import React from "react";
import { Mic, MicOff } from "lucide-react";

interface MicrophoneControlProps {
  isMuted: boolean;
  onToggle: () => void;
  className?: string;
  size?: "md" | "lg";
}

export function MicrophoneControl({
  isMuted,
  onToggle,
  className = "",
  size = "md",
}: MicrophoneControlProps) {
  const isLg = size === "lg";

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={isMuted ? "Unmute microphone" : "Mute microphone"}
      className={`inline-flex items-center gap-2 rounded-xl font-semibold transition-all active:scale-95 focus:outline-none cursor-pointer ${
        isLg ? "px-5 py-3 text-sm" : "px-4 py-2.5 text-xs sm:text-sm"
      } ${
        isMuted
          ? "bg-error-container text-on-error-container hover:bg-[#ffdad6]"
          : "bg-surface-container-low text-on-surface hover:bg-surface-container border border-surface-container-high/60"
      } ${className}`}
    >
      {isMuted ? (
        <>
          <MicOff className={isLg ? "w-5 h-5 text-error" : "w-4 h-4 text-error"} />
          <span>Unmute Mic</span>
        </>
      ) : (
        <>
          <Mic className={isLg ? "w-5 h-5 text-primary" : "w-4 h-4 text-primary"} />
          <span>Mute Mic</span>
        </>
      )}
    </button>
  );
}
