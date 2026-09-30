"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Volume2, Sparkles, Check } from "lucide-react";
import { VoiceActivityState } from "../../types/inspection";
import { VoiceParticles } from "../magic/VoiceParticles";

interface VoiceActivityFieldProps {
  state: VoiceActivityState;
  isMuted?: boolean;
  onToggleMute?: () => void;
  className?: string;
  onAdvanceDemo?: () => void;
}

export function VoiceActivityField({
  state,
  isMuted = false,
  onToggleMute,
  className = "",
  onAdvanceDemo,
}: VoiceActivityFieldProps) {
  // Config per state
  const configMap: Record<
    VoiceActivityState,
    {
      title: string;
      subtitle: string;
      pillText: string;
      pillClass: string;
      ringAnimation: string;
      centerBg: string;
      icon: React.ElementType;
    }
  > = {
    idle: {
      title: "Microphone Paused",
      subtitle: "Tap to resume hands-free voice inspection.",
      pillText: "Voice Engine · Standby",
      pillClass: "bg-surface-container text-secondary",
      ringAnimation: "scale-100 opacity-30",
      centerBg: "bg-surface-container text-secondary",
      icon: isMuted ? MicOff : Mic,
    },
    listening: {
      title: "I'm listening",
      subtitle: "Speak naturally while you inspect the kitchen stations.",
      pillText: "AssemblyAI Voice Engine · Active",
      pillClass: "bg-[#e8f5e9] text-[#2e7d32]",
      ringAnimation: "animate-voice-listen",
      centerBg: "bg-primary text-on-primary",
      icon: Mic,
    },
    processing: {
      title: "Processing speech...",
      subtitle: "Parsing temperature readings and HACCP rules.",
      pillText: "HACCP Rule Engine · Evaluating",
      pillClass: "bg-[#ffdcbb] text-[#673d00]",
      ringAnimation: "animate-spin duration-700 opacity-60",
      centerBg: "bg-[#c07a1d] text-white",
      icon: Sparkles,
    },
    speaking: {
      title: "KitchenGuard is responding",
      subtitle: "Audio confirmation streamed to headset.",
      pillText: "Audio Stream · Active",
      pillClass: "bg-primary-fixed text-on-primary-fixed",
      ringAnimation: "animate-voice-breathe",
      centerBg: "bg-primary-container text-on-primary",
      icon: Volume2,
    },
    complete: {
      title: "Checks Completed",
      subtitle: "All protocol items verified for this station.",
      pillText: "Inspection Complete · Ready for Review",
      pillClass: "bg-[#e8f5e9] text-[#2e7d32]",
      ringAnimation: "scale-100 opacity-40",
      centerBg: "bg-[#2e7d32] text-white",
      icon: Check,
    },
    tool_call: {
      title: "Executing Tool...",
      subtitle: "Deterministic business logic running.",
      pillText: "Tool Execution · Active",
      pillClass: "bg-surface-container-high text-on-surface",
      ringAnimation: "animate-spin duration-1000 opacity-50",
      centerBg: "bg-secondary text-white",
      icon: Sparkles,
    },
    confirmation_required: {
      title: "Confirmation Required",
      subtitle: "Review the proposed observation correction.",
      pillText: "Verification Needed",
      pillClass: "bg-[#ffdcbb] text-[#673d00]",
      ringAnimation: "animate-pulse opacity-75",
      centerBg: "bg-[#c07a1d] text-white",
      icon: Sparkles,
    },
    error: {
      title: "Voice Processing Issue",
      subtitle: "Please repeat or check microphone connection.",
      pillText: "Connection Error",
      pillClass: "bg-error-container text-on-error-container",
      ringAnimation: "scale-100 opacity-60",
      centerBg: "bg-error text-on-error",
      icon: isMuted ? MicOff : Mic,
    },
  };

  const config = configMap[state] || configMap.listening;
  const Icon = config.icon;

  return (
    <section
      className={`w-full bg-surface-container-lowest rounded-2xl shadow-sm py-10 px-6 flex flex-col items-center justify-center text-center relative overflow-hidden border border-surface-container-high/60 ${className}`}
    >
      {/* Decorative ambient backdrop */}
      <div className="absolute w-96 h-96 rounded-full bg-surface-container-low/60 blur-3xl pointer-events-none -top-12" />

      {/* Concentric Voice Activity Rings with Particle Field */}
      <div className="relative flex items-center justify-center mb-6 w-72 h-72">
        {/* Magic UI: Ambient Voice Particles reacting to state */}
        <VoiceParticles state={state} className="rounded-full" />

        {/* Outer breathing pulse ring */}
        <div
          className={`absolute w-56 h-56 rounded-full bg-surface-container-high/40 pointer-events-none transition-all duration-700 ${
            state === "listening" ? "animate-pulse scale-105" : ""
          }`}
        />

        {/* Middle organic ring */}
        <div
          className={`absolute w-44 h-44 rounded-full bg-surface-container-low/80 pointer-events-none transition-all duration-500 ease-out ${config.ringAnimation}`}
        />

        {/* Inner ring */}
        <div className="absolute w-32 h-32 rounded-full bg-surface-bright shadow-sm pointer-events-none" />

        {/* Elevated tactile Microphone / Action Button */}
        <motion.button
          type="button"
          onClick={onToggleMute}
          aria-label={isMuted ? "Unmute microphone" : "Mute microphone"}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className={`relative z-10 w-24 h-24 rounded-full bg-surface-container-lowest shadow-md flex items-center justify-center transition-shadow group focus:outline-none ring-4 ${
            state === "listening"
              ? "ring-primary/20"
              : state === "processing"
              ? "ring-[#c07a1d]/20"
              : "ring-surface-container"
          }`}
        >
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${config.centerBg} shadow-inner`}
          >
            <Icon className="w-8 h-8" />
          </div>
        </motion.button>
      </div>

      {/* State & Intent Readout with subtle crossfade */}
      <div className="max-w-md mx-auto space-y-2 z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={state}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="flex flex-col items-center gap-2"
          >
            <div
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wide ${config.pillClass}`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
              <span>{config.pillText}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">
              {config.title}
            </h2>
            <p className="text-sm text-secondary leading-relaxed">{config.subtitle}</p>
          </motion.div>
        </AnimatePresence>

        {onAdvanceDemo && (
          <div className="pt-2">
            <button
              onClick={onAdvanceDemo}
              type="button"
              className="inline-flex items-center gap-1.5 text-xs text-primary font-semibold hover:underline bg-surface-container-low px-3 py-1 rounded-full border border-surface-container-high transition-colors"
            >
              <span>Simulate next spoken phrase</span>
              <span className="text-outline">→</span>
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
