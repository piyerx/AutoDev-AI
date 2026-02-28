"use client";

import { useParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import SkillRadar from "@/components/SkillRadar";
import ProgressTimeline from "@/components/ProgressTimeline";
import ModuleCompletionGrid from "@/components/ModuleCompletionGrid";
import type { DeveloperProgress } from "@autodev/shared";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
const DEFAULT_USER = "anonymous";

export default function ProgressPage() {
  const params = useParams();
  const repoId = params.repoId as string;
  const decodedRepoId = decodeURIComponent(repoId);
  const [owner, repo] = decodedRepoId.split("/");

  const [progress, setProgress] = useState<DeveloperProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProgress = useCallback(async () => {
    if (!owner || !repo) return;
    try {
      setLoading(true);
      const res = await fetch(
        `${API_BASE}/progress/${owner}/${repo}/${DEFAULT_USER}`
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: DeveloperProgress = await res.json();
      setProgress(data);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load progress"
      );
    } finally {
      setLoading(false);
    }
  }, [owner, repo]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchProgress, 30_000);
    return () => clearInterval(interval);
  }, [fetchProgress]);

  return (
    <div className="min-h-screen">
      {/* Sidebar */}
      <nav className="fixed left-0 top-0 w-64 h-full bg-gray-900 border-r border-gray-800 p-6">
        <a
          href="/dashboard"
          className="text-xl font-bold mb-6 block bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent"
        >
          AutoDev
        </a>
        <p className="text-sm text-gray-400 mb-4">{decodedRepoId}</p>
        <ul className="space-y-1">
          <li>
            <a href={`/dashboard/${repoId}`} className="block px-3 py-2 rounded-lg hover:bg-gray-800 text-gray-300 text-sm transition-colors">
              Architecture Map
            </a>
          </li>
          <li>
            <a href={`/dashboard/${repoId}/animated`} className="block px-3 py-2 rounded-lg hover:bg-gray-800 text-gray-300 text-sm transition-colors">
              Animated Map
            </a>
          </li>
          <li>
            <a href={`/dashboard/${repoId}/walkthroughs`} className="block px-3 py-2 rounded-lg hover:bg-gray-800 text-gray-300 text-sm transition-colors">
              Walkthroughs
            </a>
          </li>
          <li>
            <a href={`/dashboard/${repoId}/conventions`} className="block px-3 py-2 rounded-lg hover:bg-gray-800 text-gray-300 text-sm transition-colors">
              Conventions
            </a>
          </li>
          <li>
            <a href={`/dashboard/${repoId}/env-setup`} className="block px-3 py-2 rounded-lg hover:bg-gray-800 text-gray-300 text-sm transition-colors">
              Env Setup
            </a>
          </li>
          <li>
            <a href={`/dashboard/${repoId}/qa`} className="block px-3 py-2 rounded-lg hover:bg-gray-800 text-gray-300 text-sm transition-colors">
              Q&A
            </a>
          </li>
          <li>
            <a href={`/dashboard/${repoId}/progress`} className="block px-3 py-2 rounded-lg bg-gray-800 text-white text-sm">
              My Progress
            </a>
          </li>
          <li>
            <a href={`/dashboard/${repoId}/team`} className="block px-3 py-2 rounded-lg hover:bg-gray-800 text-gray-300 text-sm transition-colors">
              Team
            </a>
          </li>
        </ul>
      </nav>

      {/* Main content */}
      <main className="ml-64 p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">My Learning Progress</h1>
          <button
            onClick={fetchProgress}
            className="px-4 py-2 border border-gray-700 hover:bg-gray-800 rounded-lg text-sm font-medium transition-colors"
          >
            Refresh
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 border border-red-800 bg-red-950 rounded-lg text-red-300 text-sm">
            {error}
          </div>
        )}

        {loading && !progress ? (
          <div className="border border-gray-800 rounded-xl bg-gray-900/50 h-[400px] flex items-center justify-center">
            <div className="text-center">
              <div className="inline-block w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-gray-400">Loading progress...</p>
            </div>
          </div>
        ) : progress ? (
          <div className="space-y-8">
            {/* Top row: Skill Radar + Timeline */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Skill Radar */}
              <div className="border border-gray-800 rounded-xl bg-gray-900/50 p-6">
                <h2 className="text-lg font-semibold mb-4 text-white">
                  Skill Distribution
                </h2>
                <SkillRadar skills={progress.skills} size={320} />
              </div>

              {/* Progress Timeline */}
              <div className="border border-gray-800 rounded-xl bg-gray-900/50 p-6">
                <h2 className="text-lg font-semibold mb-4 text-white">
                  Progress Over Time
                </h2>
                <ProgressTimeline
                  timeline={progress.timeline}
                  firstActivity={progress.firstActivity}
                  lastActivity={progress.lastActivity}
                  currentScore={progress.overallScore}
                />
              </div>
            </div>

            {/* Module Completion Grid */}
            <div className="border border-gray-800 rounded-xl bg-gray-900/50 p-6">
              <h2 className="text-lg font-semibold mb-4 text-white">
                Module Completion
              </h2>
              <ModuleCompletionGrid
                skills={progress.skills}
                totalWalkthroughs={10}
                walkthroughsCompleted={progress.walkthroughsCompleted}
                totalConventions={8}
                conventionsViewed={progress.conventionsViewed}
                questionsAsked={progress.questionsAsked}
              />
            </div>

            {/* Summary stats row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="border border-gray-800 rounded-xl bg-gray-900/50 p-5">
                <p className="text-3xl font-bold text-white">
                  {progress.overallScore}%
                </p>
                <p className="text-gray-400 text-sm mt-1">Overall Score</p>
              </div>
              <div className="border border-gray-800 rounded-xl bg-gray-900/50 p-5">
                <p className="text-3xl font-bold text-white">
                  {progress.modulesExplored}
                </p>
                <p className="text-gray-400 text-sm mt-1">Modules Explored</p>
              </div>
              <div className="border border-gray-800 rounded-xl bg-gray-900/50 p-5">
                <p className="text-3xl font-bold text-white">
                  {progress.walkthroughsCompleted}
                </p>
                <p className="text-gray-400 text-sm mt-1">
                  Walkthroughs Done
                </p>
              </div>
              <div className="border border-gray-800 rounded-xl bg-gray-900/50 p-5">
                <p className="text-3xl font-bold text-white">
                  {progress.questionsAsked}
                </p>
                <p className="text-gray-400 text-sm mt-1">Questions Asked</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="border border-gray-800 rounded-xl bg-gray-900/50 h-[400px] flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-400 text-lg mb-2">
                No progress data yet
              </p>
              <p className="text-gray-500 text-sm">
                Start exploring the codebase to track your learning journey!
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
