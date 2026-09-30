import {
  Inspection,
  Checkpoint,
  Observation,
  Issue,
  Correction,
} from "@/types/inspection";
import {
  getInspectionById,
  saveInspection,
  getActiveInspection,
} from "../persistence/database";
import { STANDARD_CHECKPOINTS, createInitialCheckpoints } from "../checkpoints/standardCheckpoints";
import { evaluateObservationRules, detectContradiction } from "../rules/rulesEngine";
import { canFinalizeInspection, calculateReadinessScore } from "../state-machine/stateMachine";

export interface ToolExecutionResponse<T = unknown> {
  success: boolean;
  toolName: string;
  data?: T;
  voiceResponse: string;
  badge?: string;
  error?: string;
  inspectionState?: {
    id: string;
    status: string;
    readinessScore: number;
    checkpointsCompleted: number;
    checkpointsTotal: number;
    issuesCount: number;
    issuesResolved: number;
  };
}

export class InspectionService {
  /**
   * Helper: Resolves the target inspection by ID, or falls back to current active inspection.
   */
  private static resolveInspection(inspectionId?: string): Inspection {
    if (inspectionId) {
      const found = getInspectionById(inspectionId);
      if (found) return found;
    }
    return getActiveInspection();
  }

  /**
   * 1. startInspection
   */
  public static startInspection(params: {
    inspectionType?: "opening" | "closing" | "deep-clean" | "custom-voice";
    kitchen?: string;
    inspector?: string;
  }): ToolExecutionResponse<Inspection> {
    const type = params.inspectionType || "opening";
    const typeName =
      type === "opening"
        ? "Opening Inspection"
        : type === "closing"
        ? "Closing Inspection"
        : type === "deep-clean"
        ? "Deep Clean Protocol"
        : "Kitchen Walkthrough";

    const kitchen = params.kitchen || "Main Kitchen";
    const inspector = params.inspector || "Arun Patel";

    const id = `KG-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.floor(
      1000 + Math.random() * 9000
    )}`;

    const newInspection: Inspection = {
      id,
      type,
      typeName,
      kitchen,
      status: "in_progress",
      inspector,
      inspectorRole: "Kitchen Supervisor",
      startedAt: new Date().toISOString(),
      readinessScore: 0,
      checkpointsTotal: 8,
      checkpointsCompleted: 0,
      issuesCount: 0,
      issuesResolved: 0,
      correctionsCount: 0,
      checkpoints: createInitialCheckpoints(),
      observations: [],
      issues: [],
      corrections: [],
      events: [
        {
          id: `evt-${Date.now()}`,
          type: "start",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          description: `Inspection initiated for ${kitchen} ${typeName}`,
        },
      ],
      transcripts: [],
    };

    saveInspection(newInspection);

    return {
      success: true,
      toolName: "startInspection",
      data: newInspection,
      voiceResponse: `Started ${typeName} for ${kitchen}. What would you like to inspect first?`,
      inspectionState: {
        id: newInspection.id,
        status: newInspection.status,
        readinessScore: newInspection.readinessScore,
        checkpointsCompleted: newInspection.checkpointsCompleted,
        checkpointsTotal: newInspection.checkpointsTotal,
        issuesCount: newInspection.issuesCount,
        issuesResolved: newInspection.issuesResolved,
      },
    };
  }

