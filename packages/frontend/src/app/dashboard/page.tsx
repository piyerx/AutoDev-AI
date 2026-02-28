"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

interface RepoItem {
  repoId: string;
  analysisStatus: "pending" | "analyzing" | "completed" | "failed";
  lastAnalyzedAt?: string;
  fileCount?: number;
  techStack?: Record<string, string | undefined>;
}

function DashboardContent() {
  const searchParams = useSearchParams();
  const isDemo = searchParams.get("demo") === "true";

  const [repos, setRepos] = useState<RepoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRepos = useCallback(async () => {
    try {
      setLoading(true);
      const endpoint = isDemo ? `${API_BASE}/demo/repos` : `${API_BASE}/repos`;
      const res = await fetch(endpoint);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setRepos(Array.isArray(data) ? data : data.repos ?? []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load repos");
    } finally {
      setLoading(false);
    }
  }, [isDemo]);

  useEffect(() => {
    fetchRepos();
    // Poll every 15s so "analyzing" repos update automatically
    const interval = setInterval(fetchRepos, 15_000);
    return () => clearInterval(interval);
  }, [fetchRepos]);

  const statusBadge = (status: RepoItem["analysisStatus"]) => {
    const map: Record<string, string> = {
      completed: "bg-green-900 text-green-300",
      analyzing: "bg-yellow-900 text-yellow-300 animate-pulse",
      failed: "bg-red-900 text-red-300",
      pending: "bg-gray-800 text-gray-400",
    };
    return map[status] ?? map.pending;
  };

  const demoSuffix = isDemo ? "?demo=true" : "";

  return (
    <div className="min-h-screen">
      {/* Demo banner */}
      {isDemo && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-center py-2 text-sm font-medium">
          Demo Mode — Exploring pre-analyzed sample repositories
          <a href="/dashboard" className="ml-3 underline opacity-80 hover:opacity-100">Exit demo</a>
        </div>
      )}

      {/* Sidebar */}
      <nav className={`fixed left-0 ${isDemo ? "top-10" : "top-0"} w-64 h-full bg-gray-900 border-r border-gray-800 p-6`}>
        <a href="/">
          <h2 className="text-xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            AutoDev
          </h2>
        </a>
        <ul className="space-y-2">
          <li>
            <a
              href={`/dashboard${demoSuffix}`}
              className="block px-3 py-2 rounded-lg bg-gray-800 text-white text-sm"
            >
              Repositories
            </a>
          </li>
        </ul>
      </nav>

      {/* Main content */}
      <main className={`ml-64 p-8 ${isDemo ? "pt-18" : ""}`}>
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">
            {isDemo ? "Sample Repositories" : "Connected Repositories"}
          </h1>
          <div className="flex gap-3">
            <button
              onClick={fetchRepos}
              className="px-4 py-2 border border-gray-700 hover:bg-gray-800 rounded-lg text-sm font-medium transition-colors"
            >
              Refresh
            </button>
            {!isDemo && (
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors">
                + Connect Repo
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 border border-red-800 bg-red-950 rounded-lg text-red-300 text-sm">
            Failed to load repositories: {error}
          </div>
        )}

        {loading && repos.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-block w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-400">Loading repositories...</p>
          </div>
        ) : repos.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-gray-700 rounded-xl">
            <p className="text-gray-400 text-lg mb-2">No repositories connected yet</p>
            <p className="text-gray-500 text-sm mb-6">
              Install the AutoDev GitHub App to get started
            </p>
            <div className="flex gap-3 justify-center">
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors">
                Install GitHub App
              </button>
              <a href="/dashboard?demo=true" className="px-4 py-2 border border-purple-600 text-purple-400 hover:bg-purple-950 rounded-lg text-sm font-medium transition-colors">
                Try Demo Mode
              </a>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {repos.map((repo) => (
              <a
                key={repo.repoId}
                href={`/dashboard/${encodeURIComponent(repo.repoId)}${demoSuffix}`}
                className="p-5 border border-gray-800 rounded-xl bg-gray-900/50 hover:border-gray-600 transition-colors group"
              >
                <h3 className="font-medium mb-2 group-hover:text-blue-400 transition-colors">
                  {repo.repoId}
                </h3>
                <div className="flex items-center gap-3 mb-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${statusBadge(repo.analysisStatus)}`}>
                    {repo.analysisStatus}
                  </span>
                  {repo.fileCount && (
                    <span className="text-xs text-gray-500">{repo.fileCount} files</span>
                  )}
                </div>
                {repo.techStack && Object.keys(repo.techStack).length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {Object.entries(repo.techStack)
                      .filter(([, v]) => v)
                      .slice(0, 4)
                      .map(([k, v]) => (
                        <span key={k} className="text-[10px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-400">
                          {v}
                        </span>
                      ))}
                  </div>
                )}
                {repo.lastAnalyzedAt && (
                  <p className="text-[10px] text-gray-600 mt-2">
                    Analyzed {new Date(repo.lastAnalyzedAt).toLocaleDateString()}
                  </p>
                )}
              </a>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" /></div>}>
      <DashboardContent />
    </Suspense>
  );
}
