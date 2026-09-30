import { RuleResult, RuleEvaluationContext, InspectionRuleEngineConfig } from "./types";

/**
 * Deterministic Hygiene & Hand Washing Station Rule Evaluator
 * Hand washing stations must have:
 * 1. Antimicrobial / liquid hand soap
 * 2. Single-use sanitary paper towels (or approved air dryer)
 * 3. Warm water (≥ 38°C / 100°F)
 * 4. Unobstructed, clean access
 */
export function evaluateHygieneRule(
  context: RuleEvaluationContext,
  _config: InspectionRuleEngineConfig
): RuleResult {
  const text = `${context.item} ${context.value} ${context.notes || ""}`.toLowerCase();

  const missingPaperTowels =
    text.includes("no paper towel") ||
    text.includes("missing paper towel") ||
    text.includes("out of paper towel") ||
    text.includes("empty towel dispenser") ||
    text.includes("without paper towel");

  const missingSoap =
    text.includes("no soap") ||
    text.includes("missing soap") ||
    text.includes("out of soap") ||
    text.includes("empty soap dispenser") ||
    text.includes("without soap");

  const stationBlocked =
    text.includes("blocked") ||
    text.includes("obstructed") ||
    text.includes("cluttered") ||
    text.includes("inaccessible");

  const waterTooCold =
    text.includes("no hot water") ||
    text.includes("cold water only") ||
    text.includes("water not warm");

  if (missingPaperTowels || missingSoap || stationBlocked || waterTooCold) {
    const reasons: string[] = [];
    if (missingPaperTowels) reasons.push("Paper towels missing");
    if (missingSoap) reasons.push("Hand soap missing");
    if (stationBlocked) reasons.push("Sink station obstructed");
    if (waterTooCold) reasons.push("Water temperature insufficient");

    const reasonSummary = reasons.join(", ");

    return {
      ruleId: "hygiene-handwashing-station-supplies",
      ruleName: "Hand Washing Station Mandatory Supplies",
      status: "requires_attention",
      checkpointStatus: "warning",
      severity: missingSoap ? "critical" : "high",
      message: `Hand washing station non-compliant: ${reasonSummary}. Immediate restocking/correction required.`,
      actualValue: reasonSummary,
      expectedValue: "Soap, paper towels, unobstructed warm water",
      shouldCreateIssue: true,
      issueDetails: {
        category: "Hygiene & Sanitation",
        title: `Hand washing station supplies missing: ${reasonSummary}`,
        severity: missingSoap ? "critical" : "high",
        description: `Hand washing station fails compliance criteria. Missing or deficient: ${reasonSummary}. Food handlers cannot maintain sanitary protocols.`,
        recommendedAction: "Restock dispensers immediately with soap/paper towels and clear any station obstructions.",
        flagReason: reasonSummary,
      },
      missingFields: missingPaperTowels ? ["paper_towels"] : missingSoap ? ["hand_soap"] : [],
    };
  }

  // Check if fully supplied
  const isFullySupplied =
    (text.includes("paper towel") || text.includes("towels stocked")) &&
    (text.includes("soap") || text.includes("soap stocked")) &&
    !text.includes("no") &&
    !text.includes("missing");

  // Strict supply verification: both soap AND paper towels must be explicitly confirmed
  const confirmsSoap =
    (text.includes("soap") || text.includes("soap dispenser")) &&
    (text.includes("stocked") || text.includes("supplied") || text.includes("available") || text.includes("full") || text.includes("present") || text.includes("yes") || text.includes("confirmed"));

  const confirmsTowels =
    (text.includes("paper towel") || text.includes("towels") || text.includes("towel dispenser")) &&
    (text.includes("stocked") || text.includes("supplied") || text.includes("available") || text.includes("full") || text.includes("present") || text.includes("yes") || text.includes("confirmed"));

  if (isFullySupplied || (confirmsSoap && confirmsTowels)) {
    return {
      ruleId: "hygiene-handwashing-station-supplies",
      ruleName: "Hand Washing Station Mandatory Supplies",
      status: "compliant",
      checkpointStatus: "verified",
      severity: "low",
      message: "Hand washing station fully stocked with soap, paper towels, and warm water.",
      actualValue: "Soap and paper towels confirmed stocked",
      expectedValue: "Soap and paper towels present",
      shouldCreateIssue: false,
    };
  }

  // If only one component was mentioned (e.g., "soap is stocked" but nothing about paper towels)
  const mentionsSoapOnly = text.includes("soap") && !text.includes("towel");
  const mentionsTowelsOnly = text.includes("towel") && !text.includes("soap");

  if (mentionsSoapOnly || mentionsTowelsOnly) {
    const missing = mentionsSoapOnly ? "paper towels" : "hand soap";
    return {
      ruleId: "hygiene-partial-check",
      ruleName: "Hand Washing Station Verification",
      status: "missing_information",
      checkpointStatus: "pending",
      severity: "low",
      message: `Soap verified. Please also confirm ${missing} status to complete this checkpoint.`,
      actualValue: context.value,
      expectedValue: "Both soap and paper towels verified",
      shouldCreateIssue: false,
      missingFields: [mentionsSoapOnly ? "paper_towels" : "hand_soap"],
    };
  }

  return {
    ruleId: "hygiene-handwashing-general",
    ruleName: "Hand Washing Station Inspection",
    status: "missing_information",
    checkpointStatus: "pending",
    severity: "low",
    message: "Hand washing check initiated. Please verify soap and paper towel status.",
    actualValue: context.value,
    expectedValue: "Soap and paper towels present",
    shouldCreateIssue: false,
    missingFields: ["hand_soap", "paper_towels"],
  };
}
