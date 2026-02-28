"use client";

import { useCallback, useMemo, useState, useEffect, useRef } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type NodeTypes,
  Handle,
  Position,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { ArchitectureMap as ArchMap, AnimationSequence, AnimationStep } from "@autodev/shared";

/* ------------------------------------------------------------------ */
/*  Colours                                                           */
/* ------------------------------------------------------------------ */

const NODE_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  entry:    { bg: "#fef3c7", border: "#f59e0b", text: "#92400e" },
  module:   { bg: "#dbeafe", border: "#3b82f6", text: "#1e40af" },
  service:  { bg: "#d1fae5", border: "#10b981", text: "#065f46" },
  config:   { bg: "#f3e8ff", border: "#8b5cf6", text: "#5b21b6" },
  util:     { bg: "#e0e7ff", border: "#6366f1", text: "#3730a3" },
  database: { bg: "#fce7f3", border: "#ec4899", text: "#9d174d" },
  external: { bg: "#fee2e2", border: "#ef4444", text: "#991b1b" },
};

const HIGHLIGHT_RING = "0 0 0 3px #facc15, 0 0 16px 4px rgba(250,204,21,0.45)";
const DIM_OPACITY = 0.3;

/* ------------------------------------------------------------------ */
/*  Node component                                                    */
/* ------------------------------------------------------------------ */

interface ArchNodeData {
  label: string;
  type: string;
  files: string[];
  description: string;
  isActive?: boolean;
  isDimmed?: boolean;
  [key: string]: unknown;
}

function AnimatedArchNode({ data }: { data: ArchNodeData }) {
  const colors = NODE_COLORS[data.type] || NODE_COLORS.module;

  return (
    <div
      className="rounded-lg shadow-md border-2 px-4 py-3 min-w-[180px] max-w-[280px] transition-all duration-500"
      style={{
        backgroundColor: colors.bg,
        borderColor: data.isActive ? "#facc15" : colors.border,
        opacity: data.isDimmed ? DIM_OPACITY : 1,
        boxShadow: data.isActive ? HIGHLIGHT_RING : undefined,
        transform: data.isActive ? "scale(1.08)" : "scale(1)",
      }}
    >
      <Handle type="target" position={Position.Top} className="!bg-gray-400" />
      <div className="flex items-center gap-2 mb-1">
        <span
          className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded"
          style={{ backgroundColor: colors.border, color: "white" }}
        >
          {data.type}
        </span>
        {data.isActive && (
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-yellow-500" />
          </span>
        )}
      </div>
      <div className="font-semibold text-sm" style={{ color: colors.text }}>
        {data.label}
      </div>
      <div className="text-xs text-gray-600 mt-1 line-clamp-2">
        {data.description}
      </div>
      {data.files.length > 0 && (
        <div className="text-[10px] text-gray-400 mt-1.5">
          {data.files.length} file{data.files.length !== 1 ? "s" : ""}
        </div>
      )}
      <Handle type="source" position={Position.Bottom} className="!bg-gray-400" />
    </div>
  );
}

const nodeTypes: NodeTypes = {
  architecture: AnimatedArchNode as unknown as NodeTypes[string],
};

/* ------------------------------------------------------------------ */
/*  Layout helpers (same as ArchitectureMap)                          */
/* ------------------------------------------------------------------ */

function layoutNodes(archNodes: ArchMap["nodes"]): Node[] {
  const typeOrder: Record<string, number> = {
    entry: 0, config: 1, module: 2, service: 3, util: 4, database: 5, external: 6,
  };

  const sorted = [...archNodes].sort(
    (a, b) => (typeOrder[a.type] ?? 3) - (typeOrder[b.type] ?? 3)
  );

  const layers: ArchMap["nodes"][] = [];
  let currentOrder = -1;
  for (const node of sorted) {
    const order = typeOrder[node.type] ?? 3;
    if (order !== currentOrder) {
      layers.push([]);
      currentOrder = order;
    }
    layers[layers.length - 1].push(node);
  }

  const LAYER_GAP = 160;
  const NODE_GAP = 260;
  const nodes: Node[] = [];

  let y = 40;
  for (const layer of layers) {
    const layerWidth = layer.length * NODE_GAP;
    const startX = -layerWidth / 2 + NODE_GAP / 2;
    for (let i = 0; i < layer.length; i++) {
      const n = layer[i];
      nodes.push({
        id: n.id,
        type: "architecture",
        position: { x: startX + i * NODE_GAP, y },
        data: {
          label: n.label,
          type: n.type,
          files: n.files,
          description: n.description,
          isActive: false,
          isDimmed: false,
        },
      });
    }
    y += LAYER_GAP;
  }

  return nodes;
}

function layoutEdges(archEdges: ArchMap["edges"]): Edge[] {
  return archEdges.map((e, idx) => ({
    id: `edge-${idx}`,
    source: e.source,
    target: e.target,
    label: e.label || "",
    animated: false,
    style: { stroke: "#94a3b8", strokeWidth: 1.5 },
    labelStyle: { fontSize: 10, fill: "#64748b" },
  }));
}

