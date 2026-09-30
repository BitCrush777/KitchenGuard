export interface ParsedVoiceIntent {
  toolName: string;
  parameters: Record<string, unknown>;
  confidence: number;
}

let lastReferencedEntity = "blue cleaning bucket";

export function setLastReferencedEntity(entity: string): void {
  lastReferencedEntity = entity;
}

export function getLastReferencedEntity(): string {
  return lastReferencedEntity;
}

/**
 * Deterministic Natural Language Voice Intent Parser for KitchenGuard
 * Extracts operational inspection intent, fixtures, measurements, and commands.
 */
export function parseSpokenInspectionIntent(text: string): ParsedVoiceIntent {
  const trimmed = text.trim();
  const lower = trimmed.toLowerCase();

  // 1. Start Inspection Command
  if (
    lower.startsWith("start ") ||
    lower.includes("start inspection") ||
    lower.includes("start opening") ||
    lower.includes("start closing") ||
    lower.includes("start deep clean")
  ) {
    let type: "opening" | "closing" | "deep-clean" | "custom-voice" = "opening";
    if (lower.includes("closing")) type = "closing";
    if (lower.includes("deep")) type = "deep-clean";
    if (lower.includes("custom")) type = "custom-voice";

    return {
      toolName: "startInspection",
      parameters: {
        inspectionType: type,
        kitchen: "Main Kitchen",
        inspector: "Arun Patel",
        spokenText: trimmed,
      },
      confidence: 0.95,
    };
  }

  // 2. Finalize / Complete Inspection
  if (
    lower.includes("finalize inspection") ||
    lower.includes("complete inspection") ||
    lower.includes("finish inspection") ||
    lower.includes("finish the inspection") ||
    lower.includes("can i finish now") ||
    lower.includes("sign off inspection")
  ) {
    return {
      toolName: "finalizeInspection",
      parameters: { inspectorSignoff: "Arun Patel", spokenText: trimmed },
      confidence: 0.95,
    };
  }

  // 3. Review Inspection
  if (
    lower.includes("review inspection") ||
    lower.includes("review the inspection") ||
    lower.includes("audit review") ||
    lower.includes("check readiness")
  ) {
    return {
      toolName: "reviewInspection",
      parameters: { spokenText: trimmed },
      confidence: 0.95,
    };
  }

  // 4. Query Missing Checks
  if (
    lower.includes("what's left") ||
    lower.includes("what is left") ||
    lower.includes("what do i have left") ||
    lower.includes("what do i still need to check") ||
    lower.includes("remaining checks") ||
    lower.includes("missing checks") ||
    lower.includes("what else")
  ) {
    return {
      toolName: "getMissingChecks",
      parameters: { spokenText: trimmed },
      confidence: 0.95,
    };
  }

  // 5. Query Current Status
  if (
    lower.includes("inspection status") ||
    lower.includes("current state") ||
    lower.includes("how are we doing") ||
    lower.includes("what is the score") ||
    lower.includes("what issues have i found") ||
    lower.includes("what did i correct")
  ) {
    return {
      toolName: "getCurrentInspectionState",
      parameters: { spokenText: trimmed },
      confidence: 0.9,
    };
  }

  // 6. Accept Correction (Worker says "Yes", "Replace it", "Accept", "Confirm correction")
  if (
    lower === "yes" ||
    lower === "yes please" ||
    lower === "confirm" ||
    lower === "accept" ||
    lower.includes("accept correction") ||
    lower.includes("confirm correction") ||
    lower.includes("accept the correction") ||
    lower.includes("replace it") ||
    lower.includes("use the new value") ||
    lower.includes("save correction")
  ) {
    return {
      toolName: "acceptCorrection",
      parameters: { spokenText: trimmed },
      confidence: 0.95,
    };
  }

  // 7. Reject Correction (Worker says "No", "Keep previous", "Don't replace", "Discard correction")
  if (
    lower === "no" ||
    lower === "no don't" ||
    lower.includes("keep previous") ||
    lower.includes("keep the previous") ||
    lower.includes("reject correction") ||
    lower.includes("reject the correction") ||
    lower.includes("keep four degrees") ||
    lower.includes("keep 4 degrees") ||
    lower.includes("keep original") ||
    lower.includes("don't replace") ||
    lower.includes("discard correction")
  ) {
    return {
      toolName: "rejectCorrection",
      parameters: { spokenText: trimmed },
      confidence: 0.95,
    };
  }

  // 8. Issue Resolution (e.g., "paper towels have been restocked", "paper towels are now stocked", "damper adjusted")
  if (
    lower.includes("restocked") ||
    lower.includes("now stocked") ||
    lower.includes("fixed") ||
    lower.includes("resolved") ||
    lower.includes("corrected the issue")
  ) {
    const titleSearch = lower.includes("towel")
      ? "paper towels"
      : lower.includes("damper") || lower.includes("refrigerator") || lower.includes("seal")
      ? "cold storage"
      : lower.includes("chicken") || lower.includes("separation")
      ? "food separation"
      : "issue";

    return {
      toolName: "resolveIssue",
      parameters: {
        titleSearch,
        resolutionNotes: trimmed,
        spokenText: trimmed,
      },
      confidence: 0.92,
    };
  }

  // ==========================================================
  // KITCHENGUARD PERSISTENT MEMORY INTENT ROUTER
  // ==========================================================
  const SPATIAL_PREP_REGEX =
    "(?:underneath|under|beneath|below|inside|in|next\\s+to|beside|by|behind|in\\s+back\\s+of|above|on\\s+top\\s+of|on\\s+the\\s+shelf\\s+above|atop|on|near|in\\s+front\\s+of|stored\\s+in)";

  // M1. Memory Correction (e.g. "Actually, it wasn't next to the sink. I put it behind the oven.")
  if (
    (lower.includes("actually") || lower.includes("correction")) &&
    (lower.includes("behind") ||
      lower.includes("next to") ||
      lower.includes("under") ||
      lower.includes("inside") ||
      lower.includes("oven") ||
      lower.includes("sink") ||
      lower.includes("drawer") ||
      lower.includes("shelf") ||
      lower.includes("put it") ||
      lower.includes("moved it") ||
      lower.includes("put the") ||
      lower.includes("moved the")) &&
    !lower.includes("degree") &&
    !lower.includes("°c")
  ) {
    const corrMatch = lower.match(
      new RegExp(
        `(?:put|moved|placed|is|store(?:d)?)\\s+(?:it|the\\s+([a-z0-9\\s\\-]+?))?\\s*(?:to\\s+)?(${SPATIAL_PREP_REGEX})\\s+(?:the\\s+|a\\s+|an\\s+)?([a-z0-9\\s\\-#]+)`,
        "i"
      )
    );
    if (corrMatch) {
      const subject = corrMatch[1]?.trim() || lastReferencedEntity;
      const relation = corrMatch[2].trim();
      const object = corrMatch[3].trim().replace(/[.,!?;]+$/, "");
      return {
        toolName: "rememberObservation",
        parameters: {
          subject,
          relation,
          object,
          isCorrection: "true",
          spokenText: trimmed,
        },
        confidence: 0.96,
      };
    }
  }

  // M2. Reverse Spatial Query: "What is [under/inside/next to] the [object]?"
  const reverseMatch = lower.match(
    new RegExp(
      `^(?:what(?:'s|\\s+is)|what\\s+items?\\s+are|what\\s+do\\s+we\\s+have|is\\s+(?:anything|there\\s+anything))\\s+(?:currently\\s+)?(${SPATIAL_PREP_REGEX})\\s+(?:the\\s+|a\\s+|an\\s+)?([a-z0-9\\s\\-#]+?)\\??$`,
      "i"
    )
  );
  if (reverseMatch) {
    const relation = reverseMatch[1].trim();
    const object = reverseMatch[2].trim().replace(/[.,!?;]+$/, "");
    return {
      toolName: "reverseLocate",
      parameters: {
        relation,
        object,
        spokenText: trimmed,
      },
      confidence: 0.96,
    };
  }

  // M3. Entity History / Provenance Query: "Where was it before?" / "Where has the blue bucket been recorded?"
  const historyMatch = lower.match(
    new RegExp(
      `^(?:where\\s+was|where\\s+did|where\\s+has|where\\s+have|what\\s+is\\s+the\\s+history\\s+of|show\\s+history\\s+for|history\\s+of)\\s+(?:the\\s+|a\\s+|an\\s+)?([a-z0-9\\s\\-#]+?)(?:\\s+(?:before|originally|use\\s+to\\s+be|been\\s+recorded|been))?\\??$`,
      "i"
    )
  );
  if (historyMatch) {
    let entity = historyMatch[1].trim().replace(/[.,!?;]+$/, "");
    if (entity === "it" || entity === "that" || entity === "this") {
      entity = lastReferencedEntity;
    } else {
      lastReferencedEntity = entity;
    }

    if (lower.includes("before") || lower.includes("originally") || lower.includes("use to be")) {
      return {
        toolName: "locateEntity",
        parameters: {
          entity,
          temporalScope: "historical",
          spokenText: trimmed,
        },
        confidence: 0.96,
      };
    }

    return {
      toolName: "getMemoryHistory",
      parameters: {
        entity,
        spokenText: trimmed,
      },
      confidence: 0.96,
    };
  }

  // M4. Entity Locate Query: "Where is the [entity]?" / "Do you remember where the blue bucket was?"
  const locateMatch = lower.match(
    new RegExp(
      `^(?:where\\s+is|where's|where\\s+are|locate|find|do\\s+you\\s+remember\\s+where)\\s+(?:the\\s+|a\\s+|an\\s+)?([a-z0-9\\s\\-#]+?)(?:\\s+(?:now|located|at|currently|was|is))?\\??$`,
      "i"
    )
  );
  if (locateMatch) {
    let entity = locateMatch[1].trim().replace(/[.,!?;]+$/, "");
    if (entity === "it" || entity === "that" || entity === "this") {
      entity = lastReferencedEntity;
    } else {
      lastReferencedEntity = entity;
    }
    return {
      toolName: "locateEntity",
      parameters: {
        entity,
        temporalScope: "current",
        spokenText: trimmed,
      },
      confidence: 0.95,
    };
  }

  // M5. Movement Observation: "I moved the blue bucket next to the sink."
  const moveMatch = lower.match(
    new RegExp(
      `(?:i\\s+|we\\s+)?(?:have\\s+)?(?:moved|relocated)\\s+(?:the\\s+|a\\s+|an\\s+)?([a-z0-9\\s\\-#]+?)\\s+(?:to\\s+)?(${SPATIAL_PREP_REGEX})\\s+(?:the\\s+|a\\s+|an\\s+)?([a-z0-9\\s\\-#]+)`,
      "i"
    )
  );
  if (moveMatch) {
    let subject = moveMatch[1].trim();
    if (subject === "it" || subject === "that" || subject === "this") {
      subject = lastReferencedEntity;
    } else {
      lastReferencedEntity = subject;
    }
    const relation = moveMatch[2].trim();
    const object = moveMatch[3].trim().replace(/[.,!?;]+$/, "");
    return {
      toolName: "rememberObservation",
      parameters: {
        subject,
        relation,
        object,
        isCorrection: "false",
        spokenText: trimmed,
      },
      confidence: 0.96,
    };
  }

  // M6. "There is / There's a [subject] [relation] the [object]"
  const thereIsMatch = lower.match(
    new RegExp(
      `^(?:there\\s+is|there's)\\s+(?:a\\s+|an\\s+|the\\s+)?([a-z0-9\\s\\-#]+?)\\s+(${SPATIAL_PREP_REGEX})\\s+(?:the\\s+|a\\s+|an\\s+)?([a-z0-9\\s\\-#]+?)[.,!?;]?$`,
      "i"
    )
  );
  if (thereIsMatch) {
    const subject = thereIsMatch[1].trim();
    const relation = thereIsMatch[2].trim();
    const object = thereIsMatch[3].trim().replace(/[.,!?;]+$/, "");
    lastReferencedEntity = subject;
    return {
      toolName: "rememberObservation",
      parameters: {
        subject,
        relation,
        object,
        spokenText: trimmed,
      },
      confidence: 0.96,
    };
  }

  // M7. Direct Spatial Observation: "[subject] is [relation] the [object]"
  const directMatch = lower.match(
    new RegExp(
      `^(?:the\\s+|a\\s+|an\\s+)?([a-z0-9\\s\\-#]+?)\\s+is\\s+(${SPATIAL_PREP_REGEX})\\s+(?:the\\s+|a\\s+|an\\s+)?([a-z0-9\\s\\-#]+?)[.,!?;]?$`,
      "i"
    )
  );
  if (directMatch) {
    const subject = directMatch[1].trim();
    const relation = directMatch[2].trim();
    const object = directMatch[3].trim().replace(/[.,!?;]+$/, "");

    const isFoodHierarchy =
      (subject.includes("vegetable") || subject.includes("chicken") || subject.includes("meat") || subject.includes("poultry")) &&
      (object.includes("vegetable") || object.includes("chicken") || object.includes("meat") || object.includes("poultry"));

    const isTemperature = object.includes("degree") || object.includes("°") || /^\d+$/.test(object);

    if (!isFoodHierarchy && !isTemperature) {
      lastReferencedEntity = subject;
      return {
        toolName: "rememberObservation",
        parameters: {
          subject,
          relation,
          object,
          spokenText: trimmed,
        },
        confidence: 0.95,
      };
    }
  }

  // M8. Semantic Search Query
  if (
    lower.startsWith("search memory") ||
    lower.startsWith("search kitchen memory") ||
    lower.startsWith("recall ")
  ) {
    const query = lower
      .replace(/^(?:search\s+(?:kitchen\s+)?memory\s+(?:for\s+)?|recall\s+)/i, "")
      .trim();
    return {
      toolName: "searchMemory",
      parameters: {
        query,
        spokenText: trimmed,
      },
      confidence: 0.94,
    };
  }

  // 9. Voice Correction Statement (e.g., "Actually, the refrigerator was six degrees, not four")
  if (
    lower.includes("actually") ||
    (lower.includes("not four") && (lower.includes("six") || lower.includes("6"))) ||
    lower.includes("correction") ||
    lower.includes("change that to") ||
    lower.includes("that was wrong")
  ) {
    const matchSix = lower.match(/(six|6)(\s*(degrees|°c|c)?)/);
    const numMatch = lower.match(/(\d+(\.\d+)?)/);
    const newValue = matchSix ? "6" : numMatch ? numMatch[1] : "6";

    return {
      toolName: "updateObservation",
      parameters: {
        item: "Walk-in refrigerator",
        newValue: `${newValue}°C`,
        reason: "Inspector voice correction",
        spokenText: trimmed,
      },
      confidence: 0.95,
    };
  }

  // 10. Hand Washing Check & Missing Supplies
  if (lower.includes("paper towel") || lower.includes("towel dispenser")) {
    if (lower.includes("missing") || lower.includes("empty") || lower.includes("out of") || lower.includes("no paper")) {
      return {
        toolName: "flagIssue",
        parameters: {
          checkpointId: "chk-4",
          category: "Hygiene",
          title: "Hand-wash station paper towels missing",
          severity: "medium",
          description: "Paper towel dispenser empty during line walkthrough inspection.",
          location: "Hand Washing Station #1",
          recommendedAction: "Restock dispenser from chemical supply storage locker.",
          spokenText: trimmed,
        },
        confidence: 0.95,
      };
    }
  }

  if (
    lower.includes("hand-wash") ||
    lower.includes("hand washing") ||
    lower.includes("handwash") ||
    lower.includes("sink station")
  ) {
    return {
      toolName: "recordObservation",
      parameters: {
        checkpointId: "chk-4",
        checkpointName: "Hand Washing Station #1 & #2",
        item: "Hand washing supplies",
        value: trimmed,
        spokenText: trimmed,
      },
      confidence: 0.93,
    };
  }

  // 11. Food Separation / Cross-Contamination & Unsealed Container Response
  if (lower === "no" || lower.includes("not sealed") || lower.includes("unsealed")) {
    return {
      toolName: "flagIssue",
      parameters: {
        checkpointId: "chk-3",
        category: "Food Separation",
        title: "Food separation violation: Unsealed storage",
        severity: "high",
        description: "Vegetables stored unsealed above raw poultry. Cross-contamination hazard detected.",
        location: "Main Walk-in Rack B",
        recommendedAction: "Immediately seal produce containers or relocate raw chicken to the bottom-most shelf.",
        spokenText: trimmed,
      },
      confidence: 0.95,
    };
  }

  if (
    lower.includes("vegetable") ||
    lower.includes("chicken") ||
    lower.includes("poultry") ||
    lower.includes("meat above") ||
    lower.includes("stored above") ||
    lower.includes("stored below")
  ) {
    return {
      toolName: "recordObservation",
      parameters: {
        checkpointId: "chk-3",
        checkpointName: "Food Separation & Storage",
        item: "Storage vertical hierarchy",
        value: trimmed,
        spokenText: trimmed,
      },
      confidence: 0.95,
    };
  }

  // Complete hygiene station when soap and paper towels verified
  if (
    (lower.includes("soap") && (lower.includes("paper towel") || lower.includes("towel"))) &&
    (lower.includes("stocked") || lower.includes("available") || lower.includes("present") || lower.includes("both") || lower.includes("verified"))
  ) {
    return {
      toolName: "completeCheckpoint",
      parameters: {
        checkpointId: "chk-4",
        evidenceValues: "Soap and paper towels both verified stocked and operational",
        spokenText: trimmed,
      },
      confidence: 0.96,
    };
  }

  // Commercial Dishwasher Sanitizing Rinse Temperature
  if (lower.includes("dishwasher") || lower.includes("dish machine") || lower.includes("warewash")) {
    const tempMatch = lower.match(/(\d+)/);
    const tempVal = tempMatch ? tempMatch[1] : "82";
    return {
      toolName: "recordObservation",
      parameters: {
        checkpointId: "chk-8",
        checkpointName: "Dishwasher Sanitation",
        item: "Commercial dish machine sanitizing rinse",
        value: tempVal,
        unit: "°C",
        spokenText: trimmed,
      },
      confidence: 0.94,
    };
  }

  // 12. Sanitizer Titration
  if (lower.includes("sanitizer") || lower.includes("titration") || lower.includes("ppm")) {
    const ppmMatch = lower.match(/(\d+)\s*(ppm)?/i);
    const ppmVal = ppmMatch ? ppmMatch[1] : "200";
    return {
      toolName: "recordObservation",
      parameters: {
        checkpointId: "chk-6",
        checkpointName: "Sanitizer Buckets (Pass & Butchery)",
        item: "Sanitizer bucket titration",
        value: ppmVal,
        unit: "PPM",
        spokenText: trimmed,
      },
      confidence: 0.92,
    };
  }

  // 13. Deep Freezer Temperature
  if (
    lower.includes("freezer") ||
    lower.includes("minus eighteen") ||
    lower.includes("minus 18") ||
    lower.includes("-18") ||
    lower.includes("minus")
  ) {
    const freezerMatch = lower.match(/(minus\s*(\d+)|-(\d+))/);
    const num = freezerMatch ? (freezerMatch[2] ? `-${freezerMatch[2]}` : `-${freezerMatch[3]}`) : "-18";
    return {
      toolName: "recordObservation",
      parameters: {
        checkpointId: "chk-2",
        checkpointName: "Walk-in Deep Freezer",
        item: "Walk-in freezer temperature",
        value: num,
        unit: "°C",
        spokenText: trimmed,
      },
      confidence: 0.95,
    };
  }

  // 14. Cold Storage / Refrigerator Temperature
  if (
    lower.includes("refrigerator") ||
    lower.includes("fridge") ||
    lower.includes("chiller") ||
    lower.includes("cooler") ||
    lower.includes("four degrees") ||
    lower.includes("4 degrees") ||
    lower.includes("six degrees") ||
    lower.includes("6 degrees")
  ) {
    let tempVal = "4";
    if (lower.includes("six") || lower.includes("6")) tempVal = "6";
    else if (lower.includes("four") || lower.includes("4")) tempVal = "4";
    else {
      const match = lower.match(/(\d+(\.\d+)?)/);
      if (match) tempVal = match[1];
    }

    return {
      toolName: "recordObservation",
      parameters: {
        checkpointId: "chk-1",
        checkpointName: "Cold Storage Line #1",
        item: "Walk-in refrigerator temperature",
        value: tempVal,
        unit: "°C",
        spokenText: trimmed,
      },
      confidence: 0.95,
    };
  }

  // 15. Expiration Labels & FIFO
  if (lower.includes("label") || lower.includes("fifo") || lower.includes("date")) {
    return {
      toolName: "recordObservation",
      parameters: {
        checkpointId: "chk-7",
        checkpointName: "Expiration Labels & FIFO",
        item: "Expiration labels & FIFO tags",
        value: trimmed,
        spokenText: trimmed,
      },
      confidence: 0.9,
    };
  }

  // Fallback observation
  return {
    toolName: "recordObservation",
    parameters: {
      item: "Kitchen observation",
      value: trimmed,
      spokenText: trimmed,
    },
    confidence: 0.7,
  };
}
