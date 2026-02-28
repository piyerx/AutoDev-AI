"use client";

import { useParams } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { getApiBase } from "@/lib/api";

interface RelevantFile {
  path: string;
  lineRange?: { start: number; end: number };
}

interface Message {
  role: "user" | "assistant";
  content: string;
  relevantFiles?: RelevantFile[];
  relatedQuestions?: string[];
}

export default function QAPage() {
  const params = useParams();
  const repoId = params.repoId as string;
  const decodedRepoId = decodeURIComponent(repoId);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const question = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: question }]);
    setLoading(true);

    try {
      const res = await fetch(`${getApiBase(decodedRepoId)}/qa/${decodedRepoId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.answer ?? data.error ?? "No response",
          relevantFiles: data.relevantFiles,
          relatedQuestions: data.relatedQuestions,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Failed to get a response. Is the backend running?" },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function askFollowUp(question: string) {
    setInput(question);
  }

  return (
    <div className="min-h-screen">
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
            <a href={`/dashboard/${repoId}/qa`} className="block px-3 py-2 rounded-lg bg-gray-800 text-white text-sm">
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

      <main className="ml-64 p-8 flex flex-col h-screen">
        <h1 className="text-2xl font-bold mb-6">Ask About This Codebase</h1>

        <div className="flex-1 overflow-y-auto mb-4 space-y-3">
          {messages.length === 0 && (
            <div className="text-center py-20">
              <p className="text-gray-400 text-lg mb-2">Ask anything about this codebase</p>
              <p className="text-gray-500 text-sm mb-6">
                Try: &quot;How is the project structured?&quot; or &quot;Where is the auth logic?&quot;
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {[
                  "How is the project structured?",
                  "What are the main entry points?",
                  "What patterns does this codebase use?",
                ].map((q) => (
                  <button
                    key={q}
                    onClick={() => askFollowUp(q)}
                    className="text-xs px-3 py-1.5 border border-gray-700 rounded-full hover:bg-gray-800 text-gray-400 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map((msg, i) => (
            <div key={i}>
              <div
                className={`p-4 rounded-xl max-w-2xl ${
                  msg.role === "user"
                    ? "bg-blue-600/20 border border-blue-800 ml-auto"
                    : "bg-gray-900 border border-gray-800"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              </div>
              {/* Relevant files */}
              {msg.relevantFiles && msg.relevantFiles.length > 0 && (
                <div className="mt-2 max-w-2xl">
                  <p className="text-[10px] uppercase text-gray-500 mb-1">Relevant Files</p>
                  <div className="flex flex-wrap gap-1.5">
                    {msg.relevantFiles.map((f, j) => (
                      <span key={j} className="text-xs px-2 py-0.5 rounded bg-gray-800 text-gray-400 font-mono">
                        {f.path}{f.lineRange ? `:${f.lineRange.start}-${f.lineRange.end}` : ""}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {/* Related questions */}
              {msg.relatedQuestions && msg.relatedQuestions.length > 0 && (
                <div className="mt-2 max-w-2xl flex flex-wrap gap-1.5">
                  {msg.relatedQuestions.map((q, j) => (
                    <button
                      key={j}
                      onClick={() => askFollowUp(q)}
                      className="text-xs px-2.5 py-1 border border-gray-700 rounded-full hover:bg-gray-800 text-gray-400 transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="p-4 rounded-xl bg-gray-900 border border-gray-800 max-w-2xl">
              <p className="text-sm text-gray-400 animate-pulse">Thinking...</p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about this codebase..."
            className="flex-1 px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg text-sm font-medium transition-colors"
          >
            Ask
          </button>
        </form>
      </main>
    </div>
  );
}