  /**
   * 2. recordObservation
   */
  public static recordObservation(params: {
    inspectionId?: string;
    checkpointId?: string;
    checkpointName?: string;
    item: string;
    value: string;
    unit?: string;
    notes?: string;
    spokenText?: string;
  }): ToolExecutionResponse<{ observation: Observation; issueCreated?: Issue; contradictionDetected?: boolean }> {
    const inspection = this.resolveInspection(params.inspectionId);

    // Resolve checkpoint
    let checkpoint: Checkpoint | undefined;
    if (params.checkpointId) {
      checkpoint = inspection.checkpoints.find((c) => c.id === params.checkpointId);
    }
    if (!checkpoint && params.checkpointName) {
      const q = params.checkpointName.toLowerCase();
      checkpoint = inspection.checkpoints.find(
        (c) => c.name.toLowerCase().includes(q) || c.category.toLowerCase().includes(q)
      );
    }
    if (!checkpoint) {
      const fullText = `${params.item} ${params.value} ${params.spokenText || ""} ${params.checkpointName || ""}`.toLowerCase();
      checkpoint = inspection.checkpoints.find(
        (c) =>
          c.name.toLowerCase().includes(params.item.toLowerCase()) ||
          params.item.toLowerCase().includes(c.name.toLowerCase()) ||
          (fullText.includes("freezer") && c.id === "chk-2") ||
          ((fullText.includes("refrigerator") || fullText.includes("chiller") || fullText.includes("cooler")) && c.id === "chk-1") ||
          ((fullText.includes("chicken") || fullText.includes("separation") || fullText.includes("storage hierarchy") || fullText.includes("poultry") || fullText.includes("cross contamination")) && c.id === "chk-3") ||
          ((fullText.includes("soap") || fullText.includes("towel") || fullText.includes("hand wash") || fullText.includes("sink")) && c.id === "chk-4") ||
          ((fullText.includes("prep table") || fullText.includes("stainless steel") || fullText.includes("cutting board")) && c.id === "chk-5") ||
          ((fullText.includes("sanitizer") || fullText.includes("ppm") || fullText.includes("titration") || fullText.includes("quat")) && c.id === "chk-6") ||
          ((fullText.includes("label") || fullText.includes("fifo") || fullText.includes("expiration") || fullText.includes("prep date")) && c.id === "chk-7") ||
          ((fullText.includes("trash") || fullText.includes("waste") || fullText.includes("grease")) && c.id === "chk-8")
      );
    }
    if (!checkpoint) {
      checkpoint = inspection.checkpoints[0]; // fallback to first
    }

    // Check for contradiction against prior observations
    const contradictionCheck = detectContradiction(
      params.item,
      params.value,
      inspection.observations
    );

    // Run deterministic rules
    const ruleResult = evaluateObservationRules({
      checkpointId: checkpoint.id,
      checkpointName: checkpoint.name,
      category: checkpoint.category,
      item: params.item,
      value: params.value,
      unit: params.unit || checkpoint.unit,
      notes: params.notes,
    });

    const nowStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    const obsId = `obs-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const newObservation: Observation = {
      id: obsId,
      checkpointId: checkpoint.id,
      item: params.item,
      value: params.value,
      unit: params.unit || checkpoint.unit,
      status: ruleResult.checkpointStatus === "warning" ? "attention" : "verified",
      source: "voice",
      timestamp: nowStr,
      previousValue: contradictionCheck.previousValue,
      rawSpokenText: params.spokenText || `${params.item} is ${params.value}${params.unit || ""}`,
      understoodEntity: `${checkpoint.name} · ${params.item}: ${params.value}${params.unit || ""}`,
      ruleEvaluation: ruleResult.message,
    };

    inspection.observations.push(newObservation);

    // Update Checkpoint
    checkpoint.status = ruleResult.checkpointStatus;
    checkpoint.currentValue = `${params.value}${params.unit ? ` ${params.unit}` : ""}`;
    checkpoint.updatedAt = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    checkpoint.notes = ruleResult.message;

    // Issue generation if rule flagged
    let createdIssue: Issue | undefined;
    if (ruleResult.shouldCreateIssue && ruleResult.issueDetails) {
      createdIssue = {
        id: `iss-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        category: ruleResult.issueDetails.category,
        title: ruleResult.issueDetails.title,
        severity: ruleResult.issueDetails.severity,
        description: ruleResult.issueDetails.description,
        status: "open",
        location: checkpoint.name,
        observationId: obsId,
        createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        loggedBy: inspection.inspector,
        observedText: params.spokenText || `${params.item}: ${params.value}`,
        flagReason: ruleResult.issueDetails.flagReason,
        recommendedAction: ruleResult.issueDetails.recommendedAction,
        history: [
          {
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            action: `Flagged by rule: ${ruleResult.ruleName}`,
          },
        ],
      };
      inspection.issues.push(createdIssue);
      inspection.issuesCount = inspection.issues.length;

