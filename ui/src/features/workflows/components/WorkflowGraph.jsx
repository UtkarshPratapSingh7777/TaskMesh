import ReactFlow, { Background, Controls, MarkerType } from "reactflow";
import "reactflow/dist/style.css";
import StatusPill from "../../../components/ui/StatusPill.jsx";
export default function WorkflowGraph({ workflow }) {
  if (!workflow) {
    return (
      <div className="min-h-80 rounded-xl border-2 border-pink-600 bg-gradient-to-br from-pink-900/20 to-pink-800/10 shadow-xl" />
    );
  }
  const positions = layoutDag(workflow);
  const nodes = workflow.nodes.map((node) => ({
    id: node.id,
    position: positions.get(node.id),
    data: {
      label: (
        <div>
          <div className="font-bold">{node.name}</div>
          <div className="text-xs opacity-80">{node.status}</div>
        </div>
      ),
    },
    style: {
      width: 160,
      color: "#fff",
      border: "2px solid #ec4899",
      borderRadius: "10px",
      background: "#7c3aed",
      fontWeight: "bold",
    },
  }));
  const edges = workflow.edges.map((edge) => ({
    id: `${edge.from}-${edge.to}`,
    source: edge.from,
    target: edge.to,
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
    style: {
      stroke: "#ec4899",
      strokeWidth: 2,
    },
  }));
  return (
    <div className="h-[500px] overflow-hidden rounded-xl border-2 border-pink-600 bg-gradient-to-br from-slate-800 to-slate-900 shadow-xl">
      <ReactFlow nodes={nodes} edges={edges} fitView>
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}
export function WorkflowSummary({ workflow }) {
  if (!workflow) {
    return null;
  }
  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-xl font-black bg-gradient-to-r from-pink-300 to-purple-300 bg-clip-text text-transparent">
        {workflow.name}
      </span>
      <StatusPill status={workflow.status} />
      <span className="inline-flex px-3 py-1 rounded-full bg-gradient-to-r from-orange-600 to-pink-600 text-xs font-bold text-white shadow-lg">
        {workflow.nodes.length} nodes
      </span>
    </div>
  );
}
function layoutDag(workflow) {
  const levels = new Map(workflow.nodes.map((node) => [node.id, 0]));
  for (const nodeId of workflow.topologicalOrder ||
    workflow.nodes.map((node) => node.id)) {
    const level = levels.get(nodeId) || 0;
    for (const edge of workflow.edges.filter((e) => e.from === nodeId)) {
      levels.set(edge.to, Math.max(levels.get(edge.to) || 0, level + 1));
    }
  }
  const buckets = new Map();
  for (const node of workflow.nodes) {
    const level = levels.get(node.id) || 0;
    if (!buckets.has(level)) {
      buckets.set(level, []);
    }
    buckets.get(level).push(node);
  }
  const positions = new Map();
  for (const [level, nodes] of buckets.entries()) {
    nodes.forEach((node, index) => {
      positions.set(node.id, {
        x: 36 + level * 230,
        y: 38 + index * 110,
      });
    });
  }
  return positions;
}
