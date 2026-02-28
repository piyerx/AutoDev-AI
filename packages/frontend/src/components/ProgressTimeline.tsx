"use client";

import type { ProgressSnapshot } from "@autodev/shared";

interface ProgressTimelineProps {
  timeline: ProgressSnapshot[];
  firstActivity: string;
  lastActivity: string;
  currentScore: number;
}

function formatDuration(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const hours = Math.floor(minutes / 60);
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  return `${minutes}m`;
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

export default function ProgressTimeline({
  timeline,
  firstActivity,
  lastActivity,
  currentScore,
}: ProgressTimelineProps) {
  const totalTimeMs = new Date(lastActivity).getTime() - new Date(firstActivity).getTime();

  if (timeline.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-500">
        No activity recorded yet. Start exploring!
      </div>
    );
  }

  // Score range for chart
  const maxScore = Math.max(...timeline.map((s) => s.overallScore), currentScore, 10);

  return (
    <div>
      {/* Header stats */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-white">{currentScore}%</span>
          <span className="text-gray-400 text-sm">understanding</span>
        </div>
        <div className="text-right text-sm text-gray-400">
          <div>{formatDuration(totalTimeMs)} total</div>
          <div className="text-xs text-gray-500">
            {formatDate(firstActivity)} — {formatDate(lastActivity)}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative h-3 bg-gray-800 rounded-full overflow-hidden mb-6">
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-all duration-1000"
          style={{
            width: `${currentScore}%`,
            background: `linear-gradient(90deg, #6366f1 0%, ${currentScore > 70 ? "#22c55e" : currentScore > 40 ? "#eab308" : "#6366f1"} 100%)`,
          }}
        />
      </div>

      {/* SVG Chart */}
      <div className="relative">
        <svg
          viewBox="0 0 600 160"
          className="w-full h-40"
          preserveAspectRatio="none"
        >
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((pct) => (
            <line
              key={pct}
              x1={0}
              y1={160 - (pct / maxScore) * 140 - 10}
              x2={600}
              y2={160 - (pct / maxScore) * 140 - 10}
              stroke="rgba(148, 163, 184, 0.1)"
              strokeDasharray="4 4"
            />
          ))}

          {/* Area fill */}
          <path
            d={`M ${timeline
              .map((s, i) => {
                const x = (i / Math.max(timeline.length - 1, 1)) * 580 + 10;
                const y = 160 - (s.overallScore / maxScore) * 140 - 10;
                return `${x},${y}`;
              })
              .join(" L ")} L ${580 + 10},${160 - 10} L 10,${160 - 10} Z`}
            fill="url(#progressGradient)"
            opacity={0.3}
          />

          {/* Line */}
          <polyline
            points={timeline
              .map((s, i) => {
                const x = (i / Math.max(timeline.length - 1, 1)) * 580 + 10;
                const y = 160 - (s.overallScore / maxScore) * 140 - 10;
                return `${x},${y}`;
              })
              .join(" ")}
            fill="none"
            stroke="#6366f1"
            strokeWidth={2.5}
            strokeLinejoin="round"
          />

          {/* Points */}
          {timeline.map((s, i) => {
            const x = (i / Math.max(timeline.length - 1, 1)) * 580 + 10;
            const y = 160 - (s.overallScore / maxScore) * 140 - 10;
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r={3}
                fill="#6366f1"
                stroke="white"
                strokeWidth={1.5}
              >
                <title>
                  {s.overallScore}% — {s.eventDescription}
                </title>
              </circle>
            );
          })}

          {/* Gradient definition */}
          <defs>
            <linearGradient id="progressGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Timeline events */}
      <div className="mt-4 space-y-2 max-h-48 overflow-y-auto">
        {timeline
          .slice()
          .reverse()
          .map((snapshot, i) => (
          <div
            key={i}
            className="flex items-center gap-3 text-xs"
          >
            <span className="text-gray-500 w-12 flex-shrink-0">
              {formatTime(snapshot.timestamp)}
            </span>
            <div className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0" />
            <span className="text-gray-300 flex-1 truncate">
              {snapshot.eventDescription}
            </span>
            <span className="text-indigo-400 font-medium flex-shrink-0">
              {snapshot.overallScore}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
