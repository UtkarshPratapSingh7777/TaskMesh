import { Plus } from 'lucide-react';
import { useState } from 'react';
import Button from '../../../components/ui/Button.jsx';
import JobTable from './JobTable.jsx';

export default function JobsView({ jobs, onCancel, onCreate }) {
  const [form, setForm] = useState({
    name: 'Email digest',
    priority: 5,
    delaySeconds: 5,
    maxAttempts: 4,
    payload: '{"kind":"email","tenant":"demo"}'
  });
  const [error, setError] = useState('');

  async function submit(event) {
    event.preventDefault();
    try {
      await onCreate({
        name: form.name,
        priority: Number(form.priority),
        delaySeconds: Number(form.delaySeconds),
        maxAttempts: Number(form.maxAttempts),
        payload: JSON.parse(form.payload || '{}')
      });
      setError('');
    } catch (nextError) {
      setError(nextError.message);
    }
  }

  return (
    <main className="grid gap-4 lg:grid-cols-[minmax(320px,420px)_1fr]">
      <section className="rounded-md border border-slate-200 bg-white p-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-black text-slate-950">Create Job</h2>
        </div>
        <form className="mt-4 grid gap-3" onSubmit={submit}>
          <label className="grid gap-1 text-sm font-bold text-slate-700">
            Name
            <input className="min-h-10 rounded-md border border-slate-300 px-3" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
          </label>
          <div className="grid grid-cols-3 gap-2">
            <label className="grid gap-1 text-sm font-bold text-slate-700">
              Priority
              <input className="min-h-10 rounded-md border border-slate-300 px-3" type="number" min="0" max="100" value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value })} />
            </label>
            <label className="grid gap-1 text-sm font-bold text-slate-700">
              Delay
              <input className="min-h-10 rounded-md border border-slate-300 px-3" type="number" min="0" value={form.delaySeconds} onChange={(event) => setForm({ ...form, delaySeconds: event.target.value })} />
            </label>
            <label className="grid gap-1 text-sm font-bold text-slate-700">
              Attempts
              <input className="min-h-10 rounded-md border border-slate-300 px-3" type="number" min="1" max="20" value={form.maxAttempts} onChange={(event) => setForm({ ...form, maxAttempts: event.target.value })} />
            </label>
          </div>
          <label className="grid gap-1 text-sm font-bold text-slate-700">
            Payload
            <textarea className="min-h-32 resize-y rounded-md border border-slate-300 px-3 py-2 font-mono text-sm" value={form.payload} onChange={(event) => setForm({ ...form, payload: event.target.value })} />
          </label>
          {error ? <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">{error}</p> : null}
          <Button className="w-full" type="submit">
            <Plus size={16} aria-hidden="true" />
            Create Job
          </Button>
        </form>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-base font-black text-slate-950">Jobs</h2>
          <span className="text-sm font-semibold text-slate-500">{jobs.length} total</span>
        </div>
        <JobTable jobs={jobs} onCancel={onCancel} />
      </section>
    </main>
  );
}
