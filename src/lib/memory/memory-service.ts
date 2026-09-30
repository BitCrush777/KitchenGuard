import {
  MemoryEntity,
  MemoryRelation,
  MemoryEvent,
  RememberObservationParams,
  LocateEntityParams,
  ReverseLocateParams,
  UpdateMemoryParams,
  GetMemoryHistoryParams,
  SearchMemoryParams,
  EntityLocationResult,
  ReverseLocateResult,
  MemoryHistoryResult,
  MemoryHistoryEntry,
} from "./memory-types";
import {
  getMemoryEntities,
  saveMemoryEntity,
  getMemoryRelations,
  saveMemoryRelation,
  updateMemoryRelation,
  getMemoryEvents,
  saveMemoryEvent,
  getMemoryEmbeddings,
  saveMemoryEmbedding,
} from "../inspection/persistence/database";
import { resolveEntity, createNewEntity, normalizeEntityName } from "./entity-resolution";
import { normalizeSpatialRelation, formatRelationForSpeech } from "./relation-service";
import { createMemoryEmbedding, rankEmbeddings } from "./memory-embeddings";

export class MemoryService {
  /**
   * Default kitchen and restaurant IDs.
   */
  private static DEFAULT_KITCHEN_ID = "kitch-1";
  private static DEFAULT_RESTAURANT_ID = "rest-1";

