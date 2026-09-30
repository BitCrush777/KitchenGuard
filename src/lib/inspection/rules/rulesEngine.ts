import { RuleResult, RuleEvaluationContext, InspectionRuleEngineConfig } from "./types";
import { getRuleConfig } from "./config";
import { evaluateTemperatureRule, parseTemperatureValue } from "./temperatureRule";
import { evaluateFoodSeparationRule } from "./foodSeparationRule";
import { evaluateHygieneRule } from "./hygieneRule";
import { evaluateCleaningRule, parsePpmValue } from "./cleaningRule";
import { evaluateLabelRule } from "./labelRule";

export interface ContradictionCheckResult {
  hasContradiction: boolean;
  previousValue?: string;
  previousObservationId?: string;
  contradictionMessage?: string;
  requiresExplicitConfirmation: boolean;
}

/**
 * Checks if a new observation directly contradicts a prior active observation
 * for the same checkpoint / item.
 */
export function detectContradiction(
  newItem: string,
  newValue: number | string | boolean,
  priorObservations: Array<{ id: string; item: string; value: string; status?: string }>
): ContradictionCheckResult {
  const normNewItem = newItem.trim().toLowerCase();
  const match = priorObservations.find(
    (obs) => obs.item.trim().toLowerCase() === normNewItem
  );

  if (!match) {
    return { hasContradiction: false, requiresExplicitConfirmation: false };
  }

  const prevValStr = String(match.value).trim().toLowerCase();
  const newValStr = String(newValue).trim().toLowerCase();

  // If identical, not a contradiction
  if (prevValStr === newValStr) {
    return { hasContradiction: false, requiresExplicitConfirmation: false };
  }

  // Check temperature contradiction
  const prevTemp = parseTemperatureValue(match.value);
  const newTemp = parseTemperatureValue(newValue);
  if (prevTemp !== null && newTemp !== null) {
    const diff = Math.abs(newTemp - prevTemp);
    if (diff > 0.01) {
      return {
        hasContradiction: true,
        previousValue: match.value,
        previousObservationId: match.id,
        contradictionMessage: `Previous reading for ${newItem} was ${match.value}°C, but new reading is ${newValue}°C (variance of ${diff.toFixed(1)}°C).`,
        requiresExplicitConfirmation: true,
      };
    }
  }

  // Check PPM contradiction
  const prevPpm = parsePpmValue(match.value);
  const newPpm = parsePpmValue(newValue);
  if (prevPpm !== null && newPpm !== null) {
    const diff = Math.abs(newPpm - prevPpm);
    if (diff > 1) {
      return {
        hasContradiction: true,
        previousValue: match.value,
        previousObservationId: match.id,
        contradictionMessage: `Previous concentration was ${match.value} PPM, new reading is ${newValue} PPM (variance of ${diff} PPM).`,
        requiresExplicitConfirmation: true,
      };
    }
  }

  // Status/qualitative contradiction (e.g. clean vs dirty, compliant vs noncompliant)
  const isOpposite =
    (prevValStr.includes("clean") && newValStr.includes("dirty")) ||
    (prevValStr.includes("dirty") && newValStr.includes("clean")) ||
    (prevValStr.includes("compliant") && newValStr.includes("violat")) ||
    (prevValStr.includes("stocked") && newValStr.includes("missing")) ||
    (prevValStr.includes("missing") && newValStr.includes("stocked"));

  if (isOpposite) {
    return {
      hasContradiction: true,
      previousValue: match.value,
      previousObservationId: match.id,
      contradictionMessage: `New observation "${newValue}" contradicts previously recorded status "${match.value}" for ${newItem}.`,
      requiresExplicitConfirmation: true,
    };
  }

  // General update (same item, differing description)
  return {
    hasContradiction: true,
    previousValue: match.value,
    previousObservationId: match.id,
    contradictionMessage: `Updated observation for ${newItem}: changed from "${match.value}" to "${newValue}".`,
    requiresExplicitConfirmation: false,
  };
}

