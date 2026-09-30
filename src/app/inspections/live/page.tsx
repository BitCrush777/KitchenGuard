"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useVoiceAgent } from "../../../hooks/useVoiceAgent";
import { VoiceActivityField } from "../../../components/inspections/VoiceActivityField";
import { MicrophoneControl } from "../../../components/inspections/MicrophoneControl";
import { TranscriptPanel } from "../../../components/inspections/TranscriptPanel";
import { ObservationCard } from "../../../components/inspections/ObservationCard";
import { ObservationExplanation } from "../../../components/inspections/ObservationExplanation";
import { InspectionProgress } from "../../../components/inspections/InspectionProgress";
import { initialCheckpoints } from "../../../services/inspectionData";
import { ArrowLeft, ClipboardCheck, Play } from "lucide-react";

function LiveInspectionContent() {
  const searchParams = useSearchParams();
  const inspectionType = searchParams?.get("type") || "opening";
  const inspectionId = searchParams?.get("id") || undefined;

  const {
    voiceState,
    transcript,
    interimTranscript,
    isListening,
    activeObservation,
    currentInspection,
    toggleListening,
    advanceDialogueStep,
    acceptCorrection,
    rejectCorrection,
  } = useVoiceAgent({ inspectionId });

  // Live timer simulation
  const [seconds, setSeconds] = useState(272); // Starts at 04:32

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60)
      .toString()
      .padStart(2, "0");
    const secs = (totalSecs % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  const typeTitles: Record<string, string> = {
    opening: "Opening Inspection",
    closing: "Closing Inspection",
    "deep-clean": "Deep Clean Protocol",
    "custom-voice": "Custom Voice Audit",
  };

  const title = typeTitles[inspectionType] || "Opening Inspection";

  return (
    <div className="min-h-screen bg-surface flex flex-col font-sans">
      <main className="w-full flex-1 flex flex-col justify-start items-center">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6 sm:gap-8">
          {/* Top Bar: Clean focused inspection bar */}
          <header className="w-full bg-surface-container-lowest rounded-2xl shadow-sm px-5 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 border border-surface-container-high/60">
            <div className="flex items-center gap-4 flex-wrap">
              <Link
                href="/inspections"
                className="inline-flex items-center gap-1.5 text-secondary hover:text-on-surface transition-colors font-semibold text-xs sm:text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Inspections</span>
              </Link>
              <div className="h-4 w-px bg-surface-container-highest" />
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-bold text-on-surface">
                  {title}
                </span>
                <span className="text-secondary text-xs sm:text-sm">· Main Kitchen</span>
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-surface-container-low rounded-full border border-surface-container-high/40">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                </span>
                <span className="text-xs font-mono font-bold text-primary tracking-wider">
                  {formatTime(seconds)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <MicrophoneControl
                isMuted={!isListening}
                onToggle={toggleListening}
              />

              <Link
                href={
                  currentInspection?.id || inspectionId
                    ? `/inspections/review?id=${currentInspection?.id || inspectionId}`
                    : "/inspections/review"
                }
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-on-primary hover:bg-primary-container transition-all active:scale-95 font-semibold text-xs sm:text-sm shadow-sm"
              >
                <ClipboardCheck className="w-4 h-4" />
                <span>End Inspection</span>
              </Link>
            </div>
          </header>

          {/* Center Hero: The Voice Interaction Field */}
          <VoiceActivityField
            state={voiceState}
            isMuted={!isListening}
            onToggleMute={toggleListening}
            onAdvanceDemo={advanceDialogueStep}
          />

          {/* Main Live Workspace Grid */}
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
            {/* Left Column: Conversational Context & Transcription (5 cols) */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              <TranscriptPanel
                messages={transcript}
                isStreaming={isListening}
                interimText={interimTranscript}
              />
            </div>

            {/* Right Column: Active Observation Card & Signature Verification Engine (7 cols) */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              {/* Active Observation Component */}
              {activeObservation && (
                <ObservationCard
                  observation={activeObservation}
                  onAccept={acceptCorrection}
                  onKeepPrevious={rejectCorrection}
                />
              )}

              {/* Signature Component: VOICE → UNDERSTANDING → VERIFICATION */}
              <ObservationExplanation
                heardText={activeObservation?.rawSpokenText || "“Walk-in refrigerator is six degrees.”"}
                understoodText={activeObservation?.understoodEntity || "Walk-in Refrigerator #1 · Temperature: 6°C"}
                rulesFoundText={activeObservation?.ruleEvaluation || "Configured limit: ≤ 5°C · Regulatory compliance violation flag generated"}
                ruleFlag={
                  activeObservation?.status === "attention"
                    ? "Requires immediate chef sign-off or corrective re-chill"
                    : "Within compliant operational parameters"
                }
              />
            </div>
          </div>

          {/* Live Inspection Status Floating Section: Progress & Checkpoints */}
          <InspectionProgress
            completedCount={currentInspection?.checkpointsCompleted ?? 5}
            totalCount={currentInspection?.checkpointsTotal ?? 8}
            checkpoints={currentInspection?.checkpoints ?? initialCheckpoints}
            estimatedRemaining="Est. 3 mins remaining"
          />
        </div>
      </main>

      {/* Sticky Mobile Microphone Bar (Mobile Only) */}
      <div className="lg:hidden sticky bottom-0 left-0 right-0 p-3 bg-surface-container-lowest/95 backdrop-blur-md border-t border-surface-container flex items-center justify-between gap-3 shadow-lg z-30">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-xs font-semibold">{title}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={advanceDialogueStep}
            className="px-3 py-2 bg-surface-container hover:bg-surface-container-high rounded-lg text-xs font-semibold text-secondary flex items-center gap-1"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Next Speech</span>
          </button>
          <MicrophoneControl
            isMuted={!isListening}
            onToggle={toggleListening}
          />
        </div>
      </div>
    </div>
  );
}

export default function LiveInspectionPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-surface flex items-center justify-center text-secondary text-sm">
          Loading Voice Workspace...
        </div>
      }
    >
      <LiveInspectionContent />
    </Suspense>
  );
}