  /**
   * 1. rememberObservation
   * Extracts, normalizes, links, and stores a durable spatial observation.
   */
  public static rememberObservation(params: RememberObservationParams): {
    success: boolean;
    memoryId?: string;
    voiceResponse: string;
    entity?: MemoryEntity;
    referenceEntity?: MemoryEntity;
    relation?: MemoryRelation;
    error?: string;
  } {
    const kitchenId = params.kitchenId || this.DEFAULT_KITCHEN_ID;
    const restaurantId = params.restaurantId || this.DEFAULT_RESTAURANT_ID;
    const now = new Date().toISOString();

    // 1. Resolve or create Subject Entity
    const existingEntities = getMemoryEntities(kitchenId);
    const subjectRes = resolveEntity(params.subject, existingEntities, kitchenId);
    let subjectEntity = subjectRes.match;

    if (!subjectEntity) {
      subjectEntity = createNewEntity(params.subject, kitchenId, restaurantId);
      saveMemoryEntity(subjectEntity);
    }

    // 2. Resolve or create Object Entity (Reference)
    const objectRes = resolveEntity(params.object, existingEntities, kitchenId);
    let objectEntity = objectRes.match;

    if (!objectEntity) {
      objectEntity = createNewEntity(params.object, kitchenId, restaurantId);
      saveMemoryEntity(objectEntity);
    }

    // 3. Normalize Spatial Relation
    const normalizedRelation = normalizeSpatialRelation(params.relation);
    const speechRelation = formatRelationForSpeech(normalizedRelation);

    // 4. Check for previous current location of this subject entity
    const existingRelations = getMemoryRelations(kitchenId);
    const previousCurrentRelation = existingRelations.find(
      (r) => r.subjectEntityId === subjectEntity!.id && r.isCurrent
    );

    let eventType: "MEMORY_CREATED" | "MEMORY_MOVED" | "MEMORY_CORRECTED" = "MEMORY_CREATED";
    let oldValue: string | undefined;

    if (previousCurrentRelation) {
      oldValue = `${previousCurrentRelation.relationType} ${previousCurrentRelation.objectName}`;

      // Check if location is actually different
      const sameLocation =
        previousCurrentRelation.relationType === normalizedRelation &&
        previousCurrentRelation.objectEntityId === objectEntity.id;

      if (sameLocation) {
        // Confirmation of existing location
        updateMemoryRelation(previousCurrentRelation.id, {
          observedAt: now,
          confidence: params.confidence || "high",
        });

        const confirmEvent: MemoryEvent = {
          id: `m-evt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          memoryId: previousCurrentRelation.id,
          eventType: "MEMORY_CONFIRMED",
          entityId: subjectEntity.id,
          entityName: subjectEntity.displayName,
          newValue: `${normalizedRelation} ${objectEntity.displayName}`,
          sourceType: params.sourceType || "voice",
          sourceText: params.sourceText || `Confirmed ${subjectEntity.displayName} ${speechRelation} ${objectEntity.displayName}`,
          inspectionId: params.inspectionId,
          timestamp: now,
          actor: params.actor || "Kitchen Inspector",
        };
        saveMemoryEvent(confirmEvent);

        return {
          success: true,
          memoryId: previousCurrentRelation.id,
          voiceResponse: `Got it. I confirmed the ${subjectEntity.displayName} is ${speechRelation} the ${objectEntity.displayName}.`,
          entity: subjectEntity,
          referenceEntity: objectEntity,
          relation: previousCurrentRelation,
        };
      }

      // If location changed: determine if it's a movement or a correction
      eventType = params.isCorrection ? "MEMORY_CORRECTED" : "MEMORY_MOVED";

      // Mark previous relation as historical / no longer current
      updateMemoryRelation(previousCurrentRelation.id, {
        isCurrent: false,
        validUntil: now,
        status: params.isCorrection ? "corrected" : "historical",
      });
    }

    // 5. Create new current relation
    const memoryId = `rel-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const locationDesc =
      params.locationDescription ||
      `${speechRelation} the ${objectEntity.displayName}`;

    const newRelation: MemoryRelation = {
      id: memoryId,
      restaurantId,
      kitchenId,
      subjectEntityId: subjectEntity.id,
      subjectName: subjectEntity.displayName,
      relationType: normalizedRelation,
      objectEntityId: objectEntity.id,
      objectName: objectEntity.displayName,
      locationDescription: locationDesc,
      confidence: params.confidence || "high",
      sourceType: params.sourceType || "voice",
      sourceText: params.sourceText || `${subjectEntity.displayName} is ${speechRelation} the ${objectEntity.displayName}`,
      inspectionId: params.inspectionId,
      checkpointId: params.checkpointId,
      createdAt: now,
      observedAt: now,
      validFrom: now,
      validUntil: null,
      isCurrent: true,
      status: "active",
    };

    saveMemoryRelation(newRelation);

    // 6. Log Audit Event
    const memoryEvent: MemoryEvent = {
      id: `m-evt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      memoryId,
      eventType,
      entityId: subjectEntity.id,
      entityName: subjectEntity.displayName,
      oldValue,
      newValue: `${normalizedRelation} ${objectEntity.displayName}`,
      sourceType: params.sourceType || "voice",
      sourceText: params.sourceText || `${subjectEntity.displayName} is ${locationDesc}`,
      inspectionId: params.inspectionId,
      timestamp: now,
      actor: params.actor || "Kitchen Inspector",
    };
    saveMemoryEvent(memoryEvent);

    // 7. Index in semantic memory embeddings
    const embeddingText = `${subjectEntity.displayName} is ${speechRelation} the ${objectEntity.displayName} in kitchen. ${params.sourceText || ""}`;
    const embeddingRecord = createMemoryEmbedding(
      `emb-${memoryId}`,
      embeddingText,
      subjectEntity.id,
      memoryId
    );
    saveMemoryEmbedding(embeddingRecord);

    // Formulate concise voice response
    let voiceResponse = "";
    if (eventType === "MEMORY_MOVED") {
      voiceResponse = `Got it. I've updated the location of the ${subjectEntity.displayName} to ${speechRelation} the ${objectEntity.displayName}.`;
    } else if (eventType === "MEMORY_CORRECTED") {
      voiceResponse = `Understood. I've corrected the recorded location of the ${subjectEntity.displayName} to ${speechRelation} the ${objectEntity.displayName}.`;
    } else {
      voiceResponse = `Got it. I recorded the ${subjectEntity.displayName} ${speechRelation} the ${objectEntity.displayName}.`;
    }

    return {
      success: true,
      memoryId,
      voiceResponse,
      entity: subjectEntity,
      referenceEntity: objectEntity,
      relation: newRelation,
    };
  }

  /**
   * 2. locateEntity
   * Answers: "Where is the [entity]?"
   * Strictly relies on persisted structured memory. Never hallucinates.
   */
  public static locateEntity(params: LocateEntityParams): EntityLocationResult {
    const kitchenId = params.kitchenId || this.DEFAULT_KITCHEN_ID;
    const existingEntities = getMemoryEntities(kitchenId);

    // 1. Resolve entity
    const resolution = resolveEntity(params.entity, existingEntities, kitchenId);

    if (resolution.isAmbiguous) {
      return {
        found: false,
        entity: params.entity,
        canonicalName: params.entity,
        isCurrent: false,
        isAmbiguous: true,
        matchingEntities: resolution.candidates.map((c) => c.displayName),
        clarificationPrompt: resolution.clarificationMessage,
        message: resolution.clarificationMessage,
      };
    }

    if (!resolution.match) {
      return {
        found: false,
        entity: params.entity,
        canonicalName: normalizeEntityName(params.entity),
        isCurrent: false,
        message: `I don't have a recorded location for the ${params.entity}.`,
      };
    }

    const entity = resolution.match;
    const relations = getMemoryRelations(kitchenId).filter(
      (r) => r.subjectEntityId === entity.id
    );

    if (relations.length === 0) {
      return {
        found: false,
        entity: entity.displayName,
        canonicalName: entity.canonicalName,
        isCurrent: false,
        message: `I remember the ${entity.displayName}, but there is no recorded location for it.`,
      };
    }

    // Check for current location
    const currentRelation = relations.find((r) => r.isCurrent);

    if (currentRelation && params.temporalScope !== "historical") {
      const speechRelation = formatRelationForSpeech(currentRelation.relationType);

      return {
        found: true,
        entity: entity.displayName,
        canonicalName: entity.canonicalName,
        relation: currentRelation.relationType,
        object: currentRelation.objectName,
        locationDescription: currentRelation.locationDescription,
        isCurrent: true,
        observedAt: currentRelation.observedAt,
        sourceInspection: currentRelation.inspectionId,
        confidence: currentRelation.confidence,
        sourceText: currentRelation.sourceText,
        historyCount: relations.length,
        message: `The ${entity.displayName} is currently recorded ${speechRelation} the ${currentRelation.objectName}.`,
      };
    }

    // Historical location check
    const sortedHistorical = relations
      .filter((r) => !r.isCurrent)
      .sort((a, b) => new Date(b.observedAt).getTime() - new Date(a.observedAt).getTime());

    if (sortedHistorical.length > 0) {
      const latestHistory = sortedHistorical[0];
      const speechRelation = formatRelationForSpeech(latestHistory.relationType);

      return {
        found: true,
        entity: entity.displayName,
        canonicalName: entity.canonicalName,
        relation: latestHistory.relationType,
        object: latestHistory.objectName,
        locationDescription: latestHistory.locationDescription,
        isCurrent: false,
        observedAt: latestHistory.observedAt,
        sourceInspection: latestHistory.inspectionId,
        confidence: latestHistory.confidence,
        sourceText: latestHistory.sourceText,
        historyCount: relations.length,
        message: `The ${entity.displayName} was previously recorded ${speechRelation} the ${latestHistory.objectName}.`,
      };
    }

    return {
      found: false,
      entity: entity.displayName,
      canonicalName: entity.canonicalName,
      isCurrent: false,
      message: `I don't have a recorded location for the ${entity.displayName}.`,
    };
  }

  /**
   * 3. reverseLocate
   * Answers: "What is [under/inside/next to] the [object]?"
   * Enforces temporal reasoning: does not return moved/historical objects as current.
   */
  public static reverseLocate(params: ReverseLocateParams): ReverseLocateResult {
    const kitchenId = params.kitchenId || this.DEFAULT_KITCHEN_ID;
    const normalizedRelation = normalizeSpatialRelation(params.relation);
    const speechRelation = formatRelationForSpeech(normalizedRelation);

    const existingEntities = getMemoryEntities(kitchenId);
    const objectRes = resolveEntity(params.object, existingEntities, kitchenId);

    if (!objectRes.match) {
      return {
        found: false,
        relation: normalizedRelation,
        object: params.object,
        entities: [],
        message: `I don't have a record for ${params.object}.`,
      };
    }

    const objectEntity = objectRes.match;
    const relations = getMemoryRelations(kitchenId).filter(
      (r) => r.objectEntityId === objectEntity.id && r.relationType === normalizedRelation
    );

    // Filter current objects
    const currentRelations = relations.filter((r) => r.isCurrent);

    if (currentRelations.length > 0) {
      const names = currentRelations.map((r) => r.subjectName);

      return {
        found: true,
        relation: normalizedRelation,
        object: objectEntity.displayName,
        entities: currentRelations.map((r) => ({
          name: r.subjectName,
          isCurrent: true,
          observedAt: r.observedAt,
          locationDescription: r.locationDescription,
          sourceInspection: r.inspectionId,
        })),
        message: `The ${names.join(", ")} is currently recorded ${speechRelation} the ${objectEntity.displayName}.`,
      };
    }

    // Check if there were historical objects that have since been moved
    const historicalRelations = relations.filter((r) => !r.isCurrent);

    if (historicalRelations.length > 0) {
      const prevNames = Array.from(new Set(historicalRelations.map((r) => r.subjectName)));

      return {
        found: false,
        relation: normalizedRelation,
        object: objectEntity.displayName,
        entities: historicalRelations.map((r) => ({
          name: r.subjectName,
          isCurrent: false,
          observedAt: r.observedAt,
          locationDescription: r.locationDescription,
          sourceInspection: r.inspectionId,
        })),
        hasHistoricalOnly: true,
        message: `There is no currently recorded object ${speechRelation} the ${objectEntity.displayName}. (Previously, the ${prevNames.join(", ")} was recorded there.)`,
      };
    }

    return {
      found: false,
      relation: normalizedRelation,
      object: objectEntity.displayName,
      entities: [],
      message: `Nothing is currently recorded ${speechRelation} the ${objectEntity.displayName}.`,
    };
  }

  /**
   * 4. getMemoryHistory
   * Returns full chronological provenance, movement events, and corrections for an entity.
   */
  public static getMemoryHistory(params: GetMemoryHistoryParams): MemoryHistoryResult {
    const kitchenId = params.kitchenId || this.DEFAULT_KITCHEN_ID;
    const existingEntities = getMemoryEntities(kitchenId);
    const resolution = resolveEntity(params.entity, existingEntities, kitchenId);

    if (!resolution.match) {
      return {
        found: false,
        entity: params.entity,
        history: [],
        events: [],
        message: `No memory history found for ${params.entity}.`,
      };
    }

    const entity = resolution.match;
    const relations = getMemoryRelations(kitchenId).filter(
      (r) => r.subjectEntityId === entity.id
    );

    const events = getMemoryEvents(kitchenId).filter(
      (e) => e.entityId === entity.id
    );

    // Sort relations chronologically (oldest to newest)
    const sortedRelations = relations.slice().sort(
      (a, b) => new Date(a.observedAt).getTime() - new Date(b.observedAt).getTime()
    );

    const history: MemoryHistoryEntry[] = sortedRelations.map((r) => ({
      relation: r.relationType,
      object: r.objectName,
      locationDescription: r.locationDescription,
      isCurrent: r.isCurrent,
      validFrom: r.validFrom,
      validUntil: r.validUntil,
      sourceInspection: r.inspectionId,
      timestamp: r.observedAt,
    }));

    const currentRelation = sortedRelations.find((r) => r.isCurrent);
    let currentEntry: MemoryHistoryEntry | null = null;
    if (currentRelation) {
      currentEntry = {
        relation: currentRelation.relationType,
        object: currentRelation.objectName,
        locationDescription: currentRelation.locationDescription,
        isCurrent: true,
        validFrom: currentRelation.validFrom,
        validUntil: null,
        sourceInspection: currentRelation.inspectionId,
        timestamp: currentRelation.observedAt,
      };
    }

    // Build natural narrative
    let narrative = "";
    if (history.length === 0) {
      narrative = `There is no recorded location history for the ${entity.displayName}.`;
    } else if (history.length === 1) {
      narrative = `The ${entity.displayName} has only been recorded once: ${formatRelationForSpeech(history[0].relation)} the ${history[0].object}.`;
    } else {
      const steps = history.map(
        (h) => `${formatRelationForSpeech(h.relation)} the ${h.object}`
      );
      narrative = `Chronological history for the ${entity.displayName}: It was recorded ${steps.join(", then ")}.`;
    }

    return {
      found: true,
      entity: entity.displayName,
      currentState: currentEntry,
      history,
      events,
      message: narrative,
    };
  }

  /**
   * 5. updateMemory
   * Explicitly moves or corrects an entity's location.
   */
  public static updateMemory(params: UpdateMemoryParams): {
    success: boolean;
    voiceResponse: string;
    error?: string;
  } {
    const kitchenId = params.kitchenId || this.DEFAULT_KITCHEN_ID;

    // Use rememberObservation with isCorrection flag if reason specifies correction
    const isCorrection =
      params.reason?.toLowerCase().includes("correction") ||
      params.reason?.toLowerCase().includes("mistake") ||
      params.reason?.toLowerCase().includes("wrong");

    const res = this.rememberObservation({
      subject: params.entity || "Object",
      relation: params.newRelation,
      object: params.newObject,
      sourceText: params.sourceText || `Updated memory: ${params.entity} ${params.newRelation} ${params.newObject}`,
      sourceType: "voice",
      kitchenId,
      inspectionId: params.inspectionId,
      actor: params.actor || "Inspector",
      isCorrection,
    });

    return {
      success: res.success,
      voiceResponse: res.voiceResponse,
      error: res.error,
    };
  }

  /**
   * 6. searchMemory
   * Performs semantic candidate retrieval + structured relation validation.
   */
  public static searchMemory(params: SearchMemoryParams): {
    results: Array<{
      entity: string;
      relation: string;
      object: string;
      isCurrent: boolean;
      score: number;
      observedAt: string;
    }>;
  } {
    const kitchenId = params.kitchenId || this.DEFAULT_KITCHEN_ID;
    const embeddings = getMemoryEmbeddings();
    const ranked = rankEmbeddings(params.query, embeddings, 0.15);
    const relations = getMemoryRelations(kitchenId);

    const results: Array<{
      entity: string;
      relation: string;
      object: string;
      isCurrent: boolean;
      score: number;
      observedAt: string;
    }> = [];

    const seenRelationIds = new Set<string>();

    for (const item of ranked) {
      if (!item.embedding.relationId) continue;
      if (seenRelationIds.has(item.embedding.relationId)) continue;
      seenRelationIds.add(item.embedding.relationId);

      const rel = relations.find((r) => r.id === item.embedding.relationId);
      if (rel) {
        if (params.timeRange === "current" && !rel.isCurrent) continue;
        if (params.timeRange === "historical" && rel.isCurrent) continue;

        results.push({
          entity: rel.subjectName,
          relation: rel.relationType,
          object: rel.objectName,
          isCurrent: rel.isCurrent,
          score: item.score,
          observedAt: rel.observedAt,
        });
      }
    }

    return { results: results.slice(0, params.limit || 10) };
  }
}
