import { InspectionRuleEngineConfig } from "./types";

/**
 * Default Configurable Operational Thresholds
 * These values can be adjusted through the KitchenGuard configuration interface.
 * They do not contain hard-coded statutory text, only deterministic operational parameters.
 */
export const defaultRuleConfig: InspectionRuleEngineConfig = {
  cold_storage: {
    maximumTemperatureC: 5.0, // Limit: 5.0°C (requires attention above this)
    recommendedMinC: 0.0,
    warningMarginC: 1.0,
  },
  freezer: {
    maximumTemperatureC: -18.0, // Limit: -18.0°C
    recommendedTargetC: -20.0,
  },
  cleaning: {
    minTitrationPpm: 200, // Quaternary ammonium sanitizer minimum concentration
    maxTitrationPpm: 400, // Maximum concentration
  },
  labels: {
    maxShelfLifeDays: 7, // Maximum prepared food shelf life before discard
  },
  food_separation: {
    strictVerticalHierarchy: true, // Raw poultry and proteins below ready-to-eat foods
    requireSealedContainers: true, // Vegetables stored above raw foods must be sealed
  },
  hand_washing: {
    requireSoap: true,
    requirePaperTowels: true,
    requireWarmWater: true,
    minWaterTempC: 38.0,
  },
};

let currentRuleConfig: InspectionRuleEngineConfig = { ...defaultRuleConfig };

export function getRuleConfig(): InspectionRuleEngineConfig {
  return currentRuleConfig;
}

export function updateRuleConfig(newConfig: Partial<InspectionRuleEngineConfig>): InspectionRuleEngineConfig {
  currentRuleConfig = {
    ...currentRuleConfig,
    ...newConfig,
    cold_storage: { ...currentRuleConfig.cold_storage, ...newConfig.cold_storage },
    freezer: { ...currentRuleConfig.freezer, ...newConfig.freezer },
    cleaning: { ...currentRuleConfig.cleaning, ...newConfig.cleaning },
    labels: { ...currentRuleConfig.labels, ...newConfig.labels },
    food_separation: { ...currentRuleConfig.food_separation, ...newConfig.food_separation },
    hand_washing: { ...currentRuleConfig.hand_washing, ...newConfig.hand_washing },
  };
  return currentRuleConfig;
}

export function resetRuleConfig(): InspectionRuleEngineConfig {
  currentRuleConfig = { ...defaultRuleConfig };
  return currentRuleConfig;
}
