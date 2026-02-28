import { Router, type Router as RouterType } from "express";
import {
  recordProgressEvent,
  getProgressEvents,
  computeDeveloperProgress,
  computeTeamProgress,
  classifyArea,
} from "../services/progressTracker.js";
import { getArchitectureAnalysis } from "../services/analysisOrchestrator.js";
import type { ArchitectureMap, SkillArea } from "@autodev/shared";

export const skillTrackerRoutes: RouterType = Router();

// POST /api/progress/:owner/:repo/event — record a progress event
skillTrackerRoutes.post("/:owner/:repo/event", async (req, res) => {
  const repoId = `${req.params.owner}/${req.params.repo}`;
  const { userId, eventType, targetId, targetLabel, area, durationMs } = req.body as {
    userId: string;
    eventType: string;
    targetId?: string;
    targetLabel?: string;
    area?: SkillArea;
    durationMs?: number;
  };

  if (!userId || !eventType) {
    res.status(400).json({ error: "userId and eventType are required" });
    return;
  }

  const validEvents = [
    "walkthrough_viewed",
    "qa_asked",
    "module_explored",
    "convention_viewed",
    "env_setup_viewed",
    "animated_viewed",
  ];
  if (!validEvents.includes(eventType)) {
    res.status(400).json({ error: `eventType must be one of: ${validEvents.join(", ")}` });
    return;
  }

  try {
    const event = await recordProgressEvent({
      userId,
      repoId,
      eventType: eventType as any,
      targetId,
      targetLabel,
      area: area || classifyArea(targetLabel || ""),
      durationMs,
    });
    res.json({ success: true, event });
  } catch (err) {
    console.error("Error recording progress event:", err);
    res.status(500).json({ error: "Failed to record event" });
  }
});

// GET /api/progress/:owner/:repo/:userId — get developer progress
skillTrackerRoutes.get("/:owner/:repo/:userId", async (req, res) => {
  const repoId = `${req.params.owner}/${req.params.repo}`;
  const { userId } = req.params;

  try {
    const [events, architecture] = await Promise.all([
      getProgressEvents(repoId, userId),
      getArchitectureAnalysis(repoId).catch(() => null),
    ]);

    const archMap = architecture as ArchitectureMap | null;
    const progress = computeDeveloperProgress(userId, repoId, events, archMap);
    res.json(progress);
  } catch (err) {
    console.error("Error getting progress:", err);
    res.status(500).json({ error: "Failed to get progress" });
  }
});

// GET /api/progress/:owner/:repo/:userId/events — get raw events
skillTrackerRoutes.get("/:owner/:repo/:userId/events", async (req, res) => {
  const repoId = `${req.params.owner}/${req.params.repo}`;
  const { userId } = req.params;
  const limit = parseInt(req.query.limit as string) || 200;

  try {
    const events = await getProgressEvents(repoId, userId, limit);
    res.json({ repoId, userId, events, count: events.length });
  } catch (err) {
    console.error("Error getting events:", err);
    res.status(500).json({ error: "Failed to get events" });
  }
});

// GET /api/progress/:owner/:repo/team — get team-wide progress
skillTrackerRoutes.get("/:owner/:repo/team", async (req, res) => {
  const repoId = `${req.params.owner}/${req.params.repo}`;

  try {
    const architecture = await getArchitectureAnalysis(repoId).catch(() => null);
    const archMap = architecture as ArchitectureMap | null;
    const teamProgress = await computeTeamProgress(repoId, archMap);
    res.json(teamProgress);
  } catch (err) {
    console.error("Error getting team progress:", err);
    res.status(500).json({ error: "Failed to get team progress" });
  }
});

// GET /api/progress/:owner/:repo/leaderboard — get ranked team members
skillTrackerRoutes.get("/:owner/:repo/leaderboard", async (req, res) => {
  const repoId = `${req.params.owner}/${req.params.repo}`;

  try {
    const architecture = await getArchitectureAnalysis(repoId).catch(() => null);
    const archMap = architecture as ArchitectureMap | null;
    const teamProgress = await computeTeamProgress(repoId, archMap);

    const leaderboard = teamProgress.members
      .sort((a, b) => b.overallScore - a.overallScore)
      .map((m, i) => ({
        rank: i + 1,
        userId: m.userId,
        overallScore: m.overallScore,
        totalTimeSpentMs: m.totalTimeSpentMs,
        walkthroughsCompleted: m.walkthroughsCompleted,
        questionsAsked: m.questionsAsked,
        modulesExplored: m.modulesExplored,
        strongestArea: m.skills.sort((a, b) => b.score - a.score)[0]?.area || "none",
      }));

    res.json({ repoId, leaderboard });
  } catch (err) {
    console.error("Error getting leaderboard:", err);
    res.status(500).json({ error: "Failed to get leaderboard" });
  }
});
