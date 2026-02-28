"use client";

import { useState } from "react";

interface RepoItem {
  repoId: string;
  status: "pending" | "analyzing" | "completed" | "failed";
  lastAnalyzedAt?: string;
}

export default function DashboardPage() {
  const [repos] = useState<RepoItem[]>([]);

  return (
    <div className="min-h-screen">
      {/* Sidebar */}
      <nav className="fixed left-0 top-0 w-64 h-full bg-gray-900 border-r border-gray-800 p-6">
        <h2 className="text-xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          AutoDev
        </h2>
        <ul className="space-y-2">
          <li>
            <a
              href="/dashboard"
              className="block px-3 py-2 rounded-lg bg-gray-800 text-white text-sm"
            >
              Repositories
            </a>
          </li>
        </ul>
      </nav>

      {/* Main content */}
      <main className="ml-64 p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Connected Repositories</h1>
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors">
            + Connect Repo
          </button>
        </div>

        {repos.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-gray-700 rounded-xl">
            <p className="text-gray-400 text-lg mb-2">No repositories connected yet</p>
            <p className="text-gray-500 text-sm mb-6">
              Install the AutoDev GitHub App to get started
            </p>
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors">
              Install GitHub App
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {repos.map((repo) => (
              <a
                key={repo.repoId}
                href={`/dashboard/${repo.repoId}`}
                className="p-5 border border-gray-800 rounded-xl bg-gray-900/50 hover:border-gray-600 transition-colors"
              >
                <h3 className="font-medium mb-2">{repo.repoId}</h3>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    repo.status === "completed"
                      ? "bg-green-900 text-green-300"
                      : repo.status === "analyzing"
                        ? "bg-yellow-900 text-yellow-300"
                        : "bg-gray-800 text-gray-400"
                  }`}
                >
                  {repo.status}
                </span>
              </a>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
