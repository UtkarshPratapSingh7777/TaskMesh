import { useEffect, useMemo, useRef, useState } from 'react';
import StatusPill from '../../../components/ui/StatusPill.jsx';

const STATUS_COLORS = {
  COMPLETED: '#22c55e',
  RUNNING: '#10b981',
  FAILED: '#f43f5e',
  PENDING: '#f59e0b',
  READY: '#818cf8',
  RETRYING: '#f59e0b'
};

export default function WorkflowGraph({ workflow }) {
  const prevStatuses = useRef(new Map());
  const [flashingNodes, setFlashingNodes] = useState(new Set());
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => setTick((value) => value + 1), 1200);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!workflow) {
      return;
    }

    const changed = new Set();
    for (const node of workflow.nodes) {
      const previous = prevStatuses.current.get(node.id);
      if (previous && previous !== node.status) {
        changed.add(node.id);
      }
      prevStatuses.current.set(node.id, node.status);
    }

    if (changed.size) {
      setFlashingNodes(changed);
      const timer = window.setTimeout(() => setFlashingNodes(new Set()), 900);
      return () => window.clearTimeout(timer);
    }

    return undefined;
  }, [workflow, tick]);

  const layout = useMemo(() => (workflow ? layoutDag(workflow) : null), [workflow]);

  if (!workflow || !layout) {
    return (
      <div className="graph-grid flex min-h-80 items-center justify-center rounded-2xl border border-dashed border-white/15 bg-slate-900/40">
        <p className="text-sm text-slate-500">Select or create a workflow to see the live graph</p>
      </div>
    );
  }

  const { positions, width, height } = layout;
  const nodeMap = new Map(workflow.nodes.map((node) => [node.id, node]));
  const runningCount = workflow.nodes.filter((node) => node.status === 'RUNNING').length;
  const completedCount = workflow.nodes.filter((node) => node.status === 'COMPLETED').length;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-semibold text-slate-400">
        <span className="text-slate-300">Pipeline progress</span>
        <div className="h-2 flex-1 min-w-[120px] overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-emerald-400 transition-all duration-700"
            style={{ width: `${(completedCount / workflow.nodes.length) * 100}%` }}
          />
        </div>
        <span className="text-emerald-300">{completedCount}/{workflow.nodes.length} done</span>
        {runningCount > 0 ? (
          <span className="inline-flex items-center gap-1.5 text-emerald-300">
            <span className="live-dot" />
            {runningCount} running
          </span>
        ) : null}
      </div>

      <div className="graph-grid overflow-auto rounded-2xl border border-white/10 bg-slate-900/60 shadow-2xl shadow-indigo-500/5 backdrop-blur-sm">
        <svg
          className="min-h-80 min-w-[680px] w-full"
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label={`${workflow.name} workflow graph`}
        >
          <defs>
            <linearGradient id="nodeFill" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(30, 27, 75, 0.95)" />
              <stop offset="100%" stopColor="rgba(15, 23, 42, 0.95)" />
            </linearGradient>
            <filter id="nodeGlow">
              <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#6366f1" floodOpacity="0.35" />
            </filter>
            <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#818cf8" />
            </marker>
          </defs>

          {workflow.edges.map((edge) => {
            const from = positions.get(edge.from);
            const to = positions.get(edge.to);
            if (!from || !to) {
              return null;
            }

            const fromNode = nodeMap.get(edge.from);
            const isActive = ['RUNNING', 'COMPLETED'].includes(fromNode?.status);
            const pathD = `M ${from.x + 168} ${from.y + 40} C ${from.x + 228} ${from.y + 40}, ${to.x - 72} ${to.y + 40}, ${to.x} ${to.y + 40}`;

            return (
              <g key={`${edge.from}:${edge.to}`}>
                <path
                  className={isActive ? 'workflow-edge workflow-edge-active' : 'workflow-edge workflow-edge-idle'}
                  d={pathD}
                  fill="none"
                  markerEnd="url(#arrow)"
                  strokeWidth="2.5"
                />
                {isActive ? (
                  <circle fill="#a5b4fc" r="4">
                    <animateMotion dur="1.8s" repeatCount="indefinite" path={pathD} />
                  </circle>
                ) : null}
              </g>
            );
          })}

          {workflow.nodes.map((node, index) => {
            const point = positions.get(node.id);
            const statusColor = STATUS_COLORS[node.status] || '#64748b';
            const isRunning = node.status === 'RUNNING';
            const isFlashing = flashingNodes.has(node.id);

            return (
              <g
                className="node-enter"
                filter={isRunning ? 'url(#nodeGlow)' : undefined}
                key={node.id}
                style={{ animationDelay: `${index * 0.08}s` }}
              >
                {isRunning ? (
                  <rect
                    className="node-pulse-ring"
                    fill="none"
                    height="88"
                    rx="16"
                    stroke={statusColor}
                    strokeOpacity="0.5"
                    strokeWidth="2"
                    width="176"
                    x={point.x - 8}
                    y={point.y - 8}
                  />
                ) : null}
                {isFlashing ? (
                  <rect
                    className="status-flash-ring"
                    fill={statusColor}
                    fillOpacity="0.25"
                    height="80"
                    rx="14"
                    width="168"
                    x={point.x}
                    y={point.y}
                  />
                ) : null}
                <rect
                  fill="url(#nodeFill)"
                  height="80"
                  rx="14"
                  stroke={statusColor}
                  strokeOpacity="0.6"
                  strokeWidth="1.5"
                  width="168"
                  x={point.x}
                  y={point.y}
                />
                <rect fill={statusColor} height="4" rx="2" width="168" x={point.x} y={point.y} />
                <text fill="#f8fafc" fontSize="13" fontWeight="700" x={point.x + 14} y={point.y + 32}>
                  {node.name.slice(0, 20)}
                </text>
                <text fill={statusColor} fontSize="11" fontWeight="700" x={point.x + 14} y={point.y + 56}>
                  {node.status}
                </text>
                {isRunning ? (
                  <circle cx={point.x + 150} cy={point.y + 52} fill="#34d399" r="4">
                    <animate attributeName="opacity" dur="1s" repeatCount="indefinite" values="1;0.3;1" />
                  </circle>
                ) : null}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

export function WorkflowSummary({ workflow }) {
  if (!workflow) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <span className="text-base font-bold text-white">{workflow.name}</span>
      <StatusPill status={workflow.status} />
      <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-semibold text-slate-300">
        {workflow.nodes.length} nodes
      </span>
    </div>
  );
}

function layoutDag(workflow) {
  const levels = new Map(workflow.nodes.map((node) => [node.id, 0]));

  for (const nodeId of workflow.topologicalOrder || workflow.nodes.map((node) => node.id)) {
    const level = levels.get(nodeId) || 0;
    for (const edge of workflow.edges.filter((item) => item.from === nodeId)) {
      levels.set(edge.to, Math.max(levels.get(edge.to) || 0, level + 1));
    }
  }

  const buckets = new Map();
  for (const node of workflow.nodes) {
    const level = levels.get(node.id) || 0;
    const bucket = buckets.get(level) || [];
    bucket.push(node);
    buckets.set(level, bucket);
  }

  const positions = new Map();
  for (const [level, nodes] of buckets.entries()) {
    nodes.forEach((node, index) => {
      positions.set(node.id, {
        x: 40 + level * 240,
        y: 44 + index * 120
      });
    });
  }

  const width = Math.max(780, Math.max(...[...positions.values()].map((point) => point.x)) + 240);
  const height = Math.max(360, Math.max(...[...positions.values()].map((point) => point.y)) + 140);

  return { positions, width, height };
}
