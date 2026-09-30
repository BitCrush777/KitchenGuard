import { SpatialRelationType } from "./memory-types";

/**
 * Normalizes raw spoken prepositions and spatial terms into canonical SpatialRelationType.
 */
export function normalizeSpatialRelation(raw: string): SpatialRelationType {
  const cleaned = raw.trim().toLowerCase().replace(/^(is|was|are|were|been|located|stored|kept)\s+/g, "");

  if (/^(under|beneath|below|underneath|bottom of)/i.test(cleaned)) {
    return "UNDER";
  }

  if (/^(above|over|overhead)/i.test(cleaned)) {
    return "ABOVE";
  }

  if (/^(inside|within|in the|in a|stored in|into|in)/i.test(cleaned)) {
    return "INSIDE";
  }

  if (/^(outside|out of)/i.test(cleaned)) {
    return "OUTSIDE";
  }

  if (/^(next to|beside|by|adjacent to|at the side of|alongside)/i.test(cleaned)) {
    return "NEXT_TO";
  }

  if (/^(behind|in back of|to the rear of|rear of)/i.test(cleaned)) {
    return "BEHIND";
  }

  if (/^(in front of|infront of|ahead of|before)/i.test(cleaned)) {
    return "IN_FRONT_OF";
  }

  if (/^(on top of|on the|on a|atop|on)/i.test(cleaned)) {
    return "ON";
  }

  if (/^(near|close to|nearby|around)/i.test(cleaned)) {
    return "NEAR";
  }

  if (/^(far from|away from)/i.test(cleaned)) {
    return "FAR_FROM";
  }

  if (/^(between)/i.test(cleaned)) {
    return "BETWEEN";
  }

  if (/^(attached to|fastened to|mounted on)/i.test(cleaned)) {
    return "ATTACHED_TO";
  }

  if (/^(left of|to the left of)/i.test(cleaned)) {
    return "LEFT_OF";
  }

  if (/^(right of|to the right of)/i.test(cleaned)) {
    return "RIGHT_OF";
  }

  return "NEAR";
}

/**
 * Maps a canonical relation to natural spoken human phrasing.
 */
export function formatRelationForSpeech(relation: SpatialRelationType): string {
  switch (relation) {
    case "UNDER":
      return "under";
    case "ABOVE":
      return "above";
    case "INSIDE":
      return "inside";
    case "OUTSIDE":
      return "outside";
    case "NEXT_TO":
      return "next to";
    case "BESIDE":
      return "beside";
    case "BEHIND":
      return "behind";
    case "IN_FRONT_OF":
      return "in front of";
    case "ON":
      return "on top of";
    case "NEAR":
      return "near";
    case "FAR_FROM":
      return "away from";
    case "BETWEEN":
      return "between";
    case "ATTACHED_TO":
      return "attached to";
    case "LEFT_OF":
      return "to the left of";
    case "RIGHT_OF":
      return "to the right of";
    default:
      return "near";
  }
}

/**
 * Returns inverse relation for multi-hop or bidirectional queries.
 */
export function getInverseRelation(relation: SpatialRelationType): SpatialRelationType {
  switch (relation) {
    case "UNDER":
      return "ABOVE";
    case "ABOVE":
      return "UNDER";
    case "INSIDE":
      return "ON";
    case "BEHIND":
      return "IN_FRONT_OF";
    case "IN_FRONT_OF":
      return "BEHIND";
    case "NEXT_TO":
    case "BESIDE":
      return "NEXT_TO";
    case "LEFT_OF":
      return "RIGHT_OF";
    case "RIGHT_OF":
      return "LEFT_OF";
    default:
      return relation;
  }
}
