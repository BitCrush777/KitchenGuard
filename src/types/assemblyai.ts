import {
  Observation,
  TranscriptMessage,
  VoiceActivityState,
} from "./inspection";

export type VoiceAgentConnectionState =
  | "disconnected"
  | "connecting"
  | "connected"
  | "reconnecting"
  | "error";

export interface ToolCallStartInspectionParams {
  inspectionType: "opening" | "closing" | "deep-clean" | "custom-voice";
  kitchenLocation: string;
  inspectorName: string;
}

export interface ToolCallRecordObservationParams {
  checkpointId?: string;
  itemName: string;
  observedValue: string;
  unit?: string;
  rawSpeech: string;
}

export interface ToolCallUpdateObservationParams {
  observationId?: string;
  checkpointId: string;
  previousValue: string;
  correctedValue: string;
  reason: string;
}

export interface ToolCallFlagIssueParams {
  category: string;
  title: string;
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  recommendedAction: string;
}

export interface ToolCallCompleteCheckpointParams {
  checkpointId: string;
  status: "verified" | "warning" | "failed" | "skipped";
  notes?: string;
}

export interface ToolCallGetMissingChecksParams {
  inspectionId: string;
}

export interface ToolCallReviewInspectionParams {
  inspectionId: string;
}

export interface ToolCallFinalizeInspectionParams {
  inspectionId: string;
  inspectorSignature: string;
}

export type AssemblyAIToolCall =
  | { name: "startInspection"; params: ToolCallStartInspectionParams }
  | { name: "recordObservation"; params: ToolCallRecordObservationParams }
  | { name: "updateObservation"; params: ToolCallUpdateObservationParams }
  | { name: "flagIssue"; params: ToolCallFlagIssueParams }
  | { name: "resolveIssue"; params: Record<string, unknown> }
  | { name: "completeCheckpoint"; params: ToolCallCompleteCheckpointParams }
  | { name: "getMissingChecks"; params: ToolCallGetMissingChecksParams }
  | { name: "getCurrentInspectionState"; params: Record<string, unknown> }
  | { name: "reviewInspection"; params: ToolCallReviewInspectionParams }
  | { name: "finalizeInspection"; params: ToolCallFinalizeInspectionParams }
  | { name: string; params: Record<string, unknown> };

export interface AssemblyAIToolResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface VoiceAgentSessionConfig {
  sampleRate?: number;
  acousticFilter?: "kitchen_ambient_noise_cancellation" | "standard";
  languageCode?: string;
  enableVad?: boolean;
}

export interface VoiceAgentHookState {
  connectionState: VoiceAgentConnectionState;
  voiceState: VoiceActivityState;
  transcript: TranscriptMessage[];
  currentSpeaker: "worker" | "assistant" | null;
  isListening: boolean;
  isProcessing: boolean;
  lastToolCall: AssemblyAIToolCall | null;
  activeObservation: Observation | null;
  audioClarityScore: number;
}
