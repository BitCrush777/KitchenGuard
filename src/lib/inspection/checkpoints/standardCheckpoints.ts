import { Checkpoint } from "@/types/inspection";

export interface StandardCheckpointDefinition {
  id: string;
  name: string;
  category: "storage" | "temperature" | "hygiene" | "cleaning" | "labels" | "waste";
  description: string;
  target: string;
  unit?: string;
  requiredEvidenceFields: string[];
  applicableRuleCategory: "cold_storage" | "freezer" | "food_separation" | "hand_washing" | "cleaning" | "labels" | "general";
}

export const STANDARD_CHECKPOINTS: StandardCheckpointDefinition[] = [
  {
    id: "chk-1",
    name: "Cold Storage Line #1",
    category: "temperature",
    description: "Main walk-in chillers and prep reach-in units (Target 0–4°C, Max 5°C)",
    target: "0–4°C",
    unit: "°C",
    requiredEvidenceFields: ["temperature"],
    applicableRuleCategory: "cold_storage",
  },
  {
    id: "chk-2",
    name: "Walk-in Deep Freezer",
    category: "temperature",
    description: "Bulk protein preservation vault and gelato hold",
    target: "< -18°C",
    unit: "°C",
    requiredEvidenceFields: ["temperature"],
    applicableRuleCategory: "freezer",
  },
  {
    id: "chk-3",
    name: "Food Separation & Storage",
    category: "storage",
    description: "Raw poultry and animal proteins isolated below ready-to-eat produce",
    target: "Zero cross-contamination",
    requiredEvidenceFields: ["separation_order", "container_sealing"],
    applicableRuleCategory: "food_separation",
  },
  {
    id: "chk-4",
    name: "Hand Washing Station #1 & #2",
    category: "hygiene",
    description: "Antibacterial soap, warm flow (38–43°C), disposable towels",
    target: "100% Stocked",
    requiredEvidenceFields: ["soap", "paper_towels"],
    applicableRuleCategory: "hand_washing",
  },
  {
    id: "chk-5",
    name: "Prep Table Surfaces",
    category: "cleaning",
    description: "Sanitized 304 food-grade stainless steel surfaces",
    target: "Sanitized",
    requiredEvidenceFields: ["surface_cleanliness"],
    applicableRuleCategory: "cleaning",
  },
  {
    id: "chk-6",
    name: "Sanitizer Buckets (Pass & Butchery)",
    category: "cleaning",
    description: "Quaternary ammonium concentration verification (200–400 PPM)",
    target: "200–400 PPM",
    unit: "PPM",
    requiredEvidenceFields: ["titration_ppm"],
    applicableRuleCategory: "cleaning",
  },
  {
    id: "chk-7",
    name: "Expiration Labels & FIFO",
    category: "labels",
    description: "First-in, first-out rotation tags across prep pans with discard dates",
    target: "All dates valid",
    requiredEvidenceFields: ["prep_date", "discard_date"],
    applicableRuleCategory: "labels",
  },
  {
    id: "chk-8",
    name: "Waste Receptacles & Grease Interceptor",
    category: "waste",
    description: "Foot-pedal cans relined, lids tight, interceptor cleaned",
    target: "Emptied & relined",
    requiredEvidenceFields: ["receptacle_cleanliness", "liner_installed"],
    applicableRuleCategory: "general",
  },
];

export function createInitialCheckpoints(): Checkpoint[] {
  return STANDARD_CHECKPOINTS.map((def) => ({
    id: def.id,
    name: def.name,
    category: def.category,
    description: def.description,
    status: "pending",
    target: def.target,
    unit: def.unit,
    requiredFields: def.requiredEvidenceFields,
    notes: "Awaiting inspection",
    updatedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  }));
}
