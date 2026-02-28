"use client";

import { useParams } from "next/navigation";

export default function RepoDetailPage() {
  const params = useParams();
  const repoId = params.repoId as string;

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
        <p className="text-sm text-gray-400 mb-4">{decodeURIComponent(repoId)}</p>
        <ul className="space-y-1">
          <li>
            <a href={`/dashboard/${repoId}`} className="block px-3 py-2 rounded-lg bg-gray-800 text-white text-sm">
              Architecture Map
            </a>
          </li>
          <li>
            <a href={`/dashboard/${repoId}/walkthroughs`} className="block px-3 py-2 rounded-lg hover:bg-gray-800 text-gray-300 text-sm transition-colors">
              Walkthroughs
            </a>
          </li>
          <li>
            <a href={`/dashboard/${repoId}/qa`} className="block px-3 py-2 rounded-lg hover:bg-gray-800 text-gray-300 text-sm transition-colors">
              Q&A
            </a>
          </li>
        </ul>
      </nav>

      {/* Main content */}
      <main className="ml-64 p-8">
        <h1 className="text-2xl font-bold mb-6">Architecture Map</h1>

        {/* Placeholder for React Flow architecture map */}
        <div className="border border-gray-800 rounded-xl bg-gray-900/50 h-[500px] flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-400 text-lg mb-2">Architecture Map</p>
            <p className="text-gray-500 text-sm">
              React Flow visualization will render here after analysis
            </p>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="p-4 border border-gray-800 rounded-lg bg-gray-900/50">
            <p className="text-gray-400 text-sm">Status</p>
            <p className="text-lg font-medium">Pending</p>
          </div>
          <div className="p-4 border border-gray-800 rounded-lg bg-gray-900/50">
            <p className="text-gray-400 text-sm">Files Analyzed</p>
            <p className="text-lg font-medium">—</p>
          </div>
          <div className="p-4 border border-gray-800 rounded-lg bg-gray-900/50">
            <p className="text-gray-400 text-sm">Modules Detected</p>
            <p className="text-lg font-medium">—</p>
          </div>
        </div>
      </main>
    </div>
  );
}
