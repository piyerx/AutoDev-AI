"use client";

import { useParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import ArchitectureMap from "@/components/ArchitectureMap";
import { getApiBase } from "@/lib/api";
import type { ArchitectureMap as ArchMapType } from "@autodev/shared";

type AnalysisStatus = "pending" | "analyzing" | "completed" | "failed";

export default function RepoDetailPage() {
  const params = useParams();
  const repoId = params.repoId as string;
  const decodedRepoId = decodeURIComponent(repoId);
  const [owner, repo] = decodedRepoId.split("/");

  const [archMap, setArchMap] = useState<ArchMapType | null>(null);
  const [status, setStatus] = useState<AnalysisStatus>("pending");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchArchitecture = useCallback(async () => {
    if (!owner || !repo) return;
    try {
      setLoading(true);
      const res = await fetch(`${getApiBase(decodedRepoId)}/analysis/${owner}/${repo}/architecture`);
      if (res.status === 404) {
        setStatus("pending");
        setArchMap(null);
        setError(null);
        return;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      if (data.content) {
        setArchMap(data.content as ArchMapType);
        setStatus("completed");
      } else if (data.nodes) {
        setArchMap(data as ArchMapType);
        setStatus("completed");
      } else {
        setStatus("analyzing");
      }
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load architecture");
    } finally {
      setLoading(false);
    }
  }, [owner, repo]);

  useEffect(() => {
    fetchArchitecture();
  }, [fetchArchitecture]);

  // Poll while analyzing
  useEffect(() => {
    if (status !== "analyzing") return;
    const interval = setInterval(fetchArchitecture, 10_000);
    return () => clearInterval(interval);
  }, [status, fetchArchitecture]);

  async function triggerAnalysis() {
    try {
      setStatus("analyzing");
      await fetch(`${getApiBase(decodedRepoId)}/repos/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoId: decodedRepoId }),
      });
      // Start polling
      setTimeout(fetchArchitecture, 5000);
    } catch {
      setError("Failed to trigger analysis");
    }
  }

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
            <a href={`/dashboard/${repoId}`} className="block px-3 py-2 rounded-lg bg-gray-800 text-white text-sm">
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
            <a href={`/dashboard/${repoId}/progress`} className="block px-3 py-2 rounded-lg hover:bg-gray-800 text-gray-300 text-sm transition-colors">
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
          <h1 className="text-2xl font-bold">Architecture Map</h1>
          <div className="flex gap-3 items-center">
            <span className={`text-xs px-2.5 py-1 rounded-full ${
              status === "completed" ? "bg-green-900 text-green-300" :
              status === "analyzing" ? "bg-yellow-900 text-yellow-300 animate-pulse" :
              status === "failed" ? "bg-red-900 text-red-300" :
              "bg-gray-800 text-gray-400"
            }`}>
              {status}
            </span>
            {(status === "pending" || status === "failed") && (
              <button
                onClick={triggerAnalysis}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors"
              >
                {status === "failed" ? "Retry Analysis" : "Run Analysis"}
              </button>
            )}
            {status === "completed" && (
              <button
                onClick={triggerAnalysis}
                className="px-4 py-2 border border-gray-700 hover:bg-gray-800 rounded-lg text-sm font-medium transition-colors"
              >
                Re-analyze
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 border border-red-800 bg-red-950 rounded-lg text-red-300 text-sm">
            {error}
          </div>
        )}

        {/* Architecture Map */}
        {loading && !archMap ? (
          <div className="border border-gray-800 rounded-xl bg-gray-900/50 h-[500px] flex items-center justify-center">
            <div className="text-center">
              <div className="inline-block w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-gray-400">Loading architecture...</p>
            </div>
          </div>
        ) : archMap ? (
          <div className="border border-gray-800 rounded-xl bg-gray-900/50 overflow-hidden">
            <ArchitectureMap data={archMap} />
          </div>
        ) : status === "analyzing" ? (
          <div className="border border-gray-800 rounded-xl bg-gray-900/50 h-[500px] flex items-center justify-center">
            <div className="text-center">
              <div className="inline-block w-6 h-6 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-gray-400 text-lg mb-2">Analysis in progress...</p>
              <p className="text-gray-500 text-sm">This may take a few minutes for large repositories</p>
            </div>
          </div>
        ) : (
          <div className="border border-gray-800 rounded-xl bg-gray-900/50 h-[500px] flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-400 text-lg mb-2">No architecture analysis yet</p>
              <p className="text-gray-500 text-sm mb-6">
                Run analysis to generate the architecture map
              </p>
              <button
                onClick={triggerAnalysis}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors"
              >
                Run Analysis
              </button>
            </div>
          </div>
        )}

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="p-4 border border-gray-800 rounded-lg bg-gray-900/50">
            <p className="text-gray-400 text-sm">Status</p>
            <p className="text-lg font-medium capitalize">{status}</p>
          </div>
          <div className="p-4 border border-gray-800 rounded-lg bg-gray-900/50">
            <p className="text-gray-400 text-sm">Modules Detected</p>
            <p className="text-lg font-medium">{archMap ? archMap.nodes.length : "—"}</p>
          </div>
          <div className="p-4 border border-gray-800 rounded-lg bg-gray-900/50">
            <p className="text-gray-400 text-sm">Dependencies</p>
            <p className="text-lg font-medium">{archMap ? archMap.edges.length : "—"}</p>
          </div>
        </div>

        {/* Tech Stack */}
        {archMap?.techStack && Object.keys(archMap.techStack).length > 0 && (
          <div className="mt-6 p-4 border border-gray-800 rounded-lg bg-gray-900/50">
            <p className="text-gray-400 text-sm mb-3">Tech Stack</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(archMap.techStack).map(([key, value]) => (
                <span key={key} className="text-xs px-2.5 py-1 rounded-full bg-gray-800 text-gray-300">
                  <span className="text-gray-500">{key}:</span> {value}
                </span>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
