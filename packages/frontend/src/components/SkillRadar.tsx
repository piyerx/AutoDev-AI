"use client";

import { useMemo } from "react";
import type { SkillScore } from "@autodev/shared";

interface SkillRadarProps {
  skills: SkillScore[];
  size?: number;
}

const AREA_LABELS: Record<string, string> = {
  architecture: "Architecture",
  api: "API",
  auth: "Auth",
  database: "Database",
  frontend: "Frontend",
  infrastructure: "Infra",
  testing: "Testing",
  devops: "DevOps",
  other: "Other",
};

const AREA_COLORS: Record<string, string> = {
  architecture: "#818cf8",
  api: "#34d399",
  auth: "#f472b6",
  database: "#fb923c",
  frontend: "#60a5fa",
  infrastructure: "#a78bfa",
  testing: "#fbbf24",
  devops: "#2dd4bf",
  other: "#94a3b8",
};

export default function SkillRadar({ skills, size = 320 }: SkillRadarProps) {
  const filteredSkills = useMemo(
    () => skills.filter((s) => s.score > 0 || s.totalModules > 0),
    [skills]
  );
  const n = filteredSkills.length || 1;
  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - 50;

  // Compute polygon points
  const points = useMemo(() => {
    return filteredSkills.map((skill, i) => {
      const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
      const r = (skill.score / 100) * radius;
      return {
        x: cx + r * Math.cos(angle),
        y: cy + r * Math.sin(angle),
        labelX: cx + (radius + 24) * Math.cos(angle),
        labelY: cy + (radius + 24) * Math.sin(angle),
        skill,
        angle,
      };
    });
  }, [filteredSkills, n, cx, cy, radius]);

  // Grid rings
  const rings = [20, 40, 60, 80, 100];

  if (filteredSkills.length === 0) {
    return (
      <div className="flex items-center justify-center h-[320px] text-gray-500">
        No skill data yet. Start exploring the codebase!
      </div>
    );
  }

  return (
    <div className="relative">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="mx-auto">
        {/* Grid rings */}
        {rings.map((pct) => {
          const r = (pct / 100) * radius;
          const ringPoints = Array.from({ length: n }, (_, i) => {
            const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
            return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
          }).join(" ");
          return (
            <polygon
              key={pct}
              points={ringPoints}
              fill="none"
              stroke="rgba(148, 163, 184, 0.15)"
              strokeWidth={1}
            />
          );
        })}

        {/* Axis lines */}
        {points.map((p, i) => (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={cx + radius * Math.cos(p.angle)}
            y2={cy + radius * Math.sin(p.angle)}
            stroke="rgba(148, 163, 184, 0.2)"
            strokeWidth={1}
          />
        ))}

        {/* Data polygon */}
        <polygon
          points={points.map((p) => `${p.x},${p.y}`).join(" ")}
          fill="rgba(99, 102, 241, 0.2)"
          stroke="rgb(99, 102, 241)"
          strokeWidth={2}
        />

        {/* Data points */}
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={4}
            fill={AREA_COLORS[p.skill.area] || "#6366f1"}
            stroke="white"
            strokeWidth={1.5}
          />
        ))}

        {/* Labels */}
        {points.map((p, i) => (
          <text
            key={i}
            x={p.labelX}
            y={p.labelY}
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-[10px] fill-gray-400 font-medium"
          >
            {AREA_LABELS[p.skill.area] || p.skill.area}
          </text>
        ))}

        {/* Score labels on each point */}
        {points.map((p, i) => (
          <text
            key={`score-${i}`}
            x={p.x}
            y={p.y - 12}
            textAnchor="middle"
            className="text-[10px] fill-white font-bold"
          >
            {p.skill.score}%
          </text>
        ))}
      </svg>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-2 mt-4 px-4">
        {filteredSkills.map((skill) => (
          <div key={skill.area} className="flex items-center gap-2 text-xs">
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: AREA_COLORS[skill.area] || "#6366f1" }}
            />
            <span className="text-gray-400">{AREA_LABELS[skill.area] || skill.area}</span>
            <span className="text-white font-medium ml-auto">{skill.score}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
