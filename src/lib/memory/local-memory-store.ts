/**
 * KitchenGuard Local Persistent Memory Store (Hackathon Mode)
 * Uses browser localStorage with versioned key: kitchenguard:memory:v1
 * Authoritative, durable, survives browser refresh, route changes, and new sessions.
 */

export interface MemoryEntityRef {
  name: string;
  aliases: string[];
}

export interface MemoryHistoryEntry {
  relation: string;
  object: MemoryEntityRef;
  locationDescription: string;
  isCurrent: boolean;
  updatedAt: string;
  sourceText?: string;
  reason?: string;
}

export interface LocalMemoryRecord {
  id: string;
  kitchenId: string;
  entity: MemoryEntityRef;
  relation: string;
  object: MemoryEntityRef;
  locationDescription: string;
  isCurrent: boolean;
  confidence: "high" | "medium" | "low";
  source: string;
  sourceText: string;
  createdAt: string;
  updatedAt: string;
  history: MemoryHistoryEntry[];
}

const STORAGE_KEY = "kitchenguard:memory:v1";
const DEFAULT_KITCHEN_ID = "main-kitchen";

// In-memory fallback for SSR/server environments
let serverMemoryCache: LocalMemoryRecord[] = [
  {
    id: "mem_seed_1",
    kitchenId: DEFAULT_KITCHEN_ID,
    entity: {
      name: "digital thermometer",
      aliases: ["thermometer", "temp probe", "digital probe"],
    },
    relation: "INSIDE",
    object: {
      name: "top drawer",
      aliases: ["drawer", "first drawer", "top storage drawer"],
    },
    locationDescription: "inside the top drawer at workstation #1",
    isCurrent: true,
    confidence: "high",
    source: "system",
    sourceText: "Thermometer is kept inside top drawer for morning checks.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    history: [],
  },
];

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function loadAllRecords(): LocalMemoryRecord[] {
  if (!isBrowser()) {
    return serverMemoryCache;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(serverMemoryCache));
      return serverMemoryCache;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return serverMemoryCache;
  } catch (err) {
    console.warn("[LocalMemoryStore] Failed to read localStorage, falling back to cache", err);
    return serverMemoryCache;
  }
}

function saveAllRecords(records: LocalMemoryRecord[]): void {
  serverMemoryCache = records;
  if (isBrowser()) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    } catch (err) {
      console.error("[LocalMemoryStore] Failed to write localStorage", err);
    }
  }
}

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/^(the|a|an|that|this|our|my)\s+/i, "")
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeRelation(raw: string): string {
  const norm = raw.trim().toLowerCase();
  if (/^(under|beneath|below|underneath)/i.test(norm)) return "UNDER";
  if (/^(inside|in the|in a|in|within)/i.test(norm)) return "INSIDE";
  if (/^(next to|beside|by|adjacent to|alongside)/i.test(norm)) return "NEXT_TO";
  if (/^(behind|in back of)/i.test(norm)) return "BEHIND";
  if (/^(above|over|on top of|on the shelf above|on)/i.test(norm)) return "ABOVE";
  if (/^(near|close to)/i.test(norm)) return "NEAR";
  return norm.toUpperCase();
}

function matchesEntity(entityRef: MemoryEntityRef, query: string): boolean {
  const normQ = normalize(query);
  if (!normQ) return false;
  if (normalize(entityRef.name) === normQ) return true;
  if (entityRef.aliases.some((a) => normalize(a) === normQ)) return true;

  // Substring or token overlap
  const nameNorm = normalize(entityRef.name);
  if (nameNorm.includes(normQ) || normQ.includes(nameNorm)) return true;
  return entityRef.aliases.some((a) => {
    const aNorm = normalize(a);
    return aNorm.includes(normQ) || normQ.includes(aNorm);
  });
}

function formatRelationForSpeech(rel: string): string {
  switch (rel) {
    case "UNDER":
      return "under";
    case "INSIDE":
      return "inside";
    case "NEXT_TO":
      return "next to";
    case "BEHIND":
      return "behind";
    case "ABOVE":
      return "on the shelf above";
    case "NEAR":
      return "near";
    default:
      return rel.toLowerCase();
  }
}

