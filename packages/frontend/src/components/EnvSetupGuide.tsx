"use client";

import { useState } from "react";
import type { EnvSetupGuide as EnvSetupGuideType, SetupStep } from "@autodev/shared";

interface EnvSetupGuideProps {
  guide: EnvSetupGuideType;
}

function StepCard({ step, index }: { step: SetupStep; index: number }) {
  const [done, setDone] = useState(false);

  return (
    <div
      className={`border rounded-lg p-4 transition-all ${
        done
          ? "border-green-800 bg-green-950/30"
          : "border-gray-800 bg-gray-900/50 hover:border-gray-700"
      }`}
    >
      <div className="flex items-start gap-3">
        <button
          onClick={() => setDone(!done)}
          className={`mt-0.5 w-5 h-5 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${
            done
              ? "bg-green-600 border-green-600 text-white"
              : "border-gray-600 hover:border-gray-400"
          }`}
        >
          {done && (
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-gray-500">Step {index + 1}</span>
            {step.required && (
              <span className="text-xs px-1.5 py-0.5 rounded bg-red-900 text-red-300">required</span>
            )}
            {step.platform && (
              <span className="text-xs px-1.5 py-0.5 rounded bg-gray-800 text-gray-400">
                {step.platform}
              </span>
            )}
          </div>
          <h4 className={`font-medium text-sm ${done ? "text-gray-500 line-through" : "text-white"}`}>
            {step.title}
          </h4>
          <p className="text-sm text-gray-400 mt-1">{step.description}</p>

          {step.command && (
            <div className="mt-2">
              <pre className="p-2 bg-gray-950 rounded border border-gray-800 text-xs overflow-x-auto">
                <code className="text-green-300">$ {step.command}</code>
              </pre>
            </div>
          )}

          {step.verifyCommand && (
            <div className="mt-2">
              <p className="text-xs text-gray-500 mb-1">Verify:</p>
              <pre className="p-2 bg-gray-950 rounded border border-gray-800 text-xs overflow-x-auto">
                <code className="text-cyan-300">$ {step.verifyCommand}</code>
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function EnvSetupGuideView({ guide }: EnvSetupGuideProps) {
  return (
    <div className="space-y-8">
      {/* Summary */}
      <div className="p-4 border border-gray-800 rounded-lg bg-gray-900/50">
        <p className="text-gray-300 leading-relaxed">{guide.summary}</p>
        <div className="flex items-center gap-4 mt-3">
          <span className="text-xs text-gray-500">
            ⏱ Estimated setup: <strong className="text-gray-300">{guide.estimatedSetupTime}</strong>
          </span>
          {guide.requiredTools && guide.requiredTools.length > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-500">Tools:</span>
              {guide.requiredTools.map((tool, i) => (
                <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-300">
                  {tool}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Conflicts */}
      {guide.conflicts && guide.conflicts.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-yellow-400 uppercase tracking-wide mb-3">
            ⚠ Conflicts ({guide.conflicts.length})
          </h3>
          <div className="space-y-3">
            {guide.conflicts.map((conflict, i) => (
              <div key={i} className="p-3 border border-yellow-800 rounded-lg bg-yellow-950/30">
                <p className="text-sm text-yellow-200 font-medium">{conflict.description}</p>
                <p className="text-sm text-gray-400 mt-1">
                  Resolution: {conflict.resolution}
                </p>
                {conflict.files && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {conflict.files.map((f, j) => (
                      <code key={j} className="text-xs px-1.5 py-0.5 rounded bg-gray-800 text-gray-400">
                        {f}
                      </code>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Missing pieces */}
      {guide.missingPieces && guide.missingPieces.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-red-400 uppercase tracking-wide mb-3">
            Missing Pieces ({guide.missingPieces.length})
          </h3>
          <div className="space-y-3">
            {guide.missingPieces.map((piece, i) => (
              <div key={i} className="p-3 border border-red-800 rounded-lg bg-red-950/30">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm text-red-200 font-medium">{piece.what}</p>
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded ${
                      piece.severity === "critical"
                        ? "bg-red-900 text-red-300"
                        : piece.severity === "important"
                        ? "bg-yellow-900 text-yellow-300"
                        : "bg-gray-800 text-gray-400"
                    }`}
                  >
                    {piece.severity}
                  </span>
                </div>
                <p className="text-sm text-gray-400">{piece.suggestion}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Setup Steps */}
      <div>
        <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-3">
          Setup Steps ({guide.setupSteps.length})
        </h3>
        <div className="space-y-3">
          {guide.setupSteps.map((step, i) => (
            <StepCard key={i} step={step} index={i} />
          ))}
        </div>
      </div>

      {/* Environment Variables */}
      {guide.envVariables && guide.envVariables.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-3">
            Environment Variables ({guide.envVariables.length})
          </h3>
          <div className="border border-gray-800 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-900 text-gray-400">
                  <th className="text-left p-3 font-medium">Variable</th>
                  <th className="text-left p-3 font-medium">Required</th>
                  <th className="text-left p-3 font-medium">Description</th>
                  <th className="text-left p-3 font-medium">Default</th>
                </tr>
              </thead>
              <tbody>
                {guide.envVariables.map((envVar, i) => (
                  <tr key={i} className="border-t border-gray-800">
                    <td className="p-3">
                      <code className="text-blue-300 text-xs">{envVar.name}</code>
                    </td>
                    <td className="p-3">
                      <span
                        className={`text-xs ${envVar.required ? "text-red-400" : "text-gray-500"}`}
                      >
                        {envVar.required ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="p-3 text-gray-300">{envVar.description}</td>
                    <td className="p-3">
                      {envVar.defaultValue ? (
                        <code className="text-xs text-gray-400">{envVar.defaultValue}</code>
                      ) : (
                        <span className="text-xs text-gray-600">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Docker support */}
      {guide.dockerSupport && (
        <div className="p-4 border border-gray-800 rounded-lg bg-gray-900/50">
          <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-2">
            Docker Support
          </h3>
          <div className="flex items-center gap-3">
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                guide.dockerSupport.hasDockerfile
                  ? "bg-green-900 text-green-300"
                  : "bg-gray-800 text-gray-500"
              }`}
            >
              Dockerfile: {guide.dockerSupport.hasDockerfile ? "Yes" : "No"}
            </span>
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                guide.dockerSupport.hasCompose
                  ? "bg-green-900 text-green-300"
                  : "bg-gray-800 text-gray-500"
              }`}
            >
              Docker Compose: {guide.dockerSupport.hasCompose ? "Yes" : "No"}
            </span>
          </div>
          {guide.dockerSupport.services && guide.dockerSupport.services.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {guide.dockerSupport.services.map((svc, i) => (
                <span key={i} className="text-xs px-2 py-0.5 rounded bg-gray-800 text-gray-300">
                  {svc}
                </span>
              ))}
            </div>
          )}
          {guide.dockerSupport.instructions && (
            <p className="text-sm text-gray-400 mt-2">{guide.dockerSupport.instructions}</p>
          )}
        </div>
      )}
    </div>
  );
}
