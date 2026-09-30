"use client";

import React from "react";
import { Mic, GitFork, ShieldAlert, ArrowDown } from "lucide-react";
import { BlurFade } from "../magic/BlurFade";

interface ObservationExplanationProps {
  heardText?: string;
  understoodText?: string;
  rulesFoundText?: string;
  acousticClarity?: string;
  ruleFlag?: string;
  className?: string;
}

export function ObservationExplanation({
  heardText = "“Walk-in refrigerator is six degrees.”",
  understoodText = "Walk-in Refrigerator #1 · Temperature: 6°C",
  rulesFoundText = "Configured limit: ≤ 5°C · Regulatory compliance violation flag generated",
  acousticClarity = "Acoustic clarity: 98% · Ambient noise filtered",
  ruleFlag = "Requires immediate chef sign-off or corrective re-chill",
  className = "",
}: ObservationExplanationProps) {
  return (
    <div
      className={`w-full bg-surface-container-lowest rounded-2xl shadow-sm p-6 flex flex-col gap-5 border border-surface-container-high/60 ${className}`}
    >
      <div className="flex items-center justify-between border-b border-surface-container pb-3">
        <h3 className="text-xs font-bold text-on-surface tracking-wider uppercase">
          Voice Verification Pipeline
        </h3>
        <span className="text-[11px] text-secondary font-medium">Step-by-step logic audit</span>
      </div>

      <div className="flex flex-col gap-3 relative">
        {/* Step 1: What I Heard */}
        <BlurFade delay={0.06} yOffset={8}>
          <div className="flex items-start gap-4 p-4 rounded-xl bg-surface-container-low border border-surface-container-high/40">
            <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center text-primary flex-shrink-0 mt-0.5">
              <Mic className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] text-secondary uppercase font-bold tracking-wider">
                1. What I Heard
              </span>
              <p className="text-sm font-semibold text-on-surface mt-0.5">{heardText}</p>
              <span className="text-xs text-secondary mt-0.5">{acousticClarity}</span>
            </div>
          </div>
        </BlurFade>

        {/* Soft Flow Connector */}
        <BlurFade delay={0.16} yOffset={4}>
          <div className="flex justify-center -my-1 text-secondary opacity-40">
            <ArrowDown className="w-4 h-4" />
          </div>
        </BlurFade>

        {/* Step 2: What I Understood */}
        <BlurFade delay={0.26} yOffset={8}>
          <div className="flex items-start gap-4 p-4 rounded-xl bg-surface-container-low border border-surface-container-high/40">
            <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center text-primary flex-shrink-0 mt-0.5">
              <GitFork className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] text-secondary uppercase font-bold tracking-wider">
                2. What I Understood
              </span>
              <p className="text-sm font-semibold text-on-surface mt-0.5">{understoodText}</p>
              <span className="text-xs text-secondary mt-0.5">
                Entity mapped: Cold Storage Unit A · Unit: Celsius
              </span>
            </div>
          </div>
        </BlurFade>

        {/* Soft Flow Connector */}
        <BlurFade delay={0.36} yOffset={4}>
          <div className="flex justify-center -my-1 text-secondary opacity-40">
            <ArrowDown className="w-4 h-4" />
          </div>
        </BlurFade>

        {/* Step 3: What The Rules Found */}
        <BlurFade delay={0.46} yOffset={8}>
          <div className="flex items-start gap-4 p-4 rounded-xl bg-surface-container-low border border-surface-container-high/40">
            <div className="w-10 h-10 rounded-full bg-secondary-container text-tertiary flex-shrink-0 flex items-center justify-center mt-0.5">
              <ShieldAlert className="w-5 h-5 text-[#c07a1d]" />
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] text-[#c07a1d] uppercase font-bold tracking-wider">
                3. What The Rules Found
              </span>
              <p className="text-sm font-semibold text-on-surface mt-0.5">{rulesFoundText}</p>
              <div className="inline-flex items-center gap-1.5 mt-2 text-on-error-container bg-error-container px-3 py-1 rounded-full w-fit text-xs font-semibold">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>{ruleFlag}</span>
              </div>
            </div>
          </div>
        </BlurFade>
      </div>
    </div>
  );
}
