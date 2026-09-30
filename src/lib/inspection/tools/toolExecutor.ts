import { InspectionService, ToolExecutionResponse } from "../services/inspectionService";
import { MemoryService } from "@/lib/memory/memory-service";
import { KITCHENGUARD_TOOLS } from "./toolDefinitions";

export const ALLOWED_TOOL_NAMES = new Set(KITCHENGUARD_TOOLS.map((t) => t.name));

export interface ToolExecutionRequest {
  toolName: string;
  parameters: Record<string, unknown>;
  idempotencyKey?: string;
}

export async function executeInspectionTool(
  request: ToolExecutionRequest
): Promise<ToolExecutionResponse> {
  const { toolName, parameters } = request;

  if (!ALLOWED_TOOL_NAMES.has(toolName)) {
    return {
      success: false,
      toolName,
      error: `Unauthorized or unknown tool: "${toolName}". Must be one of: ${Array.from(
        ALLOWED_TOOL_NAMES
      ).join(", ")}.`,
      voiceResponse: "I cannot execute that command because it is not recognized.",
    };
  }

  try {
    switch (toolName) {
      case "startInspection":
        return InspectionService.startInspection({
          inspectionType: parameters.inspectionType as "opening" | "closing" | "deep-clean" | "custom-voice" | undefined,
          kitchen: parameters.kitchen as string | undefined,
          inspector: parameters.inspector as string | undefined,
        });

      case "recordObservation":
        return InspectionService.recordObservation({
          inspectionId: parameters.inspectionId as string | undefined,
          checkpointId: parameters.checkpointId as string | undefined,
          checkpointName: parameters.checkpointName as string | undefined,
          item: (parameters.item as string) || "General observation",
          value: (parameters.value as string) || "",
          unit: parameters.unit as string | undefined,
          notes: parameters.notes as string | undefined,
          spokenText: parameters.spokenText as string | undefined,
        });

      case "completeCheckpoint":
        return InspectionService.completeCheckpoint({
          inspectionId: parameters.inspectionId as string | undefined,
          checkpointId: (parameters.checkpointId as string) || "chk-1",
          evidenceValues: parameters.evidenceValues as string | undefined,
        });

      case "updateObservation":
        return InspectionService.updateObservation({
          inspectionId: parameters.inspectionId as string | undefined,
          observationId: parameters.observationId as string | undefined,
          item: parameters.item as string | undefined,
          newValue: (parameters.newValue as string) || "",
          reason: parameters.reason as string | undefined,
        });

      case "acceptCorrection":
        return InspectionService.acceptCorrection({
          inspectionId: parameters.inspectionId as string | undefined,
          correctionId: parameters.correctionId as string | undefined,
        });

      case "rejectCorrection":
        return InspectionService.rejectCorrection({
          inspectionId: parameters.inspectionId as string | undefined,
          correctionId: parameters.correctionId as string | undefined,
        });

      case "flagIssue":
        return InspectionService.flagIssue({
          inspectionId: parameters.inspectionId as string | undefined,
          checkpointId: parameters.checkpointId as string | undefined,
          category: (parameters.category as string) || "General",
          title: (parameters.title as string) || "Flagged finding",
          severity: parameters.severity as "low" | "medium" | "high" | "critical" | undefined,
          description: (parameters.description as string) || "",
          location: parameters.location as string | undefined,
          recommendedAction: parameters.recommendedAction as string | undefined,
        });

      case "resolveIssue":
        return InspectionService.resolveIssue({
          inspectionId: parameters.inspectionId as string | undefined,
          issueId: parameters.issueId as string | undefined,
          titleSearch: parameters.titleSearch as string | undefined,
          resolutionNotes: parameters.resolutionNotes as string | undefined,
        });

      case "getMissingChecks":
        return InspectionService.getMissingChecks({
          inspectionId: parameters.inspectionId as string | undefined,
        });

      case "getCurrentInspectionState":
        return InspectionService.getCurrentInspectionState({
          inspectionId: parameters.inspectionId as string | undefined,
        });

      case "reviewInspection":
        return InspectionService.reviewInspection({
          inspectionId: parameters.inspectionId as string | undefined,
        });

      case "finalizeInspection":
        return InspectionService.finalizeInspection({
          inspectionId: parameters.inspectionId as string | undefined,
          inspectorSignoff: parameters.inspectorSignoff as string | undefined,
          force: parameters.force as string | undefined,
        });

      case "rememberObservation": {
        const isCorr = parameters.isCorrection === true || parameters.isCorrection === "true";
        const res = MemoryService.rememberObservation({
          subject: (parameters.subject as string) || (parameters.item as string) || "Item",
          relation: (parameters.relation as string) || "in",
          object: (parameters.object as string) || (parameters.location as string) || "Kitchen",
          locationDescription: parameters.locationDescription as string | undefined,
          isCorrection: isCorr,
          sourceText: (parameters.sourceText as string) || (parameters.spokenText as string) || "",
          inspectionId: parameters.inspectionId as string | undefined,
          kitchenId: parameters.kitchenId as string | undefined,
        });
        return {
          success: res.success,
          toolName,
          data: res,
          voiceResponse: res.voiceResponse,
          badge: "Spatial Memory Saved",
          error: res.error,
        };
      }

      case "locateEntity": {
        const res = MemoryService.locateEntity({
          entity: (parameters.entity as string) || (parameters.item as string) || "",
          temporalScope: parameters.temporalScope as "current" | "historical" | "all" | undefined,
          kitchenId: parameters.kitchenId as string | undefined,
          query: (parameters.query as string) || (parameters.spokenText as string),
        });
        return {
          success: res.found,
          toolName,
          data: res,
          voiceResponse: res.message || "No memory record found.",
          badge: res.found ? "Memory Found" : (res.isAmbiguous ? "Ambiguous Entity" : "Not Found"),
        };
      }

      case "reverseLocate": {
        const res = MemoryService.reverseLocate({
          relation: (parameters.relation as string) || "",
          object: (parameters.object as string) || "",
          kitchenId: parameters.kitchenId as string | undefined,
          query: (parameters.query as string) || (parameters.spokenText as string),
        });
        return {
          success: res.found,
          toolName,
          data: res,
          voiceResponse: res.message || "No matching objects found.",
          badge: res.found ? "Reverse Memory Found" : "Reverse Memory Lookup",
        };
      }

      case "getMemoryHistory": {
        const res = MemoryService.getMemoryHistory({
          entity: (parameters.entity as string) || "",
          kitchenId: parameters.kitchenId as string | undefined,
          query: (parameters.query as string) || (parameters.spokenText as string),
        });
        return {
          success: res.found,
          toolName,
          data: res,
          voiceResponse: res.message || "No history available.",
          badge: "Memory Provenance",
        };
      }

      case "updateMemory": {
        const res = MemoryService.updateMemory({
          entity: (parameters.entity as string) || "",
          newRelation: (parameters.newRelation as string) || "",
          newObject: (parameters.newObject as string) || "",
          reason: parameters.reason as string | undefined,
          kitchenId: parameters.kitchenId as string | undefined,
          sourceText: (parameters.sourceText as string) || (parameters.spokenText as string),
        });
        return {
          success: res.success,
          toolName,
          data: res,
          voiceResponse: res.voiceResponse,
          badge: "Memory Updated",
          error: res.error,
        };
      }

      case "searchMemory": {
        const res = MemoryService.searchMemory({
          query: (parameters.query as string) || "",
          kitchenId: parameters.kitchenId as string | undefined,
          timeRange: parameters.timeRange as "all" | "current" | "historical" | undefined,
        });
        const count = res.results.length;
        return {
          success: true,
          toolName,
          data: res,
          voiceResponse: count > 0 
            ? `Found ${count} matching item${count === 1 ? "" : "s"} in kitchen memory.` 
            : "No matching items found in kitchen memory.",
          badge: "Semantic Memory",
        };
      }

      default:
        return {
          success: false,
          toolName,
          error: `Tool implementation missing for ${toolName}`,
          voiceResponse: "Tool implementation missing.",
        };
    }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Internal server error during tool execution.";
    console.error(`[ToolExecutor] Error executing ${toolName}:`, err);
    return {
      success: false,
      toolName,
      error: errorMsg,
      voiceResponse: "An error occurred while recording that inspection observation.",
    };
  }
}