/**
 * Unified Rule Engine Dispatcher
 * Deterministically applies rules based on checkpoint ID, category, or item content.
 */
export function evaluateObservationRules(
  context: RuleEvaluationContext,
  customConfig?: InspectionRuleEngineConfig
): RuleResult {
  const config = customConfig || getRuleConfig();
  const category = (context.category || "").toLowerCase();
  const checkpointId = (context.checkpointId || "").toLowerCase();
  const item = (context.item || "").toLowerCase();
  const text = `${category} ${checkpointId} ${item} ${context.value}`.toLowerCase();

  // 1. Temperature checks (Cold storage, walk-in cooler, deep freezer, blast chiller)
  if (
    category.includes("cold") ||
    category.includes("temperature") ||
    checkpointId.includes("cold") ||
    checkpointId.includes("freezer") ||
    checkpointId.includes("temp") ||
    item.includes("refrigerator") ||
    item.includes("freezer") ||
    item.includes("chiller") ||
    item.includes("cooler") ||
    context.unit === "C" ||
    context.unit === "°C" ||
    context.unit === "F" ||
    context.unit === "°F" ||
    parseTemperatureValue(context.value) !== null
  ) {
    // If it's a PPM measurement or sanitizer, avoid temperature evaluation
    if (!text.includes("ppm") && !text.includes("sanitizer") && !text.includes("quat")) {
      return evaluateTemperatureRule(context, config);
    }
  }

  // 2. Food separation / cross-contamination
  if (
    category.includes("storage") ||
    checkpointId.includes("separation") ||
    checkpointId.includes("storage") ||
    text.includes("chicken") ||
    text.includes("vegetable") ||
    text.includes("produce") ||
    text.includes("shelf") ||
    text.includes("separation") ||
    text.includes("cross contamination")
  ) {
    return evaluateFoodSeparationRule(context, config);
  }

  // 3. Handwashing / Hygiene
  if (
    category.includes("hygiene") ||
    category.includes("handwash") ||
    checkpointId.includes("hygiene") ||
    checkpointId.includes("handwash") ||
    text.includes("soap") ||
    text.includes("paper towel") ||
    text.includes("sink") ||
    text.includes("hand wash")
  ) {
    return evaluateHygieneRule(context, config);
  }

  // 4. Cleaning & Sanitizer Titration
  if (
    category.includes("clean") ||
    category.includes("sanit") ||
    checkpointId.includes("clean") ||
    checkpointId.includes("sanit") ||
    text.includes("sanitizer") ||
    text.includes("ppm") ||
    text.includes("titration") ||
    text.includes("quat") ||
    text.includes("bleach")
  ) {
    return evaluateCleaningRule(context, config);
  }

  // 5. Date marking & FIFO labels
  if (
    category.includes("label") ||
    checkpointId.includes("label") ||
    text.includes("label") ||
    text.includes("fifo") ||
    text.includes("prep date") ||
    text.includes("discard") ||
    text.includes("shelf life")
  ) {
    return evaluateLabelRule(context, config);
  }

  // Fallback generic deterministic evaluation
  const isPositive =
    text.includes("compliant") ||
    text.includes("verified") ||
    text.includes("pass") ||
    text.includes("good") ||
    text.includes("ok") ||
    context.value === true;

  if (isPositive) {
    return {
      ruleId: "standard-compliance-check",
      ruleName: "Standard Checkpoint Verification",
      status: "compliant",
      checkpointStatus: "verified",
      severity: "low",
      message: `Observation for ${context.item} is compliant.`,
      actualValue: context.value,
      expectedValue: "Compliant observation",
      shouldCreateIssue: false,
    };
  }

  return {
    ruleId: "standard-compliance-check",
    ruleName: "Standard Checkpoint Verification",
    status: "compliant",
    checkpointStatus: "verified",
    severity: "low",
    message: `Observation recorded for ${context.item}: ${context.value}`,
    actualValue: context.value,
    expectedValue: "Standard observation",
    shouldCreateIssue: false,
  };
}
