export interface ToolDefinition {
  name: string;
  description: string;
  parameters: {
    type: "object";
    properties: Record<string, {
      type: string;
      description: string;
      enum?: string[];
    }>;
    required: string[];
  };
}

export const KITCHENGUARD_TOOLS: ToolDefinition[] = [
  {
    name: "startInspection",
    description: "Initiates a new food safety inspection or resumes an existing active inspection.",
    parameters: {
      type: "object",
      properties: {
        inspectionType: {
          type: "string",
          description: "Type of inspection (opening, closing, deep-clean, custom-voice)",
          enum: ["opening", "closing", "deep-clean", "custom-voice"],
        },
        kitchen: {
          type: "string",
          description: "Name of the kitchen or station (e.g., 'Main Kitchen')",
        },
        inspector: {
          type: "string",
          description: "Name of the inspector or worker conducting the audit",
        },
      },
      required: [],
    },
  },
  {
    name: "recordObservation",
    description: "Records a hands-free spoken observation for a kitchen checkpoint, runs deterministic rules, and checks for contradictions.",
    parameters: {
      type: "object",
      properties: {
        inspectionId: {
          type: "string",
          description: "Optional ID of the inspection (defaults to active inspection)",
        },
        checkpointId: {
          type: "string",
          description: "Optional ID of the checkpoint (e.g., 'chk-1', 'chk-2')",
        },
        checkpointName: {
          type: "string",
          description: "Name or area of the checkpoint (e.g., 'Cold Storage', 'Deep Freezer', 'Food Separation')",
        },
        item: {
          type: "string",
          description: "The specific item or fixture observed (e.g., 'walk-in refrigerator', 'sanitizer bucket')",
        },
        value: {
          type: "string",
          description: "The observed measurement or condition (e.g., '4', '-18', '200', 'vegetables above chicken')",
        },
        unit: {
          type: "string",
          description: "Unit of measurement if applicable (e.g., '°C', 'PPM')",
        },
        notes: {
          type: "string",
          description: "Additional context or spoken details",
        },
        spokenText: {
          type: "string",
          description: "The verbatim user utterance from speech",
        },
      },
      required: ["item", "value"],
    },
  },
  {
    name: "completeCheckpoint",
    description: "Validates and marks a checkpoint verified after ensuring all mandatory evidence fields are satisfied.",
    parameters: {
      type: "object",
      properties: {
        inspectionId: {
          type: "string",
          description: "Optional inspection ID",
        },
        checkpointId: {
          type: "string",
          description: "ID of the checkpoint to complete (e.g. 'chk-1')",
        },
        evidenceValues: {
          type: "string",
          description: "JSON string or description of recorded evidence satisfying requirements",
        },
      },
      required: ["checkpointId"],
    },
  },
  {
    name: "updateObservation",
    description: "Corrects a previously recorded observation, maintains immutable audit history, and re-evaluates deterministic rules.",
    parameters: {
      type: "object",
      properties: {
        inspectionId: {
          type: "string",
          description: "Optional inspection ID",
        },
        observationId: {
          type: "string",
          description: "Optional ID of the specific observation to update",
        },
        item: {
          type: "string",
          description: "Name of the item being corrected (e.g., 'walk-in refrigerator')",
        },
        newValue: {
          type: "string",
          description: "The corrected value (e.g., '6')",
        },
        reason: {
          type: "string",
          description: "Reason for the correction",
        },
      },
      required: ["newValue"],
    },
  },
  {
    name: "acceptCorrection",
    description: "Accepts a pending voice observation correction, updates the current value, and re-evaluates rules.",
    parameters: {
      type: "object",
      properties: {
        inspectionId: {
          type: "string",
          description: "Optional inspection ID",
        },
        correctionId: {
          type: "string",
          description: "Optional ID of the correction to accept",
        },
      },
      required: [],
    },
  },
  {
    name: "rejectCorrection",
    description: "Rejects a pending voice observation correction and preserves the previous observation value in state.",
    parameters: {
      type: "object",
      properties: {
        inspectionId: {
          type: "string",
          description: "Optional inspection ID",
        },
        correctionId: {
          type: "string",
          description: "Optional ID of the correction to reject",
        },
      },
      required: [],
    },
  },
  {
    name: "flagIssue",
    description: "Explicitly flags a food safety issue, assigns severity, and prompts recommended corrective action.",
    parameters: {
      type: "object",
      properties: {
        inspectionId: {
          type: "string",
          description: "Optional inspection ID",
        },
        checkpointId: {
          type: "string",
          description: "Optional associated checkpoint ID",
        },
        category: {
          type: "string",
          description: "Category of the issue (e.g., 'Cold Storage', 'Hygiene', 'Cross-Contamination')",
        },
        title: {
          type: "string",
          description: "Short descriptive title of the issue",
        },
        severity: {
          type: "string",
          description: "Severity level of the issue",
          enum: ["low", "medium", "high", "critical"],
        },
        description: {
          type: "string",
          description: "Detailed description of the non-compliant finding",
        },
        location: {
          type: "string",
          description: "Physical location within the kitchen",
        },
        recommendedAction: {
          type: "string",
          description: "Recommended immediate remediation",
        },
      },
      required: ["category", "title", "description"],
    },
  },
  {
    name: "resolveIssue",
    description: "Marks an open food-safety issue as resolved with audit timestamp and remediation action.",
    parameters: {
      type: "object",
      properties: {
        inspectionId: {
          type: "string",
          description: "Optional inspection ID",
        },
        issueId: {
          type: "string",
          description: "Optional specific issue ID (e.g. 'iss-1')",
        },
        titleSearch: {
          type: "string",
          description: "Keywords to match issue title or location (e.g., 'paper towels', 'refrigerator seal')",
        },
        resolutionNotes: {
          type: "string",
          description: "Description of corrective action taken",
        },
      },
      required: [],
    },
  },
  {
    name: "getMissingChecks",
    description: "Retrieves all remaining unverified checkpoints and missing required evidence fields.",
    parameters: {
      type: "object",
      properties: {
        inspectionId: {
          type: "string",
          description: "Optional inspection ID",
        },
      },
      required: [],
    },
  },
  {
    name: "getCurrentInspectionState",
    description: "Returns the current state of the inspection including score, completed count, and active issues.",
    parameters: {
      type: "object",
      properties: {
        inspectionId: {
          type: "string",
          description: "Optional inspection ID",
        },
      },
      required: [],
    },
  },
  {
    name: "reviewInspection",
    description: "Performs pre-completion audit verification and reports readiness score and blockers.",
    parameters: {
      type: "object",
      properties: {
        inspectionId: {
          type: "string",
          description: "Optional inspection ID",
        },
      },
      required: [],
    },
  },
  {
    name: "finalizeInspection",
    description: "Enforces strict safety gate and finalizes inspection only if all criteria are met.",
    parameters: {
      type: "object",
      properties: {
        inspectionId: {
          type: "string",
          description: "Optional inspection ID",
        },
        inspectorSignoff: {
          type: "string",
          description: "Inspector name or signature code",
        },
        force: {
          type: "string",
          description: "Force finalization despite non-critical warnings ('true' or 'false')",
        },
      },
      required: [],
    },
  },
  {
    name: "rememberObservation",
    description: "Extracts, normalizes, links, and stores a durable spatial observation or entity relationship in persistent memory.",
    parameters: {
      type: "object",
      properties: {
        subject: {
          type: "string",
          description: "The item or object being located (e.g., 'blue cleaning bucket', 'digital thermometer')",
        },
        relation: {
          type: "string",
          description: "Spatial relation preposition (e.g., 'under', 'inside', 'next to', 'behind', 'above')",
        },
        object: {
          type: "string",
          description: "The reference fixture, container, or equipment (e.g., 'walk-in refrigerator', 'top drawer', 'sink')",
        },
        locationDescription: {
          type: "string",
          description: "Optional human-readable location description",
        },
        isCorrection: {
          type: "string",
          description: "Set to 'true' if this observation corrects a prior mistake",
        },
        sourceText: {
          type: "string",
          description: "The raw spoken text",
        },
        inspectionId: {
          type: "string",
          description: "Optional active inspection ID",
        },
        kitchenId: {
          type: "string",
          description: "Optional kitchen ID (defaults to 'kitch-1')",
        },
      },
      required: ["subject", "relation", "object"],
    },
  },
  {
    name: "locateEntity",
    description: "Locates an entity in kitchen persistent memory using strict spatial relationships. Never hallucinates.",
    parameters: {
      type: "object",
      properties: {
        entity: {
          type: "string",
          description: "The name of the entity to find (e.g., 'blue bucket', 'thermometer')",
        },
        temporalScope: {
          type: "string",
          description: "Scope of lookup: 'current' (default) or 'historical'",
          enum: ["current", "historical", "all"],
        },
        kitchenId: {
          type: "string",
          description: "Optional kitchen ID",
        },
      },
      required: ["entity"],
    },
  },
  {
    name: "reverseLocate",
    description: "Performs reverse spatial lookup: 'What is [under/inside/next to] the [object]?'. Respects temporal states.",
    parameters: {
      type: "object",
      properties: {
        relation: {
          type: "string",
          description: "The spatial relation preposition (e.g., 'under', 'inside', 'next to')",
        },
        object: {
          type: "string",
          description: "The reference fixture or container (e.g., 'walk-in refrigerator', 'top drawer')",
        },
        kitchenId: {
          type: "string",
          description: "Optional kitchen ID",
        },
      },
      required: ["relation", "object"],
    },
  },
  {
    name: "getMemoryHistory",
    description: "Returns the complete chronological movement and provenance history for an entity.",
    parameters: {
      type: "object",
      properties: {
        entity: {
          type: "string",
          description: "The entity name whose history to fetch (e.g., 'blue bucket')",
        },
        kitchenId: {
          type: "string",
          description: "Optional kitchen ID",
        },
      },
      required: ["entity"],
    },
  },
  {
    name: "updateMemory",
    description: "Explicitly updates or moves an entity's location in persistent memory.",
    parameters: {
      type: "object",
      properties: {
        entity: {
          type: "string",
          description: "The entity being moved or updated",
        },
        newRelation: {
          type: "string",
          description: "The new spatial relation (e.g., 'next to', 'inside')",
        },
        newObject: {
          type: "string",
          description: "The new reference fixture or container (e.g., 'sink', 'drawer')",
        },
        reason: {
          type: "string",
          description: "Reason for movement or correction",
        },
        kitchenId: {
          type: "string",
          description: "Optional kitchen ID",
        },
      },
      required: ["entity", "newRelation", "newObject"],
    },
  },
  {
    name: "searchMemory",
    description: "Performs semantic vector and keyword search across kitchen memory records.",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Search text or keyword",
        },
        timeRange: {
          type: "string",
          description: "Filter by 'all', 'current', or 'historical'",
          enum: ["all", "current", "historical"],
        },
        kitchenId: {
          type: "string",
          description: "Optional kitchen ID",
        },
      },
      required: ["query"],
    },
  },
];