export class LocalMemoryStore {
  /**
   * 1. saveMemory
   * Saves or updates a memory record. If the entity already exists in another location,
   * archives the previous relation into history and establishes the new relation as current.
   */
  public static saveMemory(params: {
    entityName: string;
    relation: string;
    objectName: string;
    aliases?: string[];
    objectAliases?: string[];
    locationDescription?: string;
    confidence?: "high" | "medium" | "low";
    sourceText?: string;
    source?: string;
    kitchenId?: string;
    isCorrection?: boolean;
  }): { success: boolean; record: LocalMemoryRecord; voiceResponse: string } {
    const records = loadAllRecords();
    const kitchenId = params.kitchenId || DEFAULT_KITCHEN_ID;
    const now = new Date().toISOString();
    const normRel = normalizeRelation(params.relation);
    const speechRel = formatRelationForSpeech(normRel);

    const existingIndex = records.findIndex(
      (r) => r.kitchenId === kitchenId && matchesEntity(r.entity, params.entityName)
    );

    let record: LocalMemoryRecord;
    let voiceResponse = "";

    if (existingIndex >= 0) {
      const existing = records[existingIndex];
      const sameLocation =
        existing.relation === normRel && matchesEntity(existing.object, params.objectName);

      if (sameLocation) {
        // Confirm existing location
        existing.updatedAt = now;
        existing.confidence = params.confidence || "high";
        records[existingIndex] = existing;
        saveAllRecords(records);
        return {
          success: true,
          record: existing,
          voiceResponse: `Got it. I confirmed the ${existing.entity.name} is ${speechRel} the ${existing.object.name}.`,
        };
      }

      // Move or correction: archive previous current location into history
      const historyEntry: MemoryHistoryEntry = {
        relation: existing.relation,
        object: existing.object,
        locationDescription: existing.locationDescription,
        isCurrent: false,
        updatedAt: now,
        sourceText: existing.sourceText,
        reason: params.isCorrection ? "Correction" : "Relocated",
      };

      const updatedHistory = [...(existing.history || []), historyEntry];
      const newLocDesc =
        params.locationDescription || `${speechRel} the ${params.objectName}`;

      record = {
        ...existing,
        relation: normRel,
        object: {
          name: params.objectName,
          aliases: params.objectAliases || [params.objectName.toLowerCase()],
        },
        locationDescription: newLocDesc,
        isCurrent: true,
        confidence: params.confidence || "high",
        sourceText: params.sourceText || `Moved ${existing.entity.name} ${speechRel} ${params.objectName}`,
        updatedAt: now,
        history: updatedHistory,
      };

      records[existingIndex] = record;
      voiceResponse = params.isCorrection
        ? `Understood. I've corrected the recorded location of the ${record.entity.name} to ${speechRel} the ${record.object.name}.`
        : `Got it. I've updated the location of the ${record.entity.name} to ${speechRel} the ${record.object.name}.`;
    } else {
      // New memory entity
      const newId = `mem_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      const newLocDesc =
        params.locationDescription || `${speechRel} the ${params.objectName}`;

      record = {
        id: newId,
        kitchenId,
        entity: {
          name: params.entityName,
          aliases: params.aliases || [params.entityName.toLowerCase()],
        },
        relation: normRel,
        object: {
          name: params.objectName,
          aliases: params.objectAliases || [params.objectName.toLowerCase()],
        },
        locationDescription: newLocDesc,
        isCurrent: true,
        confidence: params.confidence || "high",
        source: params.source || "voice",
        sourceText: params.sourceText || `There is a ${params.entityName} ${speechRel} the ${params.objectName}`,
        createdAt: now,
        updatedAt: now,
        history: [],
      };

      records.push(record);
      voiceResponse = `Got it. I recorded the ${record.entity.name} ${speechRel} the ${record.object.name}.`;
    }

    saveAllRecords(records);
    return { success: true, record, voiceResponse };
  }

  /**
   * 2. getMemory
   * Forward lookup: "Where is the [entity]?"
   * Strictly returns authoritative memory. Never hallucinates.
   */
  public static getMemory(
    entityName: string,
    options?: { temporalScope?: "current" | "historical" | "all"; kitchenId?: string }
  ): {
    found: boolean;
    record?: LocalMemoryRecord;
    message: string;
    isCurrent: boolean;
  } {
    const records = loadAllRecords();
    const kitchenId = options?.kitchenId || DEFAULT_KITCHEN_ID;

    const matched = records.find(
      (r) => r.kitchenId === kitchenId && matchesEntity(r.entity, entityName)
    );

    if (!matched) {
      return {
        found: false,
        isCurrent: false,
        message: `I don't have a recorded location for the ${entityName}.`,
      };
    }

    if (options?.temporalScope === "historical") {
      if (matched.history && matched.history.length > 0) {
        const lastHist = matched.history[matched.history.length - 1];
        const speechRel = formatRelationForSpeech(lastHist.relation);
        return {
          found: true,
          record: matched,
          isCurrent: false,
          message: `The ${matched.entity.name} was previously recorded ${speechRel} the ${lastHist.object.name}.`,
        };
      }
      const speechRel = formatRelationForSpeech(matched.relation);
      return {
        found: true,
        record: matched,
        isCurrent: true,
        message: `The ${matched.entity.name} was recorded ${speechRel} the ${matched.object.name}.`,
      };
    }

