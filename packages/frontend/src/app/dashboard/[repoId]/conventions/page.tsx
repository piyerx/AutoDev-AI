"use client";

import { useParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { ConventionList } from "@/components/ConventionCard";
import type { Convention } from "@autodev/shared";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export default function ConventionsPage() {
  const params = useParams();
  const repoId = params.repoId as string;
  const decodedRepoId = decodeURIComponent(repoId);
  const [owner, repo] = decodedRepoId.split("/");

  const [conventions, setConventions] = useState<Convention[]>([]);
  const [loading, setLoading] = useState(true);
  const [detecting, setDetecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchConventions = useCallback(async () => {
    if (!owner || !repo) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/conventions/${owner}/${repo}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setConventions(data.conventions || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load conventions");
    } finally {
      setLoading(false);
    }
  }, [owner, repo]);

  useEffect(() => {
    fetchConventions();
  }, [fetchConventions]);

  async function triggerDetection() {
    try {
      setDetecting(true);
      await fetch(`${API_BASE}/conventions/${owner}/${repo}`, { method: "POST" });
      // Poll for results
      setTimeout(fetchConventions, 15_000);
      setTimeout(fetchConventions, 30_000);
    } catch {
      setError("Failed to trigger convention detection");
    } finally {
      setDetecting(false);
    }
  }

  return (
    <div className="min-h-screen">
      {/* Sidebar */}
      <nav className="fixed left-0 top-0 w-64 h-full bg-gray-900 border-r border-gray-800 p-6">
        <a href="/dashboard" className="text-xl font-bold mb-6 block bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
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
            <a href={`/dashboard/${repoId}/conventions`} className="block px-3 py-2 rounded-lg bg-gray-800 text-white text-sm">
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
          <h1 className="text-2xl font-bold">Coding Conventions</h1>
          <button
            onClick={triggerDetection}
            disabled={detecting}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-40 flex items-center gap-2"
          >
            {detecting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Detecting...
              </>
            ) : (
              "Detect Conventions"
            )}
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 border border-red-800 bg-red-950 rounded-lg text-red-300 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="inline-block w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-gray-400">Loading conventions...</p>
            </div>
          </div>
        ) : conventions.length > 0 ? (
          <>
            <p className="text-sm text-gray-400 mb-6">
              {conventions.length} conventions detected in this codebase
            </p>
            <ConventionList conventions={conventions} />
          </>
        ) : (
          <div className="text-center py-16 border border-gray-800 rounded-xl bg-gray-900/50">
            <p className="text-gray-400 text-lg mb-2">No conventions detected yet</p>
            <p className="text-gray-500 text-sm mb-6">
              Run analysis to auto-detect coding conventions, or click &quot;Detect Conventions&quot; above.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
