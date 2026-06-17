import StatusPill from '../../../components/ui/StatusPill.jsx';

export default function WorkflowGraph({ workflow }) {
  if (!workflow) {
    return <div className="min-h-80 rounded-xl border-2 border-pink-600 bg-gradient-to-br from-pink-900/20 to-pink-800/10 shadow-xl" />;
  }

  const positions = layoutDag(workflow);
  const width = Math.max(760, Math.max(...[...positions.values()].map((point) => point.x)) + 220);
  const height = Math.max(340, Math.max(...[...positions.values()].map((point) => point.y)) + 120);

  return (
    <div className="overflow-auto rounded-xl border-2 border-pink-600 bg-gradient-to-br from-slate-800 to-slate-900 shadow-xl">
      <svg className="min-h-80 min-w-[680px] w-full" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`${workflow.name} workflow graph`}>
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#ec4899" />
          </marker>
          <linearGradient id="nodeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#7c3aed', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#6d28d9', stopOpacity: 1 }} />
          </linearGradient>
        </defs>
        {workflow.edges.map((edge) => {
          const from = positions.get(edge.from);
          const to = positions.get(edge.to);
          if (!from || !to) {
            return null;
          }
          return (
            <path
              d={`M ${from.x + 160} ${from.y + 36} C ${from.x + 220} ${from.y + 36}, ${to.x - 70} ${to.y + 36}, ${to.x} ${to.y + 36}`}
              fill="none"
              key={`${edge.from}:${edge.to}`}
              markerEnd="url(#arrow)"
              stroke="#ec4899"
              strokeWidth="3"
            />
          );
        })}
        {workflow.nodes.map((node) => {
          const point = positions.get(node.id);
          return (
            <g key={node.id}>
              <rect fill="url(#nodeGradient)" height="72" rx="10" stroke="#ec4899" strokeWidth="2.5" width="160" x={point.x} y={point.y} />
              <text fill="#ffffff" fontSize="14" fontWeight="800" x={point.x + 12} y={point.y + 27}>{node.name.slice(0, 18)}</text>
              <text fill="#e9d5ff" fontSize="11" fontWeight="700" x={point.x + 12} y={point.y + 51}>{node.status}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export function WorkflowSummary({ workflow }) {
  if (!workflow) {
    return null;
  }
  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-xl font-black bg-gradient-to-r from-pink-300 to-purple-300 bg-clip-text text-transparent">{workflow.name}</span>
      <StatusPill status={workflow.status} />
      <span className="inline-flex px-3 py-1 rounded-full bg-gradient-to-r from-orange-600 to-pink-600 text-xs font-bold text-white shadow-lg">{workflow.nodes.length} nodes</span>
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
        x: 36 + level * 230,
        y: 38 + index * 110
      });
    });
  }

  return positions;
}
