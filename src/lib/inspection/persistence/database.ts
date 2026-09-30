import fs from "fs";
import path from "path";
import { Inspection, InspectionRule } from "@/types/inspection";
import { initialCheckpoints, initialIssues, initialRules, sampleObservations, sampleTranscripts } from "@/services/inspectionData";
import {
  MemoryEntity,
  MemoryRelation,
  MemoryFact,
  MemoryEvent,
  MemoryEmbedding,
} from "../../memory/memory-types";

export interface RestaurantRecord {
  id: string;
  name: string;
  location: string;
  createdAt: string;
}

export interface KitchenRecord {
  id: string;
  restaurantId: string;
  name: string;
  type: string;
}

export interface KitchenGuardDatabaseSchema {
  restaurants: RestaurantRecord[];
  kitchens: KitchenRecord[];
  inspections: Inspection[];
  rules: InspectionRule[];
  memory_entities: MemoryEntity[];
  memory_relations: MemoryRelation[];
  memory_facts: MemoryFact[];
  memory_events: MemoryEvent[];
  memory_embeddings: MemoryEmbedding[];
}

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "kitchenguard-db.json");

function getDefaultInitialData(): KitchenGuardDatabaseSchema {
  const initialInspection: Inspection = {
    id: "KG-2026-0928-0042",
    type: "opening",
    typeName: "Opening Inspection",
    kitchen: "Main Kitchen",
    status: "in_progress",
    inspector: "Arun Patel",
    inspectorRole: "Kitchen Manager",
    startedAt: new Date(Date.now() - 15 * 60000).toISOString(),
    readinessScore: 87,
    checkpointsTotal: 8,
    checkpointsCompleted: 4,
    issuesCount: 2,
    issuesResolved: 1,
    correctionsCount: 1,
    checkpoints: JSON.parse(JSON.stringify(initialCheckpoints)),
    observations: JSON.parse(JSON.stringify(sampleObservations)),
    issues: JSON.parse(JSON.stringify(initialIssues)),
    corrections: [
      {
        id: "corr-1",
        checkpointId: "chk-1",
        itemName: "Walk-in Refrigerator #1",
        previousValue: "4°C",
        newValue: "6°C",
        reason: "Inspector voice correction",
        timestamp: "08:14:31",
        status: "accepted",
      },
    ],
    events: [
      {
        id: "evt-1",
        type: "start",
        timestamp: "08:30:00",
        description: "Inspection initiated for Main Kitchen Opening Protocol",
      },
      {
        id: "evt-2",
        type: "observation",
        timestamp: "08:32:15",
        description: "Walk-in Refrigerator parsed at 4°C",
      },
    ],
    transcripts: JSON.parse(JSON.stringify(sampleTranscripts)),
  };

  return {
    restaurants: [
      {
        id: "rest-1",
        name: "L'Arpège Culinary House",
        location: "Building 4, Sector 7",
        createdAt: "2026-01-01T00:00:00Z",
      },
    ],
    kitchens: [
      {
        id: "kitch-1",
        restaurantId: "rest-1",
        name: "Main Kitchen",
        type: "Commercial Production Line",
      },
    ],
    inspections: [initialInspection],
    rules: JSON.parse(JSON.stringify(initialRules)),
    memory_entities: [
      {
        id: "ent-seed-1",
        restaurantId: "rest-1",
        kitchenId: "kitch-1",
        type: "equipment",
        canonicalName: "walk-in refrigerator",
        displayName: "Walk-in Refrigerator",
        aliases: ["refrigerator", "fridge", "walk in refrigerator", "chiller"],
        description: "Primary cold storage unit in main production kitchen",
        createdAt: "2026-01-01T00:00:00Z",
        updatedAt: "2026-01-01T00:00:00Z",
        status: "active",
      },
      {
        id: "ent-seed-2",
        restaurantId: "rest-1",
        kitchenId: "kitch-1",
        type: "fixture",
        canonicalName: "utility sink",
        displayName: "Utility Sink",
        aliases: ["sink", "hand wash sink", "wash sink"],
        description: "Three-compartment utility and sanitation sink",
        createdAt: "2026-01-01T00:00:00Z",
        updatedAt: "2026-01-01T00:00:00Z",
        status: "active",
      },
      {
        id: "ent-seed-3",
        restaurantId: "rest-1",
        kitchenId: "kitch-1",
        type: "surface",
        canonicalName: "preparation table",
        displayName: "Preparation Table",
        aliases: ["prep table", "stainless table", "line table"],
        description: "Central stainless steel food preparation table",
        createdAt: "2026-01-01T00:00:00Z",
        updatedAt: "2026-01-01T00:00:00Z",
        status: "active",
      },
      {
        id: "ent-seed-4",
        restaurantId: "rest-1",
        kitchenId: "kitch-1",
        type: "storage_area",
        canonicalName: "top drawer",
        displayName: "Top Drawer",
        aliases: ["drawer", "tool drawer"],
        description: "Top utility drawer at workstation #1",
        createdAt: "2026-01-01T00:00:00Z",
        updatedAt: "2026-01-01T00:00:00Z",
        status: "active",
      },
      {
        id: "ent-seed-5",
        restaurantId: "rest-1",
        kitchenId: "kitch-1",
        type: "tool",
        canonicalName: "digital thermometer",
        displayName: "Digital Thermometer",
        aliases: ["thermometer", "temperature probe", "probe"],
        description: "Calibrated thermocouple digital thermometer",
        createdAt: "2026-01-01T00:00:00Z",
        updatedAt: "2026-01-01T00:00:00Z",
        status: "active",
      },
    ],
    memory_relations: [
      {
        id: "rel-seed-1",
        restaurantId: "rest-1",
        kitchenId: "kitch-1",
        subjectEntityId: "ent-seed-5",
        subjectName: "Digital Thermometer",
        relationType: "INSIDE",
        objectEntityId: "ent-seed-4",
        objectName: "Top Drawer",
        locationDescription: "stored inside the top drawer at workstation #1",
        confidence: "high",
        sourceType: "system",
        sourceText: "Thermometer is kept inside top drawer for morning checks.",
        createdAt: "2026-01-01T00:00:00Z",
        observedAt: "2026-01-01T00:00:00Z",
        validFrom: "2026-01-01T00:00:00Z",
        validUntil: null,
        isCurrent: true,
        status: "active",
      },
    ],
    memory_facts: [
      {
        id: "fact-seed-1",
        restaurantId: "rest-1",
        kitchenId: "kitch-1",
        entityId: "ent-seed-5",
        entityName: "Digital Thermometer",
        factType: "usage",
        factValue: "cold_storage_and_cooking_checks",
        confidence: "high",
        sourceType: "system",
        sourceText: "Thermometer used for daily cold storage and cooking audits.",
        createdAt: "2026-01-01T00:00:00Z",
        validFrom: "2026-01-01T00:00:00Z",
        isCurrent: true,
      },
    ],
    memory_events: [
      {
        id: "m-evt-seed-1",
        memoryId: "rel-seed-1",
        eventType: "MEMORY_CREATED",
        entityId: "ent-seed-5",
        entityName: "Digital Thermometer",
        newValue: "INSIDE Top Drawer",
        sourceType: "system",
        sourceText: "Initial kitchen standard location setup",
        timestamp: "2026-01-01T00:00:00Z",
        actor: "System Administrator",
      },
    ],
    memory_embeddings: [],
  };
}

