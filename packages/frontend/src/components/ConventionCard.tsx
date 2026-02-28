"use client";

import type { Convention } from "@autodev/shared";

interface ConventionCardProps {
  convention: Convention;
}

const CATEGORY_COLORS: Record<string, string> = {
  naming: "bg-blue-900 text-blue-300",
  structure: "bg-purple-900 text-purple-300",
  patterns: "bg-green-900 text-green-300",
  testing: "bg-yellow-900 text-yellow-300",
  styling: "bg-pink-900 text-pink-300",
  imports: "bg-indigo-900 text-indigo-300",
  errors: "bg-red-900 text-red-300",
  documentation: "bg-cyan-900 text-cyan-300",
};

const SEVERITY_COLORS: Record<string, string> = {
  required: "bg-red-900 text-red-300 border-red-700",
  recommended: "bg-yellow-900 text-yellow-300 border-yellow-700",
  optional: "bg-gray-800 text-gray-400 border-gray-700",
};

export default function ConventionCard({ convention }: ConventionCardProps) {
  const catColor = CATEGORY_COLORS[convention.category] || "bg-gray-800 text-gray-300";
  const sevColor = SEVERITY_COLORS[convention.severity || "recommended"] || SEVERITY_COLORS.recommended;

  return (
    <div className="border border-gray-800 rounded-lg bg-gray-900/50 overflow-hidden hover:border-gray-700 transition-colors">
      {/* Header */}
      <div className="p-4 pb-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${catColor}`}>
              {convention.category}
            </span>
            {convention.severity && (
              <span className={`text-xs px-2 py-0.5 rounded border ${sevColor}`}>
                {convention.severity}
              </span>
            )}
          </div>
          {convention.confidence !== undefined && (
            <span className="text-xs text-gray-500">
              {Math.round(convention.confidence * 100)}% confidence
            </span>
          )}
        </div>

        <code className="text-sm text-blue-300 font-medium">{convention.pattern}</code>
        <p className="text-sm text-gray-300 mt-2 leading-relaxed">{convention.description}</p>
      </div>

      {/* Examples */}
      {(convention.examples?.length || convention.doExample || convention.dontExample) && (
        <div className="border-t border-gray-800 p-4 pt-3 space-y-3">
          {/* Do / Don't examples */}
          {convention.doExample && (
            <div>
              <p className="text-xs text-green-400 font-medium mb-1">✓ Do</p>
              <pre className="p-2 bg-gray-950 rounded border border-gray-800 text-xs overflow-x-auto">
                <code className="text-green-200">{convention.doExample}</code>
              </pre>
            </div>
          )}
          {convention.dontExample && (
            <div>
              <p className="text-xs text-red-400 font-medium mb-1">✗ Don&apos;t</p>
              <pre className="p-2 bg-gray-950 rounded border border-gray-800 text-xs overflow-x-auto">
                <code className="text-red-200">{convention.dontExample}</code>
              </pre>
            </div>
          )}

          {/* General examples */}
          {convention.examples && convention.examples.length > 0 && !convention.doExample && (
            <div>
              <p className="text-xs text-gray-500 font-medium mb-1">Examples</p>
              <ul className="space-y-1">
                {convention.examples.map((ex, i) => (
                  <li key={i} className="text-xs text-gray-400 flex items-start gap-1.5">
                    <span className="text-gray-600 mt-0.5">•</span>
                    <code className="bg-gray-800 px-1 rounded">{ex}</code>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface ConventionListProps {
  conventions: Convention[];
}

export function ConventionList({ conventions }: ConventionListProps) {
  // Group by category
  const grouped: Record<string, Convention[]> = {};
  for (const c of conventions) {
    (grouped[c.category] ??= []).push(c);
  }

  return (
    <div className="space-y-8">
      {Object.entries(grouped).map(([category, items]) => (
        <div key={category}>
          <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-3">
            {category} ({items.length})
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            {items.map((conv, i) => (
              <ConventionCard key={i} convention={conv} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
