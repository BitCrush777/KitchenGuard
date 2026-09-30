import React from "react";
import { VoiceActivityState } from "../../types/inspection";
import { Mic, Sparkles, Volume2, Pause, Check } from "lucide-react";

interface VoiceStateIndicatorProps {
  state: VoiceActivityState;
  className?: string;
  showIcon?: boolean;
}

export function VoiceStateIndicator({
  state,
  className = "",
  showIcon = true,
}: VoiceStateIndicatorProps) {
  const map: Record<VoiceActivityState, { text: string; color: string; icon: React.ElementType }> = {
    idle: {
      text: "Standby",
      color: "bg-surface-container text-secondary",
      icon: Pause,
    },
    listening: {
      text: "Listening",
      color: "bg-[#e8f5e9] text-[#2e7d32]",
      icon: Mic,
    },
    processing: {
      text: "Evaluating Rules",
      color: "bg-[#ffdcbb] text-[#673d00]",
      icon: Sparkles,
    },
    speaking: {
      text: "Speaking",
      color: "bg-primary-fixed text-on-primary-fixed",
      icon: Volume2,
    },
    complete: {
      text: "Completed",
      color: "bg-[#e8f5e9] text-[#2e7d32]",
      icon: Check,
    },
    tool_call: {
      text: "Executing Tool",
      color: "bg-surface-container-high text-on-surface",
      icon: Sparkles,
    },
    confirmation_required: {
      text: "Confirming",
      color: "bg-[#ffdcbb] text-[#673d00]",
      icon: Sparkles,
    },
    error: {
      text: "Error",
      color: "bg-error-container text-on-error-container",
      icon: Pause,
    },
  };

  const active = map[state] || map.listening;
  const Icon = active.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide transition-all ${active.color} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
      {showIcon && <Icon className="w-3.5 h-3.5" />}
      <span>{active.text}</span>
    </span>
  );
}
