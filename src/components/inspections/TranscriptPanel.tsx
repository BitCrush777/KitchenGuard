"use client";

import React from "react";
import { TranscriptMessage } from "../../types/inspection";
import { AnimatedTranscript } from "../magic/AnimatedTranscript";
import { Activity } from "lucide-react";

interface TranscriptPanelProps {
  messages: TranscriptMessage[];
  className?: string;
  isStreaming?: boolean;
  interimText?: string;
}

export function TranscriptPanel({
  messages,
  className = "",
  isStreaming = true,
  interimText = "",
}: TranscriptPanelProps) {
  return (
    <div className={`flex flex-col gap-6 ${className}`}>
      {/* Voice Transcript Container */}
      <div className="bg-surface-container-lowest rounded-2xl shadow-sm p-6 flex flex-col border border-surface-container-high/60">
        <div className="flex items-center justify-between pb-4 border-b border-surface-container">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-secondary" />
            <h3 className="text-sm font-bold text-on-surface tracking-wide uppercase">
              Live Voice Dialogue
            </h3>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-secondary font-medium">
            {isStreaming && <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />}
            <span>Continuous Stream</span>
          </div>
        </div>

        <div className="pt-4 max-h-[480px] overflow-y-auto flex flex-col gap-3">
          {messages.length === 0 && !interimText ? (
            <div className="py-8 text-center text-xs text-secondary italic">
              Speak naturally. Your observations will transcribe here hands-free.
            </div>
          ) : (
            <AnimatedTranscript messages={messages} />
          )}

          {interimText && (
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-surface-container-low border border-primary/30 animate-pulse">
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs flex-shrink-0">
                You
              </div>
              <div className="flex-1 flex flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-on-surface">Listening...</span>
                  <span className="text-[10px] text-primary font-mono tracking-wider">LIVE</span>
                </div>
                <p className="text-xs sm:text-sm text-on-surface font-medium italic">
                  “{interimText}”
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Ambient Visual Editorial Photo representing line cleanliness */}
      <div className="w-full bg-surface-container-lowest rounded-2xl shadow-sm p-4 flex items-center gap-4 border border-surface-container-high/60">
        <img
          className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
          alt="HACCP Walk-in Complex check station"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuAUWQDiylxh1pqN9BcPR-dpCvgn-pDmaDWCxILerqSfLoJYRPQbGFQIKKjsCbLx8hdbwAvBR83V26i7XFW1XY0vFX7KuNPt864bMBg3ziFpRtFFj6yooCAgJTFtejDlTvg5xxC2RoKIU5V0HphYfMTWj6mVGLL8H04ncN89uFZWZqjiJfgU8tmUtdlLwn7ZGH8OU01pdyMc6PVhrfP6LDWIaKnZPScF0fTKWD1zyYsltNich_bXhWiO7w"
        />
        <div className="flex flex-col min-w-0">
          <span className="text-[11px] font-semibold text-secondary uppercase tracking-wider">
            HACCP Check Station
          </span>
          <span className="text-base font-bold text-on-surface truncate">
            Walk-in Complex #1
          </span>
          <span className="text-xs text-secondary truncate">
            Critical Control Point · Logged live
          </span>
        </div>
      </div>
    </div>
  );
}
