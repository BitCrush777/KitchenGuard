import {
  AssemblyAIToolResult,
  ToolCallStartInspectionParams,
  ToolCallRecordObservationParams,
  ToolCallUpdateObservationParams,
  ToolCallFlagIssueParams,
  ToolCallCompleteCheckpointParams,
  ToolCallGetMissingChecksParams,
  ToolCallReviewInspectionParams,
  ToolCallFinalizeInspectionParams,
} from "../types/assemblyai";

/**
 * AssemblyAI Service Abstraction
 * 
 * Note: Never expose the AssemblyAI API key directly in client code.
 * All real-time authentication must be negotiated via temporary single-use
 * tokens generated securely on the server.
 */
class AssemblyAIService {
  /**
   * Request an ephemeral session token from the secure backend.
   */
  async createSessionToken(): Promise<{
    token: string;
    expires_in_seconds?: number;
    websocketUrl?: string;
    mode?: string;
    error?: string;
  }> {
    try {
      const response = await fetch("/api/assemblyai/token", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        return {
          token: "mock-session-token-for-dev",
          expires_in_seconds: 600,
          mode: "simulation",
        };
      }

      return await response.json();
    } catch (err) {
      return {
        token: "mock-session-token-for-dev",
        expires_in_seconds: 600,
        mode: "simulation",
        error: err instanceof Error ? err.message : "Network error",
      };
    }
  }

  /**
   * Tool Call: startInspection
   */
  async startInspection(
    _params: ToolCallStartInspectionParams
  ): Promise<AssemblyAIToolResult<{ inspectionId: string }>> {
    return {
      success: true,
      data: { inspectionId: `KG-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-0042` },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Tool Call: recordObservation
   */
  async recordObservation(
    _params: ToolCallRecordObservationParams
  ): Promise<AssemblyAIToolResult<{ observationId: string; status: string }>> {
    return {
      success: true,
      data: {
        observationId: `obs-${Date.now()}`,
        status: "recorded",
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Tool Call: updateObservation
   */
  async updateObservation(
    _params: ToolCallUpdateObservationParams
  ): Promise<AssemblyAIToolResult<{ updated: boolean }>> {
    return {
      success: true,
      data: { updated: true },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Tool Call: flagIssue
   */
  async flagIssue(
    _params: ToolCallFlagIssueParams
  ): Promise<AssemblyAIToolResult<{ issueId: string }>> {
    return {
      success: true,
      data: { issueId: `iss-${Date.now()}` },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Tool Call: completeCheckpoint
   */
  async completeCheckpoint(
    _params: ToolCallCompleteCheckpointParams
  ): Promise<AssemblyAIToolResult<{ completed: boolean }>> {
    return {
      success: true,
      data: { completed: true },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Tool Call: getMissingChecks
   */
  async getMissingChecks(
    _params: ToolCallGetMissingChecksParams
  ): Promise<AssemblyAIToolResult<{ pendingCheckIds: string[] }>> {
    return {
      success: true,
      data: { pendingCheckIds: ["chk-4", "chk-7", "chk-8"] },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Tool Call: reviewInspection
   */
  async reviewInspection(
    _params: ToolCallReviewInspectionParams
  ): Promise<AssemblyAIToolResult<{ readinessScore: number; unaddressedIssues: number }>> {
    return {
      success: true,
      data: { readinessScore: 87, unaddressedIssues: 0 },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Tool Call: finalizeInspection
   */
  async finalizeInspection(
    _params: ToolCallFinalizeInspectionParams
  ): Promise<AssemblyAIToolResult<{ reportId: string; certificateHash: string }>> {
    return {
      success: true,
      data: {
        reportId: `KG-2026-0928-0042`,
        certificateHash: "HASH-VALID-CULINARY-0928-MICHELIN",
      },
      timestamp: new Date().toISOString(),
    };
  }
}

export const assemblyAIService = new AssemblyAIService();
