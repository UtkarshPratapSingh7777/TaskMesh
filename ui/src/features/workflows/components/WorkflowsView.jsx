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
    <main className="grid gap-6 lg:grid-cols-[minmax(320px,420px)_1fr]">
      <section className="rounded-2xl border-2 border-purple-600 bg-gradient-to-br from-purple-900/30 to-purple-800/20 p-6 shadow-xl">
        <h2 className="text-xl font-black bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">Create Workflow</h2>
        <form className="mt-6 grid gap-4" onSubmit={submit}>
          <label className="grid gap-2 text-sm font-bold text-slate-200">
            Name
            <input className="min-h-11 rounded-lg border border-purple-600 bg-slate-800/50 px-4 text-white placeholder-slate-500 transition focus:border-purple-400 focus:ring-2 focus:ring-purple-500/50" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
          </label>
          <label className="grid gap-2 text-sm font-bold text-slate-200">
            Nodes
            <textarea className="min-h-48 resize-y rounded-lg border border-purple-600 bg-slate-800/50 px-4 py-3 font-mono text-sm text-white placeholder-slate-500 transition focus:border-purple-400 focus:ring-2 focus:ring-purple-500/50" value={form.nodes} onChange={(event) => setForm({ ...form, nodes: event.target.value })} />
          </label>
          <label className="grid gap-2 text-sm font-bold text-slate-200">
            Edges
            <textarea className="min-h-36 resize-y rounded-lg border border-purple-600 bg-slate-800/50 px-4 py-3 font-mono text-sm text-white placeholder-slate-500 transition focus:border-purple-400 focus:ring-2 focus:ring-purple-500/50" value={form.edges} onChange={(event) => setForm({ ...form, edges: event.target.value })} />
          </label>
          {error ? <p className="rounded-lg border border-red-600 bg-red-900/30 px-4 py-3 text-sm font-semibold text-red-300 shadow-lg">{error}</p> : null}
          <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-lg py-3" type="submit">
            <Plus size={20} aria-hidden="true" />
            Create Workflow
          </Button>
        </form>
      </section>

      <section>
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <WorkflowSummary workflow={selected} />
          <span className="inline-flex px-3 py-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-sm font-semibold text-white shadow-lg">{workflows.length} total</span>
        </div>
        <div className="mb-5 flex flex-wrap gap-2 p-3 bg-slate-800/50 rounded-lg border border-purple-700">
          {workflows.map((workflow) => (
            <button
              className={`min-h-10 rounded-lg border-2 px-4 text-sm font-bold transition cursor-pointer ${
                workflow.id === selected?.id
                  ? 'border-purple-500 bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                  : 'border-slate-700 bg-slate-700/30 text-slate-200 hover:border-purple-500 hover:text-purple-300 hover:bg-slate-700/50'
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
