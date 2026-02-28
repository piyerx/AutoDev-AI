import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
  UpdateCommand,
  GetCommand,
} from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";
import type {
  SkillArea,
  SkillScore,
  ProgressEvent,
  DeveloperProgress,
  ProgressSnapshot,
  TeamProgress,
  ArchitectureMap,
} from "@autodev/shared";

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
});
const docClient = DynamoDBDocumentClient.from(client);

const PROGRESS_TABLE = process.env.PROGRESS_TABLE || "autodev-progress";

// --- Skill Area Classification ---

const MODULE_AREA_MAP: Record<string, SkillArea> = {
  auth: "auth",
  authentication: "auth",
  authorization: "auth",
  login: "auth",
  session: "auth",
  jwt: "auth",
  oauth: "auth",
  api: "api",
  route: "api",
  routes: "api",
  endpoint: "api",
  controller: "api",
  handler: "api",
  middleware: "api",
  database: "database",
  db: "database",
  model: "database",
  schema: "database",
  migration: "database",
  dynamodb: "database",
  postgres: "database",
  mongo: "database",
  redis: "database",
  frontend: "frontend",
  component: "frontend",
  page: "frontend",
  view: "frontend",
  ui: "frontend",
  style: "frontend",
  css: "frontend",
  react: "frontend",
  next: "frontend",
  infra: "infrastructure",
  infrastructure: "infrastructure",
  deploy: "infrastructure",
  docker: "infrastructure",
  ci: "infrastructure",
  cd: "infrastructure",
  pipeline: "infrastructure",
  aws: "infrastructure",
  cloud: "infrastructure",
  terraform: "infrastructure",
  cdk: "infrastructure",
  sam: "infrastructure",
  test: "testing",
  testing: "testing",
  spec: "testing",
  jest: "testing",
  vitest: "testing",
  e2e: "testing",
  devops: "devops",
  monitoring: "devops",
  logging: "devops",
  observability: "devops",
};

/**
 * Classify a module/label into a skill area.
 */
export function classifyArea(label: string): SkillArea {
  const lower = label.toLowerCase();
  for (const [keyword, area] of Object.entries(MODULE_AREA_MAP)) {
    if (lower.includes(keyword)) return area;
  }
  return "other";
}

/**
 * Get all skill areas present in an architecture map.
 */
export function getAreasFromArchitecture(archMap: ArchitectureMap): Map<SkillArea, string[]> {
  const areaModules = new Map<SkillArea, string[]>();

  for (const node of archMap.nodes) {
    const area = classifyArea(node.label);
    if (!areaModules.has(area)) areaModules.set(area, []);
    areaModules.get(area)!.push(node.id);
  }

  return areaModules;
}

// --- Event Recording ---

/**
 * Record a progress event (walkthrough viewed, Q&A asked, etc.)
 */
export async function recordProgressEvent(
  event: Omit<ProgressEvent, "id" | "timestamp">
): Promise<ProgressEvent> {
  const fullEvent: ProgressEvent = {
    ...event,
    id: randomUUID(),
    timestamp: new Date().toISOString(),
  };

  await docClient.send(
    new PutCommand({
      TableName: PROGRESS_TABLE,
      Item: {
        pk: `PROGRESS#${event.repoId}#${event.userId}`,
        sk: `EVENT#${fullEvent.timestamp}#${fullEvent.id}`,
        ...fullEvent,
        ttl: Math.floor(Date.now() / 1000) + 90 * 86400, // 90 days
      },
    })
  );

  return fullEvent;
}

/**
 * Get all progress events for a user on a repo.
 */
export async function getProgressEvents(
  repoId: string,
  userId: string,
  limit: number = 200
): Promise<ProgressEvent[]> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: PROGRESS_TABLE,
      KeyConditionExpression: "pk = :pk AND begins_with(sk, :prefix)",
      ExpressionAttributeValues: {
        ":pk": `PROGRESS#${repoId}#${userId}`,
        ":prefix": "EVENT#",
      },
      ScanIndexForward: true,
      Limit: limit,
    })
  );

  return (result.Items || []) as unknown as ProgressEvent[];
}

