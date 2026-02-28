/**
 * Titan Embedding Pipeline — generates embeddings for code chunks
 * using AWS Bedrock Titan Embeddings model.
 */

import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";
import type { EmbeddingResult } from "@autodev/shared";

const client = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || "us-east-1",
});

const TITAN_EMBED_MODEL = "amazon.titan-embed-text-v2:0";
const CHUNK_SIZE = 2000; // characters per chunk
const CHUNK_OVERLAP = 200;

/**
 * Generate an embedding vector for a single text chunk.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const body = JSON.stringify({
    inputText: text.slice(0, 8192), // Titan max input
  });

  const command = new InvokeModelCommand({
    modelId: TITAN_EMBED_MODEL,
    contentType: "application/json",
    accept: "application/json",
    body: new TextEncoder().encode(body),
  });

  const response = await client.send(command);
  const responseBody = JSON.parse(new TextDecoder().decode(response.body));

  return responseBody.embedding;
}

/**
 * Split a file into overlapping chunks for embedding.
 */
function chunkText(
  content: string,
  chunkSize: number = CHUNK_SIZE,
  overlap: number = CHUNK_OVERLAP
): string[] {
  const chunks: string[] = [];
  let start = 0;
  while (start < content.length) {
    const end = Math.min(start + chunkSize, content.length);
    chunks.push(content.slice(start, end));
    if (end === content.length) break;
    start = end - overlap;
  }
  return chunks;
}

/**
 * Generate embeddings for all files in a codebase.
 * Returns an array of EmbeddingResult with path, chunk content, and vector.
 */
export async function embedCodebase(
  files: { path: string; content: string }[]
): Promise<EmbeddingResult[]> {
  const results: EmbeddingResult[] = [];

  // Process files in batches to avoid rate limits
  const BATCH_SIZE = 5;
  for (let i = 0; i < files.length; i += BATCH_SIZE) {
    const batch = files.slice(i, i + BATCH_SIZE);
    const batchPromises = batch.flatMap((file) => {
      const chunks = chunkText(file.content);
      return chunks.map(async (chunk, chunkIndex) => {
        try {
          const embedding = await generateEmbedding(
            `File: ${file.path}\n\n${chunk}`
          );
          return {
            path: file.path,
            content: chunk,
            embedding,
            chunkIndex,
          };
        } catch (err) {
          console.error(
            `[embeddings] Failed to embed ${file.path} chunk ${chunkIndex}:`,
            err
          );
          return null;
        }
      });
    });

    const batchResults = await Promise.allSettled(batchPromises);
    for (const result of batchResults) {
      if (result.status === "fulfilled" && result.value) {
        results.push(result.value);
      }
    }
  }

  console.log(
    `[embeddings] Generated ${results.length} embeddings from ${files.length} files`
  );
  return results;
}

/**
 * Generate a single embedding for a query string.
 */
export async function embedQuery(query: string): Promise<number[]> {
  return generateEmbedding(query);
}