// In-memory cache to guarantee fast local operations with immediate disk persistence
let memoryDb: KitchenGuardDatabaseSchema | null = null;

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function loadDatabase(): KitchenGuardDatabaseSchema {
  if (memoryDb) {
    return memoryDb;
  }

  ensureDataDir();

  if (fs.existsSync(DB_PATH)) {
    try {
      const raw = fs.readFileSync(DB_PATH, "utf-8");
      memoryDb = JSON.parse(raw);
      if (!memoryDb!.memory_entities) memoryDb!.memory_entities = [];
      if (!memoryDb!.memory_relations) memoryDb!.memory_relations = [];
      if (!memoryDb!.memory_facts) memoryDb!.memory_facts = [];
      if (!memoryDb!.memory_events) memoryDb!.memory_events = [];
      if (!memoryDb!.memory_embeddings) memoryDb!.memory_embeddings = [];
      return memoryDb!;
    } catch (err) {
      console.error("[Database] Error reading database file, resetting to initial defaults", err);
    }
  }

  memoryDb = getDefaultInitialData();
  saveDatabase(memoryDb);
  return memoryDb;
}

export function saveDatabase(data: KitchenGuardDatabaseSchema): void {
  ensureDataDir();
  memoryDb = data;
  try {
    const jsonStr = JSON.stringify(data, null, 2);
    const tempPath = `${DB_PATH}.tmp`;
    fs.writeFileSync(tempPath, jsonStr, "utf-8");
    fs.renameSync(tempPath, DB_PATH);
  } catch (err) {
    console.error("[Database] Error writing to DB_PATH", err);
  }
}

