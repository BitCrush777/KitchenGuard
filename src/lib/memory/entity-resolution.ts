import { MemoryEntity, EntityType } from "./memory-types";

/**
 * Strips articles, demonstratives, and normalizes an entity string for lookup.
 */
export function normalizeEntityName(raw: string): string {
  if (!raw) return "";
  let name = raw.trim().toLowerCase();

  // Strip leading articles, pronouns, and filler
  name = name.replace(/^(the|a|an|that|this|our|my|some|any)\s+/i, "");
  // Replace multiple spaces and punctuation
  name = name.replace(/['’]/g, "").replace(/[^a-z0-9\s-]/g, " ").replace(/\s+/g, " ").trim();

  // Synonyms and variations
  if (name === "fridge" || name === "chiller" || name === "cooler") {
    name = "walk-in refrigerator";
  }
  if (name === "refrigerator" || name === "walk in refrigerator" || name === "main refrigerator") {
    name = "walk-in refrigerator";
  }
  if (name === "freezer" || name === "walk in freezer" || name === "deep freezer") {
    name = "walk-in freezer";
  }

  return name;
}

/**
 * Automatically infers the EntityType based on keywords.
 */
export function inferEntityType(name: string): EntityType {
  const lower = name.toLowerCase();

  if (
    lower.includes("bucket") ||
    lower.includes("mop") ||
    lower.includes("spray") ||
    lower.includes("detergent") ||
    lower.includes("sanitizer") ||
    lower.includes("bleach") ||
    lower.includes("broom") ||
    lower.includes("soap") ||
    lower.includes("sponge")
  ) {
    return "cleaning_supply";
  }

  if (
    lower.includes("refrigerator") ||
    lower.includes("fridge") ||
    lower.includes("freezer") ||
    lower.includes("oven") ||
    lower.includes("stove") ||
    lower.includes("range") ||
    lower.includes("dishwasher") ||
    lower.includes("grill") ||
    lower.includes("fryer") ||
    lower.includes("mixer") ||
    lower.includes("slicer") ||
    lower.includes("steamer")
  ) {
    return "equipment";
  }

  if (
    lower.includes("thermometer") ||
    lower.includes("probe") ||
    lower.includes("knife") ||
    lower.includes("tongs") ||
    lower.includes("spatula") ||
    lower.includes("scale") ||
    lower.includes("peeler") ||
    lower.includes("timer")
  ) {
    return "tool";
  }

  if (
    lower.includes("sink") ||
    lower.includes("station") ||
    lower.includes("dispenser") ||
    lower.includes("faucet") ||
    lower.includes("drain") ||
    lower.includes("hood") ||
    lower.includes("vent")
  ) {
    return "fixture";
  }

  if (
    lower.includes("table") ||
    lower.includes("counter") ||
    lower.includes("board") ||
    lower.includes("shelf") ||
    lower.includes("rack")
  ) {
    return "surface";
  }

  if (
    lower.includes("drawer") ||
    lower.includes("pantry") ||
    lower.includes("closet") ||
    lower.includes("cabinet") ||
    lower.includes("walk-in") ||
    lower.includes("storage")
  ) {
    return "storage_area";
  }

  if (
    lower.includes("bin") ||
    lower.includes("box") ||
    lower.includes("tub") ||
    lower.includes("pan") ||
    lower.includes("crate") ||
    lower.includes("jar") ||
    lower.includes("container")
  ) {
    return "container";
  }

  if (
    lower.includes("chicken") ||
    lower.includes("beef") ||
    lower.includes("vegetable") ||
    lower.includes("produce") ||
    lower.includes("fish") ||
    lower.includes("sauce") ||
    lower.includes("soup") ||
    lower.includes("dairy")
  ) {
    return "food_item";
  }

  return "object";
}

export interface EntityResolutionResult {
  match: MemoryEntity | null;
  score: number;
  isAmbiguous: boolean;
  candidates: MemoryEntity[];
  clarificationMessage?: string;
}

/**
 * Resolves a natural user reference against existing entities in the kitchen scope.
 */
export function resolveEntity(
  query: string,
  existingEntities: MemoryEntity[],
  kitchenId: string
): EntityResolutionResult {
  const normQuery = normalizeEntityName(query);
  if (!normQuery) {
    return { match: null, score: 0, isAmbiguous: false, candidates: [] };
  }

  // Filter entities by kitchen (or shared/unassigned)
  const scopedEntities = existingEntities.filter(
    (e) =>
      (e.kitchenId === kitchenId || !e.kitchenId || e.kitchenId === "shared") &&
      (e.status === "active" || !e.status)
  );

  // 1. Canonical name matches
  const canonicalMatches = scopedEntities.filter((e) => e.canonicalName === normQuery);
  if (canonicalMatches.length > 1) {
    const names = canonicalMatches.map((c) => c.displayName);
    return {
      match: null,
      score: 1.0,
      isAmbiguous: true,
      candidates: canonicalMatches,
      clarificationMessage: `I found multiple matching entities: ${names.join(" or ")}. Which one did you mean?`,
    };
  } else if (canonicalMatches.length === 1) {
    return { match: canonicalMatches[0], score: 1.0, isAmbiguous: false, candidates: canonicalMatches };
  }

  // 2. Alias matches
  const aliasMatches = scopedEntities.filter((e) =>
    e.aliases.some((a) => normalizeEntityName(a) === normQuery)
  );
  if (aliasMatches.length > 1) {
    const names = aliasMatches.map((c) => c.displayName);
    return {
      match: null,
      score: 0.98,
      isAmbiguous: true,
      candidates: aliasMatches,
      clarificationMessage: `I found multiple matching entities: ${names.join(" or ")}. Which one did you mean?`,
    };
  } else if (aliasMatches.length === 1) {
    return { match: aliasMatches[0], score: 0.98, isAmbiguous: false, candidates: aliasMatches };
  }

  // 3. Substring / Token matching
  const queryTokens = new Set(normQuery.split(" ").filter((t) => t.length > 2));
  const scoredCandidates: Array<{ entity: MemoryEntity; score: number }> = [];

  for (const entity of scopedEntities) {
    const entityCanonicalTokens = new Set(entity.canonicalName.split(" ").filter((t) => t.length > 2));
    let matchCount = 0;
    queryTokens.forEach((qt) => {
      if (entityCanonicalTokens.has(qt)) matchCount++;
    });

    // Check aliases
    for (const alias of entity.aliases) {
      const aliasTokens = new Set(normalizeEntityName(alias).split(" ").filter((t) => t.length > 2));
      let aMatchCount = 0;
      queryTokens.forEach((qt) => {
        if (aliasTokens.has(qt)) aMatchCount++;
      });
      if (aMatchCount > matchCount) matchCount = aMatchCount;
    }

    if (matchCount > 0) {
      const jaccard = matchCount / (queryTokens.size + entityCanonicalTokens.size - matchCount);
      const isSub =
        entity.canonicalName.includes(normQuery) ||
        normQuery.includes(entity.canonicalName) ||
        entity.aliases.some((a) => a.includes(normQuery) || normQuery.includes(a));
      const score = isSub ? Math.max(0.75, jaccard) : jaccard;
      if (score >= 0.5) {
        scoredCandidates.push({ entity, score });
      }
    }
  }

  scoredCandidates.sort((a, b) => b.score - a.score);

  if (scoredCandidates.length === 0) {
    return { match: null, score: 0, isAmbiguous: false, candidates: [] };
  }

  // Check for ambiguity: multiple top candidates with very close scores (diff < 0.1)
  if (scoredCandidates.length > 1) {
    const top = scoredCandidates[0];
    const second = scoredCandidates[1];
    if (Math.abs(top.score - second.score) < 0.15 && top.score < 0.95) {
      const names = scoredCandidates.slice(0, 3).map((c) => c.entity.displayName);
      return {
        match: null,
        score: top.score,
        isAmbiguous: true,
        candidates: scoredCandidates.slice(0, 3).map((c) => c.entity),
        clarificationMessage: `I found multiple matching entities: ${names.join(" or ")}. Which one did you mean?`,
      };
    }
  }

  return {
    match: scoredCandidates[0].entity,
    score: scoredCandidates[0].score,
    isAmbiguous: false,
    candidates: [scoredCandidates[0].entity],
  };
}

/**
 * Creates a new canonical MemoryEntity.
 */
export function createNewEntity(
  name: string,
  kitchenId: string,
  restaurantId: string,
  extraAliases: string[] = []
): MemoryEntity {
  const norm = normalizeEntityName(name);
  const words = norm.split(" ");
  const displayName = words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  const type = inferEntityType(norm);

  const aliasesSet = new Set<string>();
  aliasesSet.add(norm);
  if (name.toLowerCase() !== norm) {
    aliasesSet.add(name.toLowerCase());
  }
  extraAliases.forEach((a) => aliasesSet.add(normalizeEntityName(a)));

  const now = new Date().toISOString();

  return {
    id: `ent-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    restaurantId,
    kitchenId,
    type,
    canonicalName: norm,
    displayName,
    aliases: Array.from(aliasesSet),
    createdAt: now,
    updatedAt: now,
    status: "active",
  };
}