// --- Score Computation ---

const SCORE_WEIGHTS = {
  walkthrough_viewed: 15,
  qa_asked: 10,
  module_explored: 20,
  convention_viewed: 8,
  env_setup_viewed: 12,
  animated_viewed: 10,
} as const;

/**
 * Compute skill scores from events and architecture.
 */
export function computeSkillScores(
  events: ProgressEvent[],
  archMap: ArchitectureMap | null
): SkillScore[] {
  const areaModules = archMap ? getAreasFromArchitecture(archMap) : new Map<SkillArea, string[]>();
  const allAreas: SkillArea[] = ["architecture", "api", "auth", "database", "frontend", "infrastructure", "testing", "devops"];

  // Track unique interactions per area
  const areaInteractions = new Map<SkillArea, Set<string>>();
  const areaLastActivity = new Map<SkillArea, string>();
  const areaRawScore = new Map<SkillArea, number>();

  for (const area of allAreas) {
    areaInteractions.set(area, new Set());
    areaRawScore.set(area, 0);
  }

  for (const event of events) {
    const area = event.area || classifyArea(event.targetLabel || "");
    const interactions = areaInteractions.get(area) || new Set();
    const key = `${event.eventType}:${event.targetId || event.targetLabel || ""}`;

    if (!interactions.has(key)) {
      interactions.add(key);
      const weight = SCORE_WEIGHTS[event.eventType] || 5;
      areaRawScore.set(area, (areaRawScore.get(area) || 0) + weight);
    }
    areaInteractions.set(area, interactions);

    // Track last activity
    if (!areaLastActivity.has(area) || event.timestamp > areaLastActivity.get(area)!) {
      areaLastActivity.set(area, event.timestamp);
    }
  }

  return allAreas.map((area) => {
    const totalModules = areaModules.get(area)?.length || 1;
    const modulesExplored = areaInteractions.get(area)?.size || 0;
    const rawScore = areaRawScore.get(area) || 0;

    // Score: blend of raw score (capped at 100) and module coverage
    const coverageScore = Math.min((modulesExplored / totalModules) * 100, 100);
    const activityScore = Math.min(rawScore, 100);
    const score = Math.round(coverageScore * 0.4 + activityScore * 0.6);

    return {
      area,
      score: Math.min(score, 100),
      modulesExplored,
      totalModules,
      lastActivity: areaLastActivity.get(area) || "",
    };
  });
}

/**
 * Compute overall developer progress.
 */
export function computeDeveloperProgress(
  userId: string,
  repoId: string,
  events: ProgressEvent[],
  archMap: ArchitectureMap | null
): DeveloperProgress {
  const skills = computeSkillScores(events, archMap);
  const overallScore = skills.length > 0
    ? Math.round(skills.reduce((sum, s) => sum + s.score, 0) / skills.length)
    : 0;

  const totalTimeSpentMs = events.reduce((sum, e) => sum + (e.durationMs || 0), 0);
  const walkthroughsCompleted = new Set(
    events.filter((e) => e.eventType === "walkthrough_viewed").map((e) => e.targetId)
  ).size;
  const questionsAsked = events.filter((e) => e.eventType === "qa_asked").length;
  const modulesExplored = new Set(
    events.filter((e) => e.eventType === "module_explored").map((e) => e.targetId)
  ).size;
  const conventionsViewed = events.filter((e) => e.eventType === "convention_viewed").length;

  const firstActivity = events.length > 0 ? events[0].timestamp : new Date().toISOString();
  const lastActivity = events.length > 0 ? events[events.length - 1].timestamp : new Date().toISOString();

  // Build timeline snapshots (every N events)
  const timeline: ProgressSnapshot[] = [];
  const snapshotInterval = Math.max(1, Math.floor(events.length / 10));
  for (let i = 0; i < events.length; i += snapshotInterval) {
    const sliceEvents = events.slice(0, i + 1);
    const sliceSkills = computeSkillScores(sliceEvents, archMap);
    const sliceScore = sliceSkills.length > 0
      ? Math.round(sliceSkills.reduce((sum, s) => sum + s.score, 0) / sliceSkills.length)
      : 0;
    const latest = sliceEvents[sliceEvents.length - 1];
    timeline.push({
      timestamp: latest.timestamp,
      overallScore: sliceScore,
      eventDescription: `${latest.eventType.replace(/_/g, " ")}${latest.targetLabel ? `: ${latest.targetLabel}` : ""}`,
    });
  }
  // Always include last event
  if (events.length > 0) {
    const finalSkills = computeSkillScores(events, archMap);
    const finalScore = finalSkills.length > 0
      ? Math.round(finalSkills.reduce((sum, s) => sum + s.score, 0) / finalSkills.length)
      : 0;
    const last = events[events.length - 1];
    if (!timeline.some((s) => s.timestamp === last.timestamp)) {
      timeline.push({
        timestamp: last.timestamp,
        overallScore: finalScore,
        eventDescription: `${last.eventType.replace(/_/g, " ")}${last.targetLabel ? `: ${last.targetLabel}` : ""}`,
      });
    }
  }

  return {
    userId,
    repoId,
    overallScore,
    skills,
    totalTimeSpentMs,
    walkthroughsCompleted,
    questionsAsked,
    modulesExplored,
    conventionsViewed,
    firstActivity,
    lastActivity,
    timeline,
  };
}