// --- Specific Typed Inspection Queries & Mutations ---

export function getInspections(): Inspection[] {
  const db = loadDatabase();
  return db.inspections;
}

export function getInspectionById(id: string): Inspection | null {
  const db = loadDatabase();
  const found = db.inspections.find((i) => i.id === id);
  return found ? JSON.parse(JSON.stringify(found)) : null;
}

export function saveInspection(inspection: Inspection): Inspection {
  const db = loadDatabase();
  const idx = db.inspections.findIndex((i) => i.id === inspection.id);
  if (idx >= 0) {
    db.inspections[idx] = inspection;
  } else {
    db.inspections.unshift(inspection);
  }
  saveDatabase(db);
  return inspection;
}

export function updateInspection(
  id: string,
  updater: (prev: Inspection) => Inspection
): Inspection | null {
  const db = loadDatabase();
  const idx = db.inspections.findIndex((i) => i.id === id);
  if (idx < 0) return null;

  const current = db.inspections[idx];
  const updated = updater(current);
  db.inspections[idx] = updated;
  saveDatabase(db);
  return updated;
}

export function getActiveInspection(): Inspection {
  const db = loadDatabase();
  const inProgress = db.inspections.find(
    (i) => i.status === "in_progress" || i.status === "needs_review" || i.status === "draft"
  );
  if (inProgress) return inProgress;
  return db.inspections[0];
}

export function getInspectionRules(): InspectionRule[] {
  const db = loadDatabase();
  return db.rules;
}

export function updateInspectionRule(ruleId: string, updates: Partial<InspectionRule>): InspectionRule | null {
  const db = loadDatabase();
  const idx = db.rules.findIndex((r) => r.id === ruleId);
  if (idx < 0) return null;
  db.rules[idx] = { ...db.rules[idx], ...updates };
  saveDatabase(db);
  return db.rules[idx];
}

// ============================================================
// TYPED PERSISTENT MEMORY ACCESSORS & MUTATORS
// ============================================================

export function getMemoryEntities(kitchenId?: string): MemoryEntity[] {
  const db = loadDatabase();
  if (!kitchenId) return db.memory_entities;
  return db.memory_entities.filter(
    (e) => !e.kitchenId || e.kitchenId === kitchenId || e.kitchenId === "shared"
  );
}

export function getMemoryEntityById(id: string): MemoryEntity | null {
  const db = loadDatabase();
  const found = db.memory_entities.find((e) => e.id === id);
  return found ? JSON.parse(JSON.stringify(found)) : null;
}

export function saveMemoryEntity(entity: MemoryEntity): MemoryEntity {
  const db = loadDatabase();
  const idx = db.memory_entities.findIndex((e) => e.id === entity.id);
  if (idx >= 0) {
    db.memory_entities[idx] = entity;
  } else {
    db.memory_entities.push(entity);
  }
  saveDatabase(db);
  return entity;
}

