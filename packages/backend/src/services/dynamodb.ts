import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
});

const docClient = DynamoDBDocumentClient.from(client);

const TABLES = {
  users: process.env.USERS_TABLE || "autodev-users",
  repos: process.env.REPOS_TABLE || "autodev-repos",
  analysis: process.env.ANALYSIS_TABLE || "autodev-analysis",
  qaCache: process.env.QA_CACHE_TABLE || "autodev-qa-cache",
} as const;

// --- Repos ---

export async function putRepo(repo: Record<string, unknown>) {
  await docClient.send(
    new PutCommand({ TableName: TABLES.repos, Item: repo })
  );
}

export async function getRepo(repoId: string, userId: string) {
  const result = await docClient.send(
    new GetCommand({
      TableName: TABLES.repos,
      Key: { repoId, userId },
    })
  );
  return result.Item;
}

export async function getReposByUser(userId: string) {
  const result = await docClient.send(
    new QueryCommand({
      TableName: TABLES.repos,
      IndexName: "userId-index",
      KeyConditionExpression: "userId = :uid",
      ExpressionAttributeValues: { ":uid": userId },
    })
  );
  return result.Items || [];
}

// --- Analysis ---

export async function putAnalysis(analysis: Record<string, unknown>) {
  await docClient.send(
    new PutCommand({ TableName: TABLES.analysis, Item: analysis })
  );
}

export async function getAnalysis(repoId: string, analysisType: string) {
  const result = await docClient.send(
    new QueryCommand({
      TableName: TABLES.analysis,
      KeyConditionExpression:
        "repoId = :rid AND begins_with(analysisType, :at)",
      ExpressionAttributeValues: { ":rid": repoId, ":at": analysisType },
      ScanIndexForward: false,
      Limit: 1,
    })
  );
  return result.Items?.[0];
}

// --- QA Cache ---

export async function cacheQA(
  repoId: string,
  questionHash: string,
  data: Record<string, unknown>
) {
  const ttl = Math.floor(Date.now() / 1000) + 86400; // 24h TTL
  await docClient.send(
    new PutCommand({
      TableName: TABLES.qaCache,
      Item: { repoId, questionHash, ...data, ttl },
    })
  );
}

export async function getCachedQA(repoId: string, questionHash: string) {
  const result = await docClient.send(
    new GetCommand({
      TableName: TABLES.qaCache,
      Key: { repoId, questionHash },
    })
  );
  return result.Item;
}
