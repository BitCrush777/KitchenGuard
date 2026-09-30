export type InspectionStatus = "draft" | "in_progress" | "needs_review" | "completed";

export type CheckpointStatus = "pending" | "verified" | "warning" | "failed" | "skipped";

export type IssueSeverity = "low" | "medium" | "high" | "critical";

export type IssueStatus = "open" | "in_progress" | "resolved";

export type ObservationSource = "voice" | "manual" | "system";

export type VoiceActivityState =
  | "idle"
  | "listening"
  | "processing"
  | "speaking"
  | "tool_call"
  | "confirmation_required"
  | "complete"
  | "error";

export interface Checkpoint {
  id: string;
  name: string;
  category: "storage" | "temperature" | "hygiene" | "cleaning" | "labels" | "waste";
  description: string;
  status: CheckpointStatus;
  target?: string;
  currentValue?: string;
  unit?: string;
  notes?: string;
  requiredFields?: string[];
  rules?: string[];
  observations?: string[];
  updatedAt?: string;
}

export interface Observation {
  id: string;
  inspectionId?: string;
  checkpointId: string;
  item: string;
  value: string;
  unit?: string;
  notes?: string;
  status: "verified" | "attention" | "critical";
  source: ObservationSource;
  timestamp: string;
  createdAt?: string;
  updatedAt?: string;
  previousValue?: string;
  reason?: string;
  rawSpokenText?: string;
  understoodEntity?: string;
  ruleEvaluation?: string;
}

export interface Issue {
  id: string;
  inspectionId?: string;
  observationId?: string;
  category: string;
  title: string;
  severity: IssueSeverity;
  description: string;
  status: IssueStatus;
  location: string;
  createdAt: string;
  resolvedAt?: string;
  resolutionNote?: string;
  loggedBy: string;
  observedText?: string;
  flagReason?: string;
  recommendedAction?: string;
  history?: Array<{
    time: string;
    action: string;
  }>;
}

export interface Correction {
  id: string;
  inspectionId?: string;
  observationId?: string;
  checkpointId: string;
  itemName: string;
  previousValue: string;
  newValue: string;
  reason: string;
  timestamp: string;
  createdAt?: string;
  acceptedAt?: string;
  status: "pending" | "accepted" | "rejected" | "pending_confirmation";
}

export type InspectionEventType =
  | "inspection_started"
  | "checkpoint_started"
  | "observation_recorded"
  | "rule_evaluated"
  | "issue_created"
  | "issue_updated"
  | "correction_created"
  | "correction_accepted"
  | "correction_rejected"
  | "checkpoint_verified"
  | "checkpoint_reopened"
  | "issue_resolved"
  | "inspection_reviewed"
  | "inspection_finalized"
  // Legacy aliases for components
  | "start"
  | "observation"
  | "rule_flag"
  | "correction"
  | "resolution"
  | "complete";

export interface InspectionEvent {
  id: string;
  inspectionId?: string;
  type: InspectionEventType;
  actor?: string;
  source?: string;
  timestamp: string;
  description: string;
  speaker?: "worker" | "assistant";
  metadata?: Record<string, unknown>;
}

export interface InspectionRule {
  id: string;
  category: string;
  name: string;
  targetThreshold: string;
  action: string;
  description: string;
  enabled: boolean;
  severity: IssueSeverity;
  standard: string;
}

export interface TranscriptMessage {
  id: string;
  speaker: "worker" | "assistant";
  speakerName: string;
  role: string;
  text: string;
  timestamp: string;
  badge?: string;
  isCorrection?: boolean;
}

export interface Inspection {
  id: string;
  kitchenId?: string;
  type: "opening" | "closing" | "deep-clean" | "custom-voice" | "deep_clean" | "custom";
  typeName: string;
  kitchen: string;
  status: InspectionStatus;
  inspector: string;
  inspectorRole: string;
  currentCheckpointId?: string;
  startedAt: string;
  completedAt?: string;
  durationMinutes?: number;
  readinessScore: number;
  progress?: number;
  checkpointsTotal: number;
  checkpointsCompleted: number;
  issuesCount: number;
  issuesResolved: number;
  correctionsCount: number;
  checkpoints: Checkpoint[];
  observations: Observation[];
  issues: Issue[];
  corrections: Correction[];
  events: InspectionEvent[];
  transcripts: TranscriptMessage[];
}
