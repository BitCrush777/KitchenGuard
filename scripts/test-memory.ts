import fs from "fs";
import path from "path";
import { MemoryService } from "../src/lib/memory/memory-service";
import {
  getMemoryEntities,
  getMemoryRelations,
  getMemoryEvents,
  saveMemoryEntity,
  loadDatabase,
  saveDatabase,
} from "../src/lib/inspection/persistence/database";
import { parseSpokenInspectionIntent, setLastReferencedEntity } from "../src/lib/inspection/tools/intentParser";
import { executeInspectionTool } from "../src/lib/inspection/tools/toolExecutor";
import { resolveEntity } from "../src/lib/memory/entity-resolution";
import { normalizeSpatialRelation, formatRelationForSpeech } from "../src/lib/memory/relation-service";

async function runMemoryTests() {
  console.log("==================================================");
  console.log("KITCHENGUARD PERSISTENT MEMORY SYSTEM TEST SUITE");
  console.log("==================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition: unknown, testName: string, detail?: string) {
    if (Boolean(condition)) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName}${detail ? ` - ${detail}` : ""}`);
      failed++;
    }
  }

  const KITCHEN_TEST = "kitch-test";
  const RESTAURANT_TEST = "rest-test";
  const DEMO_KITCHEN = "kitch-1";

  // Hermetic test initialization: clear test namespaces
  const dbInit = loadDatabase();
  dbInit.memory_relations = dbInit.memory_relations.filter(
    (r) =>
      r.kitchenId !== KITCHEN_TEST &&
      r.kitchenId !== "kitch-isolated-other-tenant" &&
      r.subjectName !== "Blue Cleaning Bucket"
  );
  dbInit.memory_entities = dbInit.memory_entities.filter(
    (e) => e.kitchenId !== KITCHEN_TEST && e.displayName !== "Blue Cleaning Bucket"
  );
  dbInit.memory_events = dbInit.memory_events.filter(
    (e) => e.entityName !== "Blue Cleaning Bucket"
  );
  saveDatabase(dbInit);

  console.log("--- PART 1: 20 DETAILED UNIT & INTEGRATION TESTS ---\n");

  // Test 1: Create spatial memory
  const t1 = MemoryService.rememberObservation({
    subject: "blue cleaning bucket",
    relation: "under",
    object: "walk-in refrigerator",
    kitchenId: KITCHEN_TEST,
    restaurantId: RESTAURANT_TEST,
    confidence: "high",
    sourceText: "There is a blue cleaning bucket under the refrigerator",
  });
  assert(t1.success, "Test 1: Create spatial memory successfully");
  assert(t1.relation?.relationType === "UNDER", "Test 1: Relation normalized to UNDER");
  assert(t1.relation?.isCurrent === true, "Test 1: Relation initialized as isCurrent=true");

  // Test 2: Retrieve spatial memory
  const t2 = MemoryService.locateEntity({
    entity: "blue cleaning bucket",
    kitchenId: KITCHEN_TEST,
    temporalScope: "current",
  });
  assert(t2.found, "Test 2: Retrieve spatial memory by entity");
  assert(t2.isCurrent === true, "Test 2: Retrieved memory is marked current");
  assert(t2.relation === "UNDER", "Test 2: Retrieved relation is UNDER");

  // Test 3: Reverse spatial query
  const t3 = MemoryService.reverseLocate({
    relation: "under",
    object: "walk-in refrigerator",
    kitchenId: KITCHEN_TEST,
  });
  assert(t3.found, "Test 3: Reverse spatial query finds objects under fixture");
  assert(
    t3.entities.some((e) => e.name.toLowerCase().includes("blue")),
    "Test 3: Reverse query entities list includes blue cleaning bucket"
  );

  // Test 4: Alias resolution
  const existingEntities = getMemoryEntities(KITCHEN_TEST);
  const aliasCooler = resolveEntity("cooler", existingEntities, KITCHEN_TEST);
  assert(
    aliasCooler.match?.displayName === "Walk-in Refrigerator",
    "Test 4: Alias 'cooler' resolves to Walk-in Refrigerator"
  );
  const aliasChiller = resolveEntity("chiller", existingEntities, KITCHEN_TEST);
  assert(
    aliasChiller.match?.displayName === "Walk-in Refrigerator",
    "Test 4: Alias 'chiller' resolves to Walk-in Refrigerator"
  );

  // Test 5: Entity resolution
  const normEntity = resolveEntity("the blue bucket", existingEntities, KITCHEN_TEST);
  assert(
    normEntity.match?.displayName === "Blue Cleaning Bucket",
    "Test 5: 'the blue bucket' resolves to canonical 'Blue Cleaning Bucket'"
  );

  // Test 6: Multiple similar entities / Ambiguity handling
  // Add two ambiguous buckets to test ambiguity detection
  saveMemoryEntity({
    id: "ent-ambig-1",
    displayName: "Sanitizing Bucket Red (Butchery)",
    canonicalName: "sanitizing_bucket_red_butchery",
    type: "tool",
    aliases: ["red bucket", "butchery bucket"],
    kitchenId: KITCHEN_TEST,
    restaurantId: RESTAURANT_TEST,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: "active",
  });
  saveMemoryEntity({
    id: "ent-ambig-2",
    displayName: "Sanitizing Bucket Red (Pastry)",
    canonicalName: "sanitizing_bucket_red_pastry",
    type: "tool",
    aliases: ["red bucket", "pastry bucket"],
    kitchenId: KITCHEN_TEST,
    restaurantId: RESTAURANT_TEST,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: "active",
  });

  const allEntitiesWithAmbig = getMemoryEntities(KITCHEN_TEST);
  const ambigResult = resolveEntity("red bucket", allEntitiesWithAmbig, KITCHEN_TEST);
  assert(
    Boolean(
      ambigResult.clarificationMessage?.includes("Which one did you mean") ||
        ambigResult.clarificationMessage?.includes("Did you mean")
    ),
    "Test 6: Ambiguity generates clear clarification prompt"
  );

  // Test 7: Memory update
  const t7 = MemoryService.updateMemory({
    entity: "blue cleaning bucket",
    newRelation: "next to",
    newObject: "utility sink",
    kitchenId: KITCHEN_TEST,
    reason: "Relocated for dishwashing",
  });
  assert(t7.success, "Test 7: updateMemory executed successfully");

  // Test 8: Memory movement
  const relationsAfterMove = getMemoryRelations(KITCHEN_TEST);
  const oldRel = relationsAfterMove.find(
    (r) => r.subjectName.toLowerCase().includes("blue") && r.relationType === "UNDER"
  );
  const newRel = relationsAfterMove.find(
    (r) => r.subjectName.toLowerCase().includes("blue") && r.relationType === "NEXT_TO"
  );
  assert(oldRel !== undefined && oldRel.isCurrent === false, "Test 8: Old location marked isCurrent=false");
  assert(oldRel !== undefined && oldRel.validUntil !== null, "Test 8: Old location validUntil timestamp set");
  assert(newRel !== undefined && newRel.isCurrent === true, "Test 8: New location marked isCurrent=true");

  const eventsAfterMove = getMemoryEvents(KITCHEN_TEST);
  const moveEvent = eventsAfterMove.find((e) => e.eventType === "MEMORY_MOVED");
  assert(moveEvent !== undefined, "Test 8: MEMORY_MOVED audit event generated");

  // Test 9: Historical location retrieval
  const t9 = MemoryService.locateEntity({
    entity: "blue cleaning bucket",
    kitchenId: KITCHEN_TEST,
    temporalScope: "historical",
  });
  assert(t9.found, "Test 9: Historical location retrieval succeeds");
  assert(
    t9.object?.toLowerCase().includes("refrigerator"),
    "Test 9: Historical query accurately returns refrigerator"
  );

  // Test 10: Current location retrieval
  const t10 = MemoryService.locateEntity({
    entity: "blue cleaning bucket",
    kitchenId: KITCHEN_TEST,
    temporalScope: "current",
  });
  assert(t10.found, "Test 10: Current location retrieval succeeds");
  assert(
    t10.object?.toLowerCase().includes("sink"),
    "Test 10: Current query accurately returns utility sink"
  );

  // Test 11: Correction
  const t11 = MemoryService.rememberObservation({
    subject: "blue cleaning bucket",
    relation: "behind",
    object: "oven",
    kitchenId: KITCHEN_TEST,
    restaurantId: RESTAURANT_TEST,
    isCorrection: true,
    sourceText: "Actually it wasn't next to the sink, I put it behind the oven",
  });
  assert(t11.success, "Test 11: Correction observation recorded");
  const eventsAfterCorrection = getMemoryEvents(KITCHEN_TEST);
  const corrEvent = eventsAfterCorrection.find((e) => e.eventType === "MEMORY_CORRECTED");
  assert(corrEvent !== undefined, "Test 11: MEMORY_CORRECTED event logged");

  // Test 12: Contradiction handling
  const latestLoc = MemoryService.locateEntity({
    entity: "blue cleaning bucket",
    kitchenId: KITCHEN_TEST,
  });
  assert(
    latestLoc.relation === "BEHIND" && latestLoc.object?.toLowerCase().includes("oven"),
    "Test 12: Contradictory statements resolved to latest valid observation (BEHIND oven)"
  );

  // Test 13: Confidence handling
  const t13 = MemoryService.rememberObservation({
    subject: "digital thermometer",
    relation: "inside",
    object: "top drawer",
    kitchenId: KITCHEN_TEST,
    confidence: "high",
  });
  assert(t13.relation?.confidence === "high", "Test 13: High confidence preserved in relation schema");

  // Test 14: Kitchen scoping
  const scopedQuery = MemoryService.locateEntity({
    entity: "blue cleaning bucket",
    kitchenId: "kitch-isolated-other-tenant",
  });
  assert(!scopedQuery.found, "Test 14: Scoped query does NOT leak entity into other kitchen");

  // Test 15: Inspection scoping
  const t15 = MemoryService.rememberObservation({
    subject: "sanitizer spray bottle",
    relation: "next to",
    object: "prep table",
    kitchenId: KITCHEN_TEST,
    inspectionId: "insp-audit-999",
  });
  assert(t15.relation?.inspectionId === "insp-audit-999", "Test 15: Inspection ID preserved in memory");

  // Test 16: No-memory response
  const t16 = MemoryService.locateEntity({
    entity: "golden unicorn spatula",
    kitchenId: KITCHEN_TEST,
  });
  assert(!t16.found, "Test 16: Unknown entity returns found=false");
  assert(
    t16.message?.includes("don't have a recorded location"),
    "Test 16: Returns honest 'don't have a recorded location' without hallucinating"
  );

  // Test 17: Database resilience / graceful error handling
  try {
    const t17 = MemoryService.locateEntity({
      entity: "",
      kitchenId: KITCHEN_TEST,
    });
    assert(!t17.found, "Test 17: Empty entity query gracefully handled");
  } catch (e) {
    assert(false, "Test 17: Exception thrown during empty query");
  }

  // Test 18: Vector retrieval fallback
  const t18 = MemoryService.searchMemory({
    query: "bucket",
    kitchenId: KITCHEN_TEST,
  });
  assert(t18.results.length > 0, "Test 18: Semantic memory search returns relevant matches");
  assert(
    t18.results[0].entity.toLowerCase().includes("bucket"),
    "Test 18: Top semantic result matches keyword token"
  );

  // Test 19: Duplicate memory prevention
  const prevCount = getMemoryRelations(KITCHEN_TEST).length;
  // Confirm current location again
  MemoryService.rememberObservation({
    subject: "digital thermometer",
    relation: "inside",
    object: "top drawer",
    kitchenId: KITCHEN_TEST,
  });
  const afterCount = getMemoryRelations(KITCHEN_TEST).length;
  assert(
    afterCount === prevCount,
    "Test 19: Confirming existing location does NOT create duplicate relation"
  );

  // Test 20: Memory audit trail
  const t20 = MemoryService.getMemoryHistory({
    entity: "blue cleaning bucket",
    kitchenId: KITCHEN_TEST,
  });
  assert(t20.found, "Test 20: Memory history found for entity");
  assert(t20.history.length >= 3, "Test 20: Full movement trail tracked (Under -> Next to -> Behind)");
  assert(
    t20.message?.includes("under") && t20.message?.includes("next to") && t20.message?.includes("behind"),
    "Test 20: Audit narrative contains all 3 historical milestones"
  );

  console.log("\n--- PART 2: 10-STEP MANDATORY END-TO-END DEMO SCENARIO ---\n");

  setLastReferencedEntity("blue cleaning bucket");

  // STEP 1: Spoken observation: "There is a blue cleaning bucket under the refrigerator."
  console.log("STEP 1: User says: 'There is a blue cleaning bucket under the refrigerator.'");
  const step1Intent = parseSpokenInspectionIntent("There is a blue cleaning bucket under the refrigerator.");
  assert(step1Intent.toolName === "rememberObservation", "Step 1: Intent parsed to rememberObservation");
  const step1Exec = await executeInspectionTool({
    toolName: step1Intent.toolName,
    parameters: { ...step1Intent.parameters, kitchenId: DEMO_KITCHEN },
  });
  assert(step1Exec.success, "Step 1: Tool execution succeeded");
  assert(step1Exec.badge === "Spatial Memory Saved", "Step 1: Badge 'Spatial Memory Saved'");

  // STEP 2: User asks: "Where is the blue bucket?"
  console.log("STEP 2: User asks: 'Where is the blue bucket?'");
  const step2Intent = parseSpokenInspectionIntent("Where is the blue bucket?");
  assert(step2Intent.toolName === "locateEntity", "Step 2: Intent parsed to locateEntity");
  const step2Exec = await executeInspectionTool({
    toolName: step2Intent.toolName,
    parameters: { ...step2Intent.parameters, kitchenId: DEMO_KITCHEN },
  });
  assert(step2Exec.success, "Step 2: Agent found persistent memory");
  assert(
    step2Exec.voiceResponse.toLowerCase().includes("under") &&
      step2Exec.voiceResponse.toLowerCase().includes("refrigerator"),
    `Step 2: Agent answered: "${step2Exec.voiceResponse}"`
  );

  // STEP 3: Refresh the browser (Simulate reading fresh from disk)
  console.log("STEP 3: Refresh the browser (Re-reading persistent DB from disk)");
  const dbData = loadDatabase();
  const diskRelations = dbData.memory_relations.filter((r) => r.kitchenId === DEMO_KITCHEN && r.isCurrent);
  const diskBucket = diskRelations.find((r) => r.subjectName.toLowerCase().includes("blue"));
  assert(diskBucket !== undefined, "Step 3: Blue bucket verified on disk storage");
  const step3Exec = await executeInspectionTool({
    toolName: "locateEntity",
    parameters: { entity: "blue bucket", kitchenId: DEMO_KITCHEN },
  });
  assert(
    step3Exec.voiceResponse.toLowerCase().includes("under") &&
      step3Exec.voiceResponse.toLowerCase().includes("refrigerator"),
    "Step 3: Post-refresh query retrieved identical persistent memory from disk"
  );

  // STEP 4: Start a new inspection/session. Ask: "Do you remember where the blue bucket was?"
  console.log("STEP 4: New session: 'Do you remember where the blue bucket was?'");
  const step4Intent = parseSpokenInspectionIntent("Do you remember where the blue bucket was?");
  assert(step4Intent.toolName === "locateEntity", "Step 4: Intent recognized as locateEntity");
  const step4Exec = await executeInspectionTool({
    toolName: step4Intent.toolName,
    parameters: { ...step4Intent.parameters, kitchenId: DEMO_KITCHEN },
  });
  assert(step4Exec.success, "Step 4: Memory retained into new inspection session");

  // STEP 5: User says: "I moved the blue bucket next to the sink."
  console.log("STEP 5: User says: 'I moved the blue bucket next to the sink.'");
  const step5Intent = parseSpokenInspectionIntent("I moved the blue bucket next to the sink.");
  assert(step5Intent.toolName === "rememberObservation", "Step 5: Intent recognized as movement observation");
  const step5Exec = await executeInspectionTool({
    toolName: step5Intent.toolName,
    parameters: { ...step5Intent.parameters, kitchenId: DEMO_KITCHEN },
  });
  assert(step5Exec.success, "Step 5: Movement saved");

  // STEP 6: User says: "Where is the blue bucket now?"
  console.log("STEP 6: User asks: 'Where is the blue bucket now?'");
  const step6Intent = parseSpokenInspectionIntent("Where is the blue bucket now?");
  assert(step6Intent.toolName === "locateEntity", "Step 6: Intent recognized as locateEntity");
  const step6Exec = await executeInspectionTool({
    toolName: step6Intent.toolName,
    parameters: { ...step6Intent.parameters, kitchenId: DEMO_KITCHEN },
  });
  assert(
    step6Exec.voiceResponse.toLowerCase().includes("next to") &&
      step6Exec.voiceResponse.toLowerCase().includes("sink"),
    `Step 6: Returns current location: "${step6Exec.voiceResponse}"`
  );

  // STEP 7: User says: "Where was it before?"
  console.log("STEP 7: User asks: 'Where was it before?'");
  const step7Intent = parseSpokenInspectionIntent("Where was it before?");
  assert(step7Intent.toolName === "locateEntity", "Step 7: Intent recognized as locateEntity historical");
  const step7Exec = await executeInspectionTool({
    toolName: step7Intent.toolName,
    parameters: { ...step7Intent.parameters, kitchenId: DEMO_KITCHEN },
  });
  assert(
    step7Exec.voiceResponse.toLowerCase().includes("under") &&
      step7Exec.voiceResponse.toLowerCase().includes("refrigerator"),
    `Step 7: Returns previous location: "${step7Exec.voiceResponse}"`
  );

  // STEP 8: User says: "What is under the refrigerator?" (TEMPORAL REASONING CHECK)
  console.log("STEP 8: User asks: 'What is under the refrigerator?'");
  const step8Intent = parseSpokenInspectionIntent("What is under the refrigerator?");
  assert(step8Intent.toolName === "reverseLocate", "Step 8: Intent recognized as reverseLocate");
  const step8Exec = await executeInspectionTool({
    toolName: step8Intent.toolName,
    parameters: { ...step8Intent.parameters, kitchenId: DEMO_KITCHEN },
  });
  assert(
    step8Exec.voiceResponse.toLowerCase().includes("no currently recorded object") ||
      step8Exec.voiceResponse.toLowerCase().includes("nothing is currently recorded"),
    `Step 8: Correct temporal reasoning: does NOT claim blue bucket is currently there! Response: "${step8Exec.voiceResponse}"`
  );

  // STEP 9: User says: "Actually, it wasn't next to the sink. I put it behind the oven."
  console.log("STEP 9: User says: 'Actually, it wasn't next to the sink. I put it behind the oven.'");
  const step9Intent = parseSpokenInspectionIntent("Actually, it wasn't next to the sink. I put it behind the oven.");
  assert(step9Intent.toolName === "rememberObservation", "Step 9: Intent recognized as correction observation");
  const step9Exec = await executeInspectionTool({
    toolName: step9Intent.toolName,
    parameters: { ...step9Intent.parameters, kitchenId: DEMO_KITCHEN },
  });
  assert(step9Exec.success, "Step 9: Correction successfully recorded");

  const currentLoc9 = MemoryService.locateEntity({ entity: "blue bucket", kitchenId: DEMO_KITCHEN });
  assert(
    currentLoc9.relation === "BEHIND" && currentLoc9.object?.toLowerCase().includes("oven"),
    "Step 9: Current location updated to BEHIND oven"
  );

  // STEP 10: User asks: "Where has the blue bucket been recorded?"
  console.log("STEP 10: User asks: 'Where has the blue bucket been recorded?'");
  const step10Intent = parseSpokenInspectionIntent("Where has the blue bucket been recorded?");
  assert(step10Intent.toolName === "getMemoryHistory", "Step 10: Intent recognized as getMemoryHistory");
  const step10Exec = await executeInspectionTool({
    toolName: step10Intent.toolName,
    parameters: { ...step10Intent.parameters, kitchenId: DEMO_KITCHEN },
  });
  assert(step10Exec.success, "Step 10: Full chronological history retrieved");
  assert(
    step10Exec.voiceResponse.toLowerCase().includes("under") &&
      step10Exec.voiceResponse.toLowerCase().includes("next to") &&
      step10Exec.voiceResponse.toLowerCase().includes("behind"),
    `Step 10: Complete history narrative: "${step10Exec.voiceResponse}"`
  );

  console.log("\n==================================================");
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log("==================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runMemoryTests().catch((err) => {
  console.error("Test execution failed with fatal error:", err);
  process.exit(1);
});
