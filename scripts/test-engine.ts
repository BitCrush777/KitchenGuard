import { InspectionService } from "../src/lib/inspection/services/inspectionService";
import { evaluateObservationRules, detectContradiction } from "../src/lib/inspection/rules/rulesEngine";
import { canFinalizeInspection } from "../src/lib/inspection/state-machine/stateMachine";
import { executeInspectionTool } from "../src/lib/inspection/tools/toolExecutor";
import { parseSpokenInspectionIntent } from "../src/lib/inspection/tools/intentParser";

async function runEngineTests() {
  console.log("==================================================");
  console.log("KITCHENGUARD FOOD-SAFETY ENGINE DETERMINISTIC TEST");
  console.log("==================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName}${detail ? ` - ${detail}` : ""}`);
      failed++;
    }
  }

  // 1. Tool Allowlist Check
  const unknownTool = await executeInspectionTool({
    toolName: "deleteWholeDatabase",
    parameters: {},
  });
  assert(!unknownTool.success, "Unauthorized tool rejection");

  // 2. Start Inspection
  const startResult = InspectionService.startInspection({
    inspectionType: "opening",
    kitchen: "Main Kitchen",
    inspector: "Arun Patel",
  });
  assert(startResult.success, "Tool 1: startInspection");
  assert(startResult.data!.checkpoints.length === 8, "8 standard checkpoints initialized");
  const testId = startResult.data!.id;

  // 3. Record Observation 1: "Walk-in refrigerator is four degrees." (Compliant)
  const obs1 = InspectionService.recordObservation({
    inspectionId: testId,
    item: "Walk-in refrigerator",
    value: "4",
    unit: "°C",
    spokenText: "Walk-in refrigerator is four degrees.",
  });
  assert(obs1.success, "Tool 2: recordObservation (Walk-in Refrigerator 4°C)");
  assert(obs1.data!.observation.status === "verified", "Walk-in Refrigerator verified (4°C ≤ 5°C)");
  assert(!obs1.data!.issueCreated, "No issue created for compliant 4°C reading");

  // 4. Record Observation 2: "Minus eighteen" (Freezer Compliant)
  const obs2 = InspectionService.recordObservation({
    inspectionId: testId,
    item: "Walk-in freezer",
    value: "-18",
    unit: "°C",
    spokenText: "Minus eighteen.",
  });
  assert(obs2.success, "Record Freezer -18°C");
  assert(obs2.data!.observation.status === "verified", "Freezer verified (-18°C ≤ -18°C)");

  // 5. Record Observation 3: "Vegetables are stored above the chicken" (Compliant storage hierarchy)
  const obs3 = InspectionService.recordObservation({
    inspectionId: testId,
    item: "Storage hierarchy",
    value: "Vegetables are stored above the chicken",
    spokenText: "The vegetables are stored above the chicken.",
  });
  assert(obs3.success, "Record Food Separation (Vegetables above chicken)");
  assert(obs3.data!.observation.status === "verified", "Produce above poultry is compliant");

  // Cross-contamination rule test: "Chicken stored above vegetables"
  const crossCheck = evaluateObservationRules({
    checkpointId: "chk-3",
    checkpointName: "Food Separation",
    category: "storage",
    item: "Raw poultry",
    value: "Chicken stored above vegetables",
  });
  assert(crossCheck.status === "critical_violation", "Critical violation when chicken above vegetables");
  assert(crossCheck.shouldCreateIssue, "Issue created for cross-contamination hazard");

  // 6. Contradiction Detection
  const contradictionCheck = detectContradiction(
    "Walk-in refrigerator",
    "6",
    [obs1.data!.observation]
  );
  assert(contradictionCheck.hasContradiction, "Contradiction detected: 4°C vs 6°C");

  // 7. Update Observation (Correction) -> 6°C exceeds 5°C threshold!
  const updateRes = InspectionService.updateObservation({
    inspectionId: testId,
    item: "Walk-in refrigerator",
    newValue: "6",
    reason: "Worker voice correction",
  });
  assert(updateRes.success, "Tool 4: updateObservation (Corrected to 6°C)");
  assert(updateRes.data!.correction.previousValue === "4", "Correction tracks previousValue 4°C");
  assert(updateRes.data!.correction.newValue === "6", "Correction tracks newValue 6°C");
  assert(
    updateRes.voiceResponse.includes("Exceeds threshold"),
    "Voice response warns about threshold exceeded"
  );

  // 8. Flag Issue: "The paper towels are missing."
  const issueFlag = InspectionService.flagIssue({
    inspectionId: testId,
    checkpointId: "chk-4",
    category: "Hygiene",
    title: "Hand-wash station paper towels missing",
    severity: "medium",
    description: "Dispenser empty during morning check.",
    location: "Hand Washing Station #1",
  });
  assert(issueFlag.success, "Tool 5: flagIssue (Paper towels missing)");
  assert(issueFlag.data!.status === "open", "Issue created in 'open' status");
  const issueId = issueFlag.data!.id;

  // 9. Query Missing Checks
  const missing = InspectionService.getMissingChecks({ inspectionId: testId });
  assert(missing.success, "Tool 7: getMissingChecks");
  assert(missing.data!.remainingCount > 0, "Correctly identifies remaining uninspected checkpoints");

  // 10. Query Current Inspection State
  const state = InspectionService.getCurrentInspectionState({ inspectionId: testId });
  assert(state.success, "Tool 8: getCurrentInspectionState");
  assert(state.data!.issuesCount >= 1, "State reflects open issue");

  // 11. Resolve Issue: "Paper towels have been restocked."
  const resolved = InspectionService.resolveIssue({
    inspectionId: testId,
    issueId: issueId,
    resolutionNotes: "Paper towels restocked from storage",
  });
  assert(resolved.success, "Tool 6: resolveIssue");
  assert(resolved.data!.status === "resolved", "Issue transitioned to 'resolved'");

  // 12. "Looks Fine" Trap: Generic positive statement without mandatory evidence
  const hygieneLooksFine = evaluateObservationRules({
    checkpointId: "chk-4",
    checkpointName: "Hygiene",
    category: "hygiene",
    item: "Hand Washing Station",
    value: "Looks fine",
  });
  assert(
    hygieneLooksFine.status === "missing_information",
    "Missing Information Trap: 'Looks fine' does not mark hygiene compliant"
  );
  assert(
    hygieneLooksFine.missingFields?.includes("paper_towels") === true,
    "Rule engine flags paper_towels as missing evidence"
  );

  // 13. Sanitizer Quat Titration Tests (Config: 200 - 400 PPM)
  const sanitizerCompliant = evaluateObservationRules({
    checkpointId: "chk-5",
    checkpointName: "Sanitizer",
    category: "chemical",
    item: "Quat Sanitizer Basin",
    value: "300 PPM",
  });
  assert(sanitizerCompliant.status === "compliant", "Sanitizer 300 PPM is compliant (200-400)");

  const sanitizerLow = evaluateObservationRules({
    checkpointId: "chk-5",
    checkpointName: "Sanitizer",
    category: "chemical",
    item: "Quat Sanitizer Basin",
    value: "100 PPM",
  });
  assert(sanitizerLow.status === "requires_attention", "Sanitizer 100 PPM flagged as requires_attention (too weak)");

  const sanitizerHigh = evaluateObservationRules({
    checkpointId: "chk-5",
    checkpointName: "Sanitizer",
    category: "chemical",
    item: "Quat Sanitizer Basin",
    value: "550 PPM",
  });
  assert(sanitizerHigh.status === "requires_attention", "Sanitizer 550 PPM flagged as requires_attention (toxic residue hazard)");

  // 14. FIFO & Prep Date Marking Tests (Config: ≤ 7 days)
  const fifoCompliant = evaluateObservationRules({
    checkpointId: "chk-6",
    checkpointName: "Labeling",
    category: "labeling",
    item: "Prepped marinara sauce",
    value: "Prepped 4 days ago",
  });
  assert(fifoCompliant.status === "compliant", "FIFO 4 days prep is compliant (≤ 7 days)");

  const fifoExpired = evaluateObservationRules({
    checkpointId: "chk-6",
    checkpointName: "Labeling",
    category: "labeling",
    item: "Prepped chicken stock",
    value: "Prepped 9 days ago",
  });
  assert(fifoExpired.status === "requires_attention", "FIFO 9 days prep flagged as requires_attention (past 7 days)");

  // 15. Duplicate Issue Suppression
  const dupIssue1 = InspectionService.flagIssue({
    inspectionId: testId,
    checkpointId: "chk-7",
    category: "Safety",
    title: "Fire extinguisher pressure low",
    severity: "high",
    description: "Gauge in red zone.",
  });
  assert(dupIssue1.success, "First issue created for extinguisher");

  const dupIssue2 = InspectionService.flagIssue({
    inspectionId: testId,
    checkpointId: "chk-7",
    category: "Safety",
    title: "Fire extinguisher pressure low",
    severity: "high",
    description: "Gauge in red zone again.",
  });
  assert(dupIssue2.success, "Duplicate issue safely handled without redundant open entries");
  assert(dupIssue2.data!.id === dupIssue1.data!.id, "Existing active issue returned rather than duplicating");

  // Accept the pending correction so no pending corrections block safety gate
  const acceptRes = InspectionService.acceptCorrection({ inspectionId: testId });
  assert(acceptRes.success, "Tool: acceptCorrection confirms pending correction");

  // 16. Verify remaining checkpoints directly
  for (let i = 1; i <= 8; i++) {
    InspectionService.completeCheckpoint({
      inspectionId: testId,
      checkpointId: `chk-${i}`,
      evidenceValues: "Automated test verification evidence satisfied",
    });
  }

  // Resolve the extinguisher issue so zero high/critical issues block finalization
  InspectionService.resolveIssue({
    inspectionId: testId,
    issueId: dupIssue1.data!.id,
    resolutionNotes: "Replaced with certified charged unit.",
  });

  // 17. Safety Gate Check: Confirms that unresolved high-severity temp issue blocks finalization
  const reviewBlocked = InspectionService.reviewInspection({ inspectionId: testId });
  assert(!reviewBlocked.data!.canFinalize, "Safety gate strictly blocks finalization while high-severity temp issue is open");

  // Resolve the temperature issue after technician action
  InspectionService.resolveIssue({
    inspectionId: testId,
    titleSearch: "temperature",
    resolutionNotes: "Thermostat re-calibrated; secondary probe verified unit cooled to 3.8°C.",
  });

  // Now verify that Safety Gate allows finalization
  const reviewReady = InspectionService.reviewInspection({ inspectionId: testId });
  assert(reviewReady.data!.canFinalize, "Safety gate permits finalization once all 8 checkpoints verified and high-severity issues resolved");

  const finalizedSuccess = InspectionService.finalizeInspection({
    inspectionId: testId,
    inspectorSignoff: "Arun Patel",
  });
  assert(finalizedSuccess.success, "Finalize inspection succeeds when all requirements met");
  assert(finalizedSuccess.data!.status === "completed", "Inspection status transitions to completed");
  assert(finalizedSuccess.data!.readinessScore !== undefined, "Final compliance score computed");

  // 18. Natural Voice Intent Parsing Tests
  const confirmIntent = parseSpokenInspectionIntent("Confirm correction");
  assert(confirmIntent.toolName === "acceptCorrection", "Intent: 'Confirm correction' maps to acceptCorrection");

  const rejectIntent = parseSpokenInspectionIntent("Keep previous");
  assert(rejectIntent.toolName === "rejectCorrection", "Intent: 'Keep previous' maps to rejectCorrection");

  const dishwasherIntent = parseSpokenInspectionIntent("Dishwasher rinse temperature is 82 degrees");
  assert(dishwasherIntent.toolName === "recordObservation", "Intent: 'Dishwasher rinse is 82 degrees' maps to recordObservation");
  assert(dishwasherIntent.parameters.value === "82", "Dishwasher rinse extracts 82 degrees");

  const hygieneRestockIntent = parseSpokenInspectionIntent("Soap and paper towels are both fully stocked");
  assert(hygieneRestockIntent.toolName === "completeCheckpoint", "Intent: 'Soap and paper towels both stocked' maps to completeCheckpoint");

  console.log("\n--------------------------------------------------");
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log("--------------------------------------------------\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runEngineTests().catch((err) => {
  console.error("Test runner encountered fatal error:", err);
  process.exit(1);
});
