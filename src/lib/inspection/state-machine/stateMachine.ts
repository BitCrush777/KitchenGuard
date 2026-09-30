import {
  Inspection,
  InspectionStatus,
  Checkpoint,
  CheckpointStatus,
  Issue,
  IssueStatus,
} from "@/types/inspection";

export interface FinalizationCheckResult {
  allowed: boolean;
  reasons: string[];
  missingCheckpoints: Checkpoint[];
  unresolvedIssues: Issue[];
  readinessScore: number;
}

/**
 * Calculates a deterministic readiness score based on verified checkpoints and open issues.
 */
export function calculateReadinessScore(inspection: Inspection): number {
  const total = inspection.checkpoints.length || 8;
  const verifiedCount = inspection.checkpoints.filter((c) => c.status === "verified").length;
  const warningCount = inspection.checkpoints.filter((c) => c.status === "warning").length;

  // Base checkpoint completion percentage: up to 100 points
  // Verified = 1.0, Warning = 0.5, Failed/Pending = 0
  const checkpointPoints = ((verifiedCount * 1.0 + warningCount * 0.5) / total) * 100;

  // Penalty deductions for open issues
  let deductions = 0;
  for (const issue of inspection.issues) {
    if (issue.status !== "resolved") {
      switch (issue.severity) {
        case "critical":
          deductions += 20;
          break;
        case "high":
          deductions += 10;
          break;
        case "medium":
          deductions += 5;
          break;
        case "low":
          deductions += 2;
          break;
      }
    }
  }

  const score = Math.max(0, Math.min(100, Math.round(checkpointPoints - deductions)));
  return score;
}

/**
 * Validates whether an inspection can legally transition to "completed".
 * Enforces the core food-safety safety gate.
 */
export function canFinalizeInspection(inspection: Inspection): FinalizationCheckResult {
  const reasons: string[] = [];

  // 1. Check for pending checkpoints
  const pendingCheckpoints = inspection.checkpoints.filter(
    (c) => c.status === "pending"
  );
  if (pendingCheckpoints.length > 0) {
    reasons.push(
      `${pendingCheckpoints.length} checkpoint(s) remain unverified: ${pendingCheckpoints
        .map((c) => c.name)
        .join(", ")}.`
    );
  }

  // 2. Check for unresolved critical or high severity issues
  const blockingIssues = inspection.issues.filter(
    (i) => i.status !== "resolved" && (i.severity === "critical" || i.severity === "high")
  );
  if (blockingIssues.length > 0) {
    reasons.push(
      `${blockingIssues.length} unresolved high/critical issue(s) require remediation before sign-off: ${blockingIssues
        .map((i) => `"${i.title}" (${i.severity})`)
        .join(", ")}.`
    );
  }

  // 3. Minimum checkpoint requirement
  const verifiedCount = inspection.checkpoints.filter((c) => c.status === "verified").length;
  if (verifiedCount === 0) {
    reasons.push("Cannot finalize an inspection with zero verified checkpoints.");
  }

  // 4. Pending corrections requirement
  const pendingCorrections = inspection.corrections.filter(
    (c) => c.status === "pending" || c.status === "pending_confirmation"
  );
  if (pendingCorrections.length > 0) {
    reasons.push(
      `${pendingCorrections.length} pending observation correction(s) must be confirmed or rejected before finalization.`
    );
  }

  const readinessScore = calculateReadinessScore(inspection);

  return {
    allowed: reasons.length === 0,
    reasons,
    missingCheckpoints: pendingCheckpoints,
    unresolvedIssues: blockingIssues,
    readinessScore,
  };
}

/**
 * Validates state transitions for an inspection.
 */
export function validateInspectionTransition(
  current: InspectionStatus,
  next: InspectionStatus
): { valid: boolean; reason?: string } {
  if (current === next) return { valid: true };

  const validTransitions: Record<InspectionStatus, InspectionStatus[]> = {
    draft: ["in_progress"],
    in_progress: ["needs_review", "completed"],
    needs_review: ["in_progress", "completed"],
    completed: ["in_progress"], // Re-opening for audited amendments
  };

  const allowed = validTransitions[current]?.includes(next);
  if (!allowed) {
    return {
      valid: false,
      reason: `Invalid inspection transition from "${current}" to "${next}".`,
    };
  }

  return { valid: true };
}

/**
 * Validates state transitions for a checkpoint.
 */
export function validateCheckpointTransition(
  current: CheckpointStatus,
  next: CheckpointStatus
): { valid: boolean; reason?: string } {
  if (current === next) return { valid: true };

  const validTransitions: Record<CheckpointStatus, CheckpointStatus[]> = {
    pending: ["verified", "warning", "failed", "skipped"],
    verified: ["warning", "failed", "pending"],
    warning: ["verified", "failed", "pending"],
    failed: ["verified", "warning", "pending"],
    skipped: ["pending", "verified"],
  };

  const allowed = validTransitions[current]?.includes(next);
  if (!allowed) {
    return {
      valid: false,
      reason: `Invalid checkpoint transition from "${current}" to "${next}".`,
    };
  }

  return { valid: true };
}

/**
 * Validates state transitions for an issue.
 */
export function validateIssueTransition(
  current: IssueStatus,
  next: IssueStatus
): { valid: boolean; reason?: string } {
  if (current === next) return { valid: true };

  const validTransitions: Record<IssueStatus, IssueStatus[]> = {
    open: ["in_progress", "resolved"],
    in_progress: ["open", "resolved"],
    resolved: ["open", "in_progress"], // Re-opening if re-occurred
  };

  const allowed = validTransitions[current]?.includes(next);
  if (!allowed) {
    return {
      valid: false,
      reason: `Invalid issue transition from "${current}" to "${next}".`,
    };
  }

  return { valid: true };
}
