/**
 * Caching service — DynamoDB-backed cache with TTL for all cacheable responses.
 * Provides a generic cache layer for Q&A, translations, animations, etc.
 */

import { createHash } from "crypto";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
} from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
});

const docClient = DynamoDBDocumentClient.from(client);

const CACHE_TABLE = process.env.QA_CACHE_TABLE || "autodev-qa-cache";

export type CacheNamespace =
  | "qa"
  | "translation"
  | "animation"
  | "embedding-query"
  | "fresher";

interface CacheEntry {
  repoId: string;
  questionHash: string; // partition key
  namespace: CacheNamespace;
  data: unknown;
  ttl: number;
  createdAt: string;
}

/**
 * Generate a cache key from namespace + repo + input.
 */
export function cacheKey(
  namespace: CacheNamespace,
  repoId: string,
  input: string
): string {
  const raw = `${namespace}:${repoId}:${input.toLowerCase().trim()}`;
  return createHash("sha256").update(raw).digest("hex").slice(0, 24);
}

/**
 * Get a cached value. Returns null if not found or expired.
 */
export async function getCache<T = unknown>(
  namespace: CacheNamespace,
  repoId: string,
  input: string
): Promise<T | null> {
  const key = cacheKey(namespace, repoId, input);

  try {
    const result = await docClient.send(
      new GetCommand({
        TableName: CACHE_TABLE,
        Key: { repoId, questionHash: key },
      })
    );

    if (!result.Item) return null;

    // Check TTL (DynamoDB TTL is eventually consistent, so check client-side too)
    const now = Math.floor(Date.now() / 1000);
    if (result.Item.ttl && result.Item.ttl < now) return null;

    return result.Item.data as T;
  } catch {
    return null;
  }
}

/**
 * Set a cached value with TTL.
 */
export async function setCache(
  namespace: CacheNamespace,
  repoId: string,
  input: string,
  data: unknown,
  ttlSeconds: number = 3600 // default 1 hour
): Promise<void> {
  const key = cacheKey(namespace, repoId, input);
  const ttl = Math.floor(Date.now() / 1000) + ttlSeconds;

  const entry: CacheEntry = {
    repoId,
    questionHash: key,
    namespace,
    data,
    ttl,
    createdAt: new Date().toISOString(),
  };

  try {
    await docClient.send(
      new PutCommand({
        TableName: CACHE_TABLE,
        Item: entry,
      })
    );
  } catch (err) {
    console.error(`[cache] Failed to cache ${namespace}/${key}:`, err);
    // Swallow — caching is optional
  }
}

/**
 * Cache-through helper: get from cache, or compute and cache.
 */
export async function cacheThroughAsync<T>(
  namespace: CacheNamespace,
  repoId: string,
  input: string,
  computeFn: () => Promise<T>,
  ttlSeconds: number = 3600
): Promise<T> {
  // Try cache first
  const cached = await getCache<T>(namespace, repoId, input);
  if (cached !== null) {
    console.log(`[cache] HIT ${namespace}/${repoId}/${input.slice(0, 30)}...`);
    return cached;
  }

  console.log(`[cache] MISS ${namespace}/${repoId}/${input.slice(0, 30)}...`);

  // Compute
  const result = await computeFn();

  // Cache in background
  setCache(namespace, repoId, input, result, ttlSeconds).catch(() => {
    // Swallow cache write errors
  });

  return result;
}
