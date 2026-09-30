import { RuleResult, RuleEvaluationContext, InspectionRuleEngineConfig } from "./types";

/**
 * Deterministic Food Labeling & Expiration Rule Evaluator
 * Verifies prep dates, FIFO rotation, and 7-day maximum shelf life.
 */
export function evaluateLabelRule(
  context: RuleEvaluationContext,
  _config: InspectionRuleEngineConfig
): RuleResult {
  const text = `${context.item} ${context.value} ${context.notes || ""}`.toLowerCase();

  const isMissingLabels =
    text.includes("no label") ||
    text.includes("unlabeled") ||
    text.includes("missing label") ||
    text.includes("no date") ||
    text.includes("undated") ||
    text.includes("without label");

  const isExpired =
    text.includes("expired") ||
    text.includes("past date") ||
    text.includes("past expiration") ||
    text.includes("outdated") ||
    text.includes("spoiled") ||
    text.includes("past 7 days");

  if (isExpired) {
    return {
      ruleId: "label-expiration-discard",
      ruleName: "Prepared Food Expiration & Discard Threshold",
      status: "critical_violation",
      checkpointStatus: "warning",
      severity: "critical",
      message: "Expired food item observed in storage. Immediate discard required.",
      actualValue: "Expired product",
      expectedValue: "Within valid 7-day shelf life",
      shouldCreateIssue: true,
      issueDetails: {
        category: "Food Storage & Handling",
        title: "Expired prepared food observed",
        severity: "critical",
        description: `Food product (${context.item}) has passed its safe use-by/discard date: ${context.value}.`,
        recommendedAction: "Discard expired product immediately into compost/waste bin and log disposal.",
        flagReason: "Holding food beyond shelf life violates safe holding parameters.",
      },
    };
  }

  if (isMissingLabels) {
    return {
      ruleId: "label-presence-and-fifo",
      ruleName: "Date Marking & FIFO Food Identification",
      status: "requires_attention",
      checkpointStatus: "warning",
      severity: "high",
      message: "Prepared food container lacks mandatory date marking and allergen label.",
      actualValue: "Unlabeled container",
      expectedValue: "Legible label with product name, prep date, and discard date",
      shouldCreateIssue: true,
      issueDetails: {
        category: "Food Storage & Handling",
        title: "Unlabeled prepared food container",
        severity: "high",
        description: `Prepared food container in ${context.checkpointName} lacks mandatory date label and discard time.`,
        recommendedAction: "Verify preparation time with kitchen team, apply dated label, or discard if untraceable.",
        flagReason: "TCS food held for >24 hours requires clear 7-day date marking.",
      },
      missingFields: ["prep_date", "discard_date", "product_name"],
    };
  }

  // Proper labeling observed
  const isProperlyLabeled =
    (text.includes("labeled") || text.includes("dated") || text.includes("fifo") || text.includes("sticker")) &&
    !text.includes("unlabeled") &&
    !text.includes("missing");

  const isCompliantGeneral =
    text.includes("compliant") ||
    text.includes("pass") ||
    text.includes("all good") ||
    text.includes("correct") ||
    context.value === true;

  if (isProperlyLabeled || isCompliantGeneral) {
    return {
      ruleId: "label-presence-and-fifo",
      ruleName: "Date Marking & FIFO Food Identification",
      status: "compliant",
      checkpointStatus: "verified",
      severity: "low",
      message: "Date labeling and FIFO rotation verified compliant across all containers.",
      actualValue: "Properly labeled with dates",
      expectedValue: "Dated and labeled",
      shouldCreateIssue: false,
    };
  }

  return {
    ruleId: "label-general",
    ruleName: "Labeling & Expiration Check",
    status: "missing_information",
    checkpointStatus: "pending",
    severity: "low",
    message: "Label check noted. Please specify whether containers have prep and discard date labels.",
    actualValue: context.value,
    expectedValue: "Prep date and discard date verified",
    shouldCreateIssue: false,
    missingFields: ["prep_date", "discard_date"],
  };
}
