import { RuleResult, RuleEvaluationContext, InspectionRuleEngineConfig } from "./types";

export function parseTemperatureValue(raw: number | string | boolean): number | null {
  if (typeof raw === "number") return isNaN(raw) ? null : raw;
  if (typeof raw !== "string") return null;

  const str = raw.trim().toLowerCase();
  // Match signs, decimals, or negative numbers like "-18", "minus 18", "4", "6.2"
  const cleaned = str.replace(/minus\s*/gi, "-").replace(/[^\d.-]/g, "");
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

export function evaluateTemperatureRule(
  context: RuleEvaluationContext,
  config: InspectionRuleEngineConfig
): RuleResult {
  const num = parseTemperatureValue(context.value);

  if (num === null) {
    return {
      ruleId: "temp-invalid-format",
      ruleName: "Temperature Numeric Verification",
      status: "requires_attention",
      checkpointStatus: "warning",
      severity: "medium",
      message: `Invalid temperature reading format: "${context.value}". Must be a valid numeric measurement.`,
      actualValue: context.value,
      expectedValue: "Numeric temperature (°C)",
      shouldCreateIssue: false,
    };
  }

  const isFreezer =
    context.checkpointId.toLowerCase().includes("freezer") ||
    context.item.toLowerCase().includes("freezer");

  if (isFreezer) {
    const maxThreshold = config.freezer.maximumTemperatureC;
    const isCompliant = num <= maxThreshold;
    const diff = Number((num - maxThreshold).toFixed(1));

    if (isCompliant) {
      return {
        ruleId: "freezer-temp-threshold",
        ruleName: "Deep Freezer Temperature Limit",
        status: "compliant",
        checkpointStatus: "verified",
        severity: "low",
        message: `Freezer temperature recorded at ${num}°C. Within compliant threshold (≤ ${maxThreshold}°C).`,
        actualValue: num,
        expectedValue: `≤ ${maxThreshold}°C`,
        difference: diff,
        unit: "°C",
        shouldCreateIssue: false,
      };
    } else {
      return {
        ruleId: "freezer-temp-threshold",
        ruleName: "Deep Freezer Temperature Limit",
        status: "requires_attention",
        checkpointStatus: "warning",
        severity: "high",
        message: `Freezer temperature ${num}°C exceeds maximum threshold of ${maxThreshold}°C by +${diff}°C.`,
        actualValue: num,
        expectedValue: `≤ ${maxThreshold}°C`,
        difference: diff,
        unit: "°C",
        shouldCreateIssue: true,
        issueDetails: {
          category: "Cold Storage",
          title: "Deep freezer temperature threshold exceeded",
          severity: "high",
          description: `Deep freezer unit recorded at ${num}°C, exceeding the ${maxThreshold}°C preservation threshold.`,
          recommendedAction: "Check freezer door seal and defrost cycle.",
          flagReason: `Recorded ${num}°C exceeds configured threshold of ${maxThreshold}°C.`,
        },
      };
    }
  }

  // Walk-in / Chiller Cold Storage Rule
  const maxThreshold = config.cold_storage.maximumTemperatureC;
  const isCompliant = num <= maxThreshold;
  const diff = Number((num - maxThreshold).toFixed(1));

  if (isCompliant) {
    return {
      ruleId: "cold-storage-threshold",
      ruleName: "Walk-in Cold Storage Threshold",
      status: "compliant",
      checkpointStatus: "verified",
      severity: "low",
      message: `Cold storage temperature recorded at ${num}°C. Within compliant threshold (≤ ${maxThreshold}°C).`,
      actualValue: num,
      expectedValue: `≤ ${maxThreshold}°C`,
      difference: diff,
      unit: "°C",
      shouldCreateIssue: false,
    };
  }

  // Above configured threshold
  return {
    ruleId: "cold-storage-threshold",
    ruleName: "Walk-in Cold Storage Threshold",
    status: "requires_attention",
    checkpointStatus: "warning",
    severity: num >= maxThreshold + 3 ? "critical" : "high",
    message: `Temperature of ${num}°C exceeds configured limit of ${maxThreshold}°C by +${diff}°C.`,
    actualValue: num,
    expectedValue: `≤ ${maxThreshold}°C`,
    difference: diff,
    unit: "°C",
    shouldCreateIssue: true,
    issueDetails: {
      category: "Cold Storage",
      title: "Cold storage temperature threshold exceeded",
      severity: num >= maxThreshold + 3 ? "critical" : "high",
      description: `Walk-in refrigerator recorded at ${num}°C, which is above the configured ${maxThreshold}°C safety threshold.`,
      recommendedAction: "Adjust chiller damper, check door gasket, and re-verify temperature within 30 minutes.",
      flagReason: `Recorded temperature ${num}°C exceeds configured threshold limit of ${maxThreshold}°C.`,
    },
  };
}
