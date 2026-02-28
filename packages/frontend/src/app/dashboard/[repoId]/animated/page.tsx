"use client";

import { useParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import AnimatedArchitectureMap from "@/components/AnimatedArchitectureMap";
import LanguageSelector from "@/components/LanguageSelector";
import type {
  ArchitectureMap as ArchMapType,
  AnimationSequence,
  SupportedLanguage,
} from "@autodev/shared";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export default function AnimatedPage() {
  const params = useParams();
  const repoId = params.repoId as string;
  const decodedRepoId = decodeURIComponent(repoId);
  const [owner, repo] = decodedRepoId.split("/");

  const [archMap, setArchMap] = useState<ArchMapType | null>(null);
  const [sequences, setSequences] = useState<AnimationSequence[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [language, setLanguage] = useState<SupportedLanguage>("en");
  const [fresherMode, setFresherMode] = useState(false);

  // Node explanation state
  const [explaining, setExplaining] = useState(false);
  const [explanation, setExplanation] = useState<{ nodeId: string; text: string } | null>(null);

  // Fetch architecture
  const fetchArch = useCallback(async () => {
    if (!owner || !repo) return;
    try {
      const res = await fetch(`${API_BASE}/analysis/${owner}/${repo}/architecture`);
      if (!res.ok) return;
      const data = await res.json();
      setArchMap(data.content ?? data);
    } catch {
      // ignore
    }
  }, [owner, repo]);

  // Fetch animation sequences
  const fetchSequences = useCallback(async () => {
    if (!owner || !repo) return;
    try {
      const res = await fetch(`${API_BASE}/animated/${owner}/${repo}`);
      if (!res.ok) return;
      const data = await res.json();
      setSequences(data.sequences || []);
    } catch {
      // ignore
    }
  }, [owner, repo]);

  useEffect(() => {
    async function init() {
      setLoading(true);
      await Promise.all([fetchArch(), fetchSequences()]);
      setLoading(false);
    }
    init();
  }, [fetchArch, fetchSequences]);

  async function generateSequences() {
    try {
      setGenerating(true);
      setError(null);
      const res = await fetch(`${API_BASE}/animated/${owner}/${repo}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fresherMode }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setSequences(data.sequences || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate animated sequences");
    } finally {
      setGenerating(false);
    }
  }

  async function handleNodeClick(nodeId: string) {
    try {
      setExplaining(true);
      setExplanation(null);
      const res = await fetch(`${API_BASE}/animated/${owner}/${repo}/explain-node`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nodeId, fresherMode }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      let text = data.explanation || "No explanation available.";

      // Translate if non-English
      if (language !== "en") {
        try {
          const tRes = await fetch(`${API_BASE}/i18n/translate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text, targetLanguage: language, repoId: decodedRepoId, fresherMode }),
          });
          if (tRes.ok) {
            const tData = await tRes.json();
            text = tData.translatedText || text;
          }
        } catch {
          // keep English text on failure
        }
      }

      setExplanation({ nodeId, text });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to explain node");
    } finally {
      setExplaining(false);
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
            <a href={`/dashboard/${repoId}/animated`} className="block px-3 py-2 rounded-lg bg-gray-800 text-white text-sm">
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
          <h1 className="text-2xl font-bold">Animated Architecture</h1>
          <div className="flex items-center gap-4">
            <LanguageSelector
              value={language}
              onChange={setLanguage}
              fresherMode={fresherMode}
              onFresherToggle={setFresherMode}
            />
            {sequences.length === 0 && !generating && archMap && (
              <button
                onClick={generateSequences}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors"
              >
                Generate Animations
              </button>
            )}
            {sequences.length > 0 && (
              <button
                onClick={generateSequences}
                disabled={generating}
                className="px-4 py-2 border border-gray-700 hover:bg-gray-800 rounded-lg text-sm font-medium transition-colors disabled:opacity-40"
              >
                {generating ? "Regenerating..." : "Regenerate"}
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 border border-red-800 bg-red-950 rounded-lg text-red-300 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="border border-gray-800 rounded-xl bg-gray-900/50 h-[600px] flex items-center justify-center">
            <div className="text-center">
              <div className="inline-block w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-gray-400">Loading architecture &amp; animations...</p>
            </div>
          </div>
        ) : generating ? (
          <div className="border border-gray-800 rounded-xl bg-gray-900/50 h-[600px] flex items-center justify-center">
            <div className="text-center">
              <div className="inline-block w-6 h-6 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-gray-400 text-lg mb-2">Generating animation sequences...</p>
              <p className="text-gray-500 text-sm">
                AI is creating step-by-step visual walkthroughs
              </p>
            </div>
          </div>
        ) : archMap && sequences.length > 0 ? (
          <div className="border border-gray-800 rounded-xl bg-gray-900/50 overflow-hidden">
            <AnimatedArchitectureMap
              data={archMap}
              sequences={sequences}
              fresherMode={fresherMode}
              onNodeClick={handleNodeClick}
            />
          </div>
        ) : archMap ? (
          <div className="border border-gray-800 rounded-xl bg-gray-900/50 h-[600px] flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-400 text-lg mb-2">No animation sequences yet</p>
              <p className="text-gray-500 text-sm mb-6">
                Generate AI-powered animated walkthroughs of your architecture
              </p>
              <button
                onClick={generateSequences}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors"
              >
                Generate Animations
              </button>
            </div>
          </div>
        ) : (
          <div className="border border-gray-800 rounded-xl bg-gray-900/50 h-[600px] flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-400 text-lg mb-2">
                Architecture map required
              </p>
              <p className="text-gray-500 text-sm mb-4">
                Run an analysis first from the Architecture Map page.
              </p>
              <a
                href={`/dashboard/${repoId}`}
                className="text-blue-400 hover:text-blue-300 text-sm underline"
              >
                Go to Architecture Map
              </a>
            </div>
          </div>
        )}

        {/* Node explanation panel */}
        {(explaining || explanation) && (
          <div className="mt-6 p-5 border border-gray-800 rounded-xl bg-gray-900/50">
            <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-3">
              Node Explanation
            </h2>
            {explaining ? (
              <div className="flex items-center gap-3 text-gray-400">
                <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                Generating explanation...
              </div>
            ) : explanation ? (
              <div>
                <p className="text-xs text-gray-500 mb-2">
                  Node: <span className="text-gray-300">{explanation.nodeId}</span>
                </p>
                <p className="text-sm text-gray-200 whitespace-pre-line leading-relaxed">
                  {explanation.text}
                </p>
              </div>
            ) : null}
          </div>
        )}

        {/* Sequence info cards */}
        {sequences.length > 0 && (
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sequences.map((seq, idx) => (
              <div
                key={seq.id || idx}
                className="p-4 border border-gray-800 rounded-lg bg-gray-900/50"
              >
                <h3 className="font-semibold text-sm mb-1">{seq.title}</h3>
                <p className="text-xs text-gray-400 mb-2 line-clamp-2">
                  {seq.description}
                </p>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span>{seq.steps?.length || 0} steps</span>
                  {seq.category && (
                    <span className="px-2 py-0.5 rounded-full bg-gray-800 text-gray-400">
                      {seq.category}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
