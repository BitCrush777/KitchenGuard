import { RuleResult, RuleEvaluationContext, InspectionRuleEngineConfig } from "./types";

/**
 * Deterministic Cross-Contamination & Food Separation Rule Evaluator
 * Enforces safe storage hierarchy:
 * Ready-to-eat / produce / cooked food on TOP shelves
 * Raw poultry / chicken on BOTTOM shelves (never above produce or ready-to-eat)
 */
export function evaluateFoodSeparationRule(
  context: RuleEvaluationContext,
  config: InspectionRuleEngineConfig
): RuleResult {
  const text = `${context.item} ${context.value} ${context.notes || ""}`.toLowerCase();

  // Safe configurations:
  // e.g. "vegetables are stored above the chicken", "chicken on bottom shelf", "separated properly"
  const safeVerticalOrderRegex =
    /(vegetable|produce|salad|ready-to-eat|cooked).*(above|over|on top of).*(chicken|poultry|raw meat)/i;
  const safeVerticalOrder = safeVerticalOrderRegex.test(text);

  const chickenOnBottomRegex =
    /(chicken|poultry|raw meat).*(below|under|beneath).*(vegetable|produce|salad|cooked|ready-to-eat)/i;
  const chickenOnBottom =
    chickenOnBottomRegex.test(text) ||
    ((text.includes("chicken") || text.includes("poultry") || text.includes("raw meat")) &&
      (text.includes("bottom shelf") || text.includes("lowest shelf")));

  const explicitlySeparated =
    text.includes("properly separated") ||
    text.includes("compliant separation") ||
    text.includes("correct storage order") ||
    text.includes("no cross contamination");

  // Cross-contamination hazard detection:
  // e.g. "chicken above vegetables", "raw poultry above salad", "chicken on top shelf", "chicken stored above produce"
  const chickenAboveProduceRegex =
    /(chicken|poultry|raw meat).*(above|over|on top of).*(vegetable|produce|salad|cooked|ready-to-eat)/i;
  const chickenAboveProduce = chickenAboveProduceRegex.test(text);

  const produceBelowChickenRegex =
    /(vegetable|produce|salad).*(below|under|beneath).*(chicken|poultry|raw meat)/i;
  const produceBelowChicken = produceBelowChickenRegex.test(text);

  const rawOnTopShelf =
    (text.includes("chicken") || text.includes("raw meat") || text.includes("raw poultry")) &&
    (text.includes("top shelf") || text.includes("upper shelf"));

  const isCrossContaminationViolation =
    (chickenAboveProduce || produceBelowChicken || rawOnTopShelf) && !safeVerticalOrder;

  if (isCrossContaminationViolation) {
    return {
      ruleId: "food-separation-vertical-order",
      ruleName: "Vertical Storage Food Separation (HACCP)",
      status: "critical_violation",
      checkpointStatus: "warning",
      severity: "critical",
      message: "Critical cross-contamination risk: Raw poultry/meat observed above ready-to-eat produce or food items.",
      actualValue: "Raw meat/poultry stored above ready-to-eat items",
      expectedValue: "Raw poultry on bottom shelf; ready-to-eat produce on upper shelves",
      shouldCreateIssue: true,
      issueDetails: {
        category: "Food Storage & Handling",
        title: "Cross-contamination risk: Raw poultry stored above ready-to-eat food",
        severity: "critical",
        description: "Raw poultry or meat was observed positioned above produce or ready-to-eat food in cold storage. Drip risk creates high pathogen cross-contamination hazard.",
        recommendedAction: "Immediately relocate all raw poultry to the bottom-most shelf beneath any produce and sanitize contact surfaces.",
        flagReason: "Inverted vertical storage hierarchy violates HACCP cross-contamination prevention rule.",
      },
    };
  }

  // Check unsealed / open raw food containers
  if (config.food_separation.requireSealedContainers) {
    const unsealedRaw =
      (text.includes("unsealed") || text.includes("open container") || text.includes("uncovered")) &&
      (text.includes("raw") || text.includes("chicken") || text.includes("meat") || text.includes("fish"));

    if (unsealedRaw) {
      return {
        ruleId: "food-separation-unsealed-raw",
        ruleName: "Raw Protein Storage Enclosure",
        status: "requires_attention",
        checkpointStatus: "warning",
        severity: "high",
        message: "Unsealed or uncovered raw protein container observed in walk-in cooler.",
        actualValue: "Uncovered container",
        expectedValue: "Sealed container with tight-fitting lid or film wrap",
        shouldCreateIssue: true,
        issueDetails: {
          category: "Food Storage & Handling",
          title: "Uncovered raw protein container",
          severity: "high",
          description: "Raw meat or poultry container is left uncovered in storage, risking airborne or accidental splash contamination.",
          recommendedAction: "Apply food-grade lid or plastic wrap and label with prep date.",
          flagReason: "Raw protein must be sealed when not in active preparation.",
        },
      };
    }
  }

  // If clearly compliant or explicitly separated
  if (safeVerticalOrder || chickenOnBottom || explicitlySeparated) {
    return {
      ruleId: "food-separation-vertical-order",
      ruleName: "Vertical Storage Food Separation (HACCP)",
      status: "compliant",
      checkpointStatus: "verified",
      severity: "low",
      message: "Proper food separation observed. Ready-to-eat produce is stored safely above raw proteins on bottom shelves.",
      actualValue: "Produce above poultry / proteins on bottom",
      expectedValue: "Ready-to-eat above raw poultry",
      shouldCreateIssue: false,
    };
  }

  // Fallback for general positive observation
  const isPositive =
    text.includes("good") ||
    text.includes("correct") ||
    text.includes("pass") ||
    text.includes("clean") ||
    text.includes("organized") ||
    text.includes("yes") ||
    context.value === true;

  if (isPositive) {
    return {
      ruleId: "food-separation-general",
      ruleName: "General Food Separation",
      status: "compliant",
      checkpointStatus: "verified",
      severity: "low",
      message: "Food storage and separation verified compliant.",
      actualValue: "Separated",
      expectedValue: "Properly separated",
      shouldCreateIssue: false,
    };
  }

  // Default: Missing sufficient detail
  return {
    ruleId: "food-separation-unverified",
    ruleName: "Food Separation Verification",
    status: "missing_information",
    checkpointStatus: "pending",
    severity: "low",
    message: "Observation recorded. Please confirm shelf position of raw proteins versus ready-to-eat items.",
    actualValue: context.value,
    expectedValue: "Produce on upper shelves, raw proteins below",
    shouldCreateIssue: false,
    missingFields: ["raw_protein_shelf_position", "container_seal_status"],
  };
}
