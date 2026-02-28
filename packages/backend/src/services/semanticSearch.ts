/**
 * Semantic Search — cosine similarity search over embedded code chunks.
 * Finds the most relevant files/chunks for a natural language query.
 */

import type { EmbeddingResult, SemanticSearchResult } from "@autodev/shared";
import { embedQuery, embedCodebase } from "./embeddings.js";
import {
  getAnalysisOutput,
  uploadAnalysisOutput,
  getLatestCodeIndex,
} from "./s3.js";

/**
 * Cosine similarity between two vectors.
 */
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  return denominator === 0 ? 0 : dotProduct / denominator;
}

/**
 * Search through embedded chunks to find the most relevant ones for a query.
 */
export async function semanticSearch(
  queryEmbedding: number[],
  embeddings: EmbeddingResult[],
  topK: number = 10
): Promise<SemanticSearchResult[]> {
  const scored = embeddings.map((e) => ({
    path: e.path,
    content: e.content,
    score: cosineSimilarity(queryEmbedding, e.embedding),
  }));

  // Sort by score descending, take top K
  scored.sort((a, b) => b.score - a.score);

  // Deduplicate by file path — keep highest scoring chunk per file
  const seen = new Set<string>();
  const results: SemanticSearchResult[] = [];
  for (const item of scored) {
    if (results.length >= topK) break;
    if (seen.has(item.path)) continue;
    seen.add(item.path);
    results.push(item);
  }

  return results;
}

/**
 * Get or generate embeddings for a repo.
 * Caches embeddings in S3 to avoid redundant Bedrock calls.
 */
export async function getOrCreateEmbeddings(
  repoId: string
): Promise<EmbeddingResult[]> {
  // Try cached embeddings first
  try {
    const cached = await getAnalysisOutput<EmbeddingResult[]>(
      repoId,
      "embeddings"
    );
    if (cached && cached.length > 0) {
      console.log(
        `[semantic] Using cached embeddings for ${repoId} (${cached.length} chunks)`
      );
      return cached;
    }
  } catch {
    // Fall through to generate
  }

  // Fetch code files and generate embeddings
  const files = await getLatestCodeIndex(repoId);
  if (!files || files.length === 0) {
    console.warn(`[semantic] No code index for ${repoId}`);
    return [];
  }

  // Filter to relevant code files, limit size
  const codeFiles = files
    .filter(
      (f) =>
        f.content.length > 50 &&
        f.content.length < 50_000 &&
        !f.path.includes("node_modules") &&
        !f.path.endsWith(".lock") &&
        !f.path.endsWith(".min.js")
    )
    .slice(0, 100); // Cap at 100 files for cost control

  console.log(
    `[semantic] Generating embeddings for ${repoId} (${codeFiles.length} files)`
  );

  const embeddings = await embedCodebase(codeFiles);

  // Cache in S3
  await uploadAnalysisOutput(repoId, "embeddings", embeddings);

  return embeddings;
}

/**
 * Full semantic search pipeline: query → embed → match → return relevant files.
 */
export async function searchCodebase(
  repoId: string,
  query: string,
  topK: number = 10
): Promise<SemanticSearchResult[]> {
  const [queryEmbed, embeddings] = await Promise.all([
    embedQuery(query),
    getOrCreateEmbeddings(repoId),
  ]);

  if (embeddings.length === 0) {
    console.warn(`[semantic] No embeddings available for ${repoId}`);
    return [];
  }

  const results = await semanticSearch(queryEmbed, embeddings, topK);
  console.log(
    `[semantic] Found ${results.length} relevant files for "${query.slice(0, 50)}..."`
  );
  return results;
}
