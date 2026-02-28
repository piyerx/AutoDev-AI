"use client";

import type { SkillScore } from "@autodev/shared";

interface ModuleCompletionGridProps {
  skills: SkillScore[];
  totalWalkthroughs: number;
  walkthroughsCompleted: number;
  totalConventions: number;
  conventionsViewed: number;
  questionsAsked: number;
}

const AREA_LABELS: Record<string, string> = {
  architecture: "Architecture",
  api: "API Layer",
  auth: "Authentication",
  database: "Database",
  frontend: "Frontend",
  infrastructure: "Infrastructure",
  testing: "Testing",
  devops: "DevOps",
  other: "Other",
};

const AREA_ICONS: Record<string, string> = {
  architecture: "🏗️",
  api: "🔌",
  auth: "🔐",
  database: "🗄️",
  frontend: "🎨",
  infrastructure: "☁️",
  testing: "🧪",
  devops: "⚙️",
  other: "📦",
};

function getScoreColor(score: number): string {
  if (score >= 80) return "text-green-400 bg-green-900/30 border-green-800";
  if (score >= 50) return "text-yellow-400 bg-yellow-900/30 border-yellow-800";
  if (score > 0) return "text-orange-400 bg-orange-900/30 border-orange-800";
  return "text-gray-500 bg-gray-900/30 border-gray-800";
}

function getBarColor(score: number): string {
  if (score >= 80) return "bg-green-500";
  if (score >= 50) return "bg-yellow-500";
  if (score > 0) return "bg-orange-500";
  return "bg-gray-700";
}

export default function ModuleCompletionGrid({
  skills,
  totalWalkthroughs,
  walkthroughsCompleted,
  totalConventions,
  conventionsViewed,
  questionsAsked,
}: ModuleCompletionGridProps) {
  const completedModules = skills.filter((s) => s.score >= 80).length;
  const inProgressModules = skills.filter((s) => s.score > 0 && s.score < 80).length;
  const notStartedModules = skills.filter((s) => s.score === 0).length;

  return (
    <div>
      {/* Summary stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <div className="p-3 rounded-lg bg-green-900/20 border border-green-800/50">
          <p className="text-green-400 text-2xl font-bold">{completedModules}</p>
          <p className="text-gray-400 text-xs">Completed</p>
        </div>
        <div className="p-3 rounded-lg bg-yellow-900/20 border border-yellow-800/50">
          <p className="text-yellow-400 text-2xl font-bold">{inProgressModules}</p>
          <p className="text-gray-400 text-xs">In Progress</p>
        </div>
        <div className="p-3 rounded-lg bg-gray-900/20 border border-gray-800/50">
          <p className="text-gray-400 text-2xl font-bold">{notStartedModules}</p>
          <p className="text-gray-400 text-xs">Not Started</p>
        </div>
        <div className="p-3 rounded-lg bg-indigo-900/20 border border-indigo-800/50">
          <p className="text-indigo-400 text-2xl font-bold">{questionsAsked}</p>
          <p className="text-gray-400 text-xs">Q&As Asked</p>
        </div>
      </div>

      {/* Module grid */}
      <div className="grid grid-cols-2 gap-3">
        {skills.map((skill) => (
          <div
            key={skill.area}
            className={`p-4 rounded-lg border ${getScoreColor(skill.score)} transition-all`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">{AREA_ICONS[skill.area] || "📦"}</span>
                <span className="text-sm font-medium text-white">
                  {AREA_LABELS[skill.area] || skill.area}
                </span>
              </div>
              <span className="text-sm font-bold">{skill.score}%</span>
            </div>

            {/* Progress bar */}
            <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden mb-2">
              <div
                className={`h-full rounded-full transition-all duration-500 ${getBarColor(skill.score)}`}
                style={{ width: `${skill.score}%` }}
              />
            </div>

            <div className="flex justify-between text-xs text-gray-500">
              <span>
                {skill.modulesExplored}/{skill.totalModules} modules
              </span>
              {skill.lastActivity && (
                <span>
                  {new Date(skill.lastActivity).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Activity breakdown */}
      <div className="mt-6 grid grid-cols-3 gap-3">
        <div className="p-3 rounded-lg bg-gray-900/50 border border-gray-800">
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-xs">Walkthroughs</span>
            <span className="text-white text-sm font-medium">
              {walkthroughsCompleted}/{totalWalkthroughs}
            </span>
          </div>
          <div className="h-1 bg-gray-800 rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full"
              style={{
                width: `${totalWalkthroughs > 0 ? (walkthroughsCompleted / totalWalkthroughs) * 100 : 0}%`,
              }}
            />
          </div>
        </div>
        <div className="p-3 rounded-lg bg-gray-900/50 border border-gray-800">
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-xs">Conventions</span>
            <span className="text-white text-sm font-medium">
              {conventionsViewed}/{totalConventions}
            </span>
          </div>
          <div className="h-1 bg-gray-800 rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-purple-500 rounded-full"
              style={{
                width: `${totalConventions > 0 ? (conventionsViewed / totalConventions) * 100 : 0}%`,
              }}
            />
          </div>
        </div>
        <div className="p-3 rounded-lg bg-gray-900/50 border border-gray-800">
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-xs">Questions</span>
            <span className="text-white text-sm font-medium">{questionsAsked}</span>
          </div>
          <div className="h-1 bg-gray-800 rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full"
              style={{ width: `${Math.min(questionsAsked * 10, 100)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