      // Event
      inspection.events.push({
        id: `evt-${Date.now()}`,
        type: "rule_flag",
        timestamp: nowStr,
        description: `Alert: ${ruleResult.issueDetails.title}`,
      });
    }

    // Add transcript if spoken text was provided
    if (params.spokenText) {
      inspection.transcripts.push({
        id: `msg-${Date.now()}-worker`,
        speaker: "worker",
        speakerName: inspection.inspector,
        role: "Kitchen Inspector",
        text: params.spokenText,
        timestamp: nowStr,
      });
    }

    // Recalculate inspection metrics
    inspection.checkpointsCompleted = inspection.checkpoints.filter(
      (c) => c.status === "verified" || c.status === "warning"
    ).length;
    inspection.readinessScore = calculateReadinessScore(inspection);

    // Formulate Voice Response
    let voiceResponse = "";
    let badge: string | undefined;

    if (ruleResult.status === "missing_information") {
      if (ruleResult.missingFields?.includes("paper_towels") || ruleResult.missingFields?.includes("hand_soap")) {
        voiceResponse = "I still need to verify soap and paper towels. Are both available?";
      } else if (checkpoint.id === "chk-1" || checkpoint.id === "chk-2") {
        voiceResponse = "I need the temperature reading to verify this cold storage unit.";
      } else {
        voiceResponse = ruleResult.message;
      }
      badge = "Incomplete";
    } else if (ruleResult.shouldCreateIssue) {
      voiceResponse = `${params.item} recorded at ${params.value}${params.unit || ""}, which exceeds the safety threshold. I've flagged it for attention.`;
      badge = "Limit Exceeded";
    } else if (contradictionCheck.hasContradiction) {
      voiceResponse = `I noted ${params.item} at ${params.value}${params.unit || ""}. Note that this replaces the previous reading of ${contradictionCheck.previousValue}.`;
      badge = "Updated";
    } else {
      voiceResponse = `${params.item} recorded at ${params.value}${params.unit || ""}. Compliant.`;
      badge = "Compliant";
    }

    // Record assistant transcript
    inspection.transcripts.push({
      id: `msg-${Date.now()}-assistant`,
      speaker: "assistant",
      speakerName: "KitchenGuard",
      role: "Voice Agent",
      text: voiceResponse,
      timestamp: nowStr,
      badge,
    });

    saveInspection(inspection);

    return {
      success: true,
      toolName: "recordObservation",
      data: {
        observation: newObservation,
        issueCreated: createdIssue,
        contradictionDetected: contradictionCheck.hasContradiction,
      },
      voiceResponse,
      badge,
      inspectionState: {
        id: inspection.id,
        status: inspection.status,
        readinessScore: inspection.readinessScore,
        checkpointsCompleted: inspection.checkpointsCompleted,
        checkpointsTotal: inspection.checkpointsTotal,
        issuesCount: inspection.issuesCount,
        issuesResolved: inspection.issuesResolved,
      },
    };
  }

  /**
   * 3. completeCheckpoint
   */
  public static completeCheckpoint(params: {
    inspectionId?: string;
    checkpointId: string;
    evidenceValues?: string;
  }): ToolExecutionResponse<Checkpoint | { status: string; missing: string[] }> {
    const inspection = this.resolveInspection(params.inspectionId);
    const checkpoint = inspection.checkpoints.find((c) => c.id === params.checkpointId);

    if (!checkpoint) {
      return {
        success: false,
        toolName: "completeCheckpoint",
        error: `Checkpoint "${params.checkpointId}" not found.`,
        voiceResponse: `I couldn't find checkpoint ${params.checkpointId}.`,
      };
    }

    // Check required fields against checkpoint observations
    const def = STANDARD_CHECKPOINTS.find((d) => d.id === checkpoint.id);
    if (def && def.requiredEvidenceFields.length > 0) {
      const obsForCheckpoint = inspection.observations.filter((o) => o.checkpointId === checkpoint.id);
      const obsText = obsForCheckpoint.map((o) => `${o.item} ${o.value}`).join(" ").toLowerCase();

      const missing: string[] = [];
      for (const field of def.requiredEvidenceFields) {
        if (field === "temperature") {
          const hasTemp = obsForCheckpoint.some((o) => {
            const raw = o.value.replace(/minus\s*/gi, "-").replace(/[^\d.-]/g, "");
            return !isNaN(parseFloat(raw));
          });
          if (!hasTemp && !params.evidenceValues) missing.push("temperature");
        } else if (field === "soap") {
          const hasSoap = obsText.includes("soap");
          if (!hasSoap && !params.evidenceValues) missing.push("soap_confirmed");
        } else if (field === "paper_towels") {
          const hasTowels = obsText.includes("towel");
          if (!hasTowels && !params.evidenceValues) missing.push("paper_towels_confirmed");
        } else if (field === "titration_ppm") {
          const hasPpm = obsText.includes("ppm") || /\d+/.test(obsText);
          if (!hasPpm && !params.evidenceValues) missing.push("titration_ppm");
        }
      }

      if (missing.length > 0 && !params.evidenceValues) {
        return {
          success: false,
          toolName: "completeCheckpoint",
          data: { status: "pending", missing },
          error: `Missing required evidence for ${checkpoint.name}. Required: ${missing.join(", ")}.`,
          voiceResponse: `Cannot complete ${checkpoint.name} yet. Verification for ${missing.join(" and ")} is required.`,
        };
      }
    }

    checkpoint.status = "verified";
    checkpoint.updatedAt = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    if (params.evidenceValues) {
      checkpoint.currentValue = params.evidenceValues;
    }

    inspection.checkpointsCompleted = inspection.checkpoints.filter(
      (c) => c.status === "verified" || c.status === "warning"
    ).length;
    inspection.readinessScore = calculateReadinessScore(inspection);

    saveInspection(inspection);

    return {
      success: true,
      toolName: "completeCheckpoint",
      data: checkpoint,
      voiceResponse: `${checkpoint.name} marked verified.`,
      inspectionState: {
        id: inspection.id,
        status: inspection.status,
        readinessScore: inspection.readinessScore,
        checkpointsCompleted: inspection.checkpointsCompleted,
        checkpointsTotal: inspection.checkpointsTotal,
        issuesCount: inspection.issuesCount,
        issuesResolved: inspection.issuesResolved,
      },
    };
  }

  /**
   * 4. updateObservation (Correction handling with deterministic rule re-evaluation)
   */
  public static updateObservation(params: {
    inspectionId?: string;
    observationId?: string;
    item?: string;
    newValue: string;
    reason?: string;
  }): ToolExecutionResponse<{ observation: Observation; correction: Correction }> {
    const inspection = this.resolveInspection(params.inspectionId);

    let observation: Observation | undefined;
    if (params.observationId) {
      observation = inspection.observations.find((o) => o.id === params.observationId);
    }
    if (!observation && params.item) {
      const q = params.item.toLowerCase();
      observation = inspection.observations
        .slice()
        .reverse()
        .find((o) => o.item.toLowerCase().includes(q));
    }
    if (!observation && inspection.observations.length > 0) {
      observation = inspection.observations[inspection.observations.length - 1];
    }

    if (!observation) {
      return {
        success: false,
        toolName: "updateObservation",
        error: "No observation found to update.",
        voiceResponse: "I could not find an existing observation to update.",
      };
    }

    const previousValue = observation.value;
    const nowStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    // Create Correction record
    const correction: Correction = {
      id: `corr-${Date.now()}`,
      checkpointId: observation.checkpointId,
      itemName: observation.item,
      previousValue: previousValue,
      newValue: params.newValue,
      reason: params.reason || "Spoken voice correction",
      timestamp: nowStr,
      status: "accepted",
    };

    inspection.corrections.push(correction);
    inspection.correctionsCount = inspection.corrections.length;

    // Mutate observation
    observation.previousValue = previousValue;
    observation.value = params.newValue;
    observation.timestamp = nowStr;
    observation.reason = "Voice correction accepted";

    // Re-evaluate deterministic rules on new value
    const checkpoint = inspection.checkpoints.find((c) => c.id === observation!.checkpointId);
    const ruleResult = evaluateObservationRules({
      checkpointId: checkpoint ? checkpoint.id : "chk-1",
      checkpointName: checkpoint ? checkpoint.name : "Cold Storage",
      category: checkpoint ? checkpoint.category : "temperature",
      item: observation.item,
      value: params.newValue,
      unit: observation.unit,
    });

    observation.ruleEvaluation = ruleResult.message;
    if (checkpoint) {
      checkpoint.currentValue = params.newValue;
      checkpoint.status = ruleResult.checkpointStatus;
      checkpoint.notes = ruleResult.message;
      checkpoint.updatedAt = nowStr;
    }

    // Flag issue if newly non-compliant
    if (ruleResult.shouldCreateIssue && ruleResult.issueDetails) {
      const issue: Issue = {
        id: `iss-${Date.now()}`,
        category: ruleResult.issueDetails.category,
        title: ruleResult.issueDetails.title,
        severity: ruleResult.issueDetails.severity,
        description: ruleResult.issueDetails.description,
        status: "open",
        location: checkpoint ? checkpoint.name : "Cold Storage",
        observationId: observation.id,
        createdAt: nowStr,
        loggedBy: inspection.inspector,
        observedText: `${observation.item} corrected to ${params.newValue}`,
        flagReason: ruleResult.issueDetails.flagReason,
        recommendedAction: ruleResult.issueDetails.recommendedAction,
        history: [{ time: nowStr, action: "Logged via correction update" }],
      };
      inspection.issues.push(issue);
      inspection.issuesCount = inspection.issues.length;
    }

    // Log Event
    inspection.events.push({
      id: `evt-${Date.now()}`,
      type: "correction",
      timestamp: nowStr,
      description: `Inspector corrected ${observation.item} from ${previousValue} to ${params.newValue}`,
    });

    inspection.readinessScore = calculateReadinessScore(inspection);

    const voiceResponse = `Updated ${observation.item} to ${params.newValue}. ${
      ruleResult.shouldCreateIssue ? `Note: Exceeds threshold (${ruleResult.expectedValue}). Flagged for attention.` : "Compliant."
    }`;

    inspection.transcripts.push({
      id: `msg-${Date.now()}-assistant`,
      speaker: "assistant",
      speakerName: "KitchenGuard",
      role: "Voice Agent",
      text: voiceResponse,
      timestamp: nowStr,
      badge: ruleResult.shouldCreateIssue ? "Limit Exceeded" : "Updated",
    });

    saveInspection(inspection);

    return {
      success: true,
      toolName: "updateObservation",
      data: { observation, correction },
      voiceResponse,
      inspectionState: {
        id: inspection.id,
        status: inspection.status,
        readinessScore: inspection.readinessScore,
        checkpointsCompleted: inspection.checkpointsCompleted,
        checkpointsTotal: inspection.checkpointsTotal,
        issuesCount: inspection.issuesCount,
        issuesResolved: inspection.issuesResolved,
      },
    };
  }

  /**
   * acceptCorrection
   */
  public static acceptCorrection(params: {
    inspectionId?: string;
    correctionId?: string;
  }): ToolExecutionResponse<{ correction: Correction; observation?: Observation }> {
    const inspection = this.resolveInspection(params.inspectionId);
    const correction = params.correctionId
      ? inspection.corrections.find((c) => c.id === params.correctionId)
      : inspection.corrections[inspection.corrections.length - 1];

    if (!correction) {
      return {
        success: false,
        toolName: "acceptCorrection",
        error: "No correction found to accept.",
        voiceResponse: "There is no pending correction to accept.",
      };
    }

    const nowStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    correction.status = "accepted";
    correction.acceptedAt = nowStr;

    const observation =
      inspection.observations.find((o) => o.id === correction.observationId) ||
      inspection.observations
        .slice()
        .reverse()
        .find((o) => o.item.toLowerCase().includes(correction.itemName.toLowerCase())) ||
      inspection.observations[inspection.observations.length - 1];

    if (observation) {
      observation.previousValue = correction.previousValue;
      observation.value = correction.newValue;
      observation.status = "attention";

      const checkpoint = inspection.checkpoints.find((c) => c.id === observation.checkpointId);
      const ruleResult = evaluateObservationRules({
        checkpointId: checkpoint ? checkpoint.id : "chk-1",
        checkpointName: checkpoint ? checkpoint.name : "Cold Storage",
        category: checkpoint ? checkpoint.category : "temperature",
        item: observation.item,
        value: correction.newValue,
        unit: observation.unit,
      });

      observation.ruleEvaluation = ruleResult.message;
      if (checkpoint) {
        checkpoint.currentValue = correction.newValue;
        checkpoint.status = ruleResult.checkpointStatus;
        checkpoint.notes = ruleResult.message;
      }
    }

    inspection.events.push({
      id: `evt-${Date.now()}`,
      type: "correction_accepted",
      timestamp: nowStr,
      description: `Correction accepted: ${correction.itemName} set to ${correction.newValue}`,
    });

    inspection.readinessScore = calculateReadinessScore(inspection);
    saveInspection(inspection);

    return {
      success: true,
      toolName: "acceptCorrection",
      data: { correction, observation },
      voiceResponse: `Correction accepted. Updated ${correction.itemName} to ${correction.newValue}.`,
    };
  }

  /**
   * rejectCorrection
   */
  public static rejectCorrection(params: {
    inspectionId?: string;
    correctionId?: string;
  }): ToolExecutionResponse<{ correction: Correction }> {
    const inspection = this.resolveInspection(params.inspectionId);
    const correction = params.correctionId
      ? inspection.corrections.find((c) => c.id === params.correctionId)
      : inspection.corrections[inspection.corrections.length - 1];

    if (!correction) {
      return {
        success: false,
        toolName: "rejectCorrection",
        error: "No correction found to reject.",
        voiceResponse: "There is no pending correction to reject.",
      };
    }

    const nowStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    correction.status = "rejected";

    const observation =
      inspection.observations.find((o) => o.id === correction.observationId) ||
      inspection.observations
        .slice()
        .reverse()
        .find((o) => o.item.toLowerCase().includes(correction.itemName.toLowerCase())) ||
      inspection.observations[inspection.observations.length - 1];

    if (observation) {
      observation.value = correction.previousValue;
      observation.previousValue = undefined;
    }

    inspection.events.push({
      id: `evt-${Date.now()}`,
      type: "correction_rejected",
      timestamp: nowStr,
      description: `Correction rejected: kept ${correction.previousValue} for ${correction.itemName}`,
    });

    inspection.readinessScore = calculateReadinessScore(inspection);
    saveInspection(inspection);

    return {
      success: true,
      toolName: "rejectCorrection",
      data: { correction },
      voiceResponse: `Correction rejected. Kept previous reading of ${correction.previousValue}.`,
    };
  }

  /**
   * 5. flagIssue
   */
  public static flagIssue(params: {
    inspectionId?: string;
    checkpointId?: string;
    category: string;
    title: string;
    severity?: "low" | "medium" | "high" | "critical";
    description: string;
    location?: string;
    observationId?: string;
    recommendedAction?: string;
  }): ToolExecutionResponse<Issue> {
    const inspection = this.resolveInspection(params.inspectionId);
    const nowStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    // Deduplication check: prevent duplicate open issue for same title or same observation
    const existing = inspection.issues.find(
      (i) =>
        i.status !== "resolved" &&
        ((params.observationId && i.observationId === params.observationId) ||
          i.title.toLowerCase() === params.title.toLowerCase())
    );
    if (existing) {
      return {
        success: true,
        toolName: "flagIssue",
        data: existing,
        voiceResponse: `Issue "${params.title}" is already logged and currently open.`,
      };
    }

    const newIssue: Issue = {
      id: `iss-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      inspectionId: inspection.id,
      observationId: params.observationId,
      category: params.category,
      title: params.title,
      severity: params.severity || "high",
      description: params.description,
      status: "open",
      location: params.location || "Kitchen Floor",
      createdAt: nowStr,
      loggedBy: inspection.inspector,
      flagReason: "Explicitly flagged during walkthrough inspection",
      recommendedAction: params.recommendedAction || "Inspect and remediate immediately",
      history: [{ time: nowStr, action: "Issue logged" }],
    };

    inspection.issues.push(newIssue);
    inspection.issuesCount = inspection.issues.length;

    // If associated with a checkpoint, mark it warning
    if (params.checkpointId) {
      const chk = inspection.checkpoints.find((c) => c.id === params.checkpointId);
      if (chk) chk.status = "warning";
    }

    inspection.events.push({
      id: `evt-${Date.now()}`,
      type: "rule_flag",
      timestamp: nowStr,
      description: `Flagged: ${params.title}`,
    });

    inspection.readinessScore = calculateReadinessScore(inspection);

    const voiceResponse = `Flagged ${params.location || params.category}: ${params.title}. Added to open issues.`;

    inspection.transcripts.push({
      id: `msg-${Date.now()}-assistant`,
      speaker: "assistant",
      speakerName: "KitchenGuard",
      role: "Voice Agent",
      text: voiceResponse,
      timestamp: nowStr,
      badge: "Issue Flagged",
    });

    saveInspection(inspection);

    return {
      success: true,
      toolName: "flagIssue",
      data: newIssue,
      voiceResponse,
      inspectionState: {
        id: inspection.id,
        status: inspection.status,
        readinessScore: inspection.readinessScore,
        checkpointsCompleted: inspection.checkpointsCompleted,
        checkpointsTotal: inspection.checkpointsTotal,
        issuesCount: inspection.issuesCount,
        issuesResolved: inspection.issuesResolved,
      },
    };
  }

  /**
   * 6. resolveIssue
   */
  public static resolveIssue(params: {
    inspectionId?: string;
    issueId?: string;
    titleSearch?: string;
    resolutionNotes?: string;
  }): ToolExecutionResponse<Issue> {
    const inspection = this.resolveInspection(params.inspectionId);
    let targetIssue: Issue | undefined;

    if (params.issueId) {
      targetIssue = inspection.issues.find((i) => i.id === params.issueId);
    }
    if (!targetIssue && params.titleSearch) {
      const q = params.titleSearch.toLowerCase();
      targetIssue = inspection.issues.find(
        (i) =>
          i.status !== "resolved" &&
          (i.title.toLowerCase().includes(q) ||
            i.category.toLowerCase().includes(q) ||
            i.location.toLowerCase().includes(q) ||
            (q.includes("towel") && i.title.toLowerCase().includes("towel")))
      );
    }
    if (!targetIssue) {
      // Pick first open issue
      targetIssue = inspection.issues.find((i) => i.status !== "resolved");
    }

    if (!targetIssue) {
      return {
        success: false,
        toolName: "resolveIssue",
        error: "No matching open issue found to resolve.",
        voiceResponse: "There are no matching open issues to resolve.",
      };
    }

    const nowStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    targetIssue.status = "resolved";
    targetIssue.resolvedAt = nowStr;
    targetIssue.resolutionNote = params.resolutionNotes || "Issue marked resolved via voice command";
    if (!targetIssue.history) targetIssue.history = [];
    targetIssue.history.push({
      time: nowStr,
      action: params.resolutionNotes || "Issue marked resolved via voice command",
    });

    inspection.issuesResolved = inspection.issues.filter((i) => i.status === "resolved").length;

    // Check if checkpoint can return to verified
    const remainingOpenForLocation = inspection.issues.filter(
      (i) => i.location === targetIssue!.location && i.status !== "resolved"
    );
    if (remainingOpenForLocation.length === 0) {
      const chk = inspection.checkpoints.find((c) => c.name === targetIssue!.location);
      if (chk && chk.status === "warning") {
        chk.status = "verified";
      }
    }

    inspection.events.push({
      id: `evt-${Date.now()}`,
      type: "resolution",
      timestamp: nowStr,
      description: `Resolved: ${targetIssue.title}`,
    });

    inspection.readinessScore = calculateReadinessScore(inspection);

    const voiceResponse = `${targetIssue.title} marked resolved.`;

    inspection.transcripts.push({
      id: `msg-${Date.now()}-assistant`,
      speaker: "assistant",
      speakerName: "KitchenGuard",
      role: "Voice Agent",
      text: voiceResponse,
      timestamp: nowStr,
      badge: "Resolved",
    });

    saveInspection(inspection);

    return {
      success: true,
      toolName: "resolveIssue",
      data: targetIssue,
      voiceResponse,
      badge: "Resolved",
      inspectionState: {
        id: inspection.id,
        status: inspection.status,
        readinessScore: inspection.readinessScore,
        checkpointsCompleted: inspection.checkpointsCompleted,
        checkpointsTotal: inspection.checkpointsTotal,
        issuesCount: inspection.issuesCount,
        issuesResolved: inspection.issuesResolved,
      },
    };
  }

  /**
   * 7. getMissingChecks
   */
  public static getMissingChecks(params: {
    inspectionId?: string;
  }): ToolExecutionResponse<{
    count: number;
    items: Array<{ checkpointId: string; name: string; missing: string[] }>;
    pendingCheckpoints: Checkpoint[];
    remainingCount: number;
  }> {
    const inspection = this.resolveInspection(params.inspectionId);
    const pending = inspection.checkpoints.filter((c) => c.status === "pending");

    let voiceResponse = "";
    if (pending.length === 0) {
      voiceResponse = "All checkpoints have been inspected.";
    } else {
      const names = pending.slice(0, 3).map((c) => c.name);
      const more = pending.length > 3 ? ` and ${pending.length - 3} more` : "";
      voiceResponse = `You still have ${pending.length} checkpoint${pending.length === 1 ? "" : "s"} remaining: ${names.join(", ")}${more}.`;
    }

    const items = pending.map((c) => {
      const def = STANDARD_CHECKPOINTS.find((d) => d.id === c.id);
      return {
        checkpointId: c.id,
        name: c.name,
        missing: def?.requiredEvidenceFields || [c.category],
      };
    });

    return {
      success: true,
      toolName: "getMissingChecks",
      data: {
        count: pending.length,
        items,
        pendingCheckpoints: pending,
        remainingCount: pending.length,
      },
      voiceResponse,
    };
  }

  /**
   * 8. getCurrentInspectionState
   */
  public static getCurrentInspectionState(params: {
    inspectionId?: string;
  }): ToolExecutionResponse<Inspection> {
    const inspection = this.resolveInspection(params.inspectionId);
    const openIssues = inspection.issues.filter((i) => i.status !== "resolved").length;

    const voiceResponse = `Inspection is ${inspection.status.replace("_", " ")}. ${inspection.checkpointsCompleted} of ${
      inspection.checkpointsTotal
    } checkpoints completed, readiness score is ${inspection.readinessScore}%, with ${openIssues} open issue${
      openIssues === 1 ? "" : "s"
    }.`;

    return {
      success: true,
      toolName: "getCurrentInspectionState",
      data: inspection,
      voiceResponse,
    };
  }

  /**
   * 9. reviewInspection
   */
  public static reviewInspection(params: {
    inspectionId?: string;
  }): ToolExecutionResponse<{
    readyToFinalize: boolean;
    canFinalize: boolean;
    completed: number;
    total: number;
    unresolvedIssues: number;
    missingChecks: number;
    pendingCorrections: number;
    readinessScore: number;
    reasons: string[];
  }> {
    const inspection = this.resolveInspection(params.inspectionId);
    const check = canFinalizeInspection(inspection);

    inspection.status = "needs_review";
    saveInspection(inspection);

    let voiceResponse = "";
    if (check.allowed) {
      voiceResponse = `Inspection is ready for sign-off. Readiness score is ${check.readinessScore}%. All mandatory criteria are satisfied.`;
    } else {
      voiceResponse = `Inspection review: readiness score is ${check.readinessScore}%. Sign-off is blocked because ${check.reasons[0]}`;
    }

    const unresolved = inspection.issues.filter((i) => i.status !== "resolved").length;
    const pendingCorr = inspection.corrections.filter(
      (c) => c.status === "pending" || c.status === "pending_confirmation"
    ).length;

    return {
      success: true,
      toolName: "reviewInspection",
      data: {
        readyToFinalize: check.allowed,
        canFinalize: check.allowed,
        completed: inspection.checkpointsCompleted,
        total: inspection.checkpointsTotal,
        unresolvedIssues: unresolved,
        missingChecks: check.missingCheckpoints.length,
        pendingCorrections: pendingCorr,
        readinessScore: check.readinessScore,
        reasons: check.reasons,
      },
      voiceResponse,
    };
  }

  /**
   * 10. finalizeInspection (Strict Safety Gate)
   */
  public static finalizeInspection(params: {
    inspectionId?: string;
    inspectorSignoff?: string;
    force?: string;
  }): ToolExecutionResponse<Inspection> {
    const inspection = this.resolveInspection(params.inspectionId);
    const check = canFinalizeInspection(inspection);

    const isForced = params.force === "true";

    if (!check.allowed && !isForced) {
      const reasonSummary = check.reasons.join(" ");
      return {
        success: false,
        toolName: "finalizeInspection",
        error: reasonSummary,
        voiceResponse: `Cannot finalize inspection. ${check.reasons[0]} Please resolve before completing.`,
        data: inspection,
      };
    }

    const nowStr = new Date().toISOString();
    inspection.status = "completed";
    inspection.completedAt = nowStr;
    if (params.inspectorSignoff) {
      inspection.inspector = params.inspectorSignoff;
    }

    inspection.events.push({
      id: `evt-${Date.now()}`,
      type: "complete",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      description: `Inspection completed and signed off by ${inspection.inspector}. Readiness score: ${check.readinessScore}%`,
    });

    const voiceResponse = `Inspection finalized successfully by ${inspection.inspector}. Final readiness score is ${check.readinessScore}%.`;

    inspection.transcripts.push({
      id: `msg-${Date.now()}-assistant`,
      speaker: "assistant",
      speakerName: "KitchenGuard",
      role: "Voice Agent",
      text: voiceResponse,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      badge: "Completed",
    });

    saveInspection(inspection);

    return {
      success: true,
      toolName: "finalizeInspection",
      data: inspection,
      voiceResponse,
      inspectionState: {
        id: inspection.id,
        status: inspection.status,
        readinessScore: inspection.readinessScore,
        checkpointsCompleted: inspection.checkpointsCompleted,
        checkpointsTotal: inspection.checkpointsTotal,
        issuesCount: inspection.issuesCount,
        issuesResolved: inspection.issuesResolved,
      },
    };
  }
}
