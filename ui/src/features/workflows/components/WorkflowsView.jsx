import { Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import Button from '../../../components/ui/Button.jsx';
import LiveIndicator from '../../../components/ui/LiveIndicator.jsx';
import WorkflowGraph, { WorkflowSummary } from './WorkflowGraph.jsx';

export default function WorkflowsView({ onCreate, workflows }) {
  const [selectedId, setSelectedId] = useState('');
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: 'Invoice pipeline',
    nodes: JSON.stringify(
      [
        { id: 'extract', name: 'Extract invoices', priority: 8 },
        { id: 'validate', name: 'Validate totals', priority: 7 },
        { id: 'render', name: 'Render PDF', priority: 5 },
        { id: 'notify', name: 'Notify customer', priority: 6 }
      ],
      null,
      2
    ),
    edges: JSON.stringify(
      [
        { from: 'extract', to: 'validate' },
        { from: 'validate', to: 'render' },
        { from: 'render', to: 'notify' }
      ],
      null,
      2
    )
  });
  const selected = useMemo(
    () => workflows.find((workflow) => workflow.id === selectedId) || workflows[0],
    [selectedId, workflows]
  );

  async function submit(event) {
    event.preventDefault();
    try {
      const result = await onCreate({
        name: form.name,
        nodes: JSON.parse(form.nodes || '[]'),
        edges: JSON.parse(form.edges || '[]')
      });
      setSelectedId(result.workflow.id);
      setError('');
    } catch (nextError) {
      setError(nextError.message);
    }
  }

  return (
    <main className="grid gap-5 lg:grid-cols-[minmax(320px,420px)_1fr]">
      <section className="card">
        <h2 className="section-title">Create Workflow</h2>
        <p className="mt-1 section-subtitle">Define nodes and edges as JSON</p>
        <form className="mt-5 grid gap-4" onSubmit={submit}>
          <label className="form-label">
            Name
            <input
              className="form-input"
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
            />
          </label>
          <label className="form-label">
            Nodes
            <textarea
              className="form-textarea min-h-48"
              value={form.nodes}
              onChange={(event) => setForm({ ...form, nodes: event.target.value })}
            />
          </label>
          <label className="form-label">
            Edges
            <textarea
              className="form-textarea min-h-36"
              value={form.edges}
              onChange={(event) => setForm({ ...form, edges: event.target.value })}
            />
          </label>
          {error ? <p className="alert-error">{error}</p> : null}
          <Button className="w-full" glowing type="submit">
            <Plus size={16} aria-hidden="true" />
            Create Workflow
          </Button>
        </form>
      </section>

      <section>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <WorkflowSummary workflow={selected} />
            <LiveIndicator />
          </div>
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-slate-300">
            {workflows.length} total
          </span>
        </div>
        <div className="mb-4 flex flex-wrap gap-2">
          {workflows.map((workflow) => (
            <button
              className={`min-h-9 rounded-xl border px-3.5 text-sm font-semibold transition-all duration-300 ${
                workflow.id === selected?.id
                  ? 'border-indigo-400/50 bg-indigo-500/20 text-indigo-200 shadow-lg shadow-indigo-500/20'
                  : 'border-white/10 bg-white/5 text-slate-400 hover:border-white/20 hover:bg-white/10 hover:text-white'
              }`}
              key={workflow.id}
              type="button"
              onClick={() => setSelectedId(workflow.id)}
            >
              {workflow.name}
            </button>
          ))}
        </div>
        <WorkflowGraph key={selected?.id} workflow={selected} />
      </section>
    </main>
  );
}