    const speechRel = formatRelationForSpeech(matched.relation);
    return {
      found: true,
      record: matched,
      isCurrent: matched.isCurrent,
      message: `The ${matched.entity.name} is ${speechRel} the ${matched.object.name}.`,
    };
  }

  /**
   * 3. reverseLocate
   * Reverse lookup: "What is [under/inside/next to] the [object]?"
   * Enforces temporal reasoning: historical items are NOT returned as currently present.
   */
  public static reverseLocate(
    relation: string,
    objectName: string,
    kitchenId = DEFAULT_KITCHEN_ID
  ): {
    found: boolean;
    records: LocalMemoryRecord[];
    message: string;
    hasHistoricalOnly?: boolean;
  } {
    const records = loadAllRecords();
    const normRel = normalizeRelation(relation);
    const speechRel = formatRelationForSpeech(normRel);

    const currentMatches = records.filter(
      (r) =>
        r.kitchenId === kitchenId &&
        r.relation === normRel &&
        matchesEntity(r.object, objectName) &&
        r.isCurrent
    );

    if (currentMatches.length > 0) {
      const names = currentMatches.map((r) => r.entity.name).join(", ");
      return {
        found: true,
        records: currentMatches,
        message: `The ${names} is currently recorded ${speechRel} the ${objectName}.`,
      };
    }

    // Check if an object used to be there but moved
    const historicalMatches: string[] = [];
    records.forEach((r) => {
      if (r.kitchenId === kitchenId && r.history) {
        const histFound = r.history.some(
          (h) => h.relation === normRel && matchesEntity(h.object, objectName)
        );
        if (histFound) {
          historicalMatches.push(r.entity.name);
        }
      }
    });

    if (historicalMatches.length > 0) {
      return {
        found: false,
        records: [],
        hasHistoricalOnly: true,
        message: `There is no currently recorded object ${speechRel} the ${objectName}. (Previously, the ${historicalMatches.join(
          ", "
        )} was recorded there.)`,
      };
    }

    return {
      found: false,
      records: [],
      message: `Nothing is currently recorded ${speechRel} the ${objectName}.`,
    };
  }

  /**
   * 4. getMemoryHistory
   * Returns full chronological provenance and narrative timeline.
   */
  public static getMemoryHistory(
    entityName: string,
    kitchenId = DEFAULT_KITCHEN_ID
  ): {
    found: boolean;
    record?: LocalMemoryRecord;
    history: MemoryHistoryEntry[];
    message: string;
  } {
    const records = loadAllRecords();
    const matched = records.find(
      (r) => r.kitchenId === kitchenId && matchesEntity(r.entity, entityName)
    );

    if (!matched) {
      return {
        found: false,
        history: [],
        message: `No memory history found for ${entityName}.`,
      };
    }

    const historySteps: string[] = [];
    if (matched.history && matched.history.length > 0) {
      matched.history.forEach((h) => {
        historySteps.push(`${formatRelationForSpeech(h.relation)} the ${h.object.name}`);
      });
    }
    historySteps.push(`${formatRelationForSpeech(matched.relation)} the ${matched.object.name}`);

    const narrative = `Chronological history for the ${matched.entity.name}: It was recorded ${historySteps.join(", then ")}.`;

    return {
      found: true,
      record: matched,
      history: matched.history || [],
      message: narrative,
    };
  }

  /**
   * 5. updateMemory
   * Explicit update/move helper.
   */
  public static updateMemory(
    entityName: string,
    newRelation: string,
    newObject: string,
    sourceText?: string,
    kitchenId = DEFAULT_KITCHEN_ID
  ) {
    return this.saveMemory({
      entityName,
      relation: newRelation,
      objectName: newObject,
      sourceText,
      kitchenId,
      isCorrection: false,
    });
  }

  /**
   * 6. searchMemory
   * Keyword and substring semantic search across all stored memory records.
   */
  public static searchMemory(
    query: string,
    kitchenId = DEFAULT_KITCHEN_ID
  ): { results: LocalMemoryRecord[]; message: string } {
    const records = loadAllRecords();
    const normQ = normalize(query);
    if (!normQ) return { results: records, message: `Found ${records.length} records.` };

    const results = records.filter(
      (r) =>
        r.kitchenId === kitchenId &&
        (matchesEntity(r.entity, normQ) ||
          matchesEntity(r.object, normQ) ||
          r.locationDescription.toLowerCase().includes(normQ) ||
          r.sourceText.toLowerCase().includes(normQ))
    );

    return {
      results,
      message:
        results.length > 0
          ? `Found ${results.length} matching memory record${results.length === 1 ? "" : "s"}.`
          : "No matching memory records found.",
    };
  }

  /**
   * 7. deleteMemory
   */
  public static deleteMemory(id: string): boolean {
    const records = loadAllRecords();
    const filtered = records.filter((r) => r.id !== id);
    if (filtered.length !== records.length) {
      saveAllRecords(filtered);
      return true;
    }
    return false;
  }

  /**
   * 8. getAllMemories
   */
  public static getAllMemories(kitchenId = DEFAULT_KITCHEN_ID): LocalMemoryRecord[] {
    return loadAllRecords().filter((r) => r.kitchenId === kitchenId);
  }

  /**
   * 9. clearMemories
   */
  public static clearMemories(): void {
    saveAllRecords([]);
  }
}
