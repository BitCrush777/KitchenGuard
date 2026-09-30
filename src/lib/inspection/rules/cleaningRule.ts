import { RuleResult, RuleEvaluationContext, InspectionRuleEngineConfig } from "./types";

export function parsePpmValue(raw: number | string | boolean): number | null {
  if (typeof raw === "number") return isNaN(raw) ? null : raw;
  if (typeof raw !== "string") return null;

  const str = raw.trim().toLowerCase();
  const cleaned = str.replace(/[^\d.]/g, "");
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

/**
 * Deterministic Sanitizer Concentration & Chemical Titration Rule Evaluator
 * Standard Quaternary Ammonium: 200 - 400 PPM
 */
export function evaluateCleaningRule(
  context: RuleEvaluationContext,
  config: InspectionRuleEngineConfig
): RuleResult {
  const text = `${context.item} ${context.value} ${context.notes || ""}`.toLowerCase();
  const ppm = parsePpmValue(context.value);

  const minPpm = config.cleaning.minTitrationPpm; // default 200
  const maxPpm = config.cleaning.maxTitrationPpm; // default 400

  if (ppm !== null) {
    if (ppm < minPpm) {
      const diff = minPpm - ppm;
      return {
        ruleId: "sanitizer-titration-concentration",
        ruleName: "Sanitizer Concentration Threshold (Quat)",
        status: "requires_attention",
        checkpointStatus: "warning",
        severity: ppm < 100 ? "critical" : "high",
        message: `Sanitizer bucket concentration measured at ${ppm} PPM, below minimum requirement of ${minPpm} PPM (-${diff} PPM).`,
        actualValue: `${ppm} PPM`,
        expectedValue: `${minPpm}–${maxPpm} PPM`,
        difference: -diff,
        unit: "PPM",
        shouldCreateIssue: true,
        issueDetails: {
          category: "Sanitation & Chemical Safety",
          title: "Sanitizer concentration below minimum threshold",
          severity: ppm < 100 ? "critical" : "high",
          description: `Line sanitizer bucket tested at ${ppm} PPM. Effective microbial reduction requires at least ${minPpm} PPM.`,
          recommendedAction: "Empty bucket, remix fresh sanitizer solution with test strip verification, and re-test.",
          flagReason: `Concentration ${ppm} PPM is below configured minimum ${minPpm} PPM.`,
        },
      };
    }

    if (ppm > maxPpm) {
      const diff = ppm - maxPpm;
      return {
        ruleId: "sanitizer-titration-concentration",
        ruleName: "Sanitizer Concentration Threshold (Quat)",
        status: "requires_attention",
        checkpointStatus: "warning",
        severity: "medium",
        message: `Sanitizer concentration measured at ${ppm} PPM, exceeding safe ceiling of ${maxPpm} PPM (+${diff} PPM). Risk of chemical residue.`,
        actualValue: `${ppm} PPM`,
        expectedValue: `${minPpm}–${maxPpm} PPM`,
        difference: diff,
        unit: "PPM",
        shouldCreateIssue: true,
        issueDetails: {
          category: "Sanitation & Chemical Safety",
          title: "Sanitizer chemical concentration too high",
          severity: "medium",
          description: `Sanitizer solution at ${ppm} PPM exceeds maximum ${maxPpm} PPM. Toxic chemical residue may transfer to food contact surfaces.`,
          recommendedAction: "Dilute solution with potable water and re-verify with test strips.",
          flagReason: `Concentration ${ppm} PPM exceeds maximum threshold ${maxPpm} PPM.`,
        },
      };
    }

    return {
      ruleId: "sanitizer-titration-concentration",
      ruleName: "Sanitizer Concentration Threshold (Quat)",
      status: "compliant",
      checkpointStatus: "verified",
      severity: "low",
      message: `Sanitizer concentration recorded at ${ppm} PPM. Within compliant range (${minPpm}–${maxPpm} PPM).`,
      actualValue: `${ppm} PPM`,
      expectedValue: `${minPpm}–${maxPpm} PPM`,
      unit: "PPM",
      shouldCreateIssue: false,
    };
  }

  // Non-numeric text evaluations
  const isDirty =
    text.includes("dirty") ||
    text.includes("unclean") ||
    text.includes("grease") ||
    text.includes("crumbs") ||
    text.includes("residue");

  if (isDirty) {
    return {
      ruleId: "surface-sanitation-cleanliness",
      ruleName: "Food Contact Surface Cleanliness",
      status: "requires_attention",
      checkpointStatus: "warning",
      severity: "medium",
      message: `Food contact surface observed non-compliant: ${context.value}. Cleaning required.`,
      actualValue: context.value,
      expectedValue: "Clean and sanitized to sight and touch",
      shouldCreateIssue: true,
      issueDetails: {
        category: "Sanitation & Chemical Safety",
        title: "Food contact surface unclean",
        severity: "medium",
        description: `Food contact surface or prep station found unclean: ${context.value}.`,
        recommendedAction: "Wash, rinse, and sanitize surface before next food prep.",
        flagReason: `Surface cleanliness deficiency noted: ${context.value}`,
      },
    };
  }

  const isClean =
    text.includes("clean") ||
    text.includes("sanitized") ||
    text.includes("spotless") ||
    text.includes("compliant") ||
    text.includes("passed") ||
    context.value === true;

  if (isClean) {
    return {
      ruleId: "surface-sanitation-cleanliness",
      ruleName: "Food Contact Surface Cleanliness",
      status: "compliant",
      checkpointStatus: "verified",
      severity: "low",
      message: "Surface sanitation and cleaning verified compliant.",
      actualValue: "Clean and sanitized",
      expectedValue: "Clean and sanitized",
      shouldCreateIssue: false,
    };
  }

  return {
    ruleId: "cleaning-general",
    ruleName: "Cleaning & Sanitation Verification",
    status: "missing_information",
    checkpointStatus: "pending",
    severity: "low",
    message: "Cleaning observation noted. Please specify titration PPM or surface condition.",
    actualValue: context.value,
    expectedValue: "Sanitizer PPM (200-400) or clean surface check",
    shouldCreateIssue: false,
    missingFields: ["sanitizer_ppm"],
  };
}