// --- Team Progress ---

/**
 * Get all user IDs that have progress on a repo.
 */
export async function getRepoUserIds(repoId: string): Promise<string[]> {
  // Query for all PROGRESS# keys for this repo
  const result = await docClient.send(
    new QueryCommand({
      TableName: PROGRESS_TABLE,
      IndexName: "repoId-index",
      KeyConditionExpression: "repoId = :rid",
      ExpressionAttributeValues: { ":rid": repoId },
      ProjectionExpression: "userId",
    })
  );

  const userIds = new Set((result.Items || []).map((item) => item.userId as string));
  return Array.from(userIds);
}

/**
 * Compute team-wide progress.
 */
export async function computeTeamProgress(
  repoId: string,
  archMap: ArchitectureMap | null
): Promise<TeamProgress> {
  const userIds = await getRepoUserIds(repoId);
  const members: DeveloperProgress[] = [];

  for (const userId of userIds) {
    const events = await getProgressEvents(repoId, userId);
    const progress = computeDeveloperProgress(userId, repoId, events, archMap);
    members.push(progress);
  }

  const averageScore = members.length > 0
    ? Math.round(members.reduce((sum, m) => sum + m.overallScore, 0) / members.length)
    : 0;

  const averageTimeToOnboard = members.length > 0
    ? Math.round(members.reduce((sum, m) => sum + m.totalTimeSpentMs, 0) / members.length)
    : 0;

  // Aggregate skill scores to find top and weak areas
  const allAreas: SkillArea[] = ["architecture", "api", "auth", "database", "frontend", "infrastructure", "testing", "devops"];
  const areaAverages = allAreas.map((area) => {
    const scores = members.flatMap((m) => m.skills.filter((s) => s.area === area));
    const avgScore = scores.length > 0
      ? Math.round(scores.reduce((sum, s) => sum + s.score, 0) / scores.length)
      : 0;
    return {
      area,
      score: avgScore,
      modulesExplored: scores.reduce((sum, s) => sum + s.modulesExplored, 0),
      totalModules: scores.length > 0 ? scores[0].totalModules : 0,
      lastActivity: scores.reduce((latest, s) => s.lastActivity > latest ? s.lastActivity : latest, ""),
    } as SkillScore;
  });

  const sorted = [...areaAverages].sort((a, b) => b.score - a.score);
  const topAreas = sorted.slice(0, 3);
  const weakAreas = sorted.slice(-3).reverse();

  return {
    repoId,
    members,
    averageScore,
    averageTimeToOnboard,
    topAreas,
    weakAreas,
  };
}
