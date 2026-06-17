import StatusPill from '../../../components/ui/StatusPill.jsx';

export default function WorkflowGraph({ workflow }) {
  if (!workflow) {
    return <div className="min-h-80 rounded-md border border-slate-200 bg-white" />;
  }

  const positions = layoutDag(workflow);
  const width = Math.max(760, Math.max(...[...positions.values()].map((point) => point.x)) + 220);
  const height = Math.max(340, Math.max(...[...positions.values()].map((point) => point.y)) + 120);

  return (
    <div className="overflow-auto rounded-md border border-slate-200 bg-white">
      <svg className="min-h-80 min-w-[680px] w-full" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`${workflow.name} workflow graph`}>
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8" />
          </marker>
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
              stroke="#94a3b8"
              strokeWidth="2"
            />
          );
        })}
        {workflow.nodes.map((node) => {
          const point = positions.get(node.id);
          return (
            <g key={node.id}>
              <rect fill="#ffffff" height="72" rx="6" stroke="#cbd5e1" strokeWidth="1.5" width="160" x={point.x} y={point.y} />
              <text fill="#0f172a" fontSize="13" fontWeight="800" x={point.x + 12} y={point.y + 27}>{node.name.slice(0, 18)}</text>
              <text fill="#64748b" fontSize="12" fontWeight="700" x={point.x + 12} y={point.y + 51}>{node.status}</text>
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
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-bold text-slate-950">{workflow.name}</span>
      <StatusPill status={workflow.status} />
      <span className="text-sm font-semibold text-slate-500">{workflow.nodes.length} nodes</span>
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
