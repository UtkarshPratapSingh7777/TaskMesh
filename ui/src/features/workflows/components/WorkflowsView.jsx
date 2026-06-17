import { Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import Button from '../../../components/ui/Button.jsx';
import WorkflowGraph, { WorkflowSummary } from './WorkflowGraph.jsx';

export default function WorkflowsView({ onCreate, workflows }) {
  const [selectedId, setSelectedId] = useState('');
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: 'Invoice pipeline',
    nodes: JSON.stringify([
      { id: 'extract', name: 'Extract invoices', priority: 8 },
      { id: 'validate', name: 'Validate totals', priority: 7 },
      { id: 'render', name: 'Render PDF', priority: 5 },
      { id: 'notify', name: 'Notify customer', priority: 6 }
    ], null, 2),
    edges: JSON.stringify([
      { from: 'extract', to: 'validate' },
      { from: 'validate', to: 'render' },
      { from: 'render', to: 'notify' }
    ], null, 2)
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
    <main className="grid gap-4 lg:grid-cols-[minmax(320px,420px)_1fr]">
      <section className="rounded-md border border-slate-200 bg-white p-4">
        <h2 className="text-base font-black text-slate-950">Create Workflow</h2>
        <form className="mt-4 grid gap-3" onSubmit={submit}>
          <label className="grid gap-1 text-sm font-bold text-slate-700">
            Name
            <input className="min-h-10 rounded-md border border-slate-300 px-3" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
          </label>
          <label className="grid gap-1 text-sm font-bold text-slate-700">
            Nodes
            <textarea className="min-h-48 resize-y rounded-md border border-slate-300 px-3 py-2 font-mono text-sm" value={form.nodes} onChange={(event) => setForm({ ...form, nodes: event.target.value })} />
          </label>
          <label className="grid gap-1 text-sm font-bold text-slate-700">
            Edges
            <textarea className="min-h-36 resize-y rounded-md border border-slate-300 px-3 py-2 font-mono text-sm" value={form.edges} onChange={(event) => setForm({ ...form, edges: event.target.value })} />
          </label>
          {error ? <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">{error}</p> : null}
          <Button className="w-full" type="submit">
            <Plus size={16} aria-hidden="true" />
            Create Workflow
          </Button>
        </form>
      </section>

      <section>
        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <WorkflowSummary workflow={selected} />
          <span className="text-sm font-semibold text-slate-500">{workflows.length} total</span>
        </div>
        <div className="mb-3 flex flex-wrap gap-2">
          {workflows.map((workflow) => (
            <button
              className={`min-h-9 rounded-md border px-3 text-sm font-bold ${
                workflow.id === selected?.id
                  ? 'border-blue-600 bg-blue-50 text-blue-700'
                  : 'border-slate-300 bg-white text-slate-700'
              }`}
              key={workflow.id}
              type="button"
              onClick={() => setSelectedId(workflow.id)}
            >
              {workflow.name}
            </button>
          ))}
        </div>
        <WorkflowGraph workflow={selected} />
      </section>
    </main>
  );
}
