/**
 * KitchenGuard Local Inspection Store (Hackathon Mode)
 * Uses browser localStorage with versioned key: kitchenguard:inspection:v1
 * Authoritative client-side storage surviving page reloads and route changes.
 */

import { Inspection, Checkpoint, Observation, Issue, Correction } from "@/types/inspection";
import { initialCheckpoints, initialIssues, sampleObservations, sampleTranscripts } from "@/services/inspectionData";

const STORAGE_KEY = "kitchenguard:inspection:v1";

export interface StoredInspectionState {
  inspection: Inspection;
  checkpoints: Checkpoint[];
  observations: Observation[];
  issues: Issue[];
  corrections: Correction[];
  auditEvents: Array<{
    id: string;
    type: string;
    timestamp: string;
    description: string;
  }>;
}

function getDefaultInspectionState(): StoredInspectionState {
  const initialInspection: Inspection = {
    id: "KG-2026-0928-0042",
    type: "opening",
    typeName: "Opening Inspection",
    kitchen: "Main Kitchen",
    status: "in_progress",
    inspector: "Arun Patel",
    inspectorRole: "Kitchen Manager",
    startedAt: new Date(Date.now() - 15 * 60000).toISOString(),
    readinessScore: 87,
    checkpointsTotal: 8,
    checkpointsCompleted: 4,
    issuesCount: 2,
    issuesResolved: 1,
    correctionsCount: 1,
    checkpoints: JSON.parse(JSON.stringify(initialCheckpoints)),
    observations: JSON.parse(JSON.stringify(sampleObservations)),
    issues: JSON.parse(JSON.stringify(initialIssues)),
    corrections: [
      {
        id: "corr-1",
        checkpointId: "chk-1",
        itemName: "Walk-in Refrigerator #1",
        previousValue: "4°C",
        newValue: "6°C",
        reason: "Inspector voice correction",
        timestamp: "08:14:31",
        status: "accepted",
      },
    ],
    events: [
      {
        id: "evt-1",
        type: "start",
        timestamp: "08:30:00",
        description: "Inspection initiated for Main Kitchen Opening Protocol",
      },
      {
        id: "evt-2",
        type: "observation",
        timestamp: "08:32:15",
        description: "Walk-in Refrigerator parsed at 4°C",
      },
    ],
    transcripts: JSON.parse(JSON.stringify(sampleTranscripts)),
  };

  return {
    inspection: initialInspection,
    checkpoints: JSON.parse(JSON.stringify(initialCheckpoints)),
    observations: JSON.parse(JSON.stringify(sampleObservations)),
    issues: JSON.parse(JSON.stringify(initialIssues)),
    corrections: initialInspection.corrections || [],
    auditEvents: initialInspection.events || [],
  };
}

let serverCache: StoredInspectionState | null = null;

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export class LocalInspectionStore {
  public static getState(): StoredInspectionState {
    if (!isBrowser()) {
      if (!serverCache) serverCache = getDefaultInspectionState();
      return serverCache;
    }

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        const defaults = getDefaultInspectionState();
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
        return defaults;
      }
      return JSON.parse(raw);
    } catch {
      return getDefaultInspectionState();
    }
  }

  public static saveState(state: StoredInspectionState): void {
    serverCache = state;
    if (isBrowser()) {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch (err) {
        console.error("[LocalInspectionStore] Failed to write to localStorage:", err);
      }
    }
  }

  public static updateInspection(updater: (prev: StoredInspectionState) => StoredInspectionState): StoredInspectionState {
    const current = this.getState();
    const next = updater(current);
    this.saveState(next);
    return next;
  }

  public static resetToDefault(): StoredInspectionState {
    const defaults = getDefaultInspectionState();
    this.saveState(defaults);
    return defaults;
  }
}