export function updateMemoryEntity(
  id: string,
  updates: Partial<MemoryEntity>
): MemoryEntity | null {
  const db = loadDatabase();
  const idx = db.memory_entities.findIndex((e) => e.id === id);
  if (idx < 0) return null;
  db.memory_entities[idx] = {
    ...db.memory_entities[idx],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  saveDatabase(db);
  return db.memory_entities[idx];
}

export function getMemoryRelations(kitchenId?: string): MemoryRelation[] {
  const db = loadDatabase();
  if (!kitchenId) return db.memory_relations;
  return db.memory_relations.filter(
    (r) => !r.kitchenId || r.kitchenId === kitchenId || r.kitchenId === "shared"
  );
}

export function getMemoryRelationById(id: string): MemoryRelation | null {
  const db = loadDatabase();
  const found = db.memory_relations.find((r) => r.id === id);
  return found ? JSON.parse(JSON.stringify(found)) : null;
}

export function saveMemoryRelation(relation: MemoryRelation): MemoryRelation {
  const db = loadDatabase();
  const idx = db.memory_relations.findIndex((r) => r.id === relation.id);
  if (idx >= 0) {
    db.memory_relations[idx] = relation;
  } else {
    db.memory_relations.push(relation);
  }
  saveDatabase(db);
  return relation;
}

export function updateMemoryRelation(
  id: string,
  updates: Partial<MemoryRelation>
): MemoryRelation | null {
  const db = loadDatabase();
  const idx = db.memory_relations.findIndex((r) => r.id === id);
  if (idx < 0) return null;
  db.memory_relations[idx] = {
    ...db.memory_relations[idx],
    ...updates,
  };
  saveDatabase(db);
  return db.memory_relations[idx];
}

export function getMemoryFacts(kitchenId?: string): MemoryFact[] {
  const db = loadDatabase();
  if (!kitchenId) return db.memory_facts;
  return db.memory_facts.filter(
    (f) => !f.kitchenId || f.kitchenId === kitchenId || f.kitchenId === "shared"
  );
}

export function saveMemoryFact(fact: MemoryFact): MemoryFact {
  const db = loadDatabase();
  const idx = db.memory_facts.findIndex((f) => f.id === fact.id);
  if (idx >= 0) {
    db.memory_facts[idx] = fact;
  } else {
    db.memory_facts.push(fact);
  }
  saveDatabase(db);
  return fact;
}

export function getMemoryEvents(kitchenId?: string): MemoryEvent[] {
  const db = loadDatabase();
  if (!kitchenId) return db.memory_events;
  return db.memory_events;
}

export function saveMemoryEvent(event: MemoryEvent): MemoryEvent {
  const db = loadDatabase();
  db.memory_events.push(event);
  saveDatabase(db);
  return event;
}

export function getMemoryEmbeddings(): MemoryEmbedding[] {
  const db = loadDatabase();
  return db.memory_embeddings;
}

export function saveMemoryEmbedding(embedding: MemoryEmbedding): MemoryEmbedding {
  const db = loadDatabase();
  db.memory_embeddings.push(embedding);
  saveDatabase(db);
  return embedding;
}

export function resetKitchenMemory(kitchenId?: string): void {
  const db = loadDatabase();
  if (kitchenId) {
    db.memory_entities = db.memory_entities.filter((e) => e.kitchenId !== kitchenId);
    db.memory_relations = db.memory_relations.filter((r) => r.kitchenId !== kitchenId);
    db.memory_facts = db.memory_facts.filter((f) => f.kitchenId !== kitchenId);
  } else {
    db.memory_entities = [];
    db.memory_relations = [];
    db.memory_facts = [];
    db.memory_events = [];
    db.memory_embeddings = [];
  }
  saveDatabase(db);
}