/* ------------------------------------------------------------------ */
/*  Main component                                                    */
/* ------------------------------------------------------------------ */

interface AnimatedArchitectureMapProps {
  data: ArchMap;
  sequences: AnimationSequence[];
  fresherMode?: boolean;
  className?: string;
  onNodeClick?: (nodeId: string) => void;
}

export default function AnimatedArchitectureMap({
  data,
  sequences,
  fresherMode = false,
  className,
  onNodeClick,
}: AnimatedArchitectureMapProps) {
  /* ---- state ----- */
  const [activeSequence, setActiveSequence] = useState<AnimationSequence | null>(
    sequences[0] ?? null
  );
  const [currentStepIdx, setCurrentStepIdx] = useState(-1); // -1 = not playing
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const initialNodes = useMemo(() => layoutNodes(data.nodes), [data.nodes]);
  const initialEdges = useMemo(() => layoutEdges(data.edges), [data.edges]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  /* ---- determine current step ---- */
  const currentStep: AnimationStep | null =
    activeSequence && currentStepIdx >= 0 && currentStepIdx < activeSequence.steps.length
      ? activeSequence.steps[currentStepIdx]
      : null;

  /* ---- highlight active node + edges ---- */
  useEffect(() => {
    if (!currentStep) {
      // Reset all nodes
      setNodes((nds) =>
        nds.map((n) => ({
          ...n,
          data: { ...n.data, isActive: false, isDimmed: false },
        }))
      );
      setEdges((eds) =>
        eds.map((e) => ({
          ...e,
          animated: false,
          style: { ...e.style, stroke: "#94a3b8", strokeWidth: 1.5 },
        }))
      );
      return;
    }

    const activeNodeId = currentStep.nodeId;
    const highlightEdgeKeys = new Set(currentStep.highlightEdges ?? []);

    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        data: {
          ...n.data,
          isActive: n.id === activeNodeId,
          isDimmed: n.id !== activeNodeId && isPlaying,
        },
      }))
    );

    setEdges((eds) =>
      eds.map((e) => {
        const edgeKey = `${e.source}->${e.target}`;
        const isHighlighted = highlightEdgeKeys.has(edgeKey);
        return {
          ...e,
          animated: isHighlighted,
          style: {
            stroke: isHighlighted ? "#facc15" : "#94a3b8",
            strokeWidth: isHighlighted ? 3 : 1.5,
          },
        };
      })
    );
  }, [currentStep, isPlaying, setNodes, setEdges]);

  /* ---- auto-advance timer ---- */
  useEffect(() => {
    if (!isPlaying || isPaused || !activeSequence || currentStepIdx < 0) return;

    const step = activeSequence.steps[currentStepIdx];
    if (!step) return;

    timerRef.current = setTimeout(() => {
      const nextIdx = currentStepIdx + 1;
      if (nextIdx < activeSequence.steps.length) {
        setCurrentStepIdx(nextIdx);
      } else {
        // Finished
        setIsPlaying(false);
        setCurrentStepIdx(-1);
      }
    }, step.duration ?? 3000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPlaying, isPaused, currentStepIdx, activeSequence]);

  /* ---- controls ---- */
  const play = useCallback(() => {
    if (!activeSequence) return;
    setIsPlaying(true);
    setIsPaused(false);
    setCurrentStepIdx(0);
  }, [activeSequence]);

  const pause = useCallback(() => {
    setIsPaused((p) => !p);
  }, []);

  const stop = useCallback(() => {
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentStepIdx(-1);
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  const stepForward = useCallback(() => {
    if (!activeSequence) return;
    const max = activeSequence.steps.length - 1;
    setCurrentStepIdx((i) => Math.min(i + 1, max));
    setIsPaused(true);
    setIsPlaying(true);
  }, [activeSequence]);

  const stepBackward = useCallback(() => {
    setCurrentStepIdx((i) => Math.max(i - 1, 0));
    setIsPaused(true);
    setIsPlaying(true);
  }, []);

  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      // Pause animation and show explanation
      if (isPlaying) setIsPaused(true);
      onNodeClick?.(node.id);
    },
    [isPlaying, onNodeClick]
  );

  /* ---- explanation text ---- */
  const explanationText = currentStep
    ? fresherMode
      ? currentStep.fresherExplanation
      : currentStep.explanation
    : null;

  const progress = activeSequence
    ? ((currentStepIdx + 1) / activeSequence.steps.length) * 100
    : 0;

  return (
    <div className={`w-full h-full flex flex-col ${className || ""}`}>
      {/* Top bar: sequence selector + summary */}
      <div className="bg-gray-50 border-b px-4 py-2">
        <div className="flex items-center gap-3 mb-1">
          <select
            className="text-sm border rounded px-2 py-1 bg-white"
            value={activeSequence?.id ?? ""}
            onChange={(e) => {
              const seq = sequences.find((s) => s.id === e.target.value) ?? null;
              setActiveSequence(seq);
              stop();
            }}
          >
            {sequences.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>
          <span className="text-xs text-gray-400 uppercase font-semibold">
            {activeSequence?.category}
          </span>
        </div>
        <p className="text-xs text-gray-500">{activeSequence?.description}</p>
      </div>

      {/* React Flow canvas */}
      <div className="flex-1 relative" style={{ minHeight: 400 }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={handleNodeClick}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.3}
          maxZoom={2}
          defaultEdgeOptions={{ type: "smoothstep" }}
        >
          <Background />
          <Controls />
          <MiniMap
            nodeColor={(node) => {
              const nodeData = node.data as ArchNodeData;
              if (nodeData?.isActive) return "#facc15";
              const colors = NODE_COLORS[nodeData?.type] || NODE_COLORS.module;
              return colors.border;
            }}
          />
        </ReactFlow>

        {/* Floating explanation card */}
        {explanationText && (
          <div className="absolute bottom-4 left-4 right-4 mx-auto max-w-xl bg-white/95 backdrop-blur rounded-xl shadow-lg border border-yellow-200 p-4 z-10">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-yellow-700 uppercase">
                Step {(currentStepIdx ?? 0) + 1}
              </span>
              <span className="text-sm font-semibold text-gray-800">
                {currentStep?.label}
              </span>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">{explanationText}</p>
          </div>
        )}
      </div>

      {/* Playback controls */}
      <div className="bg-gray-50 border-t px-4 py-3">
        {/* Progress bar */}
        {isPlaying && (
          <div className="w-full h-1.5 bg-gray-200 rounded-full mb-2 overflow-hidden">
            <div
              className="h-full bg-yellow-400 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Play / Pause / Stop */}
            {!isPlaying ? (
              <button
                onClick={play}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg text-sm font-medium transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.3 2.841A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                </svg>
                Play
              </button>
            ) : (
              <>
                <button
                  onClick={pause}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  {isPaused ? (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M6.3 2.841A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M5.75 3a.75.75 0 00-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75V3.75A.75.75 0 007.25 3h-1.5zM12.75 3a.75.75 0 00-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75V3.75a.75.75 0 00-.75-.75h-1.5z" />
                    </svg>
                  )}
                  {isPaused ? "Resume" : "Pause"}
                </button>
                <button
                  onClick={stop}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5.25 3A2.25 2.25 0 003 5.25v9.5A2.25 2.25 0 005.25 17h9.5A2.25 2.25 0 0017 14.75v-9.5A2.25 2.25 0 0014.75 3h-9.5z" />
                  </svg>
                  Stop
                </button>
              </>
            )}

            {/* Step controls */}
            <div className="flex items-center gap-1 ml-2">
              <button
                onClick={stepBackward}
                disabled={!isPlaying || currentStepIdx <= 0}
                className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-30 transition-colors"
                title="Previous step"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M15.79 14.77a.75.75 0 01-1.06.02l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 111.04 1.08L11.832 10l3.938 3.71a.75.75 0 01.02 1.06zm-6 0a.75.75 0 01-1.06.02l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 111.04 1.08L5.832 10l3.938 3.71a.75.75 0 01.02 1.06z" clipRule="evenodd" />
                </svg>
              </button>
              <button
                onClick={stepForward}
                disabled={
                  !activeSequence ||
                  currentStepIdx >= (activeSequence?.steps.length ?? 0) - 1
                }
                className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-30 transition-colors"
                title="Next step"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.21 5.23a.75.75 0 011.06-.02l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 11-1.04-1.08L8.168 10 4.23 6.29a.75.75 0 01-.02-1.06zm6 0a.75.75 0 011.06-.02l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 11-1.04-1.08L14.168 10l-3.938-3.71a.75.75 0 01-.02-1.06z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>

          {/* Step indicator */}
          <div className="text-xs text-gray-500">
            {isPlaying && activeSequence
              ? `Step ${currentStepIdx + 1} of ${activeSequence.steps.length}`
              : `${sequences.length} sequence${sequences.length !== 1 ? "s" : ""} available`}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-gray-50 border-t px-4 py-2 flex gap-3 flex-wrap">
        {Object.entries(NODE_COLORS).map(([type, colors]) => (
          <div key={type} className="flex items-center gap-1">
            <div
              className="w-3 h-3 rounded-sm border"
              style={{ backgroundColor: colors.bg, borderColor: colors.border }}
            />
            <span className="text-[10px] text-gray-500 capitalize">{type}</span>
          </div>
        ))}
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm border-2 border-yellow-400 bg-yellow-100" />
          <span className="text-[10px] text-yellow-600 font-semibold">Active</span>
        </div>
      </div>
    </div>
  );
}
