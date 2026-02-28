"use client";

import { useParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import WalkthroughViewer from "@/components/WalkthroughViewer";
import type { Walkthrough } from "@autodev/shared";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export default function WalkthroughsPage() {
  const params = useParams();
  const repoId = params.repoId as string;
  const decodedRepoId = decodeURIComponent(repoId);
  const [owner, repo] = decodedRepoId.split("/");

  const [walkthroughs, setWalkthroughs] = useState<Walkthrough[]>([]);
  const [selected, setSelected] = useState<Walkthrough | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [question, setQuestion] = useState("");
  const [error, setError] = useState<string | null>(null);

  const fetchWalkthroughs = useCallback(async () => {
    if (!owner || !repo) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/walkthroughs/${owner}/${repo}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setWalkthroughs(data.walkthroughs || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load walkthroughs");
    } finally {
      setLoading(false);
    }
  }, [owner, repo]);

  useEffect(() => {
    fetchWalkthroughs();
  }, [fetchWalkthroughs]);

  async function generateWalkthrough() {
    if (!question.trim()) return;
    try {
      setGenerating(true);
      const res = await fetch(`${API_BASE}/walkthroughs/${owner}/${repo}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: question.trim() }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.walkthrough) {
        setSelected(data.walkthrough);
        setWalkthroughs((prev) => [...prev, data.walkthrough]);
      }
      setQuestion("");
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate walkthrough");
    } finally {
      setGenerating(false);
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
            <a href={`/dashboard/${repoId}/walkthroughs`} className="block px-3 py-2 rounded-lg bg-gray-800 text-white text-sm">
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
        {selected ? (
          <WalkthroughViewer
            walkthrough={selected}
            onBack={() => setSelected(null)}
          />
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold">Walkthroughs</h1>
            </div>

            {/* Generate custom walkthrough */}
            <div className="mb-8 p-5 border border-gray-800 rounded-xl bg-gray-900/50">
              <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-3">
                Ask a question to generate a walkthrough
              </h2>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && generateWalkthrough()}
                  placeholder="e.g., How does the authentication flow work?"
                  className="flex-1 px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={generateWalkthrough}
                  disabled={!question.trim() || generating}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {generating ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Generating...
                    </>
                  ) : (
                    "Generate"
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-4 border border-red-800 bg-red-950 rounded-lg text-red-300 text-sm">
                {error}
              </div>
            )}

            {/* Walkthrough list */}
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="inline-block w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mb-4" />
                  <p className="text-gray-400">Loading walkthroughs...</p>
                </div>
              </div>
            ) : walkthroughs.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {walkthroughs.map((w, i) => (
                  <button
                    key={w.id || i}
                    onClick={() => setSelected(w)}
                    className="text-left p-5 border border-gray-800 rounded-xl bg-gray-900/50 hover:border-gray-700 hover:bg-gray-900 transition-all group"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold group-hover:text-blue-400 transition-colors">
                        {w.title || `Walkthrough ${i + 1}`}
                      </h3>
                      {w.difficulty && (
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            w.difficulty === "beginner"
                              ? "bg-green-900 text-green-300"
                              : w.difficulty === "intermediate"
                              ? "bg-yellow-900 text-yellow-300"
                              : "bg-red-900 text-red-300"
                          }`}
                        >
                          {w.difficulty}
                        </span>
                      )}
                    </div>
                    {w.description && (
                      <p className="text-sm text-gray-400 mb-3 line-clamp-2">{w.description}</p>
                    )}
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span>{w.steps?.length || 0} steps</span>
                      {w.estimatedMinutes && <span>~{w.estimatedMinutes} min</span>}
                      {w.question && <span className="truncate">Q: {w.question}</span>}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 border border-gray-800 rounded-xl bg-gray-900/50">
                <p className="text-gray-400 text-lg mb-2">No walkthroughs yet</p>
                <p className="text-gray-500 text-sm">
                  Ask a question above to generate your first walkthrough, or run analysis to auto-generate them.
                </p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
