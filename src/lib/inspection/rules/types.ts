import { CheckpointStatus, IssueSeverity } from "../../../types/inspection";

export type RuleEvaluationStatus =
  | "compliant"
  | "requires_attention"
  | "critical_violation"
  | "missing_information";

export interface RuleResult {
  ruleId: string;
  ruleName: string;
  status: RuleEvaluationStatus;
  checkpointStatus: CheckpointStatus;
  severity: IssueSeverity;
  message: string;
  actualValue: unknown;
  expectedValue: unknown;
  difference?: number;
  unit?: string | null;
  shouldCreateIssue: boolean;
  issueDetails?: {
    category: string;
    title: string;
    severity: IssueSeverity;
    description: string;
    recommendedAction: string;
    flagReason: string;
  };
  missingFields?: string[];
  metadata?: Record<string, unknown>;
}

export interface RuleEvaluationContext {
  checkpointId: string;
  checkpointName: string;
  category: string;
  item: string;
  value: number | string | boolean;
  unit?: string | null;
  notes?: string | null;
  existingObservations?: Array<{
    item: string;
    value: string;
    status: string;
  }>;
}

export interface InspectionRuleEngineConfig {
  cold_storage: {
    maximumTemperatureC: number;
    recommendedMinC: number;
    warningMarginC: number;
  };
  freezer: {
    maximumTemperatureC: number;
    recommendedTargetC: number;
  };
  cleaning: {
    minTitrationPpm: number;
    maxTitrationPpm: number;
  };
  labels: {
    maxShelfLifeDays: number;
  };
  food_separation: {
    strictVerticalHierarchy: boolean;
    requireSealedContainers: boolean;
  };
  hand_washing: {
    requireSoap: boolean;
    requirePaperTowels: boolean;
    requireWarmWater: boolean;
    minWaterTempC: number;
  };
}
