export type EntityType =
  | "equipment"
  | "tool"
  | "cleaning_supply"
  | "food_item"
  | "container"
  | "storage_area"
  | "room"
  | "surface"
  | "fixture"
  | "object"
  | "person"
  | "other";

export type EntityStatus = "active" | "inactive" | "merged" | "archived";

export interface MemoryEntity {
  id: string;
  restaurantId: string;
  kitchenId: string;
  type: EntityType;
  canonicalName: string;
  displayName: string;
  aliases: string[];
  description?: string;
  createdAt: string;
  updatedAt: string;
  status: EntityStatus;
  metadata?: Record<string, unknown>;
}

export type SpatialRelationType =
  | "UNDER"
  | "ABOVE"
  | "BELOW"
  | "INSIDE"
  | "OUTSIDE"
  | "NEXT_TO"
  | "BESIDE"
  | "BEHIND"
  | "IN_FRONT_OF"
  | "NEAR"
  | "FAR_FROM"
  | "ON"
  | "UNDERNEATH"
  | "BETWEEN"
  | "LEFT_OF"
  | "RIGHT_OF"
  | "IN"
  | "AT"
  | "ATTACHED_TO";

export type MemoryConfidence = "high" | "medium" | "low";
export type MemorySourceType = "voice" | "manual" | "system" | "import";

export interface MemoryRelation {
  id: string;
  restaurantId: string;
  kitchenId: string;
  subjectEntityId: string;
  subjectName: string;
  relationType: SpatialRelationType;
  objectEntityId: string;
  objectName: string;
  locationDescription: string;
  confidence: MemoryConfidence;
  sourceType: MemorySourceType;
  sourceText: string;
  inspectionId?: string;
  checkpointId?: string;
  speaker?: string;
  createdAt: string;
  observedAt: string;
  validFrom: string;
  validUntil?: string | null;
  isCurrent: boolean;
  status: "active" | "historical" | "retracted" | "corrected";
  metadata?: Record<string, unknown>;
}

export interface MemoryFact {
  id: string;
  restaurantId: string;
  kitchenId: string;
  entityId: string;
  entityName: string;
  factType: string;
  factValue: string;
  unit?: string | null;
  confidence: MemoryConfidence;
  sourceType: MemorySourceType;
  sourceText: string;
  inspectionId?: string;
  createdAt: string;
  validFrom: string;
  validUntil?: string | null;
  isCurrent: boolean;
  metadata?: Record<string, unknown>;
}

export type MemoryEventType =
  | "MEMORY_CREATED"
  | "MEMORY_CONFIRMED"
  | "MEMORY_UPDATED"
  | "MEMORY_MOVED"
  | "MEMORY_CORRECTED"
  | "MEMORY_RETRACTED"
  | "MEMORY_MERGED";

export interface MemoryEvent {
  id: string;
  memoryId: string;
  eventType: MemoryEventType;
  entityId: string;
  entityName: string;
  oldValue?: string;
  newValue?: string;
  sourceType: MemorySourceType;
  sourceText?: string;
  inspectionId?: string;
  timestamp: string;
  actor: string;
  metadata?: Record<string, unknown>;
}

export interface MemoryEmbedding {
  id: string;
  entityId?: string;
  relationId?: string;
  text: string;
  tokens: string[];
  createdAt: string;
}

export interface EntityLocationResult {
  found: boolean;
  entity: string;
  canonicalName: string;
  relation?: SpatialRelationType;
  object?: string;
  locationDescription?: string;
  isCurrent: boolean;
  observedAt?: string;
  sourceInspection?: string;
  confidence?: MemoryConfidence;
  sourceText?: string;
  historyCount?: number;
  clarificationPrompt?: string;
  isAmbiguous?: boolean;
  matchingEntities?: string[];
  message?: string;
}

export interface ReverseLocateResult {
  found: boolean;
  relation: SpatialRelationType;
  object: string;
  entities: Array<{
    name: string;
    isCurrent: boolean;
    observedAt: string;
    locationDescription: string;
    sourceInspection?: string;
  }>;
  hasHistoricalOnly?: boolean;
  message?: string;
}

export interface MemoryHistoryEntry {
  relation: SpatialRelationType;
  object: string;
  locationDescription: string;
  isCurrent: boolean;
  validFrom: string;
  validUntil?: string | null;
  sourceInspection?: string;
  timestamp: string;
}

export interface MemoryHistoryResult {
  found: boolean;
  entity: string;
  currentState?: MemoryHistoryEntry | null;
  history: MemoryHistoryEntry[];
  events: MemoryEvent[];
  message?: string;
}

export interface RememberObservationParams {
  subject: string;
  relation: string;
  object: string;
  locationDescription?: string;
  confidence?: MemoryConfidence;
  sourceText?: string;
  sourceType?: MemorySourceType;
  inspectionId?: string;
  checkpointId?: string;
  kitchenId?: string;
  restaurantId?: string;
  actor?: string;
  isCorrection?: boolean;
}

export interface LocateEntityParams {
  entity: string;
  kitchenId?: string;
  restaurantId?: string;
  temporalScope?: "current" | "historical" | "all";
  query?: string;
}

export interface ReverseLocateParams {
  relation: string;
  object: string;
  kitchenId?: string;
  restaurantId?: string;
  includeHistorical?: boolean;
  query?: string;
}

export interface UpdateMemoryParams {
  memoryId?: string;
  entity?: string;
  newRelation: string;
  newObject: string;
  reason?: string;
  kitchenId?: string;
  inspectionId?: string;
  actor?: string;
  sourceText?: string;
}

export interface GetMemoryHistoryParams {
  entity: string;
  kitchenId?: string;
  restaurantId?: string;
  query?: string;
}

export interface SearchMemoryParams {
  query: string;
  kitchenId?: string;
  restaurantId?: string;
  timeRange?: "current" | "recent" | "historical" | "all";
  limit?: number;
}
