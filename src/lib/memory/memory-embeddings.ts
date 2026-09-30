import { MemoryEmbedding } from "./memory-types";

/**
 * Tokenizes text for semantic candidate search and indexing.
 */
export function tokenizeText(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1);
}

/**
 * Computes Jaccard + Cosine lexical similarity between two token sets.
 */
export function computeSemanticSimilarity(queryTokens: string[], targetTokens: string[]): number {
  if (queryTokens.length === 0 || targetTokens.length === 0) return 0;

  const setA = new Set(queryTokens);
  const setB = new Set(targetTokens);

  let intersection = 0;
  setA.forEach((token) => {
    if (setB.has(token)) {
      intersection++;
    } else {
      // Partial prefix/stem match
      const listB = Array.from(setB);
      for (let i = 0; i < listB.length; i++) {
        const t = listB[i];
        if (token.startsWith(t) || t.startsWith(token)) {
          intersection += 0.5;
          break;
        }
      }
    }
  });

  const union = setA.size + setB.size - Math.floor(intersection);
  const jaccard = union > 0 ? intersection / union : 0;
  const coverage = setA.size > 0 ? intersection / setA.size : 0;

  // Blended score: 70% query token coverage + 30% Jaccard
  return 0.7 * coverage + 0.3 * jaccard;
}

/**
 * Creates an indexable embedding record for a memory statement.
 */
export function createMemoryEmbedding(
  id: string,
  text: string,
  entityId?: string,
  relationId?: string
): MemoryEmbedding {
  const tokens = tokenizeText(text);
  return {
    id: `emb-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    entityId,
    relationId,
    text,
    tokens,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Ranks stored memory embeddings against a query string.
 */
export function rankEmbeddings(
  query: string,
  embeddings: MemoryEmbedding[],
  threshold = 0.2
): Array<{ embedding: MemoryEmbedding; score: number }> {
  const queryTokens = tokenizeText(query);
  const scored: Array<{ embedding: MemoryEmbedding; score: number }> = [];

  for (const emb of embeddings) {
    const score = computeSemanticSimilarity(queryTokens, emb.tokens);
    if (score >= threshold) {
      scored.push({ embedding: emb, score });
    }
  }

  scored.sort((a, b) => b.score - a.score);
  return scored;
}
